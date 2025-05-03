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
    forcedValue?: any 
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
        const isAffectedGame = 
          globalControl.affectedGames.length === 0 || 
          globalControl.affectedGames.includes(gameId);
        
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
              forcedOutcome: 'win'
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
            forcedValue: userGameControl.forcedOutcomeValue
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
      const { shouldForce, forcedOutcome, forcedValue } = 
        await this.shouldForceOutcome(userId, gameId);
      
      if (shouldForce) {
        // If forcing a win, make sure crash point is higher than target multiplier
        if (forcedOutcome === 'win') {
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
    currentlyRevealed: number[]
  ): Promise<number[]> {
    try {
      // Check if we need to force the outcome
      const { shouldForce, forcedOutcome, forcedValue } = 
        await this.shouldForceOutcome(userId, gameId);
      
      if (shouldForce) {
        // If forcing a win, ensure no mines are in the revealed positions
        if (forcedOutcome === 'win') {
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