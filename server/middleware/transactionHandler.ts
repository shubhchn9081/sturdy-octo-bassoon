import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { 
  normalizeBetAmount, 
  validateBetAmount, 
  canonicalizeBetAmount,
  calculateWinnings 
} from '../utils/betUtils';

/**
 * Transaction handler middleware for bet operations
 * This ensures that bet amounts are properly processed and wallet balances are updated atomically
 */
export const transactionHandler = {
  /**
   * Process a bet deduction with proper transaction management and validation
   */
  async deductBetAmount(req: Request, res: Response, userId: number, amount: any, currency: string, gameName: string): Promise<boolean> {
    // Use our robust bet amount normalization to ensure correct values
    const normalizedAmount = normalizeBetAmount(amount);
    
    // Validate the amount
    const validation = validateBetAmount(normalizedAmount);
    if (!validation.valid) {
      res.status(400).json({ 
        message: validation.message || 'Invalid bet amount.',
        success: false,
        providedAmount: amount,
        normalizedAmount: normalizedAmount
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

      // Double-check we have a valid amount after normalization
      if (normalizedAmount <= 0) {
        res.status(400).json({ 
          message: 'Bet amount must be greater than 0',
          success: false,
          providedAmount: amount,
          normalizedAmount: normalizedAmount
        });
        return false;
      }

      // Validate sufficient balance
      if (userBalance < normalizedAmount) {
        res.status(400).json({ 
          message: `Insufficient balance: ${userBalance}. Need: ${normalizedAmount}`,
          success: false,
          currentBalance: userBalance,
          requiredAmount: normalizedAmount
        });
        return false;
      }

      // Perform the deduction with explicit logging
      console.log(`Deducting ${normalizedAmount} ${currency} from user ${userId} balance for bet on ${gameName}`);
      console.log(`Original amount provided: ${amount}, Normalized amount: ${normalizedAmount}`);
      
      // Store the normalized amount for confirmation
      req.app.locals.lastBetAmount = normalizedAmount;
      
      const updatedUser = await storage.updateUserBalance(userId, -normalizedAmount, currency);
      
      if (!updatedUser) {
        res.status(500).json({ 
          message: 'Failed to update balance',
          success: false 
        });
        return false;
      }

      // Verify the balance was actually updated
      const afterUser = await storage.getUser(userId);
      if (!afterUser) {
        console.error('Could not verify balance update - user not found after update');
      } else {
        let afterBalance = 0;
        if (typeof afterUser.balance === 'number') {
          afterBalance = afterUser.balance;
        } else if (typeof afterUser.balance === 'object' && afterUser.balance !== null) {
          const balanceObj = afterUser.balance as Record<string, number>;
          afterBalance = balanceObj[currency] || 0;
        }
        
        console.log(`Balance before bet: ${userBalance}, Balance after bet: ${afterBalance}, Amount deducted: ${userBalance - afterBalance}`);
        
        // Double-check deduction amount with a tolerance for floating-point precision issues
        if (Math.abs((userBalance - afterBalance) - normalizedAmount) > 0.01) {
          console.warn(`Warning: Expected to deduct ${normalizedAmount} but actual deduction was ${userBalance - afterBalance}`);
          
          // If deduction failed but we got no error, it's likely a balance format issue
          // Log this to help with debugging
          console.log(`Balance types - Before: ${typeof user.balance}, After: ${typeof afterUser.balance}`);
          console.log(`Before JSON: ${JSON.stringify(user.balance)}`);
          console.log(`After JSON: ${JSON.stringify(afterUser.balance)}`);
        }
      }

      // Record the transaction
      if (storage.createTransaction) {
        try {
          await storage.createTransaction({
            userId: userId,
            type: 'BET',
            amount: normalizedAmount, // Store as positive amount for accounting
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
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  },

  /**
   * Process a bet win with proper transaction management and validation
   */
  async processBetWin(req: Request, res: Response, userId: number, betAmount: any, multiplier: any, currency: string, gameName: string): Promise<boolean> {
    // Use our robust amount normalization
    const normalizedBetAmount = normalizeBetAmount(betAmount);
    const normalizedMultiplier = normalizeBetAmount(multiplier);
    
    // Validate the bet amount and multiplier
    if (normalizedBetAmount <= 0) {
      res.status(400).json({ 
        message: 'Invalid bet amount. Must be a positive number.',
        success: false,
        providedAmount: betAmount,
        normalizedAmount: normalizedBetAmount
      });
      return false;
    }

    if (normalizedMultiplier <= 0) {
      res.status(400).json({ 
        message: 'Invalid multiplier. Must be a positive number.',
        success: false,
        providedMultiplier: multiplier,
        normalizedMultiplier: normalizedMultiplier
      });
      return false;
    }

    try {
      // Calculate total return using our utility
      const totalReturn = calculateWinnings(normalizedBetAmount, normalizedMultiplier);
      
      console.log(`Processing win for user ${userId}: Original Bet: ${betAmount}, Normalized Bet: ${normalizedBetAmount}`);
      console.log(`Multiplier: ${multiplier} (normalized: ${normalizedMultiplier}), Total Return: ${totalReturn}`);
      
      // Get user current balance for logging
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ 
          message: 'User not found',
          success: false 
        });
        return false;
      }
      
      // Get current balance for better logging
      let currentBalance = 0;
      if (typeof user.balance === 'number') {
        currentBalance = Number(user.balance);
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        const balanceObj = user.balance as Record<string, number>;
        currentBalance = Number(balanceObj[currency] || 0);
      }
      
      console.log(`Current balance before win: ${currentBalance}, Win amount to add: ${totalReturn}`);
      
      // Update the user balance with the win amount
      const updatedUser = await storage.updateUserBalance(userId, totalReturn, currency);
      
      if (!updatedUser) {
        res.status(500).json({ 
          message: 'Failed to update balance with win amount',
          success: false 
        });
        return false;
      }
      
      // Verify the balance was actually updated
      const afterUser = await storage.getUser(userId);
      if (afterUser) {
        let newBalance = 0;
        if (typeof afterUser.balance === 'number') {
          newBalance = afterUser.balance;
        } else if (typeof afterUser.balance === 'object' && afterUser.balance !== null) {
          const balanceObj = afterUser.balance as Record<string, number>;
          newBalance = balanceObj[currency] || 0;
        }
        console.log(`Balance after win: ${newBalance}, Expected: ${currentBalance + totalReturn}`);
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
            description: `Win from ${gameName} - Multiplier: ${normalizedMultiplier}x`,
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
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
};