import { storage } from '../storage';
import { WebSocket } from 'ws';
import { GameControlMessage } from '@shared/schema-admin-game-control';

// Map to track connected game clients by user ID and game ID
type ClientConnection = {
  ws: WebSocket;
  userId: number;
  gameId: number;
  sessionId: string;
  lastActivity: Date;
};

class AdvancedGameControlManager {
  // Store WebSocket connections by sessionId
  private clients: Map<string, ClientConnection> = new Map();
  // Store admin connections (those who can send control commands)
  private adminClients: Map<string, WebSocket> = new Map();

  /**
   * Register a new client connection
   */
  registerClient(
    ws: WebSocket, 
    userId: number, 
    gameId: number, 
    sessionId: string,
    isAdmin: boolean = false
  ): void {
    console.log(`Registering ${isAdmin ? 'admin' : 'player'} client: userId=${userId}, gameId=${gameId}, sessionId=${sessionId}`);
    
    if (isAdmin) {
      this.adminClients.set(sessionId, ws);
    } else {
      this.clients.set(sessionId, {
        ws,
        userId,
        gameId,
        sessionId,
        lastActivity: new Date()
      });
      
      // Register the session in the database
      this.trackGameSession(userId, gameId, sessionId, true);
    }
    
    // Setup disconnect handler
    ws.on('close', () => {
      console.log(`Client disconnected: ${sessionId}`);
      if (isAdmin) {
        this.adminClients.delete(sessionId);
      } else {
        this.clients.delete(sessionId);
        // Update database that session is disconnected
        this.trackGameSession(userId, gameId, sessionId, false);
      }
    });
  }
  
  /**
   * Track a game session in the database
   */
  private async trackGameSession(
    userId: number, 
    gameId: number, 
    sessionId: string, 
    isConnected: boolean
  ): Promise<void> {
    try {
      // Check if session exists
      const existingSession = await storage.getGameSessionBySessionId(sessionId);
      
      if (existingSession) {
        // Update existing session
        await storage.updateGameSession(existingSession.id, {
          isConnected,
          lastActivity: new Date(),
          currentState: isConnected ? 'connected' : 'disconnected'
        });
      } else {
        // Create new session
        await storage.createGameSession({
          userId,
          gameId,
          sessionId,
          isConnected,
          currentState: 'connected'
        });
      }
    } catch (error) {
      console.error('Error tracking game session:', error);
    }
  }

  /**
   * Update a client's activity timestamp
   */
  updateClientActivity(sessionId: string): void {
    const client = this.clients.get(sessionId);
    if (client) {
      client.lastActivity = new Date();
      
      // Also update in database
      this.trackGameSession(
        client.userId,
        client.gameId,
        sessionId,
        true
      );
    }
  }

  /**
   * Get all active sessions for a specific user and game
   */
  getActiveSessions(userId: number, gameId: number): ClientConnection[] {
    const activeSessions: ClientConnection[] = [];
    
    this.clients.forEach(client => {
      if (client.userId === userId && client.gameId === gameId) {
        activeSessions.push(client);
      }
    });
    
    return activeSessions;
  }

  /**
   * Send a control message to a specific client
   */
  sendControlToClient(sessionId: string, message: GameControlMessage): void {
    const client = this.clients.get(sessionId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send a control message to all sessions for a specific user and game
   */
  sendControlToUser(userId: number, gameId: number, message: GameControlMessage): void {
    this.clients.forEach(client => {
      if (client.userId === userId && client.gameId === gameId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Send a control message to all admin clients
   */
  broadcastToAdmins(message: any): void {
    this.adminClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Force a specific outcome for a user's game
   */
  async forceGameOutcome(
    userId: number, 
    gameId: number, 
    outcomeType: string, 
    multiplier?: number
  ): Promise<boolean> {
    try {
      // Get the active control for this user and game
      const userControl = await storage.getAdvancedUserGameControlByUserAndGame(userId, gameId);
      
      if (!userControl || !userControl.forceOutcome) {
        console.log(`No active control for user ${userId} on game ${gameId}`);
        return false;
      }
      
      // Construct the forced outcome message
      const message: GameControlMessage = {
        type: 'forced_outcome',
        payload: {
          userId,
          gameId,
          forcedOutcome: {
            outcomeType: userControl.outcomeType,
            multiplier: multiplier || userControl.exactMultiplier || 2.0
          }
        }
      };
      
      // Send to all of this user's active sessions
      this.sendControlToUser(userId, gameId, message);
      
      // Increment the counter for games played under this control
      await storage.incrementAdvancedUserGameControlCounter(userControl.id);
      
      return true;
    } catch (error) {
      console.error('Error forcing game outcome:', error);
      return false;
    }
  }

  /**
   * Check if a game outcome should be forced based on admin settings
   */
  async shouldForceOutcome(
    userId: number, 
    gameId: number
  ): Promise<{
    shouldForce: boolean;
    outcomeType?: string;
    exactMultiplier?: number;
    minMultiplier?: number;
    maxMultiplier?: number;
    triggerNearMiss?: boolean;
    nearMissValue?: number;
  }> {
    try {
      // First check user-specific control
      const userControl = await storage.getAdvancedUserGameControlByUserAndGame(userId, gameId);
      
      if (userControl && userControl.forceOutcome) {
        // Check if control is still active based on games played counter
        if (userControl.gamesPlayed < userControl.durationGames) {
          console.log(`Advanced user control: Forcing user ${userId} to ${userControl.outcomeType} on game ${gameId}`);
          
          return {
            shouldForce: true,
            outcomeType: userControl.outcomeType,
            exactMultiplier: userControl.exactMultiplier ? parseFloat(userControl.exactMultiplier.toString()) : undefined,
            minMultiplier: userControl.minMultiplier ? parseFloat(userControl.minMultiplier.toString()) : undefined,
            maxMultiplier: userControl.maxMultiplier ? parseFloat(userControl.maxMultiplier.toString()) : undefined,
            triggerNearMiss: userControl.triggerNearMiss,
            nearMissValue: userControl.nearMissValue ? parseFloat(userControl.nearMissValue.toString()) : undefined
          };
        }
      }
      
      // If no user-specific control, check global control
      const globalControl = await storage.getGlobalGameControl();
      
      if (globalControl) {
        const affectedGames = globalControl.affectedGames as number[] || [];
        
        // If no games specified or this game is in the affected list
        if (affectedGames.length === 0 || affectedGames.includes(gameId)) {
          if (globalControl.forceAllUsersLose) {
            console.log(`Global control: Forcing all users to LOSE on game ${gameId}`);
            return {
              shouldForce: true,
              outcomeType: 'loss'
            };
          } else if (globalControl.forceAllUsersWin) {
            console.log(`Global control: Forcing all users to WIN on game ${gameId}`);
            return {
              shouldForce: true,
              outcomeType: 'win',
              exactMultiplier: globalControl.targetMultiplier ? parseFloat(globalControl.targetMultiplier.toString()) : 2.0
            };
          }
        }
      }
      
      // No controls apply
      return { shouldForce: false };
    } catch (error) {
      console.error('Error checking advanced game outcome controls:', error);
      // In case of error, default to no forced outcome
      return { shouldForce: false };
    }
  }

  /**
   * Apply game control settings to modify a crash point
   */
  async getControlledCrashPoint(
    userId: number,
    gameId: number,
    originalCrashPoint: number
  ): Promise<number> {
    try {
      // Check if we should force an outcome
      const controlResult = await this.shouldForceOutcome(userId, gameId);
      
      if (controlResult.shouldForce) {
        console.log(`Applying controlled crash point for user ${userId} on game ${gameId}`);
        
        if (controlResult.outcomeType === 'win') {
          // For wins, we need to ensure the crash point is high enough
          
          // If we have an exact multiplier, use that
          if (controlResult.exactMultiplier) {
            console.log(`Using exact multiplier: ${controlResult.exactMultiplier}x`);
            return controlResult.exactMultiplier;
          }
          
          // If we have a range, pick a random value in that range
          if (controlResult.minMultiplier && controlResult.maxMultiplier) {
            const range = controlResult.maxMultiplier - controlResult.minMultiplier;
            const randomMultiplier = controlResult.minMultiplier + (Math.random() * range);
            console.log(`Using random multiplier in range: ${randomMultiplier.toFixed(2)}x`);
            return parseFloat(randomMultiplier.toFixed(2));
          }
          
          // Default to a reasonable win multiplier (at least 1.5x)
          const defaultWinMultiplier = Math.max(1.5, originalCrashPoint);
          console.log(`Using default win multiplier: ${defaultWinMultiplier.toFixed(2)}x`);
          return defaultWinMultiplier;
        } else {
          // For losses, ensure the crash point is low (1.0x to 1.2x for near-miss effect)
          
          // If we should trigger a near miss
          if (controlResult.triggerNearMiss && controlResult.nearMissValue) {
            console.log(`Triggering near miss at ${controlResult.nearMissValue}x`);
            return controlResult.nearMissValue;
          }
          
          // Random near-miss value between 1.01x and 1.2x
          const nearMissMultiplier = 1 + (Math.random() * 0.2);
          console.log(`Using near-miss multiplier: ${nearMissMultiplier.toFixed(2)}x`);
          return parseFloat(nearMissMultiplier.toFixed(2));
        }
      }
      
      // No control, return original value
      return originalCrashPoint;
    } catch (error) {
      console.error('Error applying game control to crash point:', error);
      // In case of error, return original crash point
      return originalCrashPoint;
    }
  }

  /**
   * Send an admin message to a specific user
   */
  sendAdminMessage(userId: number, gameId: number, message: string): void {
    const controlMessage: GameControlMessage = {
      type: 'admin_message',
      payload: {
        userId,
        gameId,
        message
      }
    };
    
    this.sendControlToUser(userId, gameId, controlMessage);
  }

  /**
   * Handle an incoming message from a WebSocket client
   */
  handleMessage(message: string, sessionId: string, isAdmin: boolean = false): void {
    try {
      const data = JSON.parse(message);
      
      // Update client activity
      if (!isAdmin) {
        this.updateClientActivity(sessionId);
      }
      
      // Route the message based on its type
      if (data.type === 'game_state' && !isAdmin) {
        // Client is updating their game state
        const client = this.clients.get(sessionId);
        if (client) {
          // Notify admins about state change
          this.broadcastToAdmins({
            type: 'client_update',
            payload: {
              userId: client.userId,
              gameId: client.gameId,
              sessionId,
              state: data.payload.gameState,
              timestamp: new Date().toISOString()
            }
          });
        }
      } else if (data.type === 'admin_control' && isAdmin) {
        // Admin is sending a control command
        const { userId, gameId, control } = data.payload;
        
        if (userId && gameId && control) {
          // Apply the control and propagate to client
          this.applyAdminControl(userId, gameId, control);
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Apply an admin control to a user's game
   */
  private async applyAdminControl(
    userId: number, 
    gameId: number, 
    control: {
      action: string;
      value?: any;
    }
  ): Promise<void> {
    try {
      switch (control.action) {
        case 'force_win':
          await this.forceGameOutcome(
            userId, 
            gameId, 
            'win', 
            control.value?.multiplier
          );
          break;
          
        case 'force_loss':
          await this.forceGameOutcome(
            userId,
            gameId,
            'loss'
          );
          break;
          
        case 'send_message':
          if (control.value?.message) {
            this.sendAdminMessage(
              userId,
              gameId,
              control.value.message
            );
          }
          break;
          
        default:
          console.log(`Unknown control action: ${control.action}`);
      }
    } catch (error) {
      console.error('Error applying admin control:', error);
    }
  }
}

// Create a singleton instance
export const advancedGameControl = new AdvancedGameControlManager();