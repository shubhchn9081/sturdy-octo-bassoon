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
      // Ensure bet amount is a valid number
      const betAmount = parseFloat(params.amount as any);
      if (isNaN(betAmount) || betAmount <= 0) {
        throw new Error('Invalid bet amount');
      }
      
      // CRITICAL FIX: Format the bet data to match the server's expected schema
      // Ensure the entire bet data structure is clean and doesn't include nested amount fields
      // This solves the double/conflicting amount issue causing bet failures
      
      let cleanOptions: Record<string, any> = {};
      
      // If options exist, make sure they don't contain an amount field
      if (params.options && typeof params.options === 'object') {
        // Create a clean copy without amount properties
        cleanOptions = { ...params.options } as Record<string, any>;
        
        // Remove amount from options to avoid conflict
        if ('amount' in cleanOptions) {
          console.log('⚠️ Removing nested amount from options:', cleanOptions.amount);
          delete cleanOptions.amount;
        }
        
        // Also check for deeply nested options structure if it exists
        if ('options' in cleanOptions && cleanOptions.options !== null && typeof cleanOptions.options === 'object') {
          const nestedOptions = cleanOptions.options as Record<string, any>;
          if ('amount' in nestedOptions) {
            console.log('⚠️ Removing deeply nested amount from options.options:', nestedOptions.amount);
            delete nestedOptions.amount;
          }
        }
      }
      
      // Create a clean bet data payload
      const betData = {
        gameId: params.gameId,
        amount: betAmount, // Use the validated and parsed bet amount as the single source of truth
        clientSeed: params.clientSeed,
        options: cleanOptions
      };
      
      console.log('Placing bet with data:', betData);
      
      try {
        // Explicitly use fetch with error handling instead of apiRequest
        const response = await fetch('/api/bets/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(betData),
          credentials: 'include'
        });
        
        // Get response data
        const responseData = await response.json();
        
        // Handle both successful and error responses
        if (!response.ok) {
          console.error('Bet placement error:', responseData);
          throw new Error(responseData.message || 'Error placing bet');
        }
        
        // Even if response.ok is true, check for success: false in the response body
        if (responseData && responseData.success === false) {
          console.error('Bet placement reported failure:', responseData);
          throw new Error(responseData.message || 'Failed to place bet');
        }
        
        console.log('Bet placed successfully:', responseData);
        return responseData;
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
      // Make a deep copy of the outcome to avoid mutating the original
      const processedOutcome = { ...params.outcome };
      
      // If this is a winning outcome with a multiplier, ensure the multiplier is a valid number
      if (processedOutcome.win && processedOutcome.multiplier !== undefined) {
        processedOutcome.multiplier = parseFloat(processedOutcome.multiplier as any);
        if (isNaN(processedOutcome.multiplier) || processedOutcome.multiplier <= 0) {
          throw new Error('Invalid multiplier value for winning outcome');
        }
        console.log(`Completing bet with multiplier: ${processedOutcome.multiplier}`);
      }
      
      try {
        // Explicitly use fetch with error handling instead of apiRequest
        const response = await fetch(`/api/bets/${params.betId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outcome: processedOutcome }),
          credentials: 'include'
        });
        
        // Get response data
        const responseData = await response.json();
        
        // Handle both successful and error responses
        if (!response.ok) {
          console.error('Bet completion error:', responseData);
          throw new Error(responseData.message || 'Error completing bet');
        }
        
        // Check for success: false in the response body
        if (responseData && responseData.success === false) {
          console.error('Bet completion reported failure:', responseData);
          throw new Error(responseData.message || 'Failed to complete bet');
        }
        
        console.log('Bet completed successfully, will refresh balance');
        return responseData;
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