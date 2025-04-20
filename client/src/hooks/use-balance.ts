import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { formatCrypto } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define the balance type
type BalanceType = {
  BTC: number;
  ETH: number;
  USDT: number;
  INR: number;
  [key: string]: number;
};

export function useBalance(currency: string = 'BTC') {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [displayBalance, setDisplayBalance] = useState("0.00000000");
  
  const { data: balanceData, isLoading } = useQuery<BalanceType>({
    queryKey: ['/api/user/balance'],
    refetchInterval: 10000, // Refresh balance every 10 seconds
  });
  
  useEffect(() => {
    if (balanceData !== undefined && currency in balanceData) {
      setDisplayBalance(formatCrypto(balanceData[currency]));
    }
  }, [balanceData, currency]);
  
  // Check if there's enough balance for a bet
  const hasSufficientBalance = (amount: number, currencyToCheck: string = currency): boolean => {
    if (!balanceData) return false;
    
    const availableBalance = balanceData[currencyToCheck] || 0;
    return availableBalance >= amount && amount > 0;
  };
  
  const placeBet = useMutation({
    mutationFn: async ({ 
      amount, 
      gameId, 
      clientSeed,
      options = {}
    }: { 
      amount: number; 
      gameId: number; 
      clientSeed: string;
      options?: Record<string, any>;
    }) => {
      // Add the currency to options if not already set
      const betCurrency = options.currency || currency;
      const updatedOptions = { ...options, currency: betCurrency };
      
      // Don't allow bets of 0 or negative amounts
      if (amount <= 0) {
        throw new Error('Bet amount must be greater than 0');
      }
      
      // Get minimum bet from options or use a default
      const minBet = options.minBet || 0.00000001;
      if (amount < minBet) {
        throw new Error(`Bet amount must be at least ${minBet} ${betCurrency}`);
      }
      
      // Check balance client-side before making the request
      if (!hasSufficientBalance(amount, betCurrency)) {
        throw new Error(`Insufficient ${betCurrency} balance`);
      }
      
      return apiRequest('POST', '/api/bets/place', {
        amount, 
        gameId, 
        clientSeed,
        options: updatedOptions,
        userId: options.userId || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bets/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const completeBet = useMutation({
    mutationFn: async ({ 
      betId, 
      outcome 
    }: { 
      betId: number; 
      outcome: Record<string, any>;
    }) => {
      return apiRequest('POST', `/api/bets/${betId}/complete`, { outcome });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bets/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Completing Bet",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get the raw balance value for the selected currency
  const rawBalance = balanceData ? balanceData[currency] || 0 : 0;

  return {
    balance: displayBalance,
    rawBalance, // Add the raw balance number for calculations
    balanceData, // Return the full balance object
    isLoading,
    placeBet,
    completeBet,
    hasSufficientBalance, // Expose the balance check function
    getCurrencySymbol: (curr: string = currency) => curr // Helper to get currency symbol
  };
}
