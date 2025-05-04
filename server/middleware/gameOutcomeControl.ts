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
          // For exact 2x multiplier with Mines game
          if (useExactMultiplier && targetMultiplier && targetMultiplier === 2.0) {
            console.log(`Forcing exact 2x multiplier for Mines game for user ${userId}`);
            
            // For most Mines configurations, revealing about half the non-mine squares
            // will give approximately 2x multiplier
            // We'll calculate the optimal mine positions for this
            const totalNonMines = totalSquares - mineCount;
            const tilesToReveal = Math.ceil(totalNonMines / 2); // Revealing ~50% of safe tiles
            
            // Make sure already revealed tiles are counted toward this goal
            const remainingToReveal = Math.max(0, tilesToReveal - currentlyRevealed.length);
            
            // Place mines in positions that aren't already revealed and won't be needed
            // to reach the target multiplier
            const availablePositions = Array.from({ length: totalSquares }, (_, i) => i)
              .filter(pos => !currentlyRevealed.includes(pos));
            
            // Shuffle available positions
            const shuffled = [...availablePositions].sort(() => 0.5 - Math.random());
            
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