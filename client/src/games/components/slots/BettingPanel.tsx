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
  luckyNumberHit?: boolean;
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
  luckyNumber: number;
  setLuckyNumber: (num: number) => void;
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
  spinResults,
  luckyNumber,
  setLuckyNumber
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
  
  // Handle lucky number selection
  const handleLuckyNumberChange = (num: number) => {
    setLuckyNumber(num);
    if (error) clearError();
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
          {/* Lucky Number Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="luckyNumber" className="flex items-center">
                <span className="text-amber-400 mr-1">★</span> 
                Lucky Number
                <span className="text-amber-400 ml-1">★</span>
              </Label>
              <div className="bg-amber-950/30 text-amber-400 border border-amber-700/50 px-2 py-1 rounded-md text-xs font-semibold">
                10x Jackpot
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`bg-[#172B3A] border-[#1D2F3D] hover:bg-[#213D54] h-12 font-bold text-lg
                    ${luckyNumber === i 
                      ? 'ring-2 ring-amber-500 bg-amber-950/30 text-amber-400 border-amber-600' 
                      : ''
                    }
                    transition-all duration-200 hover:scale-105
                  `}
                  onClick={() => handleLuckyNumberChange(i)}
                  disabled={isSpinning}
                >
                  {i}
                </Button>
              ))}
            </div>
            <p className="text-xs text-center mt-1">
              <span className="text-amber-400 font-medium">
                {luckyNumber !== null 
                  ? `Selected: ${luckyNumber} - Win jackpot if this number appears on any reel!` 
                  : 'Select your lucky number for a chance to win the jackpot!'}
              </span>
            </p>
          </div>
          
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
                ? (spinResults.luckyNumberHit 
                  ? 'bg-amber-950/30 border-amber-700/50 text-amber-400' 
                  : 'bg-green-950/30 border-green-800/50 text-green-400')
                : 'bg-red-950/30 border-red-800/50 text-red-400'
            }`}>
              <div className="flex justify-between">
                <span className="font-bold">
                  {spinResults.win 
                    ? (spinResults.luckyNumberHit ? 'JACKPOT!' : 'Win!') 
                    : 'Loss'}
                </span>
                <span>
                  {spinResults.win 
                    ? `+${formatCurrency(spinResults.winAmount)} INR` 
                    : `-${formatCurrency(betAmount)} INR`}
                </span>
              </div>
              {spinResults.win && (
                <div className="flex justify-between text-sm mt-1">
                  <span>Multiplier: {spinResults.multiplier}x</span>
                  {spinResults.luckyNumberHit && (
                    <span className="inline-flex items-center">
                      <span className="text-amber-400 mr-1">★</span> 
                      Lucky Number Hit!
                    </span>
                  )}
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
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="text-muted-foreground">
              <span className="text-xs block">Max Regular Win:</span>
              <span>{formatCurrency(betAmount * 10)} INR</span>
            </div>
            <div className="text-amber-400">
              <span className="text-xs block">Lucky Number Jackpot:</span>
              <span>{formatCurrency(betAmount * 10)} INR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;