import { create } from 'zustand';
import { queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define the wallet store type
type WalletStore = {
  balance: number;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => void;
};

// Create the wallet store with Zustand
export const useWallet = create<WalletStore>((set) => ({
  balance: 0,
  isLoading: true,
  error: null,
  refreshBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/user/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      set({ balance: data.balance, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  }
}));

// Hook to automatically fetch and update wallet data
export const useWalletData = () => {
  const walletStore = useWallet();
  
  // Fetch balance on component mount
  useQuery({
    queryKey: ['/api/user/balance'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/balance');
        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }
        const data = await response.json();
        
        // Update the wallet store
        walletStore.balance = data.balance;
        walletStore.isLoading = false;
        
        return data;
      } catch (error) {
        walletStore.error = error instanceof Error ? error.message : 'Unknown error';
        walletStore.isLoading = false;
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  // Format balance for display
  const formatBalance = (amount: number): string => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  return {
    ...walletStore,
    formatBalance,
  };
};

// Types for bet operations
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

// Hook for bet operations
export const useBetMutations = () => {
  // Mutation for placing a bet
  const placeBet = useMutation({
    mutationFn: async ({ gameId, amount, clientSeed, options = {} }: PlaceBetParams) => {
      const response = await apiRequest('/api/bets/place', {
        method: 'POST',
        body: JSON.stringify({
          gameId,
          amount,
          clientSeed,
          options
        }),
      });
      
      // Invalidate balance query to update wallet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      
      return response;
    },
  });
  
  // Mutation for completing a bet
  const completeBet = useMutation({
    mutationFn: async ({ betId, outcome }: CompleteBetParams) => {
      const response = await apiRequest(`/api/bets/${betId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ outcome }),
      });
      
      // Invalidate balance query to update wallet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      
      // Also invalidate bet history
      queryClient.invalidateQueries({ queryKey: ['/api/bets/history'] });
      
      return response;
    },
  });
  
  return {
    placeBet,
    completeBet,
  };
};

// Hook for transaction history
export const useTransactions = () => {
  return useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await apiRequest('/api/transactions');
      return response;
    },
  });
};

// Hook for bet history
export const useBetHistory = (gameId?: number) => {
  const queryString = gameId ? `?gameId=${gameId}` : '';
  
  return useQuery({
    queryKey: ['/api/bets/history', gameId],
    queryFn: async () => {
      const response = await apiRequest(`/api/bets/history${queryString}`);
      return response;
    },
  });
};