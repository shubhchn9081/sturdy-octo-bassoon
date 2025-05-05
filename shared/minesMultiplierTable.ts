// Modified multiplier table with drastically reduced values to make winning more difficult
// Values reduced to 0 to prevent any wins as requested
export const MINES_MULTIPLIER_TABLE: Record<number, number[]> = {
  1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  7: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  8: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  9: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  11: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  12: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  13: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  14: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  15: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  16: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  17: [0, 0, 0, 0, 0, 0, 0, 0],
  18: [0, 0, 0, 0, 0, 0, 0],
  19: [0, 0, 0, 0, 0, 0],
  20: [0, 0, 0, 0, 0],
  21: [0, 0, 0, 0],
  22: [0, 0, 0],
  23: [0, 0],
  24: [0]
};

/**
 * Gets the multiplier for a specific number of mines and gems collected
 * @param mineCount Number of mines (1-24)
 * @param gemsCollected Number of gems collected (1-24, must be valid for the mine count)
 * @returns The multiplier, or undefined if invalid parameters
 */
export function getMinesMultiplier(mineCount: number, gemsCollected: number): number | undefined {
  // Ensure parameters are within valid range
  if (mineCount < 1 || mineCount > 24 || gemsCollected < 1) {
    return undefined;
  }

  // Get the multiplier array for this mine count
  const multipliers = MINES_MULTIPLIER_TABLE[mineCount];
  if (!multipliers) {
    return undefined;
  }

  // Check if gems collected is valid for this mine count
  if (gemsCollected > multipliers.length) {
    return undefined;
  }

  // Return the multiplier (subtract 1 from gemsCollected for zero-based array index)
  return multipliers[gemsCollected - 1];
}

/**
 * Calculates how many gems need to be collected to reach a target multiplier
 * @param mineCount Number of mines (1-24)
 * @param targetMultiplier The target multiplier to achieve
 * @returns The number of gems to collect, or undefined if target can't be reached
 */
export function getGemsNeededForMultiplier(mineCount: number, targetMultiplier: number): number | undefined {
  // Ensure parameters are within valid range
  if (mineCount < 1 || mineCount > 24 || targetMultiplier <= 1) {
    return undefined;
  }

  // Get the multiplier array for this mine count
  const multipliers = MINES_MULTIPLIER_TABLE[mineCount];
  if (!multipliers) {
    return undefined;
  }

  // Find the closest multiplier that is >= the target
  for (let i = 0; i < multipliers.length; i++) {
    if (multipliers[i] >= targetMultiplier) {
      return i + 1; // Add 1 to convert from zero-based index to gem count
    }
  }

  // If we got here, the target multiplier is higher than any available multiplier
  return undefined;
}

/**
 * Find a close match to the target multiplier (used for exact multiplier control)
 * @param mineCount Number of mines (1-24)
 * @param targetMultiplier The desired multiplier
 * @returns Object with gems to collect and the actual multiplier, or undefined if no close match
 */
export function findClosestMultiplier(mineCount: number, targetMultiplier: number): { gems: number; multiplier: number } | undefined {
  // Ensure parameters are within valid range
  if (mineCount < 1 || mineCount > 24 || targetMultiplier <= 1) {
    return undefined;
  }

  // Get the multiplier array for this mine count
  const multipliers = MINES_MULTIPLIER_TABLE[mineCount];
  if (!multipliers) {
    return undefined;
  }

  // Find the closest multiplier to the target
  let closestGems = 0;
  let closestMultiplier = 0;
  let minDifference = Number.MAX_VALUE;

  for (let i = 0; i < multipliers.length; i++) {
    const difference = Math.abs(multipliers[i] - targetMultiplier);
    if (difference < minDifference) {
      minDifference = difference;
      closestGems = i + 1; // Add 1 to convert from zero-based index to gem count
      closestMultiplier = multipliers[i];
    }
  }

  // If we found a reasonable match (within 5% of target)
  if (minDifference / targetMultiplier <= 0.05) {
    return {
      gems: closestGems,
      multiplier: closestMultiplier
    };
  }

  // For 2.0x specifically, find the closest option
  if (Math.abs(targetMultiplier - 2.0) < 0.01) {
    // These are the common configurations that give close to 2.0x
    const options = [
      { mines: 3, gems: 2 }, // 2.02x
      { mines: 5, gems: 3 }, // 2.02x
      { mines: 9, gems: 2 }, // 2.5x
      { mines: 13, gems: 1 } // 2.08x
    ];
    
    // Find the closest option to the current mine count
    const bestOption = options.reduce((best, option) => {
      if (Math.abs(option.mines - mineCount) < Math.abs(best.mines - mineCount)) {
        return option;
      }
      return best;
    }, options[0]);
    
    // Get the multiplier for this option
    const actualMultiplier = getMinesMultiplier(bestOption.mines, bestOption.gems);
    if (actualMultiplier) {
      return {
        gems: bestOption.gems,
        multiplier: actualMultiplier
      };
    }
  }

  return undefined;
}