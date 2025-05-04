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
          if (useExactMultiplier && targetMultiplier && Math.abs(targetMultiplier - 2.0) < 0.01) {
            console.log(`Forcing exact 2x multiplier for Mines game for user ${userId}`);
            
            // Create a more varied path for 2x multiplier
            // Instead of always revealing half the safe tiles, we'll vary it a bit
            // The multiplier in Mines is roughly calculated as: totalSquares / (totalSquares - mineCount - revealed)
            
            // Get the total number of safe tiles (non-mines)
            const totalNonMines = totalSquares - mineCount;
            
            // Calculate multiple possible reveal amounts that will lead to approximately 2x
            // We'll use the formula: multiplier ≈ totalNonMines / (totalNonMines - tilesRevealed)
            // For 2x, that means: totalNonMines / (totalNonMines - tilesRevealed) ≈ 2
            // Which gives: tilesRevealed ≈ totalNonMines / 2
            
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
            
            // Create a weighted shuffle function to create more varied patterns
            // This places mines with higher probability in certain areas of the grid
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
            
            // Take the positions after remainingToReveal for mines
            // This ensures we leave enough safe tiles to reach the target multiplier
            const minePositions = shuffled.slice(remainingToReveal, remainingToReveal + mineCount);
            
            return minePositions;
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