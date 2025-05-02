import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useEffect } from 'react';

type WalletStore = {
  balance: number;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => void;
};

// Create a Zustand store for wallet state
export const useWallet = create<WalletStore>((set) => ({
  balance: 0,
  isLoading: true,
  error: null,
  refreshBalance: () => {
    // This will be implemented when the hook is used
  }
}));

// Hook to fetch and manage wallet balance
export const useWalletData = () => {
  const queryClient = useQueryClient();

  // Query to fetch balance
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/user/balance'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/balance');
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch balance');
      }
      return res.json();
    },
    staleTime: 10000, // 10 seconds
  });

  // Mutation for placing bets
  const placeBet = useMutation({
    mutationFn: async ({ gameId, amount, clientSeed, options = {} }: PlaceBetParams) => {
      try {
        const res = await apiRequest('POST', '/api/bets/place', {
          gameId,
          amount,
          clientSeed,
          options
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error placing bet');
        }

        return res.json();
      } catch (error: any) {
        console.error('Bet placement API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate balance query to get fresh balance after placing bet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    }
  });

  // Mutation for completing bets
  const completeBet = useMutation({
    mutationFn: async ({ betId, outcome }: CompleteBetParams) => {
      try {
        const res = await apiRequest('POST', `/api/bets/${betId}/complete`, { outcome });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error completing bet');
        }
        
        return res.json();
      } catch (error: any) {
        console.error('Bet completion API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
    }
  });

  // Set the wallet store data
  useEffect(() => {
    // Only update if we have data and it's not loading
    if (data && !isLoading) {
      useWallet.setState({
        balance: data.balance || 0,
        isLoading,
        error: error ? (error as Error).message : null,
        refreshBalance: refetch
      });
    }
  }, [data, isLoading, error, refetch]);

  // Return the wallet data and bet functions
  return {
    balance: data?.balance || 0,
    isLoading,
    error: error ? (error as Error).message : null,
    refreshBalance: refetch,
    placeBet,
    completeBet,
    // Formatting helper
    formatBalance: (amount: number) => amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  };
};

// Types for bet placement and completion
export type PlaceBetParams = {
  gameId: number;
  clientSeed: string;
  amount: number;
  options?: Record<string, any>;
};

export type CompleteBetParams = {
  betId: number;
  outcome: Record<string, any>;
};