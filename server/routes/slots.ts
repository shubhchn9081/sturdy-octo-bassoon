import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { processSlotBet } from '../games/slots';
import { generateHash } from '../lib/crypto';

const router = Router();

// Schema for validating slot bet request
const slotBetSchema = z.object({
  gameId: z.number().int().positive(),
  amount: z.number().positive(),
  clientSeed: z.string().min(1),
});

// Handler for processing slot bets
router.post('/play', async (req: Request, res: Response) => {
  try {
    // Make sure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract and validate request data
    const { gameId, amount, clientSeed } = slotBetSchema.parse(req.body);
    
    // Get user from session
    const userId = req.user.id;
    
    // Get the game
    const game = await storage.getGame(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Check if the game is slots
    if (game.slug !== 'slots') {
      return res.status(400).json({ 
        message: 'Invalid game type for this endpoint. Use only for slots game.'
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
    
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Generate server seed and nonce
    const serverSeed = generateHash(Date.now().toString() + Math.random().toString());
    const nonce = Math.floor(Math.random() * 1000000);
    
    // Process the bet
    const result = await processSlotBet(
      userId,
      gameId,
      amount,
      serverSeed,
      clientSeed,
      nonce
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