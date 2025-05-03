import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BettingPanelProps = {
  balance: string;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onSpin: () => void;
  isSpinning: boolean;
  autoSpin: boolean;
  setAutoSpin: (value: boolean) => void;
  stopAutoSpin: () => void;
  error: string | null;
  clearError: () => void;
  spinResults: any | null;
  luckyNumber: number;
  setLuckyNumber: (number: number) => void;
};

const BettingPanel = ({
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
  spinResults,
  luckyNumber,
  setLuckyNumber
}: BettingPanelProps) => {
  const [localBetAmount, setLocalBetAmount] = useState<string>(betAmount.toString());
  
  // Preset bet amounts
  const presetAmounts = [100, 500, 1000, 5000];
  
  // Update local bet amount when props change
  useEffect(() => {
    setLocalBetAmount(betAmount.toString());
  }, [betAmount]);
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBetAmount(value);
    
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setBetAmount(numericValue);
    }
  };
  
  // Handle preset amount click
  const handlePresetClick = (amount: number) => {
    setBetAmount(amount);
    setLocalBetAmount(amount.toString());
  };
  
  // Handle bet amount blur
  const handleBetAmountBlur = () => {
    const numericValue = parseFloat(localBetAmount);
    if (isNaN(numericValue) || numericValue <= 0) {
      setBetAmount(1); // Default to 1 if invalid
      setLocalBetAmount('1');
    }
  };
  
  // Format balance with commas for thousands
  const formattedBalance = parseFloat(balance).toLocaleString(undefined, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2"
            onClick={clearError}
          >
            ✕
          </Button>
        </Alert>
      )}
      
      {/* Win display */}
      {spinResults && spinResults.win && (
        <div className="flex justify-center items-center mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-green-500">
              +{spinResults.winAmount.toFixed(2)} INR
            </p>
          </div>
        </div>
      )}
      
      {/* Betting controls at top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Bet amount & presets */}
        <div className="space-y-2">
          <Label htmlFor="betAmount">Bet Amount</Label>
          <div className="flex space-x-2">
            <Input
              id="betAmount"
              type="number"
              min="100"
              step="100"
              value={localBetAmount}
              onChange={handleBetAmountChange}
              onBlur={handleBetAmountBlur}
              className="w-full"
              disabled={isSpinning}
            />
          </div>
          
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="text-xs py-1"
                onClick={() => handlePresetClick(amount)}
                disabled={isSpinning}
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Lucky number and Auto-spin */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="luckyNumber">Lucky Number (10× Win!)</Label>
            <Select
              value={luckyNumber.toString()}
              onValueChange={(value) => setLuckyNumber(parseInt(value))}
              disabled={isSpinning}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your lucky number" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Label htmlFor="autoSpin">Auto Spin</Label>
            <Switch
              id="autoSpin"
              checked={autoSpin}
              onCheckedChange={setAutoSpin}
              disabled={isSpinning}
            />
          </div>
        </div>
      </div>
      
      {/* SPIN button below betting controls */}
      <div>
        <Button
          variant="default"
          className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-lg"
          onClick={autoSpin ? stopAutoSpin : onSpin}
          disabled={isSpinning}
        >
          {isSpinning ? (
            <>
              <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
              Spinning...
            </>
          ) : autoSpin ? (
            'STOP AUTO SPIN'
          ) : (
            'SPIN'
          )}
        </Button>
        
        {parseFloat(balance) < betAmount && (
          <p className="text-xs text-red-500 flex items-center justify-center mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Insufficient balance
          </p>
        )}
      </div>
    </div>
  );
};

export default BettingPanel;