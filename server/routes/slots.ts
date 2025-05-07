import express from 'express';
import { storage } from '../storage';
import crypto from 'crypto';
import { z } from 'zod';

const router = express.Router();

// Check authentication middleware
const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Check if user is banned middleware
const checkNotBanned = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (user.isBanned) {
    return res.status(403).json({ message: 'Your account has been banned' });
  }
  
  next();
};

// Middleware
router.use(checkAuth);
router.use(checkNotBanned);

// Slot game categories
const slotCategories = [
  { id: 'space', name: 'Space & Sci-Fi' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'classic', name: 'Classic' },
  { id: 'sports', name: 'Sports' },
  { id: 'seasonal', name: 'Seasonal' },
  { id: 'luxury', name: 'Luxury' }
];

// Get all slot games
router.get('/games', async (req, res) => {
  try {
    const allGames = await storage.getAllGames();
    
    // Filter to only include slot games
    const slotGames = allGames.filter(game => game.type === 'SLOT');
    
    // Add random active players count to each game for demo purposes
    const enhancedGames = slotGames.map(game => ({
      ...game,
      activePlayers: Math.floor(Math.random() * 10000),
      rtp: 95 + Math.random() * 4, // Random RTP between 95% and 99%
      minBet: 100,
      maxBet: 10000,
      maxMultiplier: game.id === 101 ? 50 : 
                     game.id === 102 ? 50 : 
                     game.id === 103 ? 50 : 
                     game.id === 104 ? 50 : 
                     game.id === 105 ? 50 : 40,
      theme: game.id === 101 ? 'space' : 
             game.id === 102 ? 'adventure' : 
             game.id === 103 ? 'classic' : 
             game.id === 104 ? 'fantasy' : 
             game.id === 105 ? 'sports' : 
             slotCategories[Math.floor(Math.random() * slotCategories.length)].id
    }));
    
    res.json(enhancedGames);
  } catch (error) {
    console.error('Error fetching slot games:', error);
    res.status(500).json({ error: 'Failed to fetch slot games' });
  }
});

// Get slot game details
router.get('/games/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id, 10);
    const game = await storage.getGame(gameId);
    
    if (!game || game.type !== 'SLOT') {
      return res.status(404).json({ error: 'Slot game not found' });
    }
    
    // Add additional slot game details
    const gameDetails = {
      ...game,
      activePlayers: Math.floor(Math.random() * 10000),
      rtp: 95 + Math.random() * 4,
      minBet: 100,
      maxBet: 10000,
      maxMultiplier: gameId === 101 ? 50 : 
                     gameId === 102 ? 50 : 
                     gameId === 103 ? 50 : 
                     gameId === 104 ? 50 : 
                     gameId === 105 ? 50 : 40,
      theme: gameId === 101 ? 'space' : 
             gameId === 102 ? 'adventure' : 
             gameId === 103 ? 'classic' : 
             gameId === 104 ? 'fantasy' : 
             gameId === 105 ? 'sports' : 
             slotCategories[Math.floor(Math.random() * slotCategories.length)].id
    };
    
    res.json(gameDetails);
  } catch (error) {
    console.error('Error fetching slot game details:', error);
    res.status(500).json({ error: 'Failed to fetch slot game details' });
  }
});

// Spin schema validation
const spinSchema = z.object({
  gameId: z.number().int().positive(),
  amount: z.number().min(10).max(10000),
  luckySymbol: z.string()
});

// Spin the slot machine
router.post('/spin', async (req, res) => {
  try {
    const validationResult = spinSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request parameters', details: validationResult.error });
    }
    
    const { gameId, amount, luckySymbol } = validationResult.data;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;
    
    // Check if game exists
    const game = await storage.getGame(gameId);
    if (!game || game.type !== 'SLOT') {
      return res.status(404).json({ error: 'Slot game not found' });
    }
    
    // Check user balance
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if balance is a number or an object
    let balanceValue = 0;
    if (typeof user.balance === 'number') {
      balanceValue = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      // JSONB format with multiple currencies
      const balanceObj = user.balance as Record<string, number>;
      balanceValue = balanceObj['INR'] || 0;
    }
    
    if (balanceValue < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Generate slot result
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const clientSeed = req.headers['x-client-seed'] || 'default-client-seed';
    const nonce = Math.floor(Math.random() * 1000000);
    
    // Create combined seed for randomness
    const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}-${userId}-${gameId}`;
    
    // Generate spin outcome 
    let outcome = generateSpinOutcome(combinedSeed, gameId, luckySymbol);
    let multiplier = outcome.multiplier;
    
    // Try to get game control settings if available
    try {
      const userGameControl = await storage.getUserGameControlByUserAndGame(userId, gameId);
      const globalGameControl = await storage.getGlobalGameControl();
      
      // Apply user game control if active
      if (userGameControl && typeof userGameControl === 'object') {
        // Check if the control is active
        const isActive = userGameControl.forceOutcome === true;
        
        if (isActive) {
          // Check the outcome type
          if (userGameControl.outcomeType === 'LOSE') {
            // Generate a losing outcome
            outcome = generateLosingOutcome(gameId, luckySymbol);
            multiplier = 0;
          } else if (userGameControl.outcomeType === 'WIN') {
            // Generate a winning outcome with potentially specified multiplier
            outcome = generateWinningOutcome(
              gameId, 
              luckySymbol, 
              userGameControl.targetMultiplier || undefined
            );
            multiplier = outcome.multiplier;
          }
          
          // Increment the counter if possible
          if (typeof storage.incrementUserGameControlCounter === 'function') {
            await storage.incrementUserGameControlCounter(userGameControl.id);
          }
        }
      } 
      // Try to apply global control if available and active
      else if (globalGameControl && typeof globalGameControl === 'object') {
        // Check if global controls are active
        const globalForceLose = globalGameControl.forceAllUsersLose === true;
        const globalForceWin = globalGameControl.forceAllUsersWin === true;
        
        // Check if this game is affected (if affectedGames property exists and is an array)
        let isAffected = true;
        if (Array.isArray(globalGameControl.affectedGames) && globalGameControl.affectedGames.length > 0) {
          isAffected = globalGameControl.affectedGames.includes(gameId);
        }
        
        if (isAffected) {
          if (globalForceLose) {
            // Generate a losing outcome
            outcome = generateLosingOutcome(gameId, luckySymbol);
            multiplier = 0;
          } else if (globalForceWin) {
            // Generate a winning outcome with potentially specified multiplier
            outcome = generateWinningOutcome(
              gameId, 
              luckySymbol, 
              globalGameControl.targetMultiplier || undefined,
              !!globalGameControl.useExactMultiplier
            );
            multiplier = outcome.multiplier;
          }
        }
      }
    } catch (error) {
      console.error('Error applying game controls:', error);
      // Continue with normal random outcome if game control fails
    }
    
    // Calculate profit
    const winAmount = amount * multiplier;
    const profit = winAmount - amount;
    
    // Update user balance (deduct bet, add winnings if any)
    await storage.updateUserBalance(userId, -amount);
    if (winAmount > 0) {
      await storage.updateUserBalance(userId, winAmount);
    }
    
    // Create bet record - removing timestamp field as it's not in the schema
    const bet = await storage.createBet({
      userId,
      gameId,
      amount,
      multiplier,
      profit,
      serverSeed,
      clientSeed: clientSeed.toString(),
      nonce,
      outcome,
      completed: true
    });
    
    // Return result to client
    res.json({
      id: bet.id,
      gameId,
      amount,
      multiplier,
      profit,
      outcome,
      timestamp: bet.createdAt || new Date()
    });
    
  } catch (error) {
    console.error('Error processing slot spin:', error);
    res.status(500).json({ error: 'Failed to process slot spin' });
  }
});

// Get bet history for a specific slot game
router.get('/history/:gameId?', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;
    const gameId = req.params.gameId ? parseInt(req.params.gameId, 10) : undefined;
    
    if (gameId) {
      // Verify the game exists and is a slot game
      const game = await storage.getGame(gameId);
      if (!game || game.type !== 'SLOT') {
        return res.status(404).json({ error: 'Slot game not found' });
      }
    }
    
    const bets = await storage.getBetHistory(userId, gameId);
    
    // Filter to only include completed bets for slot games
    const slotBets = bets.filter(bet => bet.completed && (!gameId || bet.gameId === gameId));
    
    res.json(slotBets);
  } catch (error) {
    console.error('Error fetching bet history:', error);
    res.status(500).json({ error: 'Failed to fetch bet history' });
  }
});

// Helper function to generate a random slot outcome
function generateSpinOutcome(seed: string, gameId: number, luckySymbol: string) {
  // Initialize random generator with seed
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  
  // Different symbols based on game type
  let symbols: string[] = [];
  
  // Set symbols based on gameId
  if (gameId === 101) { // Cosmic Spins
    symbols = ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"];
  } else if (gameId === 102) { // Temple Quest
    symbols = ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"];
  } else if (gameId === 103) { // Lucky Sevens
    symbols = ["7️⃣", "🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎", "🍀", "🎰"];
  } else if (gameId === 104) { // Dragon's Gold
    symbols = ["🐉", "🏰", "🧙‍♂️", "⚔️", "🛡️", "🔮", "💰", "🧪", "📜", "🗝️"];
  } else if (gameId === 105) { // Football Frenzy
    symbols = ["⚽", "🏆", "👟", "🥅", "🧤", "🏟️", "🎽", "🚩", "🎖️", "🎯"];
  } else {
    // Default symbols for other slots
    symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "7️⃣", "⭐", "💎", "🍀", "🎰"];
  }
  
  // Generate random reels
  const reels = Array(3).fill(0).map(() => 
    Array(3).fill(0).map(() => symbols[parseInt(hash.substr(2 * (Math.floor(Math.random() * 10)), 2), 16) % symbols.length])
  );
  
  // Check for winning combinations in the middle row
  const middleRow = [reels[0][1], reels[1][1], reels[2][1]];
  
  // Check if all three symbols in the middle row are the same
  const hasWinningLine = middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2];
  
  // Check for lucky symbol appearance
  const hasLuckySymbol = reels.flat().includes(luckySymbol);
  
  // Calculate multiplier
  let multiplier = 0;
  let winningLines: number[] = [];
  
  if (hasWinningLine) {
    // Set multiplier based on the symbol
    const symbol = middleRow[0];
    if (symbol === symbols[0]) multiplier = 10;
    else if (symbol === symbols[1]) multiplier = 8;
    else if (symbol === symbols[2]) multiplier = 7;
    else if (symbol === symbols[3]) multiplier = 6;
    else if (symbol === symbols[4]) multiplier = 5;
    else if (symbol === symbols[5]) multiplier = 4;
    else if (symbol === symbols[6]) multiplier = 3;
    else if (symbol === symbols[7]) multiplier = 3;
    else if (symbol === symbols[8]) multiplier = 2;
    else if (symbol === symbols[9]) multiplier = 2;
    
    winningLines.push(1); // Middle row is winning
  }
  
  // Add lucky symbol bonus if applicable
  if (hasLuckySymbol && !hasWinningLine) {
    // Smaller multiplier for just the lucky symbol
    multiplier = 1.5;
  } else if (hasLuckySymbol && hasWinningLine && middleRow[0] === luckySymbol) {
    // Extra bonus for winning with the lucky symbol
    multiplier += 0.5;
  }
  
  return {
    reels,
    multiplier,
    winningLines,
    hasLuckySymbol
  };
}

// Helper function to generate a losing outcome
function generateLosingOutcome(gameId: number, luckySymbol: string) {
  // Different symbols based on game type
  let symbols: string[] = [];
  
  // Set symbols based on gameId
  if (gameId === 101) { // Cosmic Spins
    symbols = ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"];
  } else if (gameId === 102) { // Temple Quest
    symbols = ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"];
  } else if (gameId === 103) { // Lucky Sevens
    symbols = ["7️⃣", "🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎", "🍀", "🎰"];
  } else if (gameId === 104) { // Dragon's Gold
    symbols = ["🐉", "🏰", "🧙‍♂️", "⚔️", "🛡️", "🔮", "💰", "🧪", "📜", "🗝️"];
  } else if (gameId === 105) { // Football Frenzy
    symbols = ["⚽", "🏆", "👟", "🥅", "🧤", "🏟️", "🎽", "🚩", "🎖️", "🎯"];
  } else {
    // Default symbols for other slots
    symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "7️⃣", "⭐", "💎", "🍀", "🎰"];
  }
  
  // Create reels with different symbols in the middle row to ensure a loss
  const reels = Array(3).fill(0).map(() => 
    Array(3).fill(0).map(() => symbols[Math.floor(Math.random() * symbols.length)])
  );
  
  // Ensure middle row has no winning combinations and no lucky symbol
  reels[0][1] = symbols[0];
  reels[1][1] = symbols[1];
  reels[2][1] = symbols[2];
  
  // Remove lucky symbol from the entire grid
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (reels[i][j] === luckySymbol) {
        // Replace with a different symbol
        let newSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        while (newSymbol === luckySymbol) {
          newSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        }
        reels[i][j] = newSymbol;
      }
    }
  }
  
  return {
    reels,
    multiplier: 0,
    winningLines: [],
    hasLuckySymbol: false
  };
}

// Helper function to generate a winning outcome
function generateWinningOutcome(
  gameId: number, 
  luckySymbol: string, 
  targetMultiplier?: number, 
  useExactMultiplier = false
) {
  // Different symbols based on game type
  let symbols: string[] = [];
  let multiplierMap: Record<string, number> = {};
  
  // Set symbols based on gameId
  if (gameId === 101) { // Cosmic Spins
    symbols = ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"];
    multiplierMap = {
      "🚀": 10, "🪐": 8, "🌎": 7, "🌙": 6, "☄️": 5,
      "🛸": 4, "👽": 4, "⭐": 3, "🌌": 3, "🔭": 2
    };
  } else if (gameId === 102) { // Temple Quest
    symbols = ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"];
    multiplierMap = {
      "💎": 10, "🏺": 8, "🗿": 7, "🔱": 6, "👑": 5,
      "🐍": 4, "🗡️": 3, "🧭": 3, "🔥": 2, "🪙": 2
    };
  } else if (gameId === 103) { // Lucky Sevens
    symbols = ["7️⃣", "🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎", "🍀", "🎰"];
    multiplierMap = {
      "7️⃣": 10, "🍒": 5, "🍋": 4, "🍊": 4, "🍇": 3,
      "🔔": 5, "⭐": 5, "💎": 8, "🍀": 7, "🎰": 6
    };
  } else if (gameId === 104) { // Dragon's Gold
    symbols = ["🐉", "🏰", "🧙‍♂️", "⚔️", "🛡️", "🔮", "💰", "🧪", "📜", "🗝️"];
    multiplierMap = {
      "🐉": 10, "🏰": 8, "🧙‍♂️": 7, "⚔️": 6, "🛡️": 5,
      "🔮": 5, "💰": 4, "🧪": 3, "📜": 2, "🗝️": 2
    };
  } else if (gameId === 105) { // Football Frenzy
    symbols = ["⚽", "🏆", "👟", "🥅", "🧤", "🏟️", "🎽", "🚩", "🎖️", "🎯"];
    multiplierMap = {
      "⚽": 10, "🏆": 8, "👟": 6, "🥅": 5, "🧤": 5,
      "🏟️": 4, "🎽": 3, "🚩": 3, "🎖️": 2, "🎯": 2
    };
  } else {
    // Default symbols for other slots
    symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "7️⃣", "⭐", "💎", "🍀", "🎰"];
    multiplierMap = {
      "7️⃣": 10, "🍒": 5, "🍋": 4, "🍊": 4, "🍇": 3,
      "🔔": 5, "⭐": 5, "💎": 8, "🍀": 7, "🎰": 6
    };
  }
  
  // Create basic reels structure
  const reels = Array(3).fill(0).map(() => 
    Array(3).fill(0).map(() => symbols[Math.floor(Math.random() * symbols.length)])
  );
  
  // Choose a winning symbol
  let winningSymbol = symbols[0]; // Default to highest value symbol
  
  if (targetMultiplier !== undefined && useExactMultiplier) {
    // Find symbol with exact multiplier match
    for (const [symbol, multiplier] of Object.entries(multiplierMap)) {
      if (multiplier === targetMultiplier) {
        winningSymbol = symbol;
        break;
      }
    }
  } else if (targetMultiplier !== undefined) {
    // Find symbol with multiplier closest to but not exceeding target
    let closestMultiplier = 0;
    for (const [symbol, multiplier] of Object.entries(multiplierMap)) {
      if (multiplier <= targetMultiplier && multiplier > closestMultiplier) {
        winningSymbol = symbol;
        closestMultiplier = multiplier;
      }
    }
  } else {
    // No target specified, pick a random symbol
    winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  // Set middle row to winning combination
  reels[0][1] = winningSymbol;
  reels[1][1] = winningSymbol;
  reels[2][1] = winningSymbol;
  
  // Potentially add lucky symbol somewhere else in the grid
  const shouldAddLuckySymbol = Math.random() > 0.5 && luckySymbol !== winningSymbol;
  let hasAddedLuckySymbol = false;
  
  if (shouldAddLuckySymbol) {
    const randomRow = Math.floor(Math.random() * 3);
    const randomCol = Math.floor(Math.random() * 3);
    
    // Don't overwrite the winning middle row
    if (randomRow !== 1) {
      reels[randomCol][randomRow] = luckySymbol;
      hasAddedLuckySymbol = true;
    }
  }
  
  // Calculate multiplier
  let multiplier = multiplierMap[winningSymbol] || 2;
  
  // Add lucky symbol bonus
  if (winningSymbol === luckySymbol) {
    multiplier += 0.5; // Extra bonus for winning with lucky symbol
  } else if (hasAddedLuckySymbol) {
    multiplier += 0.5; // Smaller bonus for having lucky symbol elsewhere
  }
  
  return {
    reels,
    multiplier,
    winningLines: [1], // Middle row is winning
    hasLuckySymbol: winningSymbol === luckySymbol || hasAddedLuckySymbol
  };
}

export default router;