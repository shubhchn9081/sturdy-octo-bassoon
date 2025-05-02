import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/UserContext';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet
} from 'lucide-react';

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
              <span className="text-5xl font-bold font-mono mb-1">
                {user?.balance ? user.balance.toFixed(2) : "0.00"}
              </span>
              <span className="text-[#7F8990] text-lg">Credits</span>
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