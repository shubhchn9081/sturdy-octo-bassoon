import { create } from 'zustand';
import { useAuth } from '@/hooks/use-auth';
import { useBalance } from '@/hooks/use-balance';

// Define wallet types
interface WalletState {
  wallet: {
    balance: string;
    currency: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Create wallet store with real integration to our existing hooks
export const useWallet = create<WalletState>((set) => {
  // Get the auth hook for user information
  const auth = useAuth();
  const balance = useBalance();
  
  // Set initial state based on the current balance
  const currentBalance = balance.data?.BTC || 0;
  
  return {
    wallet: {
      balance: currentBalance.toString(),
      currency: 'BTC'
    },
    isLoading: balance.isLoading,
    error: null,
    refetch: () => {
      // Refetch balance data using the existing balance hook
      balance.refetch();
    }
  };
});

// Update wallet when balance changes
// This would typically be set up in a component
export const syncWalletWithBalance = () => {
  const balance = useBalance();
  const currentBalance = balance.data?.BTC || 0;
  
  useWallet.setState({
    wallet: {
      balance: currentBalance.toString(),
      currency: 'BTC'
    },
    isLoading: balance.isLoading
  });
};