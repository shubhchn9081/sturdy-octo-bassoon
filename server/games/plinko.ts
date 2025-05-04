import { PlinkoOutcome } from '@shared/schema';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { generateRandomNumber } from './provably-fair';

interface PlinkoBetParams {
  betAmount: number;
  rows: number;      // Number of plinko rows (8-16)
  risk: string;      // Risk level: 'low', 'medium', 'high'
}

// Plinko multiplier tables for different risk levels and row counts
const PLINKO_MULTIPLIERS: Record<string, Record<number, number[]>> = {
  'low': {
    8: [5.6, 2.1, 1.5, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 2.1, 5.6],
    9: [8.1, 3.0, 1.8, 1.4, 1.2, 1.0, 0.8, 0.7, 0.5, 0.5, 0.7, 0.8, 1.0, 1.2, 1.4, 1.8, 3.0, 8.1],
    10: [10.4, 4.0, 2.3, 1.5, 1.2, 1.1, 0.9, 0.7, 0.6, 0.4, 0.4, 0.6, 0.7, 0.9, 1.1, 1.2, 1.5, 2.3, 4.0, 10.4],
    11: [13.5, 5.2, 2.9, 1.8, 1.4, 1.2, 0.9, 0.8, 0.6, 0.5, 0.2, 0.5, 0.6, 0.8, 0.9, 1.2, 1.4, 1.8, 2.9, 5.2, 13.5],
    12: [18.2, 8.1, 3.2, 2.0, 1.5, 1.2, 1.0, 0.8, 0.7, 0.5, 0.3, 0.3, 0.5, 0.7, 0.8, 1.0, 1.2, 1.5, 2.0, 3.2, 8.1, 18.2],
    13: [30.2, 11.1, 4.5, 2.4, 1.7, 1.3, 1.0, 0.9, 0.7, 0.5, 0.4, 0.2, 0.2, 0.4, 0.5, 0.7, 0.9, 1.0, 1.3, 1.7, 2.4, 4.5, 11.1, 30.2],
    14: [44.0, 15.0, 6.1, 3.2, 1.9, 1.4, 1.1, 0.9, 0.7, 0.6, 0.4, 0.3, 0.1, 0.1, 0.3, 0.4, 0.6, 0.7, 0.9, 1.1, 1.4, 1.9, 3.2, 6.1, 15.0, 44.0],
    15: [84.0, 23.2, 8.4, 3.7, 2.1, 1.5, 1.2, 0.9, 0.8, 0.6, 0.5, 0.3, 0.2, 0.1, 0.1, 0.2, 0.3, 0.5, 0.6, 0.8, 0.9, 1.2, 1.5, 2.1, 3.7, 8.4, 23.2, 84.0],
    16: [170.0, 41.0, 11.6, 4.6, 2.6, 1.7, 1.2, 1.0, 0.8, 0.6, 0.5, 0.4, 0.2, 0.1, 0.05, 0.05, 0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.7, 2.6, 4.6, 11.6, 41.0, 170.0]
  },
  'medium': {
    8: [14.0, 3.0, 1.5, 1.0, 0.7, 0.5, 0.3, 0.2, 0.2, 0.2, 0.3, 0.5, 0.7, 1.0, 1.5, 3.0, 14.0],
    9: [18.0, 4.3, 1.7, 1.1, 0.8, 0.5, 0.3, 0.2, 0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.1, 1.7, 4.3, 18.0],
    10: [23.0, 5.4, 2.4, 1.1, 0.8, 0.5, 0.4, 0.2, 0.1, 0.05, 0.05, 0.1, 0.2, 0.4, 0.5, 0.8, 1.1, 2.4, 5.4, 23.0],
    11: [40.0, 8.0, 3.0, 1.5, 0.9, 0.6, 0.4, 0.2, 0.1, 0.05, 0.01, 0.05, 0.1, 0.2, 0.4, 0.6, 0.9, 1.5, 3.0, 8.0, 40.0],
    12: [67.0, 14.0, 4.5, 1.9, 1.0, 0.6, 0.4, 0.3, 0.1, 0.05, 0.02, 0.02, 0.05, 0.1, 0.3, 0.4, 0.6, 1.0, 1.9, 4.5, 14.0, 67.0],
    13: [110.0, 20.0, 6.4, 2.9, 1.4, 0.7, 0.4, 0.3, 0.1, 0.05, 0.02, 0.01, 0.01, 0.02, 0.05, 0.1, 0.3, 0.4, 0.7, 1.4, 2.9, 6.4, 20.0, 110.0],
    14: [190.0, 37.0, 9.8, 3.4, 1.8, 0.9, 0.5, 0.3, 0.1, 0.05, 0.02, 0.01, 0.005, 0.005, 0.01, 0.02, 0.05, 0.1, 0.3, 0.5, 0.9, 1.8, 3.4, 9.8, 37.0, 190.0],
    15: [310.0, 56.0, 18.0, 5.0, 2.4, 1.1, 0.6, 0.3, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.3, 0.6, 1.1, 2.4, 5.0, 18.0, 56.0, 310.0],
    16: [620.0, 120.0, 26.0, 8.0, 3.2, 1.5, 0.6, 0.3, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.3, 0.6, 1.5, 3.2, 8.0, 26.0, 120.0, 620.0]
  },
  'high': {
    8: [29.0, 4.0, 1.5, 0.6, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.6, 1.5, 4.0, 29.0],
    9: [43.0, 7.1, 1.8, 0.6, 0.2, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.6, 1.8, 7.1, 43.0],
    10: [76.0, 10.0, 2.9, 0.7, 0.3, 0.1, 0.05, 0.02, 0.01, 0.01, 0.01, 0.01, 0.02, 0.05, 0.1, 0.3, 0.7, 2.9, 10.0, 76.0],
    11: [120.0, 17.0, 4.0, 1.1, 0.3, 0.1, 0.05, 0.02, 0.01, 0.005, 0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.3, 1.1, 4.0, 17.0, 120.0],
    12: [170.0, 25.0, 5.7, 1.4, 0.4, 0.1, 0.05, 0.02, 0.01, 0.005, 0.001, 0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.4, 1.4, 5.7, 25.0, 170.0],
    13: [300.0, 44.0, 9.0, 2.0, 0.5, 0.1, 0.05, 0.02, 0.01, 0.005, 0.001, 0.0005, 0.0005, 0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.5, 2.0, 9.0, 44.0, 300.0],
    14: [550.0, 68.0, 13.0, 2.8, 0.6, 0.2, 0.05, 0.02, 0.01, 0.005, 0.001, 0.0005, 0.0001, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.02, 0.05, 0.2, 0.6, 2.8, 13.0, 68.0, 550.0],
    15: [1000.0, 120.0, 22.0, 4.5, 0.9, 0.2, 0.05, 0.02, 0.01, 0.005, 0.001, 0.0005, 0.0001, 0.00005, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.02, 0.05, 0.2, 0.9, 4.5, 22.0, 120.0, 1000.0],
    16: [1800.0, 230.0, 36.0, 7.0, 1.5, 0.3, 0.05, 0.02, 0.01, 0.005, 0.001, 0.0005, 0.0001, 0.00005, 0.00001, 0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.02, 0.05, 0.3, 1.5, 7.0, 36.0, 230.0, 1800.0]
  }
};

/**
 * Find the target path for a desired multiplier
 * This identifies a Plinko path that will result in approximately the target multiplier
 * 
 * @param rows Number of rows in the Plinko game (8-16)
 * @param risk Risk level ('low', 'medium', 'high')
 * @param targetMultiplier The desired multiplier (e.g., 2.0)
 * @returns Index of the closest multiplier and the path to reach it
 */
/**
 * Generates multiple different paths that all lead to exactly 2.0x multiplier
 * This is specifically for the 2.0x multiplier admin control requirement
 */
function generateMultiplePathsFor2xMultiplier(rows: number, risk: string): {
  pathIndex: number;
  path: number[];
  actualMultiplier: number;
} {
  // Get multiplier table for this risk and row count
  const multipliers = PLINKO_MULTIPLIERS[risk][rows];
  if (!multipliers) {
    throw new Error(`Invalid risk or row count: ${risk}, ${rows}`);
  }

  // Find all indices that have multipliers close to 2.0
  const targetIndices: number[] = [];
  for (let i = 0; i < multipliers.length; i++) {
    // Look for multipliers between 1.9 and 2.1 for better variety
    if (multipliers[i] >= 1.9 && multipliers[i] <= 2.1) {
      targetIndices.push(i);
    }
  }

  // If we didn't find any close multipliers, find the single closest one
  if (targetIndices.length === 0) {
    let closestIndex = 0;
    let minDiff = Math.abs(multipliers[0] - 2.0);
    
    for (let i = 1; i < multipliers.length; i++) {
      const diff = Math.abs(multipliers[i] - 2.0);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    targetIndices.push(closestIndex);
  }

  // Choose a random index from our candidates
  const chosenIndex = targetIndices[Math.floor(Math.random() * targetIndices.length)];
  
  // Generate a randomized path that still leads to our target
  const path: number[] = [];
  
  // Calculate how many left turns (1s) we need
  const leftTurns = chosenIndex;
  let leftTurnsRemaining = leftTurns;
  
  // Create a more randomized pattern for the path
  // This distributes the left/right turns more evenly through the path
  for (let i = 0; i < rows; i++) {
    // Create a different probability pattern based on how far we are in the sequence
    // This creates more varied-looking paths
    let probability = leftTurnsRemaining / (rows - i); // Base probability
    
    // Add some variation to the probability based on position
    if (i < rows/3) {
      // More random in the first third
      probability = probability * (0.8 + Math.random() * 0.4);
    } else if (i < 2*rows/3) {
      // Less random in the middle third
      probability = probability * (0.9 + Math.random() * 0.2);
    } else {
      // More deliberate in the final third
      probability = probability * (0.95 + Math.random() * 0.1);
    }
    
    // But ensure we still hit our target number of left turns
    if (rows - i <= leftTurnsRemaining) {
      path.push(1); // Must go left if we need all remaining turns to be left
      leftTurnsRemaining--;
    } else if (leftTurnsRemaining === 0) {
      path.push(0); // Must go right if we have no left turns remaining
    } else if (Math.random() < probability) {
      path.push(1); // Go left
      leftTurnsRemaining--;
    } else {
      path.push(0); // Go right
    }
  }

  return {
    pathIndex: chosenIndex,
    path,
    actualMultiplier: multipliers[chosenIndex]
  };
}

function findTargetPathForMultiplier(rows: number, risk: string, targetMultiplier: number): {
  pathIndex: number;
  path: number[];
  actualMultiplier: number;
} {
  // Special case for 2.0x multiplier to ensure more varied patterns
  if (Math.abs(targetMultiplier - 2.0) < 0.01) {
    console.log("[PLINKO] Using special 2.0x varied path generation");
    return generateMultiplePathsFor2xMultiplier(rows, risk);
  }
  
  // Get multiplier table for this risk and row count
  const multipliers = PLINKO_MULTIPLIERS[risk][rows];
  if (!multipliers) {
    throw new Error(`Invalid risk or row count: ${risk}, ${rows}`);
  }
  
  // Find closest multiplier to target
  let closestIndex = 0;
  let minDiff = Math.abs(multipliers[0] - targetMultiplier);
  
  for (let i = 1; i < multipliers.length; i++) {
    const diff = Math.abs(multipliers[i] - targetMultiplier);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  
  // Generate path to this index
  // For a path to end at index N, we need to have N left turns (1s)
  // out of (rows) total turns
  const path: number[] = [];
  
  // Calculate how many left turns (1s) we need
  const leftTurns = closestIndex;
  let leftTurnsRemaining = leftTurns;
  
  // Generate the path with exactly the right number of left turns
  for (let i = 0; i < rows; i++) {
    // If all remaining steps need to be left turns, or random decision says go left
    if (rows - i <= leftTurnsRemaining || (leftTurnsRemaining > 0 && Math.random() < leftTurnsRemaining / (rows - i))) {
      path.push(1); // Left turn
      leftTurnsRemaining--;
    } else {
      path.push(0); // Right turn
    }
  }
  
  return {
    pathIndex: closestIndex,
    path,
    actualMultiplier: multipliers[closestIndex]
  };
}

/**
 * Generate a Plinko game outcome
 * @param userId User ID
 * @param gameId Game ID (should be 2 for Plinko game)
 * @param params Bet parameters including rows and risk
 * @param serverSeed Server seed for provably fair
 * @param clientSeed Client seed for provably fair
 * @param nonce Nonce for provably fair
 * @returns PlinkoOutcome object with path and multiplier
 */
export async function generatePlinkoOutcome(
  userId: number,
  gameId: number,
  params: PlinkoBetParams,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<PlinkoOutcome> {
  // Check if the outcome should be forced by admin controls
  const controlResult = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  const { shouldForce, forcedOutcome, forcedValue, targetMultiplier, useExactMultiplier } = controlResult;
  
  // Default Plinko path - each element is 0 (right) or 1 (left)
  let path: number[] = [];
  let multiplier: number = 0;
  
  // Validate parameters
  if (params.rows < 8 || params.rows > 16) {
    throw new Error(`Invalid row count: ${params.rows}. Must be between 8 and 16.`);
  }
  
  if (!['low', 'medium', 'high'].includes(params.risk)) {
    throw new Error(`Invalid risk level: ${params.risk}. Must be 'low', 'medium', or 'high'.`);
  }
  
  // Apply admin controls if needed
  if (shouldForce) {
    if (forcedOutcome === 'win') {
      // Force a win
      
      // Use exact multiplier if specified (this is the new feature)
      if (useExactMultiplier && targetMultiplier) {
        console.log(`[PLINKO] Forcing EXACT ${targetMultiplier}x multiplier win for user ${userId}`);
        
        // For Plinko, we need to find a path that leads to approximately the target multiplier
        const targetPath = findTargetPathForMultiplier(
          params.rows,
          params.risk,
          targetMultiplier
        );
        
        path = targetPath.path;
        multiplier = targetPath.actualMultiplier;
        
        console.log(`[PLINKO] Found path with multiplier ${multiplier}x (target was ${targetMultiplier}x)`);
      }
      // If admin specified a specific path
      else if (forcedValue && typeof forcedValue === 'object' && Array.isArray(forcedValue)) {
        path = forcedValue as number[];
        
        // Ensure path length matches row count
        if (path.length !== params.rows) {
          throw new Error(`Forced path length (${path.length}) doesn't match row count (${params.rows})`);
        }
        
        // Calculate the final position to get the multiplier
        const finalPosition = path.reduce((sum, turn) => sum + turn, 0);
        multiplier = PLINKO_MULTIPLIERS[params.risk][params.rows][finalPosition];
      } 
      // Otherwise generate a winning path (relatively high multiplier)
      else {
        // Find a high multiplier within the first or last quarter of possibilities
        const multipliers = PLINKO_MULTIPLIERS[params.risk][params.rows];
        const totalPositions = multipliers.length;
        
        // Choose from first or last quarter (where highest multipliers are)
        const highValueIndices = [
          ...Array.from({length: Math.floor(totalPositions / 4)}, (_, i) => i),
          ...Array.from({length: Math.floor(totalPositions / 4)}, (_, i) => totalPositions - 1 - i)
        ];
        
        // Choose random high value position
        const randomIndex = highValueIndices[Math.floor(Math.random() * highValueIndices.length)];
        
        // Generate path to this position
        const targetPath = findTargetPathForMultiplier(
          params.rows,
          params.risk,
          multipliers[randomIndex]
        );
        
        path = targetPath.path;
        multiplier = targetPath.actualMultiplier;
      }
    } 
    else if (forcedOutcome === 'lose') {
      // For Plinko, we'll define a "lose" as getting a low multiplier (< 1.0x)
      
      // Find a low multiplier (near the middle of the distribution)
      const multipliers = PLINKO_MULTIPLIERS[params.risk][params.rows];
      const totalPositions = multipliers.length;
      const midPoint = Math.floor(totalPositions / 2);
      
      // Look for multipliers < 1.0 near the middle
      let lowValueIndices = [];
      for (let i = Math.floor(totalPositions / 3); i <= Math.floor(2 * totalPositions / 3); i++) {
        if (multipliers[i] < 1.0) {
          lowValueIndices.push(i);
        }
      }
      
      // If we couldn't find any low values, use the middle
      if (lowValueIndices.length === 0) {
        lowValueIndices = [midPoint];
      }
      
      // Choose random low value position
      const randomIndex = lowValueIndices[Math.floor(Math.random() * lowValueIndices.length)];
      
      // Generate path to this position
      const targetPath = findTargetPathForMultiplier(
        params.rows,
        params.risk,
        multipliers[randomIndex]
      );
      
      path = targetPath.path;
      multiplier = targetPath.actualMultiplier;
    }
  } 
  // No forced outcome - use provably fair path
  else {
    // Generate random path using provably fair
    path = [];
    for (let i = 0; i < params.rows; i++) {
      // Each decision needs its own random number
      const randNum = generateRandomNumber(serverSeed, clientSeed, nonce + i);
      path.push(randNum < 0.5 ? 0 : 1);
    }
    
    // Calculate final position and get the multiplier
    const finalPosition = path.reduce((sum, turn) => sum + turn, 0);
    multiplier = PLINKO_MULTIPLIERS[params.risk][params.rows][finalPosition];
  }
  
  return {
    path,
    multiplier,
    risk: params.risk,
    rows: params.rows
  };
}

/**
 * Calculate Plinko payout based on game result
 * @param outcome The Plinko game outcome
 * @param betAmount The amount bet by the player
 * @returns The payout amount
 */
export function calculatePlinkoPayout(
  outcome: PlinkoOutcome,
  betAmount: number
): number {
  return betAmount * outcome.multiplier;
}