import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * GameOutcomeControlMiddleware
 * This middleware checks user-specific and global game controls to determine if the outcome
 * should be manipulated.
 */
export const gameOutcomeControl = {
  /**
   * Check if a user's game outcome should be forced based on admin controls
   * This checks both user-specific and global control settings
   */
  async shouldForceOutcome(
    userId: number, 
    gameId: number
  ): Promise<{ 
    shouldForce: boolean, 
    forcedOutcome: 'win' | 'lose',
    forcedValue?: any,
    targetMultiplier?: number,
    useExactMultiplier?: boolean
  }> {
    // Default result - no forced outcome
    const defaultResult = { 
      shouldForce: false, 
      forcedOutcome: 'lose' as 'win' | 'lose'
    };

    try {
      // Step 1: Check global game controls (highest priority)
      const globalControl = await storage.getGlobalGameControl();
      
      if (globalControl) {
        // Check if this game is affected (empty array means all games)
        const affectedGames = Array.isArray(globalControl.affectedGames) ? globalControl.affectedGames : [];
        const isAffectedGame = 
          affectedGames.length === 0 || 
          affectedGames.includes(gameId);
        
        if (isAffectedGame) {
          // Force all users to lose takes precedence over win
          if (globalControl.forceAllUsersLose) {
            console.log(`Global control: Forcing user ${userId} to LOSE on game ${gameId}`);
            return { 
              shouldForce: true, 
              forcedOutcome: 'lose'
            };
          } 
          
          // Force all users to win is checked next
          if (globalControl.forceAllUsersWin) {
            console.log(`Global control: Forcing user ${userId} to WIN on game ${gameId}`);
            return { 
              shouldForce: true, 
              forcedOutcome: 'win',
              targetMultiplier: globalControl.targetMultiplier || 2.0,
              useExactMultiplier: globalControl.useExactMultiplier || false
            };
          }
        }
      }
      
      // Step 2: If no global override, check user specific controls
      const userGameControl = await storage.getUserGameControlByUserAndGame(userId, gameId);
      
      if (userGameControl && userGameControl.forceOutcome) {
        // Check if control is still active based on games played counter
        if (userGameControl.gamesPlayed < userGameControl.durationGames) {
          console.log(`User control: Forcing user ${userId} to ${userGameControl.outcomeType.toUpperCase()} on game ${gameId}`);
          
          // Increment the counter
          await storage.incrementUserGameControlCounter(userGameControl.id);
          
          return {
            shouldForce: true,
            forcedOutcome: userGameControl.outcomeType as 'win' | 'lose',
            forcedValue: userGameControl.forcedOutcomeValue,
            targetMultiplier: userGameControl.targetMultiplier || 2.0,
            useExactMultiplier: userGameControl.useExactMultiplier || false
          };
        }
      }
      
      // No controls apply, return default
      return defaultResult;
    } catch (error) {
      console.error('Error checking game outcome controls:', error);
      // In case of error, default to no forced outcome
      return defaultResult;
    }
  },
  
  /**
   * Apply game outcome control settings to a crash point
   * Returns a modified crash point based on control settings
   */
  async getControlledCrashPoint(
    userId: number,
    gameId: number,
    originalCrashPoint: number,
    targetMultiplier: number
  ): Promise<number> {
    try {
      // Check if we need to force the outcome
      const controlResult = await this.shouldForceOutcome(userId, gameId);
      const { shouldForce, forcedOutcome, forcedValue, targetMultiplier: adminTargetMultiplier, useExactMultiplier } = controlResult;
      
      if (shouldForce) {
        // If forcing a win, make sure crash point is higher than target multiplier
        if (forcedOutcome === 'win') {
          // If admin wants to force an exact multiplier (e.g., 2.0x)
          if (useExactMultiplier && adminTargetMultiplier) {
            console.log(`Using exact multiplier of ${adminTargetMultiplier}x for user ${userId}`);
            // Set crash point to exactly the target multiplier + small buffer for auto-cashout
            return adminTargetMultiplier + 0.01;
          }
          
          // If we have a specific forced value, use that
          if (forcedValue && typeof forcedValue === 'number') {
            return Math.max(forcedValue, targetMultiplier + 0.01);
          }
          
          // Otherwise ensure crash point is higher than target
          return Math.max(originalCrashPoint, targetMultiplier + 0.5);
        } 
        // If forcing a loss, make sure crash point is lower than target multiplier
        else if (forcedOutcome === 'lose') {
          // If we have a specific forced value, use that
          if (forcedValue && typeof forcedValue === 'number') {
            return Math.min(forcedValue, targetMultiplier - 0.01);
          }
          // Otherwise set crash point to 1.0 (immediate crash) or slightly below target
          return Math.min(originalCrashPoint, targetMultiplier - 0.01);
        }
      }
      
      // No forced outcome, return original crash point
      return originalCrashPoint;
    } catch (error) {
      console.error('Error applying controlled crash point:', error);
      // In case of error, return original value
      return originalCrashPoint;
    }
  },
  
  /**
   * Apply game outcome control settings to mines positions
   */
  async getControlledMinePositions(
    userId: number,
    gameId: number,
    originalMinePositions: number[],
    currentlyRevealed: number[],
    totalSquares: number = 25,
    mineCount: number = 5
  ): Promise<number[]> {
    try {
      // Check if we need to force the outcome
      const controlResult = await this.shouldForceOutcome(userId, gameId);
      const { shouldForce, forcedOutcome, forcedValue, targetMultiplier, useExactMultiplier } = controlResult;
      
      if (shouldForce) {
        // If forcing a win, ensure no mines are in the revealed positions
        if (forcedOutcome === 'win') {
          // For exact 2x multiplier with Mines game (or very close to it)
          if (useExactMultiplier && targetMultiplier) {
            // Import the accurate multiplier table
            const { findClosestMultiplier } = require('../../shared/minesMultiplierTable');
            
            console.log(`[MINES] Forcing exact ${targetMultiplier}x multiplier for user ${userId} with ${mineCount} mines`);
            
            // For extreme high mine count (like 20+ mines), we need special handling
            // because the multiplier table might not work as expected
            if (mineCount >= 20 && Math.abs(targetMultiplier - 2.0) < 0.01) {
              console.log(`[MINES] High mine count detected (${mineCount}), using special 2x handling`);
              
              // For 20 mines specifically with 2x target:
              // We need to place mines carefully to get exactly 2x

              // With 20 mines and 5 total spaces for gems:
              // Collect 1 gem = 5.0x
              // We'll place mines in specific spots to allow collecting EXACTLY 1 gem
              
              // Get all available positions
              const availablePositions = Array.from({ length: totalSquares }, (_, i) => i)
                .filter(pos => !currentlyRevealed.includes(pos));
                
              // Shuffle positions
              const shuffled = [...availablePositions].sort(() => 0.5 - Math.random());
              
              // Reserve 1 position for a gem (no mine) to achieve 5.0x multiplier
              // which will be rounded to 2.0x for this case
              const safePositions = shuffled.slice(0, 1);
              const minePositions = shuffled.slice(1, mineCount + 1);
              
              console.log(`[MINES] High mine special case: Reserved ${safePositions.length} safe positions, generated ${minePositions.length} mine positions`);
              
              return minePositions;
            }
            
            // Use our accurate multiplier table to find the closest target
            const closestOption = findClosestMultiplier(mineCount, targetMultiplier);
            
            if (closestOption) {
              const { gems, multiplier } = closestOption;
              
              console.log(`[MINES] Found exact multiplier configuration: ${gems} gems needed for ${multiplier}x multiplier`);
              
              // Calculate how many gems are already revealed
              const revealedGems = currentlyRevealed.length;
              
              // How many more gems to reveal to hit target
              const remainingGemsToReveal = Math.max(0, gems - revealedGems);
              console.log(`[MINES] Already revealed ${revealedGems} gems, need ${remainingGemsToReveal} more to reach ${multiplier}x`);
              
              // Get all available positions
              const availablePositions = Array.from({ length: totalSquares }, (_, i) => i)
                .filter(pos => !currentlyRevealed.includes(pos));
              
              // Create a weighted shuffle function for more varied patterns
              const weightedShuffle = (positions) => {
                // Create a biased distribution of positions based on grid pattern
                // We'll add slight bias to positions near the edges or center
                return positions.sort((a, b) => {
                  // Convert positions to 2D grid coordinates (assuming 5x5 grid)
                  const aX = a % 5, aY = Math.floor(a / 5);
                  const bX = b % 5, bY = Math.floor(b / 5);
                  
                  // Calculate distance from center
                  const aDistCenter = Math.sqrt(Math.pow(aX - 2, 2) + Math.pow(aY - 2, 2));
                  const bDistCenter = Math.sqrt(Math.pow(bX - 2, 2) + Math.pow(bY - 2, 2));
                  
                  // Calculate distance from edge
                  const aDistEdge = Math.min(aX, 4-aX, aY, 4-aY);
                  const bDistEdge = Math.min(bX, 4-bX, bY, 4-bY);
                  
                  // Randomly choose a bias pattern (center bias, edge bias, or random)
                  const biasPattern = Math.floor(Math.random() * 3);
                  
                  if (biasPattern === 0) {
                    // Center bias: prefer positions closer to center
                    return aDistCenter - bDistCenter;
                  } else if (biasPattern === 1) {
                    // Edge bias: prefer positions closer to edges
                    return bDistEdge - aDistEdge;
                  } else {
                    // Pure random
                    return Math.random() - 0.5;
                  }
                });
              };
              
              // Use weighted shuffle instead of pure random
              const shuffled = weightedShuffle([...availablePositions]);
              
              // Reserve the first 'remainingGemsToReveal' positions for gems (no mines)
              const safePositions = shuffled.slice(0, remainingGemsToReveal);
              
              // The rest can be mines, but we only need 'mineCount' mines
              const potentialMinePositions = shuffled.slice(remainingGemsToReveal);
              
              // Randomly select mine positions from the potential positions 
              // ensuring we always have exactly mineCount mines
              const minePositions = [];
              while (minePositions.length < mineCount && potentialMinePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * potentialMinePositions.length);
                minePositions.push(potentialMinePositions[randomIndex]);
                potentialMinePositions.splice(randomIndex, 1);
              }
              
              console.log(`[MINES] Generated ${minePositions.length} mine positions for exact ${multiplier}x multiplier`);
              
              return minePositions;
            } else {
              console.log(`[MINES] Could not find an exact multiplier configuration for ${targetMultiplier}x with ${mineCount} mines`);
              
              // Fallback to more generic logic if we can't find a perfect match
              
              // Get the total number of safe tiles (non-mines)
              const totalNonMines = totalSquares - mineCount;
              
              // For 2.0x multiplier specifically, we can use a simple approximation
              if (Math.abs(targetMultiplier - 2.0) < 0.01) {
                console.log(`[MINES] Using fallback approximation for 2.0x multiplier`);
                
                // Create a variety of reveal counts around the target value
                const targetRevealCount = Math.floor(totalNonMines / 2);
                const revealOptions = [
                  targetRevealCount - 1,
                  targetRevealCount,
                  targetRevealCount + 1
                ].filter(n => n > 0 && n < totalNonMines); // Ensure valid counts
                
                // Randomly choose one of the reveal options
                const selectedRevealCount = revealOptions[Math.floor(Math.random() * revealOptions.length)];
                console.log(`[MINES] Selected varied reveal count for 2x: ${selectedRevealCount}/${totalNonMines} safe tiles`);
                
                // Make sure already revealed tiles are counted toward this goal
                const remainingToReveal = Math.max(0, selectedRevealCount - currentlyRevealed.length);
                
                // Get all possible positions
                const availablePositions = Array.from({ length: totalSquares }, (_, i) => i)
                  .filter(pos => !currentlyRevealed.includes(pos));
                
                // Shuffle positions
                const shuffled = [...availablePositions].sort(() => 0.5 - Math.random());
                
                // Take the positions after remainingToReveal for mines
                // This ensures we leave enough safe tiles to reach the target multiplier
                const minePositions = shuffled.slice(remainingToReveal, remainingToReveal + mineCount);
                
                return minePositions;
              } else {
                // For other multipliers, we'll need a different approach
                console.log(`[MINES] Using proportional approach for ${targetMultiplier}x multiplier`);
                
                // Get all possible positions
                const availablePositions = Array.from({ length: totalSquares }, (_, i) => i)
                  .filter(pos => !currentlyRevealed.includes(pos));
                
                // Shuffle positions
                const shuffled = [...availablePositions].sort(() => 0.5 - Math.random());
                
                // Calculate a suitable number of gems to reveal based on the target multiplier
                // The higher the multiplier, the fewer gems should be revealed
                const minGems = 1;
                const maxGems = totalNonMines - currentlyRevealed.length - 1;
                
                // Inverse relationship between multiplier and gems to reveal
                // 2x -> ~50% of gems, 10x -> ~20% of gems, etc.
                const targetPercentage = Math.min(0.8, 1 / targetMultiplier);
                const targetGems = Math.max(minGems, Math.min(maxGems, Math.floor(totalNonMines * targetPercentage)));
                
                // Make sure already revealed tiles are counted toward this goal
                const remainingToReveal = Math.max(0, targetGems - currentlyRevealed.length);
                
                // Take the positions after remainingToReveal for mines
                // This ensures we leave enough safe tiles to reach the target multiplier
                const minePositions = shuffled.slice(remainingToReveal, remainingToReveal + mineCount);
                
                return minePositions;
              }
            }
          }
          
          // If we have forced mine positions, use those
          if (forcedValue && Array.isArray(forcedValue)) {
            return forcedValue;
          }
          
          // Otherwise modify positions to avoid revealed tiles
          const safePositions = originalMinePositions.filter(
            pos => !currentlyRevealed.includes(pos)
          );
          return safePositions;
        } 
        // If forcing a loss, ensure at least one mine is in the next revealed position
        else if (forcedOutcome === 'lose') {
          // If we have forced mine positions, use those
          if (forcedValue && Array.isArray(forcedValue)) {
            return forcedValue;
          }
          
          // For now, do basic loss implementation
          // In a real implementation, you would determine the next likely position
          // and place a mine there
          return originalMinePositions;
        }
      }
      
      // No forced outcome, return original positions
      return originalMinePositions;
    } catch (error) {
      console.error('Error applying controlled mine positions:', error);
      // In case of error, return original value
      return originalMinePositions;
    }
  }
};