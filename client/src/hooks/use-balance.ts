import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

/**
 * Custom hook to get and format user balance based on active currency
 * @param currency The active currency
 * @returns Formatted balance string and raw balance number
 */
export const useBalance = (currency: SupportedCurrency) => {
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

  // Return formatted balance string and raw balance value
  return {
    balance: formatBalance(data, currency),
    rawBalance: getRawBalance(data, currency),
    isLoading,
    error,
  };
};