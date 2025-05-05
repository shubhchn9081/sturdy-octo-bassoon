import { TowerClimbOutcome } from '@shared/schema';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { generateRandomNumber } from './provably-fair';
import crypto from 'crypto';

// Special item types
enum SpecialItemType {
  SHIELD = 'shield',
  SCANNER = 'scanner',
  DOUBLE = 'double',
}

// Tile types
enum TileType {
  SAFE = 'safe',
  TRAP = 'trap',
  SPECIAL_ITEM = 'special_item',
}

/**
 * Generate a provably fair tower layout
 * @param serverSeed Server seed for randomization
 * @param clientSeed Client seed for randomization
 * @param nonce Nonce for randomization
 * @param towerHeight Height of the tower (number of levels)
 * @param towerWidth Width of the tower (number of positions per level)
 */
export const generateTowerLayout = (
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  towerHeight: number = 10,
  towerWidth: number = 3
): {
  safe: number[][],
  traps: number[][],
  items: { level: number, position: number, type: string }[]
} => {
  // Create arrays to hold the positions
  const safe: number[][] = [];
  const traps: number[][] = [];
  const items: { level: number, position: number, type: string }[] = [];
  
  // First level is always all safe
  safe[0] = Array.from({ length: towerWidth }, (_, i) => i);
  
  // Generate the rest of the tower
  for (let level = 1; level < towerHeight; level++) {
    safe[level] = [];
    traps[level] = [];
    
    // Base probabilities that change with level
    const trapProbability = 0.1 + (level * 0.05); // Increases with level
    const itemProbability = 0.05; // Constant
    
    // Generate deterministic random positions for this level
    for (let pos = 0; pos < towerWidth; pos++) {
      // Generate deterministic random number for this position
      const seed = `${serverSeed}:${clientSeed}:${nonce}:${level}:${pos}`;
      const hash = crypto.createHash('sha256').update(seed).digest('hex');
      const randomValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
      
      if (randomValue < trapProbability) {
        traps[level].push(pos);
      } else if (randomValue < trapProbability + itemProbability) {
        // Determine item type
        const itemTypeSeed = `${serverSeed}:${clientSeed}:${nonce}:${level}:${pos}:item`;
        const itemHash = crypto.createHash('sha256').update(itemTypeSeed).digest('hex');
        const itemRandom = parseInt(itemHash.substring(0, 8), 16) % 3;
        
        let itemType: string;
        switch (itemRandom) {
          case 0:
            itemType = SpecialItemType.SHIELD;
            break;
          case 1:
            itemType = SpecialItemType.SCANNER;
            break;
          case 2:
            itemType = SpecialItemType.DOUBLE;
            break;
          default:
            itemType = SpecialItemType.SHIELD;
        }
        
        items.push({ level, position: pos, type: itemType });
        safe[level].push(pos);
      } else {
        safe[level].push(pos);
      }
    }
    
    // Ensure there's at least one safe position on each level
    if (safe[level].length === 0) {
      const forcedSafePosition = level % towerWidth;
      safe[level].push(forcedSafePosition);
      
      // Remove this position from traps if it exists
      const trapIndex = traps[level].indexOf(forcedSafePosition);
      if (trapIndex !== -1) {
        traps[level].splice(trapIndex, 1);
      }
    }
  }
  
  return { safe, traps, items };
};

/**
 * Calculate the tower climb multiplier based on level reached
 * @param level Level reached
 * @param baseMultiplier Base multiplier (default 1.0)
 * @param incrementPerLevel Multiplier increment per level (default 0.2)
 */
export const calculateTowerMultiplier = (
  level: number,
  baseMultiplier: number = 1.0,
  incrementPerLevel: number = 0.2
): number => {
  return baseMultiplier + (level * incrementPerLevel);
};

/**
 * Handle outcome control for tower climb game
 */
export const handleTowerClimbOutcomeControl = async (
  userId: number,
  gameId: number,
  towerHeight: number,
  options: any = {}
): Promise<{
  shouldForceOutcome: boolean;
  layout?: {
    safe: number[][];
    traps: number[][];
    items: { level: number, position: number, type: string }[];
  };
  maxSafeLevel?: number;
}> => {
  // Check for forced outcomes from admin controls
  const control = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  
  if (!control.shouldForce) {
    return { shouldForceOutcome: false };
  }
  
  // Handle force win scenario
  if (control.forcedOutcome === 'win') {
    // Create a tower layout where player can reach the top safely
    const layout = {
      safe: Array(towerHeight).fill([]).map((_, i) => [1]), // Middle path is always safe
      traps: Array(towerHeight).fill([]).map((_, i) => [0, 2]), // Traps on sides
      items: [] // No special items needed for guaranteed win
    };
    
    return {
      shouldForceOutcome: true,
      layout,
      maxSafeLevel: towerHeight // Can reach the top
    };
  } 
  // Handle force lose scenario
  else {
    // Create a tower with traps that will cause player to lose after a few levels
    const maxSafeLevel = Math.min(3, towerHeight - 1); // Allow at most 3 safe levels
    
    const layout = {
      safe: Array(towerHeight).fill([]).map((_, i) => i <= maxSafeLevel ? [1] : []), // Safe up to maxSafeLevel
      traps: Array(towerHeight).fill([]).map((_, i) => i <= maxSafeLevel ? [0, 2] : [0, 1, 2]), // All traps after maxSafeLevel
      items: [] // No special items
    };
    
    return {
      shouldForceOutcome: true,
      layout,
      maxSafeLevel
    };
  }
};

export default {
  generateTowerLayout,
  calculateTowerMultiplier,
  handleTowerClimbOutcomeControl
};