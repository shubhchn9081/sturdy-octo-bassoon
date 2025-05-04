import { LimboOutcome } from '@shared/schema';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { generateRandomNumber } from './provably-fair';

interface LimboBetParams {
  betAmount: number;
  targetMultiplier: number; // Player's target multiplier to win
}

/**
 * Generate a Limbo game outcome
 * @param userId User ID
 * @param gameId Game ID (should be 3 for Limbo game)
 * @param params Bet parameters including targetMultiplier
 * @param serverSeed Server seed for provably fair
 * @param clientSeed Client seed for provably fair
 * @param nonce Nonce for provably fair
 * @returns LimboOutcome object with result and win status
 */
export async function generateLimboOutcome(
  userId: number,
  gameId: number,
  params: LimboBetParams,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<LimboOutcome> {
  // Check if the outcome should be forced by admin controls
  const controlResult = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  const { shouldForce, forcedOutcome, forcedValue, targetMultiplier, useExactMultiplier } = controlResult;
  
  // Default limbo result is a provably fair multiplier
  const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`;
  const hash = generateHash(combinedSeed);
  const rawValue = parseInt(hash.substr(0, 8), 16);
  
  // In Limbo, the result is a multiplier, typically with a house edge built in
  // Here's a simple implementation - can be adjusted for different house edges
  let limboCurve = (rawValue % 10000) / 100; // 0.00 to 99.99
  
  // Apply house edge and calculate multiplier (simplified)
  let houseEdge = 0.01; // 1% house edge
  let result = 1 / (limboCurve / 100 * (1 - houseEdge));
  result = parseFloat(result.toFixed(2)); // Round to 2 decimal places
  
  // Player wins if result is >= their target multiplier
  let win = result >= params.targetMultiplier;
  
  // Apply admin controls if needed
  if (shouldForce) {
    if (forcedOutcome === 'win') {
      // Force a win
      
      // Use exact multiplier if specified (this is the new feature)
      if (useExactMultiplier && targetMultiplier) {
        console.log(`[LIMBO] Forcing EXACT ${targetMultiplier}x multiplier win for user ${userId}`);
        
        // For Limbo, we can directly set the result to the exact multiplier desired
        // Since the player wins if result >= targetMultiplier, we set it to exactly the target
        result = targetMultiplier;
        win = true;
      }
      // If admin specified a specific result value
      else if (forcedValue !== undefined && typeof forcedValue === 'number') {
        result = forcedValue;
        
        // Make sure this is a win
        if (result < params.targetMultiplier) {
          result = params.targetMultiplier; // Make sure it's at least the target
        }
        
        win = true;
      } 
      // Otherwise just ensure result is a win
      else {
        // Set result to the player's target multiplier to ensure a win
        result = Math.max(result, params.targetMultiplier);
        win = true;
      }
    } 
    else if (forcedOutcome === 'lose') {
      // Force a loss
      if (forcedValue !== undefined && typeof forcedValue === 'number') {
        result = forcedValue;
        
        // Make sure this is a loss
        if (result >= params.targetMultiplier) {
          result = Math.max(1.00, params.targetMultiplier - 0.01); // Just below target
        }
      } 
      // Otherwise just ensure result is a loss
      else {
        // Set result to just below the player's target multiplier to ensure a loss
        result = Math.min(result, Math.max(1.00, params.targetMultiplier - 0.01));
      }
      win = false;
    }
  }
  
  return {
    targetMultiplier: params.targetMultiplier,
    result,
    win
  };
}

/**
 * Calculate Limbo payout based on game result
 * @param outcome The Limbo game outcome
 * @param betAmount The amount bet by the player
 * @returns The payout amount (0 if lost)
 */
export function calculateLimboPayout(
  outcome: LimboOutcome,
  betAmount: number
): number {
  if (!outcome.win) return 0;
  
  // For Limbo, payout is simply bet amount times the target multiplier
  // Since a win means the player gets their target multiplier
  return betAmount * outcome.targetMultiplier;
}