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
  const presetAmounts = [1, 5, 10, 25, 50, 100];
  
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
      
      {/* Balance display */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Label className="text-xs text-muted-foreground">Balance</Label>
          <p className="text-lg font-bold">{formattedBalance} INR</p>
        </div>
        
        {spinResults && spinResults.win && (
          <div className="text-right">
            <Label className="text-xs text-muted-foreground">Last Win</Label>
            <p className="text-lg font-bold text-green-500">
              +{spinResults.winAmount.toFixed(2)} INR
            </p>
          </div>
        )}
      </div>
      
      {/* Betting controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bet amount */}
        <div className="space-y-2">
          <Label htmlFor="betAmount">Bet Amount</Label>
          <div className="flex space-x-2">
            <Input
              id="betAmount"
              type="number"
              min="1"
              step="1"
              value={localBetAmount}
              onChange={handleBetAmountChange}
              onBlur={handleBetAmountBlur}
              className="w-full"
              disabled={isSpinning}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePresetClick(Math.max(1, betAmount * 2))}
              disabled={isSpinning}
              title="Double bet"
            >
              2×
            </Button>
          </div>
          
          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2 mt-2">
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
        
        {/* Lucky number selection */}
        <div className="space-y-2">
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
          <p className="text-xs text-muted-foreground mt-1">
            Win 10× your bet if your lucky number appears in any reel!
          </p>
        </div>
        
        {/* Auto-spin and spin button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoSpin">Auto Spin</Label>
            <Switch
              id="autoSpin"
              checked={autoSpin}
              onCheckedChange={setAutoSpin}
              disabled={isSpinning}
            />
          </div>
          
          <Button
            variant="default"
            className="w-full h-12 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            onClick={autoSpin ? stopAutoSpin : onSpin}
            disabled={isSpinning || parseFloat(balance) < betAmount}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Spinning...
              </>
            ) : autoSpin ? (
              'Stop Auto Spin'
            ) : (
              'Spin'
            )}
          </Button>
          
          {parseFloat(balance) < betAmount && (
            <p className="text-xs text-red-500 flex items-center mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Insufficient balance
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;