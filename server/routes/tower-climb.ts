import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { handleTowerClimbOutcomeControl, generateTowerLayout, calculateTowerMultiplier } from '../games/tower-climb';
import crypto from 'crypto';

const router = Router();

// Schema for Tower Climb bet options
const towerClimbOptionsSchema = z.object({
  towerHeight: z.number().min(5).max(15).default(10),
  towerWidth: z.number().min(2).max(5).default(3)
});

// Endpoint to place a Tower Climb bet
router.post('/tower-climb/bet', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { amount, clientSeed, options } = req.body;
    const userId = req.user.id;
    const gameId = 101; // Tower Climb game ID - make sure this matches the frontend and DB
    
    // Validate the options
    const validatedOptions = towerClimbOptionsSchema.parse(options || {});
    
    // Get user balance
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has sufficient balance
    let balance = 0;
    
    if (typeof user.balance === 'number') {
      // Legacy numeric balance (treated as INR)
      balance = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      // JSONB format with multiple currencies
      const balanceObj = user.balance as Record<string, number>;
      balance = balanceObj['INR'] || 0;
    }
    
    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Generate server seed
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    
    // Check for outcome control
    const outcomeControl = await handleTowerClimbOutcomeControl(
      userId,
      gameId,
      validatedOptions.towerHeight,
      validatedOptions
    );
    
    // Generate tower layout
    const towerLayout = outcomeControl.shouldForceOutcome
      ? outcomeControl.layout
      : generateTowerLayout(
          serverSeed,
          clientSeed,
          0, // Initial nonce
          validatedOptions.towerHeight,
          validatedOptions.towerWidth
        );
    
    // Create outcome data
    const outcome = {
      towerLayout,
      levelReached: 0,
      positionsChosen: [],
      specialItemsCollected: [],
      maxSafeLevel: outcomeControl.maxSafeLevel,
      win: false
    };
    
    // Create the bet record
    const bet = await storage.createBet({
      userId,
      gameId,
      amount,
      clientSeed,
      outcome,
      serverSeed,
      nonce: 0,
      completed: false
    });
    
    // Deduct bet amount from user balance
    await storage.updateUserBalance(userId, -amount);
    
    return res.json({
      success: true,
      betId: bet.id,
      serverSeedHash,
      towerHeight: validatedOptions.towerHeight,
      towerWidth: validatedOptions.towerWidth
    });
  } catch (err: any) {
    console.error('Tower Climb bet error:', err);
    return res.status(400).json({ error: err.message || 'Failed to place bet' });
  }
});

// Endpoint to complete a Tower Climb bet
router.post('/tower-climb/complete/:betId', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { betId } = req.params;
    const { win, multiplier, levelReached, cashOut, positionChosen, hitTrap } = req.body;
    const userId = req.user.id;
    
    // Get the bet
    const bet = await storage.getBet(parseInt(betId));
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    // Verify bet belongs to user
    if (bet.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to complete this bet' });
    }
    
    // Check if bet is already completed
    if (bet.completed) {
      return res.status(400).json({ error: 'Bet already completed' });
    }
    
    // Update bet outcome with results
    // Using non-null assertion as we know the outcome exists in a valid bet
    const prevOutcome = bet.outcome || {};
    
    // Start with basic outcome fields
    const updatedOutcome: any = {
      ...prevOutcome,
      levelReached,
      win,
      cashOut
    };
    
    // If position was chosen, add it to positions chosen
    if (positionChosen !== undefined) {
      // Initialize positionsChosen if it doesn't exist
      const existingPositions = updatedOutcome.positionsChosen || [];
      updatedOutcome.positionsChosen = [...existingPositions, positionChosen];
    }
    
    // Calculate final multiplier
    const finalMultiplier = win ? (multiplier || calculateTowerMultiplier(levelReached)) : 0;
    
    // Calculate profit
    const profit = win ? (bet.amount * finalMultiplier - bet.amount) : -bet.amount;
    
    // Update the bet
    const updatedBet = await storage.updateBet(bet.id, {
      id: bet.id,
      userId: bet.userId,
      gameId: bet.gameId,
      amount: bet.amount,
      clientSeed: bet.clientSeed,
      serverSeed: bet.serverSeed,
      nonce: bet.nonce,
      multiplier: finalMultiplier,
      profit,
      outcome: updatedOutcome,
      completed: true,
      createdAt: bet.createdAt
    });
    
    // Update user balance if bet was won
    if (win) {
      await storage.updateUserBalance(userId, bet.amount * finalMultiplier);
    }
    
    return res.json({
      success: true,
      bet: updatedBet,
      win,
      multiplier: finalMultiplier,
      profit,
      winAmount: win ? (bet.amount * finalMultiplier) : 0
    });
  } catch (err: any) {
    console.error('Tower Climb complete bet error:', err);
    return res.status(400).json({ error: err.message || 'Failed to complete bet' });
  }
});

export default router;