import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play, Loader2, RotateCcw } from 'lucide-react';

// Types
type SpinResult = {
  reels: number[];
  multiplier: number;
  win: boolean;
  winAmount: number;
};

type BettingPanelProps = {
  balance: string;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onSpin: () => void;
  isSpinning: boolean;
  autoSpin: boolean;
  setAutoSpin: (auto: boolean) => void;
  stopAutoSpin: () => void;
  error: string | null;
  clearError: () => void;
  spinResults: SpinResult | null;
};

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
  // Quick bet amount options
  const betOptions = [1, 5, 10, 25, 50, 100];
  
  // Handle bet amount changes
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
      if (error) clearError();
    }
  };
  
  // Handle quick bet selections
  const handleQuickBet = (amount: number) => {
    setBetAmount(amount);
    if (error) clearError();
  };
  
  // Handle bet amount slider changes
  const handleSliderChange = (value: number[]) => {
    setBetAmount(value[0]);
    if (error) clearError();
  };
  
  // Double the bet amount
  const handleDoubleBet = () => {
    const newAmount = betAmount * 2;
    if (newAmount <= parseFloat(balance)) {
      setBetAmount(newAmount);
      if (error) clearError();
    }
  };
  
  // Halve the bet amount
  const handleHalfBet = () => {
    const newAmount = betAmount / 2;
    if (newAmount >= 1) {
      setBetAmount(newAmount);
      if (error) clearError();
    }
  };
  
  // Max bet (use 80% of balance to avoid rounding issues)
  const handleMaxBet = () => {
    const maxAmount = Math.floor(parseFloat(balance) * 0.8);
    setBetAmount(maxAmount > 0 ? maxAmount : 1);
    if (error) clearError();
  };
  
  // Toggle auto spin
  const handleAutoSpinToggle = () => {
    const newAutoSpin = !autoSpin;
    setAutoSpin(newAutoSpin);
    
    // If enabling auto spin and not currently spinning, start spinning
    if (newAutoSpin && !isSpinning) {
      onSpin();
    }
  };
  
  // UI helper for formatting currency amounts
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Error message display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Bet controls */}
        <div className="space-y-4">
          {/* Bet amount input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="betAmount">Bet Amount</Label>
              <span className="text-muted-foreground">Balance: {formatCurrency(parseFloat(balance))} INR</span>
            </div>
            <div className="flex space-x-2">
              <Input
                id="betAmount"
                type="number"
                min="1"
                step="1"
                value={betAmount}
                onChange={handleBetAmountChange}
                className="bg-[#172B3A] border-[#1D2F3D]"
              />
              <Button 
                variant="outline" 
                className="bg-[#172B3A] border-[#1D2F3D] hover:bg-[#213D54]"
                onClick={handleMaxBet}
              >
                Max
              </Button>
            </div>
          </div>
          
          {/* Bet adjustment buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1 bg-[#172B3A] border-[#1D2F3D] hover:bg-[#213D54]"
              onClick={handleHalfBet}
              disabled={betAmount <= 1}
            >
              ½
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-[#172B3A] border-[#1D2F3D] hover:bg-[#213D54]"
              onClick={handleDoubleBet}
              disabled={betAmount * 2 > parseFloat(balance)}
            >
              2×
            </Button>
          </div>
          
          {/* Quick bet options */}
          <div className="grid grid-cols-3 gap-2">
            {betOptions.map(option => (
              <Button
                key={option}
                variant="outline"
                className={`bg-[#172B3A] border-[#1D2F3D] hover:bg-[#213D54] ${
                  betAmount === option ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleQuickBet(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          
          {/* Bet amount slider */}
          <div className="pt-2">
            <Slider
              defaultValue={[betAmount]}
              max={Math.max(100, parseFloat(balance))}
              min={1}
              step={1}
              value={[betAmount]}
              onValueChange={handleSliderChange}
              className="py-4"
            />
          </div>
        </div>
        
        {/* Right column - Game controls and results */}
        <div className="space-y-4">
          {/* Auto spin toggle */}
          <div className="flex items-center justify-between space-x-2 p-3 bg-[#172B3A] rounded-md border border-[#1D2F3D]">
            <Label htmlFor="autoSpin" className="flex items-center space-x-2 cursor-pointer">
              <span>Auto Spin</span>
            </Label>
            <Switch
              id="autoSpin"
              checked={autoSpin}
              onCheckedChange={handleAutoSpinToggle}
              disabled={isSpinning}
            />
          </div>
          
          {/* Spin results display */}
          {spinResults && (
            <div className={`p-3 rounded-md border ${
              spinResults.win 
                ? 'bg-green-950/30 border-green-800/50 text-green-400' 
                : 'bg-red-950/30 border-red-800/50 text-red-400'
            }`}>
              <div className="flex justify-between">
                <span>{spinResults.win ? 'Win!' : 'Loss'}</span>
                <span>
                  {spinResults.win 
                    ? `+${formatCurrency(spinResults.winAmount)} INR` 
                    : `-${formatCurrency(betAmount)} INR`}
                </span>
              </div>
              {spinResults.win && (
                <div className="text-sm mt-1">
                  Multiplier: {spinResults.multiplier}x
                </div>
              )}
            </div>
          )}
          
          {/* Spin button */}
          <Button
            variant="default"
            size="lg"
            className="w-full h-16 text-lg font-bold"
            onClick={onSpin}
            disabled={isSpinning || parseFloat(balance) < betAmount}
          >
            {isSpinning ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Spinning...</span>
              </div>
            ) : autoSpin ? (
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5" />
                <span>Stop Auto</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Spin</span>
              </div>
            )}
          </Button>
          
          {/* Potential win display */}
          <div className="text-center text-muted-foreground">
            Potential Win: {formatCurrency(betAmount * 10)} INR
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;