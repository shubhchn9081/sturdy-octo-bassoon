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
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the current balance directly from the API
  useEffect(() => {
    // Only fetch balance if user is authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const response = await apiRequest('GET', '/api/user/balance');
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch balance');
          console.error('Balance fetch error:', errorData);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Network error while fetching balance');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
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
                  <span className="text-5xl font-bold font-mono mb-1">
                    {(() => {
                      // Helper function to get INR balance
                      const getBalance = () => {
                        if (!user?.balance) return 0;
                        
                        // Handle numeric balance directly
                        if (typeof user.balance === 'number') {
                          return user.balance;
                        } 
                        // For backward compatibility, handle object format but only get INR
                        else if (typeof user.balance === 'object' && user.balance !== null) {
                          const balanceObj = user.balance as Record<string, number>;
                          return balanceObj['INR'] || 0;
                        }
                        return 0;
                      };
                      
                      // Use provided balance first, then fall back to calculated balance
                      const displayBalance = balance !== null ? balance : getBalance();
                      return displayBalance.toFixed(2);
                    })()}
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