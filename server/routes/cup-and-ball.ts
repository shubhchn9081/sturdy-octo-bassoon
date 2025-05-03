import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { processCupAndBallBet } from '../games/cup-and-ball';
import { createServerSeed, hashServerSeed } from '../games/provably-fair';

const router = Router();

// Schema for validating cup and ball bet request
const cupAndBallBetSchema = z.object({
  gameId: z.number(),
  amount: z.number().positive(),
  clientSeed: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  selectedCup: z.number().min(0).max(2),
});

// Place a bet on the cup and ball game
router.post('/place-bet', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const validatedData = cupAndBallBetSchema.parse(req.body);
    const userId = req.user!.id;
    
    console.log(`Cup and Ball - User ${userId} placing bet:`, validatedData);

    // Get the user to check balance
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Extract user balance (assuming INR currency)
    let userBalance = 0;
    if (typeof user.balance === 'number') {
      userBalance = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      const balanceObj = user.balance as Record<string, number>;
      userBalance = balanceObj['INR'] || 0;
    }
    
    if (userBalance < validatedData.amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Generate server seed for this bet
    const serverSeed = createServerSeed();
    const hashedServerSeed = hashServerSeed(serverSeed);
    
    // Use a random nonce for now (normally we would keep track of this)
    const nextNonce = Math.floor(Math.random() * 1000000);
    
    // Get game control settings if any
    const gameControl = await storage.getUserGameControlByUserAndGame(userId, validatedData.gameId);

    // Process the bet
    console.log(`Cup and Ball - Processing bet with parameters:`, {
      difficulty: validatedData.difficulty,
      selectedCup: validatedData.selectedCup,
      betAmount: validatedData.amount
    });
    
    const result = processCupAndBallBet(
      {
        difficulty: validatedData.difficulty,
        selectedCup: validatedData.selectedCup,
        betAmount: validatedData.amount
      },
      serverSeed,
      validatedData.clientSeed,
      nextNonce,
      gameControl?.forcedOutcomeValue as any
    );
    
    console.log('Cup and Ball - Game result:', result.outcome);

    // Create the bet record
    const bet = await storage.createBet({
      userId,
      gameId: validatedData.gameId,
      amount: validatedData.amount,
      multiplier: result.payout / validatedData.amount,
      profit: result.payout - validatedData.amount,
      outcome: result.outcome,
      serverSeed,
      clientSeed: validatedData.clientSeed,
      nonce: nextNonce,
      completed: true
    });

    // Update user balance
    if (result.payout > 0) {
      await storage.updateUserBalance(userId, result.payout - validatedData.amount);
    } else {
      await storage.updateUserBalance(userId, -validatedData.amount);
    }

    // Update game control if needed
    if (gameControl && gameControl.forceOutcome) {
      await storage.incrementUserGameControlCounter(gameControl.id);
    }

    // Get updated user to return new balance
    const updatedUser = await storage.getUser(userId);
    let newBalance = 0;
    if (updatedUser) {
      if (typeof updatedUser.balance === 'number') {
        newBalance = updatedUser.balance;
      } else if (typeof updatedUser.balance === 'object' && updatedUser.balance !== null) {
        const balanceObj = updatedUser.balance as Record<string, number>;
        newBalance = balanceObj['INR'] || 0;
      }
    }

    res.json({
      success: true,
      bet: {
        id: bet.id,
        amount: bet.amount,
        profit: bet.profit,
        outcome: bet.outcome,
        completed: bet.completed,
        createdAt: bet.createdAt
      },
      newBalance,
      serverSeed: bet.completed ? serverSeed : undefined,
      hashedServerSeed
    });
  } catch (error) {
    console.error('Error processing cup and ball bet:', error);
    res.status(400).json({ 
      message: 'Failed to process bet', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;