import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import { useBalance } from '@/hooks/use-balance';
import { SupportedCurrency } from '@/context/CurrencyContext';

/**
 * Hook for managing game betting across all game types
 * This centralizes the betting logic to ensure consistent behavior
 */
export const useGameBet = (gameId: number) => {
  const { toast } = useToast();
  const { balance, refreshBalance } = useWallet();
  // Always use INR as the only currency (project requirement)
  const currency: SupportedCurrency = 'INR';
  const { placeBet, completeBet, refetch: refreshAPIBalance } = useBalance(currency);
  
  // Function to do a complete balance refresh, both from wallet context and direct API
  const forceBalanceRefresh = () => {
    console.log("Performing full balance refresh");
    refreshBalance(); // Refresh the wallet context balance
    refreshAPIBalance(); // Refresh the direct API balance
  };
  
  // Initialization logging for debugging
  useEffect(() => {
    console.log("Setting up global bet functions");
  }, []);
  
  // State for bet amount and auto-cashout
  const [betAmount, setBetAmount] = useState<number>(gameId === 101 ? 100.00 : 10.00);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number | null>(null);
  const [isProcessingBet, setIsProcessingBet] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Place a bet for any game type
  const handlePlaceBet = async (betOptions?: Record<string, any>) => {
    // Clear any previous errors
    setError(null);
    
    // Get client seed from options or generate one
    const clientSeed = betOptions?.clientSeed || Math.random().toString(36).substring(2, 15);
    
    // Get bet amount from options or use default
    const amountToUse = betOptions?.amount || betAmount;
    
    console.log("Placing bet with data:", {
      amount: amountToUse,
      gameId: betOptions?.gameId || gameId,
      clientSeed,
      options: betOptions?.options,
      currency: 'INR'
    });
    
    // Validate bet amount - properly parse it first to ensure it's a valid number
    const numericBetAmount = parseFloat(amountToUse as any);
    
    if (isNaN(numericBetAmount) || numericBetAmount <= 0) {
      const errorMsg = 'Bet amount must be a valid positive number';
      setError(errorMsg);
      toast({
        title: 'Invalid Bet',
        description: errorMsg,
        variant: 'destructive'
      });
      return false;
    }
    
    // Enforce minimum bet amount of 100
    if (numericBetAmount < 100) {
      const errorMsg = 'Bet amount must be at least ₹100';
      setError(errorMsg);
      toast({
        title: 'Invalid Bet',
        description: errorMsg,
        variant: 'destructive'
      });
      return false;
    }
    
    // Get the current balance - make sure it's a number too
    const numericBalance = parseFloat(balance as any);
    
    // Check if player has enough balance
    if (isNaN(numericBalance) || numericBetAmount > numericBalance) {
      const errorMsg = 'Insufficient balance to place this bet';
      setError(errorMsg);
      console.log(`Insufficient balance: ${numericBetAmount} > ${numericBalance}`);
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough funds to place this bet',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setIsProcessingBet(true);
      
      // Call the bet API - INR currency is handled on the server side
      console.log('Making bet API call with amounts:', {
        numericBetAmount,
        originalAmount: amountToUse,
        formattedAmount: numericBetAmount.toFixed(2)
      });
      
      const betData = await placeBet.mutateAsync({
        gameId: betOptions?.gameId || gameId,
        amount: numericBetAmount, // Always use the numeric parsed value
        clientSeed,
        options: betOptions?.options
      });
      
      console.log('Bet placed successfully, response:', betData);
      
      // Refresh the player's balance after placing bet
      forceBalanceRefresh();
      
      // Add a delay before setting isProcessingBet to false to ensure balance updates
      setTimeout(() => {
        setIsProcessingBet(false);
      }, 500);
      
      return betData;
      
    } catch (err: any) {
      console.error('Error placing bet:', err);
      setIsProcessingBet(false);
      
      // Ensure we have a user-friendly error message
      const errorMessage = err.message || 'Failed to place bet';
      setError(errorMessage);
      
      toast({
        title: 'Bet Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Force a balance refresh to ensure we have accurate balance data
      forceBalanceRefresh();
      
      return false;
    }
  };
  
  // Complete a bet with outcome
  const handleCompleteBet = async (betId: number, outcome: Record<string, any>) => {
    try {
      setIsProcessingBet(true);
      
      // Validate bet ID
      if (!betId || typeof betId !== 'number' || betId <= 0) {
        throw new Error('Invalid bet ID');
      }
      
      // Ensure we have a valid outcome object
      if (!outcome || typeof outcome !== 'object') {
        throw new Error('Invalid outcome data');
      }
      
      console.log(`Completing bet ID: ${betId}`, outcome);
      
      // If outcome contains a multiplier, ensure it's a valid number
      if (outcome.multiplier !== undefined) {
        const multiplier = parseFloat(outcome.multiplier as any);
        if (isNaN(multiplier) || multiplier <= 0) {
          throw new Error('Invalid multiplier value');
        }
        // Normalize the multiplier in the outcome
        outcome.multiplier = multiplier;
      }
      
      // Call the complete bet API
      const result = await completeBet.mutateAsync({
        betId,
        outcome
      });
      
      console.log("Bet completed successfully:", result);
      
      // Refresh the player's balance after completing bet
      forceBalanceRefresh();
      
      // Add a delay before setting isProcessingBet to false to ensure balance updates
      setTimeout(() => {
        setIsProcessingBet(false);
      }, 500);
      
      // Handle win notification
      if (result.win) {
        // Make sure winAmount is a valid number
        const winAmount = parseFloat(result.winAmount as any);
        const formattedWin = !isNaN(winAmount) ? winAmount.toFixed(2) : '0.00';
        
        toast({
          title: 'You Won!',
          description: `You won ₹${formattedWin}!`,
          variant: 'default'
        });
      }
      
      return result;
      
    } catch (err: any) {
      console.error('Error completing bet:', err);
      setIsProcessingBet(false);
      
      // Ensure we have a user-friendly error message
      const errorMessage = err.message || 'Failed to complete bet';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Force a balance refresh to ensure we have accurate balance data
      forceBalanceRefresh();
      
      return false;
    }
  };
  
  // Clear any error messages
  const clearError = () => {
    setError(null);
  };
  
  return {
    betAmount,
    setBetAmount,
    autoCashoutValue,
    setAutoCashoutValue,
    isProcessingBet,
    error,
    clearError,
    placeBet: handlePlaceBet,
    completeBet: handleCompleteBet
  };
};