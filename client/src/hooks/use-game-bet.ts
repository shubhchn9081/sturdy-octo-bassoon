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
  const [betAmount, setBetAmount] = useState<number>(10.00);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number | null>(null);
  const [isProcessingBet, setIsProcessingBet] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Place a bet for any game type
  const handlePlaceBet = async (options?: Record<string, any>) => {
    // Clear any previous errors
    setError(null);
    
    console.log("Placing bet with data:", {
      amount: betAmount,
      gameId,
      clientSeed: Math.random().toString(36).substring(2, 15),
      options,
      currency: 'INR'
    });
    
    // Validate bet amount
    if (betAmount <= 0) {
      setError('Bet amount must be greater than 0');
      toast({
        title: 'Invalid Bet',
        description: 'Bet amount must be greater than 0',
        variant: 'destructive'
      });
      return false;
    }
    
    // Check if player has enough balance
    if (betAmount > balance) {
      setError('Insufficient balance to place this bet');
      console.log(`Insufficient balance: ${betAmount} > ${balance}`);
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough funds to place this bet',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      setIsProcessingBet(true);
      
      // Generate a client seed for provably fair gameplay
      const clientSeed = Math.random().toString(36).substring(2, 15);
      
      // Call the bet API - INR currency is handled on the server side
      const betData = await placeBet.mutateAsync({
        gameId,
        amount: betAmount,
        clientSeed,
        options: {
          ...options,
          autoCashout: autoCashoutValue
        }
      });
      
      // Refresh the player's balance after placing bet
      forceBalanceRefresh();
      
      // Add a delay before setting isProcessingBet to false to ensure balance updates
      setTimeout(() => {
        setIsProcessingBet(false);
      }, 500);
      
      return betData;
      
    } catch (err: any) {
      setIsProcessingBet(false);
      setError(err.message || 'Failed to place bet');
      toast({
        title: 'Bet Failed',
        description: err.message || 'An error occurred while placing your bet',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Complete a bet with outcome
  const handleCompleteBet = async (betId: number, outcome: Record<string, any>) => {
    try {
      setIsProcessingBet(true);
      
      console.log(`Completing bet ID: ${betId}`, outcome);
      
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
      
      if (result.win) {
        toast({
          title: 'You Won!',
          description: `You won ₹${result.winAmount.toFixed(2)}!`,
          variant: 'default'
        });
      }
      
      return result;
      
    } catch (err: any) {
      setIsProcessingBet(false);
      setError(err.message || 'Failed to complete bet');
      toast({
        title: 'Error',
        description: err.message || 'An error occurred while processing your bet',
        variant: 'destructive'
      });
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