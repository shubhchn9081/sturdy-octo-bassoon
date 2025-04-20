import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { formatCrypto } from "@/lib/utils";

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
      return apiRequest('POST', '/api/bets/place', {
        amount, 
        gameId, 
        clientSeed,
        options
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bets/history'] });
    },
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
  });

  // Get the raw balance value for the selected currency
  const rawBalance = balanceData ? balanceData[currency] || 0 : 0;

  return {
    balance: displayBalance,
    rawBalance, // Add the raw balance number for calculations
    balanceData, // Return the full balance object
    isLoading,
    placeBet,
    completeBet
  };
}
