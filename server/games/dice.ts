import { DiceOutcome } from '@shared/schema';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { generateRandomNumber, calculateDiceRoll } from './provably-fair';

interface DiceBetParams {
  betAmount: number;
  target: number; // The target number to roll over/under
  mode: 'over' | 'under'; // Roll over or under the target
}

/**
 * Generate a dice game outcome
 * @param userId User ID
 * @param gameId Game ID (should be 5 for Dice game)
 * @param params Bet parameters including target and mode
 * @param serverSeed Server seed for provably fair
 * @param clientSeed Client seed for provably fair
 * @param nonce Nonce for provably fair
 * @returns DiceOutcome object with result and win status
 */
export async function generateDiceOutcome(
  userId: number,
  gameId: number,
  params: DiceBetParams,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<DiceOutcome> {
  // Check if the outcome should be forced by admin controls
  const controlResult = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  const { shouldForce, forcedOutcome, forcedValue, targetMultiplier, useExactMultiplier } = controlResult;
  
  // Default dice result is a provably fair number between 0 and 100
  let result = calculateDiceRoll(serverSeed, clientSeed, nonce);
  
  // Calculate if player won based on target and mode
  let win = params.mode === 'over' 
    ? result > params.target 
    : result < params.target;
  
  // Apply admin controls if needed
  if (shouldForce) {
    if (forcedOutcome === 'win') {
      // Force a win
      
      // Use exact multiplier if specified (this is the new feature)
      if (useExactMultiplier && targetMultiplier) {
        console.log(`[DICE] Forcing EXACT ${targetMultiplier}x multiplier win for user ${userId}`);
        
        // For dice, the multiplier is calculated as 100 / (target mode over ? (100 - target) : target)
        // So we need to reverse-engineer the target value that would give our desired multiplier
        
        // Calculate what the target should be to achieve the exact multiplier
        let adjustedTarget: number;
        
        if (params.mode === 'over') {
          // For "over" mode: multiplier = 100 / (100 - target)
          // Thus: (100 - target) = 100 / multiplier
          // Target = 100 - (100 / multiplier)
          adjustedTarget = 100 - (100 / targetMultiplier);
        } else {
          // For "under" mode: multiplier = 100 / target
          // Thus: target = 100 / multiplier
          adjustedTarget = 100 / targetMultiplier;
        }
        
        // Round to 2 decimal places for display
        adjustedTarget = parseFloat(adjustedTarget.toFixed(2));
        
        // Now, generate a result that will win with this target
        if (params.mode === 'over') {
          // For "over" mode, result needs to be > adjustedTarget
          result = Math.min(99.99, adjustedTarget + 0.01); // Just slightly over
        } else {
          // For "under" mode, result needs to be < adjustedTarget
          result = Math.max(0.01, adjustedTarget - 0.01); // Just slightly under
        }
        
        console.log(`[DICE] Adjusted result to ${result} to achieve ${targetMultiplier}x multiplier`);
        win = true;
      }
      // If a specific dice result was specified by admin
      else if (forcedValue !== undefined && typeof forcedValue === 'number') {
        result = forcedValue;
        
        // Make sure this result is a win
        if (params.mode === 'over' && result <= params.target) {
          result = Math.min(99.99, params.target + 0.01);
        } else if (params.mode === 'under' && result >= params.target) {
          result = Math.max(0.01, params.target - 0.01);
        }
        
        win = true;
      } 
      // Otherwise just ensure the result is a win
      else {
        if (params.mode === 'over') {
          result = Math.min(99.99, params.target + 0.01);
        } else {
          result = Math.max(0.01, params.target - 0.01);
        }
        win = true;
      }
    } 
    else if (forcedOutcome === 'lose') {
      // Force a loss
      if (forcedValue !== undefined && typeof forcedValue === 'number') {
        result = forcedValue;
        
        // Make sure this result is a loss
        if (params.mode === 'over' && result > params.target) {
          result = Math.max(0.01, params.target);
        } else if (params.mode === 'under' && result < params.target) {
          result = Math.min(99.99, params.target);
        }
      } 
      // Otherwise just ensure the result is a loss
      else {
        if (params.mode === 'over') {
          result = Math.max(0.01, params.target);
        } else {
          result = Math.min(99.99, params.target);
        }
      }
      win = false;
    }
  }
  
  return {
    target: params.target,
    result,
    win
  };
}

/**
 * Calculate dice payout based on game result
 * @param outcome The dice game outcome
 * @param betAmount The amount bet by the player
 * @returns The payout amount (0 if lost)
 */
export function calculateDicePayout(
  outcome: DiceOutcome,
  betAmount: number
): number {
  if (!outcome.win) return 0;
  
  // Calculate multiplier based on target and mode
  const targetProbability = outcome.target / 100;
  const inverseProb = 1 - targetProbability;
  
  // Multiplier calculation (simplified)
  const multiplier = 100 / outcome.target;
  
  // Payout is bet amount times multiplier
  return betAmount * multiplier;
}