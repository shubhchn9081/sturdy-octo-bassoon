import { SlotsOutcome } from '@shared/schema';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { generateRandomNumber } from './provably-fair';

// Extended outcome for Galactic Spins game with additional features
export interface GalacticSpinsOutcome extends SlotsOutcome {
  expandingWilds: number[];  // Indices of reels that have expanding wilds
  winningLines: number[];    // Indices of winning paylines
  bonusTriggered: boolean;   // Whether bonus free spins are triggered
  multiplier: number;        // Win multiplier
}

interface SlotsBetParams {
  betAmount: number;
  lines: number; // Number of paylines
  luckyNumber?: number; // Optional lucky number chosen by player
}

// Multiplier for different slot combinations
const SLOT_MULTIPLIERS = {
  THREE_SEVENS: 10.0,      // Three 7s
  THREE_SAME: 5.0,         // Three of the same number (except 7s)
  SEQUENTIAL: 3.0,         // Three sequential numbers
  TWO_SAME: 2.0,           // Two of the same number
  LUCKY_NUMBER_HIT: 3.0,   // When a lucky number is hit
  NONE: 0.0                // No winning combination
};

/**
 * Generate a slots game outcome
 * @param userId User ID
 * @param gameId Game ID (should be slot game ID)
 * @param params Bet parameters
 * @param serverSeed Server seed for provably fair
 * @param clientSeed Client seed for provably fair
 * @param nonce Nonce for provably fair
 * @returns SlotsOutcome object with result and win status
 */
export async function generateSlotsOutcome(
  userId: number,
  gameId: number,
  params: SlotsBetParams,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<SlotsOutcome> {
  // Check if the outcome should be forced by admin controls
  const controlResult = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  const { shouldForce, forcedOutcome, forcedValue, targetMultiplier, useExactMultiplier } = controlResult;
  
  // Default slots results - 3 reels with values 0-9
  let reels: number[] = [0, 0, 0];
  let win = false;
  let luckyNumberHit = false;
  
  // Generate random reels using provably fair system
  reels = [
    Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce) * 10),
    Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce + 1) * 10),
    Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce + 2) * 10)
  ];
  
  // Apply admin controls if needed
  if (shouldForce) {
    if (forcedOutcome === 'win') {
      // Force a win
      
      // Use exact multiplier if specified (this is the new feature)
      if (useExactMultiplier && targetMultiplier) {
        console.log(`[SLOTS] Forcing EXACT ${targetMultiplier}x multiplier win for user ${userId}`);
        
        // For slots, we need to create a combination that gives the exact multiplier
        // We'll try to match to the closest predefined multiplier
        
        if (Math.abs(targetMultiplier - SLOT_MULTIPLIERS.THREE_SEVENS) < 0.01) {
          // Force three 7s for 10x multiplier
          reels = [7, 7, 7];
        } 
        else if (Math.abs(targetMultiplier - SLOT_MULTIPLIERS.THREE_SAME) < 0.01) {
          // Force three of the same for 5x multiplier (using 5 as an example)
          reels = [5, 5, 5];
        } 
        else if (Math.abs(targetMultiplier - SLOT_MULTIPLIERS.SEQUENTIAL) < 0.01) {
          // Force sequential numbers for 3x multiplier
          reels = [4, 5, 6];
        } 
        else if (Math.abs(targetMultiplier - SLOT_MULTIPLIERS.TWO_SAME) < 0.01 || Math.abs(targetMultiplier - 2.0) < 0.01) {
          // Force two of the same for 2x multiplier
          // Create more varied combinations for the 2x multiplier
          
          // First, generate the two matching numbers (any number from 0-9)
          const matchingNumber = Math.floor(Math.random() * 10);
          
          // Create an array of possible third numbers that don't match the first two
          const possibleThirdNumbers = [];
          for (let i = 0; i < 10; i++) {
            if (i !== matchingNumber) {
              possibleThirdNumbers.push(i);
            }
          }
          
          // Randomly choose one of the non-matching numbers
          const thirdNumber = possibleThirdNumbers[Math.floor(Math.random() * possibleThirdNumbers.length)];
          
          // 50% chance to put the matching numbers first, 50% chance to put them in a different position
          const position = Math.floor(Math.random() * 3);
          
          if (position === 0) {
            reels = [matchingNumber, matchingNumber, thirdNumber];
          } else if (position === 1) {
            reels = [matchingNumber, thirdNumber, matchingNumber];
          } else {
            reels = [thirdNumber, matchingNumber, matchingNumber];
          }
          
          console.log(`[SLOTS] Generated varied 2x multiplier combination: [${reels.join(', ')}]`);
        } 
        else {
          // Default to a common winning combination if multiplier doesn't match
          console.log(`[SLOTS] Could not match exact multiplier ${targetMultiplier}, using closest match`);
          reels = [5, 5, 5]; // 5x multiplier as default winning combo
        }
        
        win = true;
      }
      // If admin specified forced reels
      else if (forcedValue && Array.isArray(forcedValue) && forcedValue.length === 3) {
        reels = forcedValue.map(n => n % 10); // Ensure reel values are between 0-9
      } 
      // Otherwise generate a winning combination
      else {
        // Just make 3 of a kind for a guaranteed win
        const randomNum = Math.floor(Math.random() * 10);
        reels = [randomNum, randomNum, randomNum];
      }
      
      win = true;
    } 
    else if (forcedOutcome === 'lose') {
      // Force a loss - ensure reels don't form a winning combination
      if (forcedValue && Array.isArray(forcedValue) && forcedValue.length === 3) {
        reels = forcedValue.map(n => n % 10);
        
        // Make sure this is actually a losing combination
        if (calculateMultiplier(reels) > 0) {
          // If it would win, modify one reel
          reels[2] = (reels[2] + 1) % 10;
        }
      } 
      else {
        // Generate a losing combination
        reels = [1, 3, 5]; // This combination doesn't win
      }
      
      win = false;
    }
  }
  
  // Check for lucky number hit if player selected one
  if (params.luckyNumber !== undefined) {
    luckyNumberHit = reels.includes(params.luckyNumber);
  }
  
  // Recalculate win status based on final reels
  const multiplier = calculateMultiplier(reels);
  win = multiplier > 0 || luckyNumberHit;
  
  return {
    reels,
    win,
    luckyNumberHit,
    luckyNumber: params.luckyNumber
  };
}

/**
 * Calculate the multiplier for a given slot combination
 * @param reels Array of 3 reel values (0-9)
 * @returns Multiplier value (0 if no win)
 */
function calculateMultiplier(reels: number[]): number {
  // Sort the reels to make pattern checking easier
  const sortedReels = [...reels].sort();
  
  // Check for three 7s - highest multiplier (10x)
  if (reels[0] === 7 && reels[1] === 7 && reels[2] === 7) {
    return SLOT_MULTIPLIERS.THREE_SEVENS;
  }
  
  // Check for three of the same number (5x)
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    return SLOT_MULTIPLIERS.THREE_SAME;
  }
  
  // Check for sequential numbers (3x)
  if (
    sortedReels[1] === sortedReels[0] + 1 &&
    sortedReels[2] === sortedReels[1] + 1
  ) {
    return SLOT_MULTIPLIERS.SEQUENTIAL;
  }
  
  // Check for two of the same number (2x)
  if (
    reels[0] === reels[1] ||
    reels[1] === reels[2] ||
    reels[0] === reels[2]
  ) {
    return SLOT_MULTIPLIERS.TWO_SAME;
  }
  
  // No winning combination
  return SLOT_MULTIPLIERS.NONE;
}

/**
 * Calculate slots payout based on game result
 * @param outcome The slots game outcome
 * @param betAmount The amount bet by the player
 * @returns The payout amount (0 if lost)
 */
export function calculateSlotsPayout(
  outcome: SlotsOutcome,
  betAmount: number
): number {
  if (!outcome.win && !outcome.luckyNumberHit) return 0;
  
  let multiplier = calculateMultiplier(outcome.reels);
  
  // Add lucky number bonus if applicable
  if (outcome.luckyNumberHit) {
    multiplier += SLOT_MULTIPLIERS.LUCKY_NUMBER_HIT;
  }
  
  return betAmount * multiplier;
}

/**
 * Process a slot bet
 * @param userId User ID 
 * @param gameId Game ID
 * @param betAmount Bet amount
 * @param serverSeed Server seed for provably fair
 * @param clientSeed Client seed for provably fair
 * @param nonce Nonce for provably fair
 * @param luckyNumber Optional lucky number
 * @returns Bet result including outcome and payout
 */
export async function processSlotBet(
  userId: number,
  gameId: number,
  betAmount: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  luckyNumber?: number,
  lines: number = 1
): Promise<{
  outcome: SlotsOutcome | GalacticSpinsOutcome;
  payout: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  multiplier?: number;
}> {
  // Get the game to check what type of slot game it is
  const storage = await import('../storage').then(m => m.storage);
  const game = await storage.getGame(gameId);
  
  if (game?.slug === 'galactic-spins') {
    return processGalacticSpinsBet(
      userId,
      gameId,
      betAmount,
      serverSeed,
      clientSeed,
      nonce,
      lines,
      luckyNumber
    );
  }
  
  // For regular slots game
  // Generate slot outcome
  const outcome = await generateSlotsOutcome(
    userId,
    gameId,
    {
      betAmount,
      lines: 1, // Default to 1 line for regular slots
      luckyNumber
    },
    serverSeed,
    clientSeed,
    nonce
  );
  
  // Calculate payout
  const payout = calculateSlotsPayout(outcome, betAmount);
  
  // Update user balance
  await storage.updateUserBalance(userId, payout - betAmount);
  
  // Return result
  return {
    outcome,
    payout,
    serverSeed,
    clientSeed,
    nonce
  };
}

/**
 * Process a Galactic Spins bet with enhanced features
 */
export async function processGalacticSpinsBet(
  userId: number,
  gameId: number,
  betAmount: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  lines: number = 10, // Default to 10 lines for Galactic Spins
  luckyNumber?: number
): Promise<{
  outcome: GalacticSpinsOutcome;
  payout: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  multiplier: number;
}> {
  // Check if the outcome should be forced by admin controls
  const controlResult = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  const { shouldForce, forcedOutcome, targetMultiplier } = controlResult;
  
  // Generate base outcome first
  const baseOutcome = await generateSlotsOutcome(
    userId,
    gameId,
    {
      betAmount,
      lines,
      luckyNumber
    },
    serverSeed,
    clientSeed,
    nonce
  );
  
  // Enhanced features specific to Galactic Spins
  let expandingWilds: number[] = [];
  let winningLines: number[] = [];
  let bonusTriggered = false;
  let multiplier = 1;
  
  // For a winning spin, calculate additional features
  if (baseOutcome.win) {
    // Random expanding wilds (0-2 reels)
    const numExpandingWilds = Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce + 10) * 3);
    for (let i = 0; i < numExpandingWilds; i++) {
      const reelIndex = Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce + 11 + i) * 5);
      if (!expandingWilds.includes(reelIndex)) {
        expandingWilds.push(reelIndex);
      }
    }
    
    // Winning paylines - for now just generate between 1-lines random winning lines
    const numWinningLines = Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce + 20) * lines) + 1;
    for (let i = 0; i < numWinningLines; i++) {
      const lineIndex = Math.floor(generateRandomNumber(serverSeed, clientSeed, nonce + 21 + i) * lines);
      if (!winningLines.includes(lineIndex)) {
        winningLines.push(lineIndex);
      }
    }
    
    // Bonus trigger chance (10%)
    bonusTriggered = generateRandomNumber(serverSeed, clientSeed, nonce + 30) < 0.1;
    
    // Multiplier - weighted towards lower multipliers but can go up to 50x
    const multiplierRoll = generateRandomNumber(serverSeed, clientSeed, nonce + 40);
    if (multiplierRoll < 0.8) {
      // 80% chance of 1-5x
      multiplier = Math.floor(multiplierRoll * 5) + 1;
    } else if (multiplierRoll < 0.95) {
      // 15% chance of 5-20x
      multiplier = Math.floor((multiplierRoll - 0.8) * 15 / 0.15) + 5;
    } else {
      // 5% chance of 20-50x
      multiplier = Math.floor((multiplierRoll - 0.95) * 30 / 0.05) + 20;
    }
    
    // Apply admin controls if necessary
    if (shouldForce && forcedOutcome === 'win' && targetMultiplier) {
      multiplier = targetMultiplier;
    }
  }
  
  // Calculate final payout
  const baseBet = betAmount * lines;
  const payout = baseOutcome.win ? baseBet * multiplier : 0;
  
  // Create the full Galactic Spins outcome
  const outcome: GalacticSpinsOutcome = {
    ...baseOutcome,
    expandingWilds,
    winningLines,
    bonusTriggered,
    multiplier
  };
  
  // Update user balance
  const storage = await import('../storage').then(m => m.storage);
  await storage.updateUserBalance(userId, payout - baseBet);
  
  // Save bet to history
  await storage.createBet({
    userId,
    gameId,
    amount: baseBet,
    multiplier,
    profit: payout - baseBet,
    serverSeed,
    clientSeed,
    nonce,
    outcome: { 
      ...outcome,
      multiplier
    },
    completed: true
  });
  
  // Return full result
  return {
    outcome,
    payout,
    serverSeed,
    clientSeed,
    nonce,
    multiplier
  };
}