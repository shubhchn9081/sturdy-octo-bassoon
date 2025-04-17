import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { formatCrypto } from "@/lib/utils";

export function useBalance() {
  const queryClient = useQueryClient();
  const [displayBalance, setDisplayBalance] = useState("0.00000000");
  
  const { data: balance, isLoading } = useQuery({
    queryKey: ['/api/user/balance'],
    refetchInterval: 10000, // Refresh balance every 10 seconds
  });
  
  useEffect(() => {
    if (balance !== undefined) {
      setDisplayBalance(formatCrypto(balance));
    }
  }, [balance]);
  
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

  return {
    balance: displayBalance,
    isLoading,
    placeBet,
    completeBet
  };
}
