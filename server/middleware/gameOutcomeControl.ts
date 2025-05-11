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
    // Default result - Now default is to NOT force outcomes, letting the game use natural distribution
    const defaultResult = { 
      shouldForce: false, // Changed to false - default is to NOT force outcome
      forcedOutcome: 'lose' as 'win' | 'lose' // Only used when shouldForce is true
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
          // ONLY SCENARIO WHERE PLAYERS CAN WIN - when admin explicitly enables it
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
      
      // No specific controls apply, return default (which is now to NOT force an outcome)
      console.log(`DEFAULT BEHAVIOR: Natural distribution for user ${userId} on game ${gameId} (no forced outcome)`);
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
      // SPECIAL IMPLEMENTATION FOR GAME ID 7
      if (gameId === 7) {
        console.log(`Game ID 7 detected - using special crash behavior`);
        
        // Check if any PLAYER bets exist for this game (not system-generated bets)
        // Real players have userId > 0, system bets typically have userId = 0 or a negative value
        const bets = await storage.getBetsByGameId(7, 'active');
        const hasPlayerBets = bets && bets.filter(bet => bet.userId > 0).length > 0;
        
        console.log(`Game ID 7: Total active bets: ${bets?.length || 0}, Player bets: ${bets?.filter(bet => bet.userId > 0).length || 0}`);
        
        if (!hasPlayerBets) {
          // No player bets - VERY high multipliers
          console.log(`Game ID 7: No player bets - generating high crash point`);
          const r = Math.random();
          
          if (r < 0.05) {
            // Medium crash (10.00x to 20.00x) - 5% chance
            return 10.00 + (Math.random() * 10);
          } else if (r < 0.30) {
            // Higher crash (20.00x to 50.00x) - 25% chance
            return 20.00 + (Math.random() * 30);
          } else if (r < 0.60) {
            // Very high crash (50.00x to 100.00x) - 30% chance
            return 50.00 + (Math.random() * 50);
          } else if (r < 0.85) {
            // Extreme crash (100.00x to 200.00x) - 25% chance
            return 100.00 + (Math.random() * 100);
          } else {
            // Ultra rare mega crash (200.00x to 500.00x) - 15% chance
            return 200.00 + (Math.random() * 300);
          }
        } else {
          // Player bets exist - more balanced distribution with improved variety
          console.log(`Game ID 7: Player bets exist - generating balanced crash point distribution`);
          const r = Math.random();
          
          if (r < 0.25) {
            // Low multipliers (1.00x to 1.50x) - 25% chance
            return 1.00 + (Math.random() * 0.5);
          } else if (r < 0.50) {
            // Medium-low multipliers (1.50x to 3.00x) - 25% chance
            return 1.50 + (Math.random() * 1.5);
          } else if (r < 0.75) {
            // Medium multipliers (3.00x to 10.00x) - 25% chance
            return 3.00 + (Math.random() * 7.0);
          } else if (r < 0.95) {
            // High multipliers (10.00x to 50.00x) - 20% chance
            return 10.00 + (Math.random() * 40.0);
          } else {
            // Extremely high multipliers (50.00x to 100.00x) - 5% chance
            return 50.00 + (Math.random() * 50.0);
          }
        }
      }
      
      // For all other games, check if we need to force the outcome
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
        // If forcing a loss, make sure crash point is much lower than target multiplier
        // Now we use a more aggressive approach to ensure users lose
        else if (forcedOutcome === 'lose') {
          // If we have a specific forced value, use that
          if (forcedValue && typeof forcedValue === 'number') {
            return Math.min(forcedValue, 1.05); // Hard cap at 1.05x multiplier
          }
          
          // Generate a varied crash point distribution when forcing a loss
          // This will create a more natural pattern of crash points
          const r = Math.random();
          if (r < 0.30) {
            return 1.00 + (Math.random() * 0.10); // 1.00-1.10x (30% chance)
          } else if (r < 0.70) {
            return 1.10 + (Math.random() * 0.20); // 1.10-1.30x (40% chance) 
          } else if (r < 0.90) {
            return 1.30 + (Math.random() * 0.30); // 1.30-1.60x (20% chance)
          } else {
            return 1.60 + (Math.random() * 0.40); // 1.60-2.00x (10% chance)
          }
          
          // This ensures that almost all bets lose unless the player cashes out extremely early
          // Original code (commented out):
          // return Math.min(originalCrashPoint, targetMultiplier - 0.01);
        }
      }
      
      // If no forced outcome, use a natural distribution (this will happen in our new setup)
      // Use the original crash point that was passed in, providing a natural experience
      console.log(`Using natural crash point ${originalCrashPoint.toFixed(2)}x for user ${userId} on game ${gameId}`);
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
      // Removed the override that forced a loss for Mines game (gameId 1)
      // Now using the standard game outcome control like all other games
      
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
              const weightedShuffle = (positions: number[]) => {
                // Create a biased distribution of positions based on grid pattern
                // We'll add slight bias to positions near the edges or center
                return positions.sort((a: number, b: number) => {
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
        // If forcing a loss, ensure mines are EVERYWHERE (guaranteed loss)
        else if (forcedOutcome === 'lose') {
          // If we have forced mine positions, use those
          if (forcedValue && Array.isArray(forcedValue)) {
            return forcedValue;
          }
          
          // ALWAYS GUARANTEE A LOSS by placing mines in all positions
          // except those already revealed
          const availablePositions = Array.from({ length: totalSquares }, (_, i) => i)
            .filter(pos => !currentlyRevealed.includes(pos));
          
          console.log(`[MINES] Enforcing loss by placing mines in all ${availablePositions.length} available positions`);
          
          // Return all available positions as mines
          return availablePositions;
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