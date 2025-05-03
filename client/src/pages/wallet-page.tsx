import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/UserContext';
import { useWalletBalance } from '@/lib/wallet';
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
  const [isUpdated, setIsUpdated] = useState(false); // Track when balance updates happen
  
  // Use the wallet hook from our library instead of direct fetching
  const { 
    data: walletData, 
    isLoading, 
    error: walletError,
    refetch
  } = useWalletBalance();
  
  // Get the balance value or null if data isn't available
  const balance = walletData?.balance ?? null;
  const error = walletError ? walletError.message : null;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // If not authenticated and we've confirmed we're not loading,
      // redirect to the login page
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  // Set up effect to detect balance changes for animation
  useEffect(() => {
    if (balance !== null) {
      setIsUpdated(true);
      const timer = setTimeout(() => setIsUpdated(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [balance]);
  
  // Set up refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh immediately on mount
      refetch();
      
      // Set up interval to refresh every second
      const refreshInterval = setInterval(() => {
        refetch();
      }, 1000);
      
      // Clean up on unmount
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, refetch]);
  
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