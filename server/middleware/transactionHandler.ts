import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Transaction handler middleware for bet operations
 * This ensures that bet amounts are properly processed and wallet balances are updated atomically
 */
export const transactionHandler = {
  /**
   * Process a bet deduction with proper transaction management and validation
   */
  async deductBetAmount(req: Request, res: Response, userId: number, amount: number, currency: string, gameName: string): Promise<boolean> {
    // Ensure amount is a valid number and convert any string/malformed values
    amount = parseFloat(amount as any);
    if (isNaN(amount) || amount <= 0) {
      res.status(400).json({ 
        message: 'Invalid bet amount. Must be a positive number.',
        success: false
      });
      return false;
    }

    try {
      // Get current user to check balance
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ 
          message: 'User not found',
          success: false 
        });
        return false;
      }

      // Get current balance
      let userBalance = 0;
      if (typeof user.balance === 'number') {
        userBalance = user.balance;
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        const balanceObj = user.balance as Record<string, number>;
        userBalance = balanceObj[currency] || 0;
      }

      // Validate sufficient balance
      if (userBalance < amount) {
        res.status(400).json({ 
          message: `Insufficient balance: ${userBalance}. Need: ${amount}`,
          success: false,
          currentBalance: userBalance,
          requiredAmount: amount
        });
        return false;
      }

      // Perform the deduction
      console.log(`Deducting ${amount} ${currency} from user ${userId} balance for bet on ${gameName}`);
      const updatedUser = await storage.updateUserBalance(userId, -amount, currency);
      
      if (!updatedUser) {
        res.status(500).json({ 
          message: 'Failed to update balance',
          success: false 
        });
        return false;
      }

      // Record the transaction
      if (storage.createTransaction) {
        try {
          await storage.createTransaction({
            userId: userId,
            type: 'BET',
            amount: amount, // Store as positive amount for accounting
            status: 'COMPLETED',
            currency: currency,
            description: `Bet placed on ${gameName}`,
          });
        } catch (err) {
          console.error('Error recording bet transaction:', err);
          // Continue even if transaction recording fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error in deductBetAmount transaction:', error);
      res.status(500).json({ 
        message: 'Server error processing bet amount',
        success: false 
      });
      return false;
    }
  },

  /**
   * Process a bet win with proper transaction management and validation
   */
  async processBetWin(req: Request, res: Response, userId: number, betAmount: number, multiplier: number, currency: string, gameName: string): Promise<boolean> {
    // Ensure amounts are valid numbers
    betAmount = parseFloat(betAmount as any);
    multiplier = parseFloat(multiplier as any);
    
    if (isNaN(betAmount) || betAmount <= 0) {
      res.status(400).json({ 
        message: 'Invalid bet amount. Must be a positive number.',
        success: false
      });
      return false;
    }

    if (isNaN(multiplier) || multiplier <= 0) {
      res.status(400).json({ 
        message: 'Invalid multiplier. Must be a positive number.',
        success: false
      });
      return false;
    }

    try {
      // Calculate total return (original bet amount * multiplier)
      const totalReturn = betAmount * multiplier;
      
      console.log(`Processing win for user ${userId}: Bet: ${betAmount}, Multiplier: ${multiplier}, Total Return: ${totalReturn}`);
      
      // Update the user balance with the win amount
      const updatedUser = await storage.updateUserBalance(userId, totalReturn, currency);
      
      if (!updatedUser) {
        res.status(500).json({ 
          message: 'Failed to update balance with win amount',
          success: false 
        });
        return false;
      }

      // Record the transaction
      if (storage.createTransaction) {
        try {
          await storage.createTransaction({
            userId: userId,
            type: 'WIN',
            amount: totalReturn,
            status: 'COMPLETED',
            currency: currency,
            description: `Win from ${gameName} - Multiplier: ${multiplier}x`,
          });
        } catch (err) {
          console.error('Error recording win transaction:', err);
          // Continue even if transaction recording fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error in processBetWin transaction:', error);
      res.status(500).json({ 
        message: 'Server error processing win amount',
        success: false 
      });
      return false;
    }
  }
};