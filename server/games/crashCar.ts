import crypto from 'crypto';
import { CrashCarOutcome } from '../../shared/schema';
import { storage } from '../storage';

/**
 * Default parameters for the crash car game
 */
const CRASH_CAR_DEFAULT_PARAMS = {
  houseEdge: 0.03, // 3% house edge
  baseMultiplier: 1.00, // Starting multiplier
  maxPossibleMultiplier: 1000, // Theoretical maximum multiplier
  defaultMaxCrashPoint: 50, // Default maximum multiplier to cap at
  gameId: 99, // Unique game ID for crash car game - matching the ID in client/src/games/index.ts
};

/**
 * Generate a provably fair crash car outcome
 * @param serverSeed Server-side random seed
 * @param clientSeed Client-side random seed
 * @param nonce Unique nonce for this game round
 * @param userId User ID for additional entropy
 * @returns Crash point
 */
export async function generateCrashCarCrashPoint(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  userId: number
): Promise<number> {
  try {
    // Check for game control overrides first
    const globalControl = await storage.getGlobalGameControl();
    if (globalControl) {
      // If global controls are active, and they affect this game (crash car), apply them
      const affectedGames = globalControl.affectedGames as number[];
      
      if (
        globalControl.forceAllUsersWin && 
        (affectedGames.length === 0 || 
         affectedGames.includes(CRASH_CAR_DEFAULT_PARAMS.gameId)) // Use the gameId constant
      ) {
        const targetMultiplier = globalControl.targetMultiplier || 2.0;
        return globalControl.useExactMultiplier 
          ? targetMultiplier 
          : Math.random() * 3 + targetMultiplier;
      }
      
      if (
        globalControl.forceAllUsersLose && 
        (affectedGames.length === 0 || 
         affectedGames.includes(101))
      ) {
        // Force a crash at 1.0x or slightly above
        return 1.0 + Math.random() * 0.2;
      }
    }
    
    // Check for user-specific controls
    const userControls = await storage.getUserGameControls(userId);
    const crashCarControl = userControls.find(control => 
      control.gameId === CRASH_CAR_DEFAULT_PARAMS.gameId && // Use the gameId constant
      control.forceOutcome && 
      control.gamesPlayed < control.durationGames
    );
    
    if (crashCarControl) {
      if (crashCarControl.outcomeType === 'win') {
        // Increment the counter for this control
        await storage.incrementUserGameControlCounter(crashCarControl.id);
        
        const targetMultiplier = crashCarControl.targetMultiplier || 2.0;
        return crashCarControl.useExactMultiplier 
          ? targetMultiplier 
          : Math.random() * 3 + targetMultiplier;
      }
      
      if (crashCarControl.outcomeType === 'loss') {
        // Increment the counter for this control
        await storage.incrementUserGameControlCounter(crashCarControl.id);
        
        // Force a crash at 1.0x or slightly above
        return 1.0 + Math.random() * 0.2;
      }
    }
    
    // No control active, generate a fair crash point
    
    // Hash the inputs to get a 'random' crash point
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}:${userId}`);
    const hash = hmac.digest('hex');
    
    // Convert first 8 characters of hash to a decimal value between 0 and 1
    const divisor = Math.pow(16, 8);
    const randomValue = parseInt(hash.slice(0, 8), 16) / divisor;
    
    // Apply house edge (3%)
    const houseEdge = CRASH_CAR_DEFAULT_PARAMS.houseEdge;
    
    // Formula: 99 / (1 - R) where R is random value between 0 and 1
    // This creates an exponential curve
    // The house edge is applied by multiplying by (1 - edge)
    const crashPoint = (100 / (1 - randomValue) * (1 - houseEdge)) / 100;
    
    // Clamp the crash point to a reasonable range
    return Math.min(
      Math.max(1.0, crashPoint), 
      CRASH_CAR_DEFAULT_PARAMS.defaultMaxCrashPoint
    );
  } catch (error) {
    console.error('Error generating crash car point:', error);
    // Fallback to a default crash point
    return 1.5;
  }
}

/**
 * Create a crash car outcome based on bet parameters
 * @param serverSeed Server seed from storage
 * @param clientSeed Client seed from request
 * @param nonce Nonce for this bet
 * @param userId User ID
 * @param cashoutAt The multiplier at which the user chose to cash out (or null if they didn't)
 * @returns CrashCarOutcome object
 */
export async function createCrashCarOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  userId: number,
  cashoutAt: number | null = null
): Promise<CrashCarOutcome> {
  // Generate the crash point
  const crashPoint = await generateCrashCarCrashPoint(serverSeed, clientSeed, nonce, userId);
  
  // Determine if the player won (cashed out before crash)
  const win = cashoutAt !== null && cashoutAt <= crashPoint;
  
  // Calculate simulated fuel level at cashout (0-100%)
  const fuelLevel = cashoutAt 
    ? Math.max(0, 100 - (cashoutAt / crashPoint) * 100) 
    : 0;
  
  return {
    crashPoint,
    cashoutAt: cashoutAt || 0,
    win,
    fuelLevel
  };
}

/**
 * Get a multiplier value for a given elapsed time using an exponential growth formula
 * @param elapsedTimeMs Time elapsed in milliseconds
 * @returns Current multiplier value
 */
export function getMultiplierAtTime(elapsedTimeMs: number): number {
  // Convert milliseconds to seconds for more intuitive formula
  const elapsedTimeSec = elapsedTimeMs / 1000;
  
  // Formula: 1.0 + k * (e^(t/10) - 1)
  // Where t is time in seconds, k is a growth factor
  // This gives a curve that starts slow and accelerates
  const growthFactor = 0.18;
  const multiplier = 1.0 + growthFactor * (Math.exp(elapsedTimeSec / 10) - 1);
  
  // Ensure we never return less than 1.0x
  return Math.max(1.0, multiplier);
}