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
        <div className="p-2 rounded-full bg-[#57FBA2]/10 mr-3">
          <Wallet className="h-6 w-6 text-[#57FBA2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Funds</h1>
          <p className="text-[#7F8990] text-sm">Fast & secure deposits</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <APay />
      </div>
    </div>
  );
}