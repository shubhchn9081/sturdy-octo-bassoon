import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportedCurrency } from '@/context/CurrencyContext';
import { apiRequest } from '@/lib/queryClient';

// Define balance structure to match our new simplified API response
type BalanceResponse = {
  balance: number;
};

// Types for bet placement and completion
export type PlaceBetParams = {
  gameId: number;
  clientSeed: string;
  amount: number;
  options?: Record<string, any>;
  // Currency parameter removed as we only support INR
  // userId is NOT required on the client side
  // The server gets it from the authenticated session
};

export type CompleteBetParams = {
  betId: number;
  outcome: Record<string, any>;
};

/**
 * Custom hook to get and format user balance
 * @param currency The active currency (currently only INR is used)
 * @returns Formatted balance string, raw balance number, and bet mutations
 */
export const useBalance = (currency: SupportedCurrency) => {
  const queryClient = useQueryClient();
  
  // Query to fetch balance data from API
  const { data, isLoading, error, refetch } = useQuery<BalanceResponse, Error>({
    queryKey: ['/api/user/balance'],
    queryFn: async () => {
      const res = await fetch('/api/user/balance');
      if (!res.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await res.json();
      return data;
    },
    // Set a lower staleTime to ensure more frequent updates
    staleTime: 3000,
    // Enable automatic refetching
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Mutation to place a bet
  const placeBet = useMutation({
    mutationFn: async (params: PlaceBetParams) => {
      // Format the bet data to match the server's expected schema
      // Note: currency is now always INR and handled on the server side
      const betData = {
        gameId: params.gameId,
        amount: params.amount,
        clientSeed: params.clientSeed,
        options: params.options || {}
      };
      
      try {
        const res = await apiRequest('POST', '/api/bets/place', betData);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Bet placement error:', errorData);
          throw new Error(errorData.message || 'Error placing bet');
        }
        
        return res.json();
      } catch (error) {
        console.error('Bet API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the balance query to fetch fresh balance after placing bet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    }
  });

  // Mutation to complete a bet
  const completeBet = useMutation({
    mutationFn: async (params: CompleteBetParams) => {
      try {
        const res = await apiRequest('POST', `/api/bets/${params.betId}/complete`, { outcome: params.outcome });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Bet completion error:', errorData);
          throw new Error(errorData.message || 'Error completing bet');
        }
        
        return res.json();
      } catch (error) {
        console.error('Bet completion API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the balance query to fetch fresh balance after completing bet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      // Also invalidate any bet history queries that might exist
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
    }
  });

  // Format balance with 2 decimal places (INR format)
  const formatBalance = (balance?: number): string => {
    if (balance === undefined) return "0.00";
    
    // Always format with 2 decimal places since we only use INR
    return balance.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Return formatted balance string, raw balance value, refresh function, and bet mutations
  return {
    balance: formatBalance(data?.balance),
    rawBalance: data?.balance || 0,
    isLoading,
    error,
    refetch,  // Include refetch function to allow explicit balance refreshes
    placeBet,
    completeBet
  };
};