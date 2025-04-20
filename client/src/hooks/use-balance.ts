import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportedCurrency } from '@/context/CurrencyContext';
import { apiRequest } from '@/lib/queryClient';

// Define balance structure that matches the API response
type BalanceResponse = {
  BTC: number;
  ETH: number;
  INR: number;
  USDT: number;
  USD: number;
};

// Types for bet placement and completion
type PlaceBetParams = {
  gameId: number;
  clientSeed: string;
  amount: number;
  options?: Record<string, any>;
  currency?: SupportedCurrency;
};

type CompleteBetParams = {
  betId: number;
  outcome: Record<string, any>;
};

/**
 * Custom hook to get and format user balance based on active currency
 * @param currency The active currency
 * @returns Formatted balance string, raw balance number, and bet mutations
 */
export const useBalance = (currency: SupportedCurrency) => {
  const queryClient = useQueryClient();
  
  // Query to fetch balance data from API
  const { data, isLoading, error } = useQuery<BalanceResponse, Error>({
    queryKey: ['/api/user/balance'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/balance');
      return await res.json();
    },
    // Keep cached balance data for 10 seconds
    staleTime: 10000,
  });

  // Mutation to place a bet
  const placeBet = useMutation({
    mutationFn: async (params: PlaceBetParams) => {
      const betData = {
        ...params,
        options: {
          ...params.options,
          currency: params.currency || currency
        }
      };
      
      const res = await apiRequest('POST', '/api/bets/place', betData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the balance query to fetch fresh balance after placing bet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    }
  });

  // Mutation to complete a bet
  const completeBet = useMutation({
    mutationFn: async (params: CompleteBetParams) => {
      const res = await apiRequest('POST', `/api/bets/${params.betId}/complete`, { outcome: params.outcome });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the balance query to fetch fresh balance after completing bet
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    }
  });

  // Format balance based on currency
  const formatBalance = (balance: BalanceResponse | undefined, currency: SupportedCurrency): string => {
    if (!balance) return "0";
    
    switch (currency) {
      case 'BTC':
        return balance.BTC.toFixed(8);
      case 'ETH':
        return balance.ETH.toFixed(6);
      case 'USDT':
        return balance.USDT.toFixed(2);
      case 'USD':
        return balance.USD.toFixed(2);
      case 'INR':
        return balance.INR.toFixed(2);
      default:
        return "0";
    }
  };

  // Get raw balance amount for the selected currency
  const getRawBalance = (balance: BalanceResponse | undefined, currency: SupportedCurrency): number => {
    if (!balance) return 0;
    
    switch (currency) {
      case 'BTC':
        return balance.BTC;
      case 'ETH':
        return balance.ETH;
      case 'USDT':
        return balance.USDT;
      case 'USD':
        return balance.USD;
      case 'INR':
        return balance.INR;
      default:
        return 0;
    }
  };

  // Return formatted balance string, raw balance value, and bet mutations
  return {
    balance: formatBalance(data, currency),
    rawBalance: getRawBalance(data, currency),
    isLoading,
    error,
    placeBet,
    completeBet
  };
};