import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWalletBalance, formatWalletAmount, getCurrencySymbol } from '@/lib/wallet';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SupportedCurrency } from './CurrencyContext';

// Context type
interface WalletContextType {
  balance: number;
  formattedBalance: string;
  symbol: string;
  currency: SupportedCurrency;
  isLoading: boolean;
  error: Error | null;
  refreshBalance: () => void;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get user auth context to check authentication status
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use our custom wallet hook to fetch balance
  const { 
    data: walletData,
    isLoading, 
    error, 
    refetch 
  } = useWalletBalance();
  
  // Default currency is INR
  const currency: SupportedCurrency = 'INR';
  
  // Get balance value or default to 0
  const balance = walletData ? walletData.balance : 0;
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Format the balance for display
  const formattedBalance = formatWalletAmount(balance, currency);
  
  // Get currency symbol for display
  const symbol = getCurrencySymbol(currency);
  
  // Effect to handle errors
  useEffect(() => {
    if (error && isAuthenticated) {
      toast({
        title: 'Wallet Error',
        description: `Could not load your balance: ${error.message}`,
        variant: 'destructive'
      });
    }
  }, [error, isAuthenticated, toast]);
  
  // Set up automatic balance refresh
  useEffect(() => {
    if (isAuthenticated) {
      // Immediate refresh on mount
      refetch();
      
      // Set up an interval to refresh balance every 5 seconds
      const intervalId = setInterval(() => {
        console.log("Auto-refreshing wallet balance");
        refetch();
      }, 5000);
      
      // Clean up on unmount
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, refetch]);
  
  // Values for the context
  const contextValue: WalletContextType = {
    balance,
    formattedBalance,
    symbol,
    currency,
    isLoading,
    error: error || null,
    refreshBalance: refetch
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for using the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};

// Export a function to format amounts using the wallet's formatting logic
export const formatWalletCurrency = (amount: number, currency: SupportedCurrency = 'INR'): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${formatWalletAmount(amount, currency)}`;
};