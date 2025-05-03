import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet } from 'lucide-react';
import { APay } from '@/components/payments/APay';

export default function RechargePage() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-4 flex items-center border-[#243442] text-white hover:bg-[#172B3A]"
        onClick={() => setLocation('/wallet')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Wallet
      </Button>
      
      <div className="flex items-center mb-6">
        <Wallet className="h-6 w-6 text-[#1375e1] mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-white">Add Funds</h1>
          <p className="text-[#7F8990]">Recharge your wallet instantly</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <APay />
      </div>
    </div>
  );
}