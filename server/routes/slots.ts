import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { processSlotBet } from '../games/slots';
import { createServerSeed, hashServerSeed } from '../games/provably-fair';

const router = Router();

// Schema for validating slot bet request
const slotBetSchema = z.object({
  gameId: z.number().int().positive(),
  amount: z.number().positive(),
  clientSeed: z.string().min(1),
  luckyNumber: z.number().int().min(0).max(9).optional(),
  lines: z.number().int().min(1).max(20).optional(), // Number of lines for multi-line slots
});

// Handler for processing slot bets
router.post('/play', async (req: Request, res: Response) => {
  try {
    // Make sure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract and validate request data
    const { gameId, amount, clientSeed, luckyNumber, lines } = slotBetSchema.parse(req.body);
    
    // Get user from session
    const userId = req.user.id;
    
    // Get the game
    const game = await storage.getGame(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Check if the game is a slot type game
    if (game.slug !== 'slots' && game.slug !== 'galactic-spins') {
      return res.status(400).json({ 
        message: 'Invalid game type for this endpoint. Use only for slot games.'
      });
    }
    
    // Validate bet amount
    if (amount < game.minBet || amount > game.maxBet) {
      return res.status(400).json({
        message: `Bet amount must be between ${game.minBet} and ${game.maxBet}`,
        minBet: game.minBet,
        maxBet: game.maxBet
      });
    }
    
    // Check if user has enough balance
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate total amount needed based on number of lines (if applicable)
    const totalAmount = game.slug === 'galactic-spins' && lines ? amount * lines : amount;
    
    // Handle balance check - our balance is stored as a JSONB object with currency keys
    let userBalance = 0;
    if (typeof user.balance === 'number') {
      // Legacy format - direct number
      userBalance = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      // Current format - JSONB with currency keys, we use INR
      userBalance = (user.balance as any).INR || 0;
    }
    
    if (userBalance < totalAmount) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        required: totalAmount,
        available: userBalance
      });
    }
    
    // Generate server seed and nonce
    const serverSeed = createServerSeed();
    const hashedServerSeed = hashServerSeed(serverSeed);
    const nonce = Math.floor(Math.random() * 1000000);
    
    // Process the bet
    const result = await processSlotBet(
      userId,
      gameId,
      amount,
      serverSeed,
      clientSeed,
      nonce,
      luckyNumber,
      lines || 1 // Default to 1 line if not specified
    );
    
    // Return result to client
    res.json(result);
    
  } catch (error) {
    console.error('Error processing slot bet:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;