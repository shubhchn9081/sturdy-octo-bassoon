import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/UserContext';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  ArrowUpRight, 
  LogIn,
  AlertTriangle,
  Wallet
} from 'lucide-react';

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  // Always start with null and fetch from API
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Show loading indicator until data arrives
  const [error, setError] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false); // Track when balance updates happen
  
  // Directly connect to the wallet balance API
  useEffect(() => {
    // Only fetch balance if user is authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    const fetchDirectBalance = async () => {
      try {
        // Add a cache-busting parameter to prevent stale data
        const timestamp = Date.now();
        const response = await fetch(`/api/user/balance?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && typeof data.balance === 'number') {
          // Get the current balance to compare with new data
          // This avoids the need to include balance in the effect dependencies
          setBalance(currentBalance => {
            // Only update and animate if balance has changed
            if (currentBalance !== data.balance) {
              // Visual feedback for balance changes
              setIsUpdated(true);
              setTimeout(() => setIsUpdated(false), 1000);
              setError(null);
              return data.balance;
            }
            return currentBalance;
          });
        } else {
          throw new Error('Invalid balance data format received');
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setError(error instanceof Error ? error.message : 'Failed to update balance');
      } finally {
        // Ensure loading state is turned off after first attempt
        setIsLoading(false);
      }
    };
    
    // Fetch balance immediately
    fetchDirectBalance();
    
    // Set up an interval to refresh the balance every 1 second
    const refreshInterval = setInterval(fetchDirectBalance, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
    
    // Important: We intentionally don't include 'balance' as a dependency
    // as it would cause the effect to re-run on every balance change,
    // creating new intervals continuously
  }, [isAuthenticated]);
  
  const handleAddFunds = () => {
    toast({
      title: "Add Funds",
      description: "Opening payment gateway...",
    });
    // In a real app, this would redirect to a payment gateway or modal
  };
  
  const handleWithdrawFunds = () => {
    toast({
      title: "Withdraw Funds",
      description: "Opening withdrawal form...",
    });
    // In a real app, this would open a withdrawal form
  };

  const handleLogin = () => {
    setLocation('/login');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-[#7F8990]">Manage your funds securely</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg overflow-hidden">
          <CardHeader className="border-b border-[#243442]">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-[#1375e1] mr-3" />
              <CardTitle className="text-2xl font-bold">Your Balance</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center mb-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-16">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
                       aria-label="Loading"/>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-sm text-[#7F8990]">Try refreshing the page</p>
                </div>
              ) : (
                <>
                  <span 
                    className={`text-5xl font-bold font-mono mb-1 transition-all duration-500 ${isUpdated ? 'scale-110' : 'scale-100'}`}
                    style={{ 
                      color: isUpdated ? '#1375e1' : (balance !== null ? '#fff' : '#7F8990'),
                      textShadow: isUpdated 
                        ? '0 0 15px rgba(19, 117, 225, 0.8)' 
                        : (balance !== null ? '0 0 10px rgba(19, 117, 225, 0.5)' : 'none')
                    }}
                  >
                    {balance !== null ? balance.toFixed(2) : "Loading..."}
                  </span>
                  <span className="text-[#7F8990] text-lg">INR</span>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button 
                className="bg-[#20b26c] hover:bg-[#1a9f5c] text-white py-6 text-lg font-medium"
                onClick={handleAddFunds}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Funds
              </Button>
              
              <Button 
                className="bg-[#1375e1] hover:bg-[#1060c0] text-white py-6 text-lg font-medium"
                onClick={handleWithdrawFunds}
              >
                <ArrowUpRight className="h-5 w-5 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="bg-[#0F212E] border-t border-[#243442] py-4 text-center text-[#7F8990]">
            <p className="text-sm w-full">Transaction history available in account settings</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}