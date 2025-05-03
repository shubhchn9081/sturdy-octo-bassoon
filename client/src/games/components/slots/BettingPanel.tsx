import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Type definitions for BettingPanel props
type BettingPanelProps = {
  balance: string | number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onSpin: () => void;
  isSpinning: boolean;
  autoSpin: boolean;
  setAutoSpin: (auto: boolean) => void;
  stopAutoSpin: () => void;
  error: string | null;
  clearError: () => void;
  spinResults: {
    reels: number[];
    multiplier: number;
    win: boolean;
    winAmount: number;
  } | null;
};

// Betting panel component
const BettingPanel: React.FC<BettingPanelProps> = ({
  balance,
  betAmount,
  setBetAmount,
  onSpin,
  isSpinning,
  autoSpin,
  setAutoSpin,
  stopAutoSpin,
  error,
  clearError,
  spinResults
}) => {
  // State for expanded betting panel
  const [expanded, setExpanded] = useState(false);
  
  // Bet amount preset values
  const presetAmounts = [1, 5, 10, 25, 50, 100];
  
  // Handle input change (validate to allow only numbers)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
    } else if (e.target.value === '') {
      setBetAmount(0);
    }
  };
  
  // Increment and decrement bet amount
  const incrementBet = () => {
    setBetAmount(Math.min(parseFloat(balance as string) || 0, betAmount + 1));
  };
  
  const decrementBet = () => {
    setBetAmount(Math.max(0, betAmount - 1));
  };
  
  // Set bet amount to a preset value
  const setPresetAmount = (amount: number) => {
    if (amount <= (parseFloat(balance as string) || 0)) {
      setBetAmount(amount);
    }
  };
  
  // Set bet amount to a percentage of balance
  const setBetPercentage = (percentage: number) => {
    const maxBet = parseFloat(balance as string) || 0;
    const amount = Math.floor((maxBet * percentage) * 100) / 100; // Round to 2 decimal places
    setBetAmount(amount);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Error message */}
      {error && (
        <Alert className="mb-4 border-red-800 bg-red-900/30 text-red-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Expanded betting controls */}
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 animate-in fade-in-50 duration-200">
          {/* Preset bet amounts */}
          <div className="bg-[#0A1824] rounded-lg p-4">
            <div className="text-sm font-medium text-gray-400 mb-2">Preset Amounts</div>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  size="sm"
                  variant="outline"
                  className={amount <= (parseFloat(balance as string) || 0) ? 'border-[#1D2F3D] hover:bg-[#1E3141]' : 'opacity-50 cursor-not-allowed'}
                  onClick={() => setPresetAmount(amount)}
                  disabled={amount > (parseFloat(balance as string) || 0)}
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Percentage buttons */}
          <div className="bg-[#0A1824] rounded-lg p-4">
            <div className="text-sm font-medium text-gray-400 mb-2">Bet Percentage</div>
            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.25, 0.5, 1].map((percentage) => (
                <Button
                  key={percentage}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-[#1D2F3D] hover:bg-[#1E3141]"
                  onClick={() => setBetPercentage(percentage)}
                >
                  {percentage * 100}%
                </Button>
              ))}
            </div>
          </div>
          
          {/* Auto spin toggle */}
          <div className="bg-[#0A1824] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-400">Auto Spin</div>
              <div className="text-xs text-gray-500">Automatically spin after each result</div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-spin" className="sr-only">Auto Spin</Label>
              <Switch 
                id="auto-spin" 
                checked={autoSpin}
                onCheckedChange={setAutoSpin}
                disabled={isSpinning}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Main betting controls */}
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Bet amount input with increment/decrement */}
        <div className="col-span-6 sm:col-span-5">
          <div className="flex items-center">
            <div className="relative w-full">
              <Input
                type="number"
                value={betAmount || ''}
                onChange={handleInputChange}
                className="pr-10 bg-[#0A1824] border-[#1D2F3D] font-medium"
                placeholder="Bet Amount"
                min="0"
                disabled={isSpinning}
              />
              <div className="absolute inset-y-0 right-0 flex flex-col">
                <button
                  type="button"
                  className="flex-1 px-2 text-gray-400 hover:text-white"
                  onClick={incrementBet}
                  disabled={isSpinning}
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="flex-1 px-2 text-gray-400 hover:text-white"
                  onClick={decrementBet}
                  disabled={isSpinning}
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Balance display */}
        <div className="hidden sm:block sm:col-span-2 text-center">
          <div className="text-gray-400 text-xs">Balance</div>
          <div className="font-medium text-white truncate">
            {typeof balance === 'number' ? balance.toFixed(2) : balance}
          </div>
        </div>
        
        {/* Spin button */}
        <div className="col-span-5 sm:col-span-4">
          <Button
            type="button"
            className={`w-full h-10 ${
              isSpinning 
                ? 'bg-amber-600 hover:bg-amber-600' 
                : 'bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600'
            }`}
            onClick={isSpinning && autoSpin ? stopAutoSpin : onSpin}
            disabled={isSpinning && !autoSpin}
          >
            {isSpinning ? (autoSpin ? 'STOP AUTO' : 'SPINNING...') : 'SPIN'}
          </Button>
        </div>
        
        {/* Expand/collapse button */}
        <div className="col-span-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="w-10 h-10 border-[#1D2F3D]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;