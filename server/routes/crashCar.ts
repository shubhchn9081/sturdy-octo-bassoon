import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { auth } from '../middleware/auth';
import { createCrashCarOutcome } from '../games/crashCar';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';

const router = express.Router();

// Game constants
const CRASH_CAR_GAME_ID = 101; // Unique ID for Crash Car game
const WAITING_PERIOD_MS = 10000; // 10 seconds waiting period
const FORCE_CRASH_TIMEOUT_MS = 120000; // Force game end after 2 minutes max

// Game state enum
enum GameState {
  WAITING = 'waiting',
  RUNNING = 'running',
  CRASHED = 'crashed'
}

// WebSocket messages and game state
interface GameStateInfo {
  state: GameState;
  countdown: number | null;
  currentMultiplier: number;
  crashPoint: number | null;
  startTime: number | null;
  crashTime: number | null;
  activeBets: ActiveBet[];
  gameId: string;
  previousGames: PreviousGame[];
}

interface ActiveBet {
  userId: number;
  username: string;
  amount: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
  profit: number | null;
}

interface PreviousGame {
  crashPoint: number;
  timestamp: number;
}

// Track active game state
let gameState: GameStateInfo = {
  state: GameState.WAITING,
  countdown: WAITING_PERIOD_MS / 1000,
  currentMultiplier: 1.0,
  crashPoint: null,
  startTime: null,
  crashTime: null,
  activeBets: [],
  gameId: generateGameId(),
  previousGames: []
};

// Game timers
let gameCountdownInterval: NodeJS.Timeout | null = null;
let gameRunningInterval: NodeJS.Timeout | null = null;
let forceCrashTimeout: NodeJS.Timeout | null = null;

// Generate a unique game ID
function generateGameId(): string {
  return `car-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Calculate current multiplier based on elapsed time
function calculateMultiplier(elapsedMs: number): number {
  // Use an exponential curve formula: 1.0 + 0.05 * (e^(t/15) - 1)
  // This gives a curve that starts slow and accelerates
  const elapsedSec = elapsedMs / 1000;
  const growthFactor = 0.05;
  const multiplier = 1.0 + growthFactor * (Math.exp(elapsedSec / 15) - 1);
  
  // Round to 2 decimal places
  return Math.round(multiplier * 100) / 100;
}

// Start a new game round
function startNewGameRound() {
  // Reset game state
  gameState = {
    state: GameState.WAITING,
    countdown: WAITING_PERIOD_MS / 1000,
    currentMultiplier: 1.0,
    crashPoint: null,
    startTime: null,
    crashTime: null,
    activeBets: [],
    gameId: generateGameId(),
    previousGames: gameState.previousGames.slice(0, 20) // Keep only last 20 games
  };
  
  console.log(`Starting new Crash Car game round: ${gameState.gameId}`);
  
  // Start countdown timer
  gameCountdownInterval = setInterval(() => {
    gameState.countdown!--;
    
    // Broadcast updated game state to all clients
    broadcastGameState();
    
    if (gameState.countdown! <= 0) {
      clearInterval(gameCountdownInterval!);
      gameCountdownInterval = null;
      startGameRunning();
    }
  }, 1000);
  
  // Broadcast initial game state
  broadcastGameState();
}

// Start the running phase of the game
async function startGameRunning() {
  // Generate a fair crash point for this round
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const clientSeed = gameState.gameId;
  const nonce = Date.now();
  
  // Use an admin user ID for the global crash point
  const adminUserId = 1; // Assuming admin user has ID 1
  
  try {
    // Use the crash car game logic to generate a crash point
    const outcome = await createCrashCarOutcome(
      serverSeed,
      clientSeed,
      nonce,
      adminUserId
    );
    
    // Update game state
    gameState.state = GameState.RUNNING;
    gameState.countdown = null;
    gameState.startTime = Date.now();
    gameState.crashPoint = outcome.crashPoint;
    
    console.log(`Crash Car game ${gameState.gameId} running with crash point: ${gameState.crashPoint}`);
    
    // Calculate when the crash should happen
    const crashTime = calculateCrashTime(gameState.crashPoint);
    gameState.crashTime = gameState.startTime + crashTime;
    
    // Set a force crash timeout in case something goes wrong
    forceCrashTimeout = setTimeout(() => {
      if (gameState.state === GameState.RUNNING) {
        console.warn(`Force ending Crash Car game ${gameState.gameId} due to timeout`);
        endGame();
      }
    }, FORCE_CRASH_TIMEOUT_MS);
    
    // Update multiplier at regular intervals
    gameRunningInterval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - gameState.startTime!;
      
      // Calculate current multiplier
      gameState.currentMultiplier = calculateMultiplier(elapsedMs);
      
      // Broadcast updated game state
      broadcastGameState();
      
      // Check if it's time to crash
      if (gameState.currentMultiplier >= gameState.crashPoint!) {
        endGame();
      }
    }, 100); // Update 10 times per second for smooth animation
    
    // Broadcast initial running state
    broadcastGameState();
  } catch (error) {
    console.error('Error starting Crash Car game:', error);
    // In case of error, use a default crash point
    gameState.crashPoint = 1.5;
    gameState.state = GameState.RUNNING;
    gameState.countdown = null;
    gameState.startTime = Date.now();
    
    // Start the game with default values
    gameRunningInterval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - gameState.startTime!;
      
      // Calculate current multiplier
      gameState.currentMultiplier = calculateMultiplier(elapsedMs);
      
      // Broadcast updated game state
      broadcastGameState();
      
      // Check if it's time to crash
      if (gameState.currentMultiplier >= gameState.crashPoint!) {
        endGame();
      }
    }, 100);
    
    broadcastGameState();
  }
}

// Calculate when the crash should happen based on the crash point
function calculateCrashTime(crashPoint: number): number {
  // Solve for t in the equation: crashPoint = 1.0 + 0.05 * (e^(t/15) - 1)
  // Rearranging: t = 15 * ln((crashPoint - 1.0) / 0.05 + 1)
  const growthFactor = 0.05;
  const timeInSec = 15 * Math.log((crashPoint - 1.0) / growthFactor + 1);
  
  // Convert seconds to milliseconds
  return timeInSec * 1000;
}

// End the current game
function endGame() {
  // Clear intervals
  if (gameRunningInterval) {
    clearInterval(gameRunningInterval);
    gameRunningInterval = null;
  }
  
  if (forceCrashTimeout) {
    clearTimeout(forceCrashTimeout);
    forceCrashTimeout = null;
  }
  
  // Update game state
  gameState.state = GameState.CRASHED;
  
  // Add this game to previous games history
  const historyItem: PreviousGame = {
    crashPoint: gameState.crashPoint || 1.0,
    timestamp: Date.now()
  };
  gameState.previousGames = [historyItem, ...gameState.previousGames];
  
  // Process any remaining bets (players who didn't cash out)
  processLostBets();
  
  // Broadcast final game state
  broadcastGameState();
  
  // Schedule next game round after a short delay
  setTimeout(startNewGameRound, 5000);
}

// Process bets for players who didn't cash out in time
async function processLostBets() {
  const lostBets = gameState.activeBets.filter(bet => !bet.cashedOut);
  
  // Record lost bets in the database
  for (const bet of lostBets) {
    try {
      // Create a new server seed and nonce for this specific bet
      const serverSeed = crypto.randomBytes(32).toString('hex');
      const clientSeed = gameState.gameId + '-' + bet.userId;
      const nonce = Date.now() + bet.userId;
      
      // Create the outcome
      const outcome = await createCrashCarOutcome(
        serverSeed,
        clientSeed,
        nonce,
        bet.userId,
        null // Player didn't cash out
      );
      
      // Create the bet record in the database
      await storage.createBet({
        userId: bet.userId,
        gameId: CRASH_CAR_GAME_ID,
        amount: bet.amount,
        multiplier: 0, // Player lost, so multiplier is 0
        profit: -bet.amount, // Player lost their bet
        clientSeed,
        serverSeed,
        nonce,
        outcome,
        completed: true
      });
    } catch (error) {
      console.error(`Error processing lost bet for user ${bet.userId}:`, error);
    }
  }
}

// Broadcast current game state to all connected WebSocket clients
function broadcastGameState() {
  // This will be implemented once we set up the WebSocket server
  // For now, just log the current state
  // console.log('Current game state:', gameState);
  
  // Broadcast to WebSocket topic
  if (globalWss) {
    const message = {
      topic: 'crash-car-game',
      timestamp: Date.now(),
      payload: {
        gameState: gameState.state,
        countdown: gameState.countdown,
        currentMultiplier: gameState.currentMultiplier,
        gameId: gameState.gameId,
        activeBets: gameState.activeBets,
        previousGames: gameState.previousGames
      }
    };
    
    broadcastToTopic('crash-car-game', message.payload);
  }
}

// Global WebSocket server reference
let globalWss: WebSocketServer | null = null;
let broadcastToTopic: (topic: string, payload: any) => void;

// Connect routes
router.get('/game-state', auth, (req, res) => {
  res.json({
    gameState: gameState.state,
    countdown: gameState.countdown,
    currentMultiplier: gameState.currentMultiplier,
    gameId: gameState.gameId,
    activeBets: gameState.activeBets,
    previousGames: gameState.previousGames
  });
});

// Schema for placing a bet
const placeBetSchema = z.object({
  amount: z.number().positive(),
  autoCashout: z.union([z.number().positive(), z.null()]).optional()
});

// Schema for cashing out
const cashoutSchema = z.object({
  gameId: z.string()
});

// Place a bet on the current game
router.post('/place-bet', auth, async (req, res) => {
  try {
    // Validate input
    const { amount, autoCashout } = placeBetSchema.parse(req.body);
    
    // Get user info
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough balance
    // Fix balance check to properly read balance regardless of format
    let userBalance = 0;
    if (typeof user.balance === 'number') {
      userBalance = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      userBalance = (user.balance as any)?.INR || 0;
    }
    
    console.log('User balance check:', { 
      userId: userId, 
      balanceRaw: user.balance, 
      parsedBalance: userBalance, 
      betAmount: amount 
    });
    
    if (userBalance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        balance: userBalance,
        required: amount
      });
    }
    
    // Verify current game state allows bets
    if (gameState.state !== GameState.WAITING) {
      return res.status(400).json({ 
        message: 'Cannot place bet now, game is already running or crashed',
        gameState: gameState.state
      });
    }
    
    // Deduct amount from user balance
    await storage.updateUserBalance(userId, -amount, 'INR');
    
    // Add bet to active bets
    gameState.activeBets.push({
      userId,
      username: user.username,
      amount,
      cashedOut: false,
      cashoutMultiplier: null,
      profit: null
    });
    
    // Broadcast updated game state
    broadcastGameState();
    
    // Return success
    res.json({ 
      success: true, 
      message: 'Bet placed successfully', 
      newBalance: userBalance - amount,
      gameState: gameState.state,
      countdown: gameState.countdown
    });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Error placing bet' 
    });
  }
});

// Cash out from the current game
router.post('/cashout', auth, async (req, res) => {
  try {
    // Validate input
    const { gameId } = cashoutSchema.parse(req.body);
    
    // Verify game ID matches current game
    if (gameId !== gameState.gameId) {
      return res.status(400).json({ 
        message: 'Invalid game ID',
        providedId: gameId,
        currentGameId: gameState.gameId
      });
    }
    
    // Verify game is in running state
    if (gameState.state !== GameState.RUNNING) {
      return res.status(400).json({ 
        message: 'Cannot cash out now, game is not running',
        gameState: gameState.state
      });
    }
    
    // Get user info
    const userId = req.user!.id;
    
    // Find user's active bet
    const betIndex = gameState.activeBets.findIndex(bet => 
      bet.userId === userId && !bet.cashedOut
    );
    
    if (betIndex === -1) {
      return res.status(404).json({ 
        message: 'No active bet found for this user'
      });
    }
    
    // Get current multiplier
    const currentMultiplier = gameState.currentMultiplier;
    
    // Update bet as cashed out
    const bet = gameState.activeBets[betIndex];
    bet.cashedOut = true;
    bet.cashoutMultiplier = currentMultiplier;
    bet.profit = bet.amount * currentMultiplier - bet.amount;
    
    // Update user balance with winnings
    const winAmount = bet.amount * currentMultiplier;
    await storage.updateUserBalance(userId, winAmount, 'INR');
    
    // Create a bet record in the database
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const clientSeed = gameState.gameId + '-' + userId;
    const nonce = Date.now() + userId;
    
    // Create the outcome
    const outcome = await createCrashCarOutcome(
      serverSeed,
      clientSeed,
      nonce,
      userId,
      currentMultiplier // User cashed out at this multiplier
    );
    
    // Record the successful bet
    await storage.createBet({
      userId,
      gameId: CRASH_CAR_GAME_ID,
      amount: bet.amount,
      multiplier: currentMultiplier,
      profit: bet.profit,
      clientSeed,
      serverSeed,
      nonce,
      outcome,
      completed: true
    });
    
    // Update game state
    gameState.activeBets[betIndex] = bet;
    
    // Broadcast updated game state
    broadcastGameState();
    
    // Return success with updated info
    const user = await storage.getUser(userId);
    
    // Fix balance handling for the response
    let newBalance = 0;
    if (user) {
      if (typeof user.balance === 'number') {
        newBalance = user.balance;
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        newBalance = (user.balance as any)?.INR || 0;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Successfully cashed out', 
      cashoutMultiplier: currentMultiplier,
      profit: bet.profit,
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Error cashing out:', error);
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Error cashing out' 
    });
  }
});

// Set the WebSocket server and broadcast function
export function setWebSocketServer(
  wss: WebSocketServer, 
  broadcastFn: (topic: string, payload: any) => void
) {
  globalWss = wss;
  broadcastToTopic = broadcastFn;
  
  // Start the initial game
  startNewGameRound();
}

export default router;