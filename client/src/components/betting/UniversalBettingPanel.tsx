import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useBalance } from '@/hooks/use-balance';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

interface UniversalBettingPanelProps {
  onBet: (amount: number, autoCashout?: number | null) => void;
  onCashout?: () => void;
  gameType: 'crash' | 'dice' | 'plinko' | 'mines' | 'limbo' | 'wheel';
  disabled?: boolean;
  showAutoCashout?: boolean;
  maxWin?: number;
}

export const UniversalBettingPanel: React.FC<UniversalBettingPanelProps> = ({
  onBet,
  onCashout,
  gameType,
  disabled = false,
  showAutoCashout = false,
  maxWin
}) => {
  // Get balance from the INR-only balance hook
  const { rawBalance, balance: formattedBalance } = useBalance('INR');
  const { user } = useAuth();
  
  // Use the balance directly - always in INR
  const currentBalance = rawBalance;
  
  // State for bet amount and auto-cashout
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number | null>(null);
  
  // Quick bet buttons amounts
  const quickBetOptions = [10, 50, 100, 500, 1000];
  
  // Validate and set bet amount
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setBetAmount(0);
    } else {
      setBetAmount(value);
    }
  };
  
  // Validate and set auto-cashout
  const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 1) {
      setAutoCashoutValue(null);
    } else {
      setAutoCashoutValue(value);
    }
  };
  
  // Place bet with validation
  const placeBet = () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to place bets",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet",
        variant: "destructive"
      });
      return;
    }
    
    onBet(betAmount, showAutoCashout ? autoCashoutValue : null);
  };
  
  // Apply % of balance
  const applyPercentage = (percentage: number) => {
    const newAmount = Math.floor(currentBalance * percentage) / 100;
    setBetAmount(newAmount);
  };
  
  // Set maximum bet amount based on balance
  const setMaxBet = () => {
    setBetAmount(currentBalance);
  };
  
  return (
    <Card className="bg-[#172B3A] border-[#243442] shadow-lg">
      <CardContent className="p-4">
        {/* Header with Balance */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Place Bet</h3>
          <div className="text-[#7F8990]">
            Balance: <span className="text-white font-mono">₹{formattedBalance}</span>
          </div>
        </div>
        
        {/* Bet Amount Input */}
        <div className="mb-4">
          <Label htmlFor="betAmount" className="text-[#7F8990] text-sm mb-1 block">
            Bet Amount (INR)
          </Label>
          <div className="flex">
            <Input
              id="betAmount"
              type="number"
              min="0"
              step="1"
              value={betAmount}
              onChange={handleBetAmountChange}
              className="bg-[#0F212E] border-[#243442] text-white"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-[#0F212E] border-[#243442] text-white hover:bg-[#243442] h-10"
              onClick={setMaxBet}
            >
              Max
            </Button>
          </div>
        </div>
        
        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {quickBetOptions.map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              className="bg-[#0F212E] border-[#243442] text-white hover:bg-[#243442]"
              onClick={() => setBetAmount(amount)}
            >
              ₹{amount}
            </Button>
          ))}
        </div>
        
        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-1 mb-4">
          {[10, 25, 50, 100].map(percent => (
            <Button
              key={percent}
              variant="outline"
              size="sm"
              className="bg-[#0F212E] border-[#243442] text-white hover:bg-[#243442]"
              onClick={() => applyPercentage(percent)}
            >
              {percent}%
            </Button>
          ))}
        </div>
        
        {/* Auto-Cashout Input (for crash game) */}
        {showAutoCashout && (
          <div className="mb-4">
            <Label htmlFor="autoCashout" className="text-[#7F8990] text-sm mb-1 block">
              Auto Cashout at (optional)
            </Label>
            <Input
              id="autoCashout"
              type="number"
              min="1.01"
              step="0.01"
              placeholder="E.g. 2.00x"
              value={autoCashoutValue || ''}
              onChange={handleAutoCashoutChange}
              className="bg-[#0F212E] border-[#243442] text-white"
            />
          </div>
        )}
        
        {/* Max Win Display if provided */}
        {maxWin !== undefined && (
          <div className="text-[#7F8990] text-sm mb-4">
            Potential Win: <span className="text-[#57FBA2] font-mono">₹{maxWin.toFixed(2)}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={placeBet}
            disabled={disabled || betAmount <= 0 || betAmount > currentBalance}
          >
            Place Bet
          </Button>
          
          {onCashout && (
            <Button 
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={onCashout}
              disabled={disabled}
            >
              Cash Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UniversalBettingPanel;