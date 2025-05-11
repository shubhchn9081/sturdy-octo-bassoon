// Modified multiplier table with increased values for better rewards
// Values are still controlled but offer more significant wins
export const MINES_MULTIPLIER_TABLE: Record<number, number[]> = {
  1: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.50, 4.00, 4.50, 5.00, 5.50, 6.00, 7.00, 8.00, 9.00, 10.00, 12.00, 14.00, 16.00, 18.00, 20.00, 24.00],
  2: [1.20, 1.40, 1.60, 1.80, 2.00, 2.25, 2.50, 2.75, 3.00, 3.50, 4.00, 4.50, 5.00, 5.50, 6.00, 7.00, 8.00, 9.00, 10.00, 12.00, 14.00, 16.00, 18.00],
  3: [1.15, 1.30, 1.45, 1.60, 1.80, 2.00, 2.20, 2.40, 2.60, 2.80, 3.00, 3.50, 4.00, 4.50, 5.00, 5.50, 6.00, 7.00, 8.00, 9.00, 10.00, 12.00],
  4: [1.10, 1.20, 1.30, 1.40, 1.60, 1.80, 2.00, 2.20, 2.40, 2.60, 2.80, 3.00, 3.50, 4.00, 4.50, 5.00, 5.50, 6.00, 7.00, 8.00, 9.00],
  5: [1.08, 1.16, 1.24, 1.32, 1.50, 1.70, 1.90, 2.10, 2.30, 2.50, 2.70, 2.90, 3.25, 3.60, 4.00, 4.40, 4.80, 5.25, 6.00, 7.00],
  6: [1.06, 1.12, 1.18, 1.24, 1.40, 1.60, 1.80, 2.00, 2.20, 2.40, 2.60, 2.80, 3.10, 3.40, 3.70, 4.00, 4.40, 4.80, 5.20],
  7: [1.05, 1.10, 1.15, 1.20, 1.30, 1.45, 1.60, 1.75, 1.90, 2.05, 2.20, 2.40, 2.70, 3.00, 3.30, 3.60, 3.90, 4.20],
  8: [1.04, 1.08, 1.12, 1.16, 1.25, 1.35, 1.45, 1.55, 1.65, 1.75, 1.90, 2.05, 2.30, 2.60, 2.90, 3.20, 3.50, 3.80],
  9: [1.03, 1.06, 1.09, 1.12, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.15, 2.40, 2.65, 2.90, 3.15, 3.40],
  10: [1.02, 1.04, 1.06, 1.08, 1.15, 1.25, 1.35, 1.45, 1.55, 1.65, 1.75, 1.85, 2.00, 2.20, 2.40, 2.60, 2.80, 3.00],
  11: [1.02, 1.04, 1.06, 1.08, 1.12, 1.20, 1.28, 1.36, 1.44, 1.52, 1.60, 1.70, 1.85, 2.00, 2.15, 2.30, 2.45, 2.60],
  12: [1.02, 1.04, 1.06, 1.08, 1.10, 1.15, 1.20, 1.25, 1.30, 1.40, 1.50, 1.60, 1.75, 1.90, 2.05, 2.20, 2.35, 2.50],
  13: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.60, 1.72, 1.84, 1.96, 2.08, 2.20],
  14: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.18, 1.22, 1.26, 1.32, 1.38, 1.48, 1.58, 1.68, 1.78, 1.88, 1.98],
  15: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.25, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90],
  16: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.32, 1.40, 1.48, 1.56, 1.64, 1.72],
  17: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.28, 1.32, 1.36, 1.40, 1.44, 1.48],
  18: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.26, 1.28, 1.30, 1.32, 1.34, 1.36],
  19: [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.26, 1.28, 1.30, 1.32],
  20: [1.05, 1.10, 1.15, 1.20, 1.25, 1.30, 1.35, 1.40, 1.45, 1.50, 1.55, 1.60, 1.65, 1.70, 1.75],
  21: [1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.00],
  22: [1.15, 1.30, 1.45, 1.60, 1.75, 1.90, 2.05, 2.20],
  23: [1.20, 1.40, 1.60, 1.80, 2.00, 2.20],
  24: [1.25]
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