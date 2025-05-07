import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { auth } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// List of available slot games
const slotGames = [
  {
    id: 101,
    name: "Cosmic Spins",
    slug: "cosmic-spins",
    type: "Slot Machine",
    theme: "space",
    description: "Embark on an interstellar adventure with Cosmic Spins, where astronomical wins await among the stars, planets, and cosmic wonders of the universe.",
    imageUrl: null,
    rtp: 96.5,
    activePlayers: 2134,
    minBet: 100,
    maxBet: 10000,
    maxMultiplier: 50
  },
  {
    id: 102,
    name: "Temple Quest",
    slug: "temple-quest",
    type: "Slot Machine",
    theme: "adventure",
    description: "Venture deep into an ancient temple filled with treasures and mysteries. Match the right artifacts to claim the treasures of a lost civilization.",
    imageUrl: null,
    rtp: 96.0,
    activePlayers: 1857,
    minBet: 100,
    maxBet: 10000,
    maxMultiplier: 50
  },
  {
    id: 103,
    name: "Lucky Sevens",
    slug: "lucky-sevens",
    type: "Slot Machine",
    theme: "classic",
    description: "A classic slot machine experience with a modern twist. The lucky number 7 could be your ticket to massive wins in this timeless game.",
    imageUrl: null,
    rtp: 95.8,
    activePlayers: 2678,
    minBet: 100,
    maxBet: 10000,
    maxMultiplier: 50
  },
  {
    id: 104,
    name: "Dragon's Gold",
    slug: "dragons-gold",
    type: "Slot Machine",
    theme: "fantasy",
    description: "Venture into the dragon's lair and spin to win the legendary treasure. Match mystical symbols and awaken the dragon for massive rewards.",
    imageUrl: null,
    rtp: 97.1,
    activePlayers: 1935,
    minBet: 100,
    maxBet: 10000,
    maxMultiplier: 50
  },
  {
    id: 105,
    name: "Football Frenzy",
    slug: "football-frenzy",
    type: "Slot Machine",
    theme: "sports",
    description: "Experience the thrill of the beautiful game with Football Frenzy slots. Match football symbols to score big wins and championship rewards!",
    imageUrl: null,
    rtp: 96.2,
    activePlayers: 1650,
    minBet: 100,
    maxBet: 10000,
    maxMultiplier: 50
  }
];

// Get all slot games
router.get('/games', (req, res) => {
  console.log('Returning slot games:', slotGames.length);
  res.json(slotGames);
});

// Get a specific slot game by ID
router.get('/games/:id', (req, res) => {
  const gameId = parseInt(req.params.id);
  const game = slotGames.find(g => g.id === gameId);
  
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }
  
  res.json(game);
});

// Schema for spin request
const spinRequestSchema = z.object({
  gameId: z.number().int().positive(),
  amount: z.number().min(100).max(10000),
  luckySymbol: z.string().optional()
});

// Spin the slot machine
router.post('/spin', auth, async (req, res) => {
  try {
    // Validate request
    const validation = spinRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid request", 
        errors: validation.error.errors 
      });
    }
    
    // Get validated data
    const { gameId, amount, luckySymbol } = validation.data;
    
    // Verify game exists
    const game = slotGames.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    
    // Get user
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check user balance
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    // Check for game control
    const userGameControl = await storage.getUserGameControlByUserAndGame(userId, gameId);
    const globalGameControl = await storage.getGlobalGameControl();
    
    // Generate outcome
    const serverSeed = crypto.randomBytes(16).toString('hex');
    const clientSeed = req.body.clientSeed || crypto.randomBytes(8).toString('hex');
    const nonce = Math.floor(Math.random() * 100000);
    
    // Determine if this should be a forced win or loss
    let forceWin = false;
    let forceLoss = false;
    let targetMultiplier = 0;
    
    if (globalGameControl) {
      if (globalGameControl.forceAllUsersWin && 
        (!globalGameControl.affectedGames.length || 
          globalGameControl.affectedGames.includes(gameId))) {
        forceWin = true;
        targetMultiplier = globalGameControl.targetMultiplier;
      } else if (globalGameControl.forceAllUsersLose && 
        (!globalGameControl.affectedGames.length || 
          globalGameControl.affectedGames.includes(gameId))) {
        forceLoss = true;
      }
    }
    
    if (userGameControl) {
      if (userGameControl.forceWin) {
        forceWin = true;
        targetMultiplier = userGameControl.targetMultiplier;
      } else if (userGameControl.forceLose) {
        forceLoss = true;
      }
      
      // Increment counter for this game control
      await storage.incrementUserGameControlCounter(userGameControl.id);
    }
    
    // Calculate outcome based on random chance or forced outcome
    const symbols = getSymbolsForGame(gameId);
    let reels: string[][] = [];
    let multiplier = 0;
    let winningLines: number[] = [];
    let hasLuckySymbol = false;
    
    if (forceWin) {
      // Generate a winning outcome
      const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      reels = generateWinningReels(symbols, winningSymbol);
      multiplier = targetMultiplier > 0 ? targetMultiplier : getRandomMultiplier(2, 10);
      winningLines = [1]; // Middle row is the winning line
      
      // Check if lucky symbol matches winning symbol
      if (luckySymbol && luckySymbol === winningSymbol) {
        hasLuckySymbol = true;
        multiplier += 0.5; // Add bonus for lucky symbol
      }
    } else if (forceLoss) {
      // Generate a losing outcome
      reels = generateLosingReels(symbols);
      multiplier = 0;
    } else {
      // Random outcome with about 40% win chance
      const isWin = Math.random() < 0.4;
      
      if (isWin) {
        const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        reels = generateWinningReels(symbols, winningSymbol);
        multiplier = getRandomMultiplier(2, 10);
        winningLines = [1]; // Middle row is the winning line
        
        // Check if lucky symbol matches winning symbol
        if (luckySymbol && luckySymbol === winningSymbol) {
          hasLuckySymbol = true;
          multiplier += 0.5; // Add bonus for lucky symbol
        }
      } else {
        reels = generateLosingReels(symbols);
        multiplier = 0;
      }
    }
    
    // Calculate profit
    const profit = multiplier > 0 ? amount * multiplier - amount : -amount;
    
    // Update user balance
    await storage.updateUserBalance(userId, profit);
    
    // Create bet record
    const bet = await storage.createBet({
      userId,
      gameId,
      amount,
      multiplier,
      profit,
      createdAt: new Date(),
      serverSeed,
      clientSeed, // Make sure clientSeed is included
      nonce,
      outcome: {
        reels,
        multiplier,
        winningLines,
        hasLuckySymbol,
        provablyFair: {
          serverSeed,
          clientSeed,
          nonce
        }
      },
      completed: true
    });
    
    // Return result
    res.json({
      betId: bet.id,
      outcome: {
        reels,
        multiplier,
        winningLines,
        hasLuckySymbol
      },
      profit,
      balance: user.balance + profit,
      multiplier
    });
    
  } catch (error) {
    console.error("Error during slot spin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get bet history for a user
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
    
    const bets = await storage.getBetHistory(userId, gameId);
    
    // Format and return bet history
    const history = bets.map(bet => ({
      id: bet.id,
      gameId: bet.gameId,
      amount: bet.amount,
      multiplier: bet.multiplier,
      profit: bet.profit,
      createdAt: bet.createdAt
    }));
    
    res.json(history);
    
  } catch (error) {
    console.error("Error fetching bet history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get bet history for a specific game
router.get('/history/:gameId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const gameId = parseInt(req.params.gameId);
    
    const bets = await storage.getBetHistory(userId, gameId);
    
    // Format and return bet history
    const history = bets.map(bet => ({
      id: bet.id,
      gameId: bet.gameId,
      amount: bet.amount,
      multiplier: bet.multiplier,
      profit: bet.profit,
      createdAt: bet.createdAt
    }));
    
    res.json(history);
    
  } catch (error) {
    console.error("Error fetching game bet history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper functions

// Get symbols for a specific game
function getSymbolsForGame(gameId: number): string[] {
  switch (gameId) {
    case 101: // Cosmic Spins
      return ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"];
    case 102: // Temple Quest
      return ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"];
    case 103: // Lucky Sevens
      return ["7️⃣", "🍒", "🔔", "💰", "⭐", "🍇", "🍊", "🍋", "🍉", "♦️"];
    case 104: // Dragon's Gold
      return ["🐉", "🔥", "🗡️", "🛡️", "👑", "💎", "📜", "🧙", "🏰", "🧪"];
    case 105: // Football Frenzy
      return ["⚽", "🏆", "👟", "🥅", "🏟️", "🧤", "🥇", "🎽", "🚩", "📣"];
    default:
      return ["🎰", "💰", "🎲", "🎯", "🎮", "🎪", "🎨", "🎭", "🎬", "🎼"];
  }
}

// Generate winning reels with the middle row having a matching symbol
function generateWinningReels(symbols: string[], winningSymbol: string): string[][] {
  const reels: string[][] = [];
  
  // Generate 3 reels with 3 symbols each
  for (let i = 0; i < 3; i++) {
    const reel: string[] = [];
    
    // Top symbol - random
    reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
    
    // Middle symbol - winning symbol
    reel.push(winningSymbol);
    
    // Bottom symbol - random
    reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
    
    reels.push(reel);
  }
  
  return reels;
}

// Generate losing reels with no matching symbols in any row
function generateLosingReels(symbols: string[]): string[][] {
  const reels: string[][] = [];
  const usedSymbols: Set<string>[] = [new Set(), new Set(), new Set()];
  
  // Generate 3 reels with 3 symbols each
  for (let i = 0; i < 3; i++) {
    const reel: string[] = [];
    
    // Generate 3 symbols for this reel
    for (let j = 0; j < 3; j++) {
      let candidateSymbol: string;
      do {
        candidateSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      } while (usedSymbols[j].size === 2 && usedSymbols[j].has(candidateSymbol));
      
      reel.push(candidateSymbol);
      usedSymbols[j].add(candidateSymbol);
    }
    
    reels.push(reel);
  }
  
  // Ensure we don't accidentally have a winning combination
  if (reels[0][0] === reels[1][0] && reels[1][0] === reels[2][0] ||
      reels[0][1] === reels[1][1] && reels[1][1] === reels[2][1] ||
      reels[0][2] === reels[1][2] && reels[1][2] === reels[2][2]) {
    // Try again if we accidentally got a winning combination
    return generateLosingReels(symbols);
  }
  
  return reels;
}

// Get a random multiplier within a range
function getRandomMultiplier(min: number, max: number): number {
  const multipliers = [2, 3, 4, 5, 6, 7, 8, 10];
  return multipliers[Math.floor(Math.random() * multipliers.length)];
}

export default router;