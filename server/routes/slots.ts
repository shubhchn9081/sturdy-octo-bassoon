import express from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import crypto from 'crypto';

const router = express.Router();

// Schema for slot play request
const slotPlaySchema = z.object({
  gameId: z.number(),
  amount: z.number().positive(),
  clientSeed: z.string(),
  luckySymbol: z.union([z.string(), z.number()]).optional(),
  theme: z.string().optional()
});

// Helper function to calculate random outcome based on provably fair algorithm
function calculateSlotOutcome(serverSeed: string, clientSeed: string, nonce: number, gameTheme: string = 'default') {
  // Create the combined seed
  const combinedSeed = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = crypto.createHash('sha256').update(combinedSeed).digest('hex');
  
  // Generate 3 reels for basic slot machine
  const reels = [];
  for (let i = 0; i < 3; i++) {
    // Use 4 characters of the hash for each reel (more entropy)
    const segment = hash.substring(i * 8, (i + 1) * 8);
    const decimal = parseInt(segment, 16);
    
    // Different themes have different symbols and ranges
    let symbolRange = 10; // Default range
    
    // Specific theme handling
    if (gameTheme === 'space') {
      symbolRange = 10; // Space theme has 10 symbols
      const spaceSymbols = ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"];
      reels.push(spaceSymbols[decimal % symbolRange]);
    } else if (gameTheme === 'adventure') {
      symbolRange = 10; // Adventure theme has 10 symbols
      const adventureSymbols = ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"];
      reels.push(adventureSymbols[decimal % symbolRange]);
    } else if (gameTheme === 'fantasy') {
      symbolRange = 10; // Fantasy theme has 10 symbols
      const fantasySymbols = ["🐉", "🔥", "🏰", "⚔️", "🛡️", "📜", "💰", "🧙", "🏆", "🔮"];
      reels.push(fantasySymbols[decimal % symbolRange]);
    } else if (gameTheme === 'classic') {
      symbolRange = 10; // Classic theme has 10 symbols
      const classicSymbols = ["7", "BAR", "🍒", "🍋", "🍊", "🍇", "🔔", "💎", "⭐", "WILD"];
      reels.push(classicSymbols[decimal % symbolRange]);
    } else if (gameTheme === 'sports') {
      symbolRange = 10; // Sports theme has 10 symbols
      const sportsSymbols = ["⚽", "🥅", "👟", "🏆", "🏟️", "🧤", "🥇", "🎯", "🎪", "🎲"];
      reels.push(sportsSymbols[decimal % symbolRange]);
    } else {
      // Default numeric reels (0-9)
      reels.push(decimal % symbolRange);
    }
  }
  
  return reels;
}

// Helper function to determine if the outcome is a win
function determineSlotWin(reels: (string | number)[], luckySymbol?: string | number): {
  win: boolean;
  multiplier: number;
  luckyNumberHit: boolean;
} {
  // Check if all reels match (three of a kind)
  const allMatch = reels[0] === reels[1] && reels[1] === reels[2];
  
  // Check if lucky symbol hit
  const luckyNumberHit = luckySymbol !== undefined && 
                        (reels[0] === luckySymbol || 
                         reels[1] === luckySymbol || 
                         reels[2] === luckySymbol);
  
  // Check if it's a sequence (only for numeric reels)
  let isSequence = false;
  if (typeof reels[0] === 'number' && typeof reels[1] === 'number' && typeof reels[2] === 'number') {
    const sorted = [...reels].sort((a, b) => (a as number) - (b as number));
    isSequence = (sorted[1] as number) === (sorted[0] as number) + 1 && 
                (sorted[2] as number) === (sorted[1] as number) + 1;
  }
  
  // Calculate multiplier based on outcome
  let multiplier = 0;
  let win = false;
  
  if (allMatch) {
    if (reels[0] === "7" || reels[0] === "🚀" || reels[0] === "💎" || reels[0] === "🐉" || reels[0] === "⚽") {
      // Three 7s, rockets, diamonds, dragons, or soccer balls (highest symbol in each theme)
      multiplier = 10;
    } else if (reels[0] === "WILD" || reels[0] === "🏆" || reels[0] === "💰" || reels[0] === "🏺") {
      // Three WILDs or other high-value symbols
      multiplier = 8;
    } else if (reels[0] === "BAR" || reels[0] === "🏰" || reels[0] === "🪐" || reels[0] === "🗿" || reels[0] === "🥅") {
      // Three BARs or medium-high value symbols
      multiplier = 7;
    } else if (reels[0] === "💎" || reels[0] === "⚔️" || reels[0] === "🌎" || reels[0] === "🔱" || reels[0] === "👟") {
      // Three diamonds or medium value symbols
      multiplier = 6;
    } else if (reels[0] === "🔔" || reels[0] === "🛡️" || reels[0] === "🌙" || reels[0] === "👑" || reels[0] === "🏟️" || reels[0] === "🧤") {
      // Three bells or medium value symbols
      multiplier = 5;
    } else if (reels[0] === "⭐" || reels[0] === "📜" || reels[0] === "☄️" || reels[0] === "🐍" || reels[0] === "🥇") {
      // Three stars or medium value symbols
      multiplier = 4;
    } else if (reels[0] === "🍇" || reels[0] === "🔮" || reels[0] === "🛸" || reels[0] === "🗡️" || reels[0] === "🎯") {
      // Three grapes or medium-low value symbols
      multiplier = 3;
    } else if (reels[0] === "🍊" || reels[0] === "🧙" || reels[0] === "👽" || reels[0] === "🧭" || reels[0] === "🎪") {
      // Three oranges or medium-low value symbols
      multiplier = 3;
    } else if (reels[0] === "🍋" || reels[0] === "🏆" || reels[0] === "⭐" || reels[0] === "🔥" || reels[0] === "🎲") {
      // Three lemons or low value symbols
      multiplier = 2;
    } else if (reels[0] === "🍒" || reels[0] === "WILD" || reels[0] === "🌌" || reels[0] === "🪙" || reels[0] === "🎲") {
      // Three cherries or lowest value symbols
      multiplier = 2;
    } else {
      // Three of any other symbols
      multiplier = 5;
    }
    win = true;
  } else if (isSequence) {
    // Sequence of numbers (e.g. 1,2,3)
    multiplier = 3;
    win = true;
  } else if (luckyNumberHit) {
    // Lucky number hit
    multiplier = 15; // High multiplier for lucky number
    win = true;
  }
  
  return { win, multiplier, luckyNumberHit };
}

/**
 * Play a slot game
 * POST /api/slots/play
 */
router.post('/play', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session || !(req.session as any).userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = (req.session as any).userId;
    
    // Validate request body
    const validationResult = slotPlaySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid request',
        errors: validationResult.error.format() 
      });
    }
    
    const { gameId, amount, clientSeed, luckySymbol, theme = 'default' } = validationResult.data;
    
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user has enough balance
    const userBalance = user.balance as { [key: string]: number };
    const balance = userBalance.INR || 0;
    if (balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Generate server seed for provably fair gameplay
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const nonce = Math.floor(Math.random() * 1000000);
    
    // Calculate the outcome based on seeds
    const reels = calculateSlotOutcome(serverSeed, clientSeed, nonce, theme);
    
    // Determine if it's a win and calculate multiplier
    const { win, multiplier, luckyNumberHit } = determineSlotWin(reels, luckySymbol);
    
    // Calculate profit/loss
    const profit = win ? amount * multiplier - amount : -amount;
    
    // Update user's balance
    await storage.updateUserBalance(user.id, profit);
    
    // Create bet record
    const bet = await storage.createBet({
      userId: user.id,
      gameId,
      amount,
      clientSeed,
      multiplier: win ? multiplier : 0,
      profit,
      completed: true,
      serverSeed,
      nonce,
      outcome: {
        reels,
        win,
        multiplier,
        luckyNumberHit
      }
    });
    
    // Create transaction record
    await storage.createTransaction({
      userId: user.id,
      type: win ? 'bet_win' : 'bet_loss',
      amount: Math.abs(profit),
      currency: 'INR',
      status: 'completed',
      description: `Slot game ${gameId} - ${win ? 'Win' : 'Loss'}`
    });
    
    // Return result to client
    return res.status(200).json({
      id: bet.id,
      outcome: {
        reels,
        win,
        luckyNumberHit
      },
      profit,
      multiplier: win ? multiplier : 0,
      clientSeed,
      serverSeed,
      nonce
    });
    
  } catch (error) {
    console.error('Error in slot game play:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get slot games list
 * GET /api/slots/games
 */
router.get('/games', async (req, res) => {
  try {
    // Get all games
    const allGames = await storage.getAllGames();
    
    // Filter slot games
    const slotGames = allGames.filter(game => game.type.toLowerCase().includes('slot'));
    
    return res.status(200).json(slotGames);
  } catch (error) {
    console.error('Error fetching slot games:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;