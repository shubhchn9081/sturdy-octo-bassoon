import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportedCurrency } from '@/context/CurrencyContext';

// Types
export interface WalletBalance {
  balance: number;
}

export interface TransactionHistory {
  id: number;
  userId: number;
  amount: number;
  currency: SupportedCurrency;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  gameId?: number;
  createdAt: string;
  description: string;
}

/**
 * Hook to get the current wallet balance
 */
export const useWalletBalance = () => {
  return useQuery<WalletBalance>({
    queryKey: ['/api/user/balance'],
    queryFn: async () => {
      // Use fetch directly with cache-busting to ensure fresh data
      const res = await fetch('/api/user/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      return res.json();
    },
    // Keep cached balance data for a very short time
    staleTime: 1000,
    // Enable automatic refetching
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnMount: true,
    // Use modern TanStack Query v5 property name
    gcTime: 0, // Previously cacheTime
  });
};

/**
 * Hook to get transaction history
 */
export const useTransactionHistory = (limit: number = 10) => {
  return useQuery<TransactionHistory[]>({
    queryKey: ['/api/transactions', limit],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/transactions?limit=${limit}`);
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return res.json();
    },
    // Keep cached transaction data for 30 seconds
    staleTime: 30000,
  });
};

/**
 * Hook to update wallet balance (for admin use)
 */
export const useUpdateBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      amount, 
      currency = 'INR' 
    }: { 
      userId: number, 
      amount: number, 
      currency?: SupportedCurrency 
    }) => {
      const res = await apiRequest('POST', '/api/admin/update-balance', {
        userId,
        amount,
        currency
      });
      
      if (!res.ok) {
        throw new Error('Failed to update balance');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate balance queries to force a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    }
  });
};

/**
 * Hook for depositing funds 
 */
export const useDeposit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      amount, 
      currency = 'INR'
    }: {
      amount: number,
      currency?: SupportedCurrency
    }) => {
      const res = await apiRequest('POST', '/api/wallet/deposit', {
        amount,
        currency
      });
      
      if (!res.ok) {
        throw new Error('Failed to deposit funds');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate balance queries to force a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      // Also invalidate transaction history
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    }
  });
};

/**
 * Hook for withdrawing funds
 */
export const useWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      amount, 
      currency = 'INR'
    }: {
      amount: number,
      currency?: SupportedCurrency
    }) => {
      const res = await apiRequest('POST', '/api/wallet/withdraw', {
        amount,
        currency
      });
      
      if (!res.ok) {
        throw new Error('Failed to withdraw funds');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate balance queries to force a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      // Also invalidate transaction history
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    }
  });
};

/**
 * Utility to format the currency according to standards
 */
export const formatWalletAmount = (amount: number, currency: SupportedCurrency = 'INR'): string => {
  if (currency === 'INR') {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Fallback to standard formatting
  return amount.toFixed(2);
};

/**
 * Currency symbol for display
 */
export const getCurrencySymbol = (currency: SupportedCurrency = 'INR'): string => {
  if (currency === 'INR') {
    return '₹';
  }
  
  return '';
};