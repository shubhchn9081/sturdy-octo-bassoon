import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { auth } from '../middleware/auth';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { generateDiceTradingOutcome } from '../games/diceTrading';
import { createServerSeed, hashServerSeed } from '../games/provably-fair';
import { broadcastToTopic } from '../utils/websocket';

const router = express.Router();

// Game constants
const DICE_TRADING_GAME_ID = 200; // Must match the client-side game ID

// Schema for validating bet requests
const placeBetSchema = z.object({
  amount: z.number().positive(),
  minRange: z.number().min(0).max(99),
  maxRange: z.number().min(1).max(100),
  clientSeed: z.string().optional()
});

// Route to place a bet
router.post('/place-bet', auth, async (req, res) => {
  try {
    // Validate request body
    const validationResult = placeBetSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { amount, minRange, maxRange, clientSeed = Math.random().toString(36).substring(2, 15) } = validationResult.data;
    
    // Ensure the range is valid
    if (minRange >= maxRange) {
      return res.status(400).json({ message: 'Min range must be less than max range' });
    }
    
    // Ensure the user has enough balance
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user balance (handling both numeric and object formats)
    const currency = 'INR';
    let userBalance = 0;
    
    if (typeof user.balance === 'number') {
      // Legacy numeric balance (treated as INR)
      userBalance = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      // JSONB format with multiple currencies
      const balanceObj = user.balance as Record<string, number>;
      userBalance = balanceObj[currency] || 0;
    }
    
    // Debug log
    console.log(`Checking balance for user ${user.id}: Has ${userBalance}, needs ${amount}`);
    
    if (userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Create server seed and hash it
    const serverSeed = createServerSeed();
    const hashedServerSeed = hashServerSeed(serverSeed);
    
    // Get nonce (can be 0 for simple implementation)
    const nonce = 0;
    
    // Check if game outcome should be controlled
    const gameControl = await gameOutcomeControl.shouldForceOutcome(
      req.user!.id, 
      DICE_TRADING_GAME_ID
    );
    
    const isControlled = gameControl.shouldForce;
    const controlOptions = {
      forceWin: gameControl.forcedOutcome === 'win',
      forceLose: gameControl.forcedOutcome === 'lose',
      exactResult: gameControl.forcedValue,
      targetMultiplier: gameControl.targetMultiplier,
      useExactMultiplier: gameControl.useExactMultiplier
    };
    
    // Generate game outcome
    const outcome = generateDiceTradingOutcome(
      serverSeed,
      clientSeed,
      nonce,
      { betAmount: amount, minRange, maxRange },
      isControlled,
      controlOptions
    );
    
    // Calculate profit
    const profit = outcome.win ? amount * outcome.multiplier - amount : -amount;
    
    // Create bet record in database
    const bet = await storage.createBet({
      userId: req.user!.id,
      gameId: DICE_TRADING_GAME_ID,
      amount,
      profit: outcome.win ? amount * outcome.multiplier - amount : -amount,
      outcome: {
        result: outcome.result,
        minRange: outcome.minRange,
        maxRange: outcome.maxRange,
        multiplier: outcome.multiplier,
        win: outcome.win
      },
      completed: true,
      serverSeed,
      nonce,
      clientSeed
    });
    
    // Update user balance
    await storage.updateUserBalance(req.user!.id, profit, currency);
    
    // Get updated user information for the broadcast
    const updatedUserInfo = await storage.getUser(req.user!.id);
    
    // Broadcast the bet result to all clients subscribed to dice-trading topic
    broadcastToTopic('dice-trading', {
      type: 'bet-result',
      userId: req.user!.id,
      username: updatedUserInfo?.username || 'Anonymous',
      amount: amount,
      result: outcome.result,
      minRange: outcome.minRange,
      maxRange: outcome.maxRange,
      multiplier: outcome.multiplier,
      win: outcome.win,
      profit: profit,
      timestamp: Date.now()
    });
    
    // Return the bet result to the requesting client
    res.json({
      bet,
      balance: updatedUserInfo?.balance,
      serverSeedHash: hashedServerSeed
    });
    
  } catch (error) {
    console.error('Error in dice trading bet:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Route to verify fairness with revealed server seed
router.post('/verify', auth, async (req, res) => {
  try {
    // Validate request
    const { betId, serverSeed } = req.body;
    if (!betId || !serverSeed) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    // Get the bet from the database
    const bet = await storage.getBet(Number(betId));
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    // Verify that the bet belongs to the user
    if (bet.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to verify this bet' });
    }
    
    // Verify the provided server seed matches the hash
    const hashedServerSeed = hashServerSeed(serverSeed);
    const hashedStoredServerSeed = hashServerSeed(bet.serverSeed);
    
    if (hashedServerSeed !== hashedStoredServerSeed) {
      return res.status(400).json({ message: 'Invalid server seed' });
    }
    
    // Re-calculate the outcome using the original parameters
    const outcome = bet.outcome as any;
    const recalculatedOutcome = generateDiceTradingOutcome(
      serverSeed,
      bet.clientSeed,
      bet.nonce,
      { 
        betAmount: bet.amount, 
        minRange: outcome.minRange, 
        maxRange: outcome.maxRange 
      }
    );
    
    // Check if the recalculated outcome matches the stored outcome
    const verified = recalculatedOutcome.result === outcome.result;
    
    res.json({
      verified,
      originalOutcome: outcome,
      recalculatedOutcome,
      serverSeed,
      clientSeed: bet.clientSeed,
      nonce: bet.nonce
    });
    
  } catch (error) {
    console.error('Error in dice trading verification:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

export default router;