import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, RotateCw, X, Plus, Minus } from 'lucide-react';
import { formatCrypto } from '@/lib/utils';

// Define component props
interface BettingPanelProps {
  balance: number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onSpin: () => void;
  isSpinning: boolean;
  autoSpin: boolean;
  setAutoSpin: (auto: boolean) => void;
  stopAutoSpin: () => void;
  error: string | null;
  clearError: () => void;
  spinResults: any | null;
}

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
  const [inputValue, setInputValue] = useState<string>(betAmount.toString());

  // Update input when bet amount changes
  useEffect(() => {
    setInputValue(betAmount.toString());
  }, [betAmount]);

  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Only update actual bet amount if value is valid
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
    }
  };

  // Quick bet amount adjustments
  const adjustBetAmount = (adjustment: number) => {
    const newAmount = Math.max(0, betAmount + adjustment);
    setBetAmount(newAmount);
  };

  // Handle bet amount "1/2" button
  const handleHalfBetAmount = () => {
    const halved = Math.max(0.01, betAmount / 2);
    setBetAmount(parseFloat(halved.toFixed(2)));
  };

  // Handle bet amount "2x" button
  const handleDoubleBetAmount = () => {
    // Don't allow betting more than balance
    const doubled = Math.min(balance, betAmount * 2);
    setBetAmount(parseFloat(doubled.toFixed(2)));
  };

  // Handle "Max" button
  const handleMaxBetAmount = () => {
    setBetAmount(parseFloat(balance.toFixed(2)));
  };

  // Toggle auto spin
  const toggleAutoSpin = () => {
    const newAutoSpin = !autoSpin;
    setAutoSpin(newAutoSpin);
    
    // If turning on auto spin and not currently spinning, start spinning
    if (newAutoSpin && !isSpinning) {
      onSpin();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-white hover:text-red-300">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bet amount controls */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Bet Amount</span>
            <span className="text-sm text-gray-400">Balance: {formatCrypto(balance)}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleHalfBetAmount} className="px-2">
              ½
            </Button>
            <Button variant="outline" size="sm" onClick={handleDoubleBetAmount} className="px-2">
              2×
            </Button>
            <Button variant="outline" size="sm" onClick={handleMaxBetAmount} className="px-2">
              Max
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => adjustBetAmount(-0.1)}
              disabled={betAmount <= 0.1}
            >
              <Minus size={16} />
            </Button>
            
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={inputValue}
                onChange={handleInputChange}
                className="bg-[#172B3A] border-[#264051] w-full"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                INR
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => adjustBetAmount(0.1)}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Spin button and results */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Auto Spin</span>
            <Switch
              checked={autoSpin}
              onCheckedChange={toggleAutoSpin}
            />
          </div>
          
          <Button
            onClick={autoSpin ? stopAutoSpin : onSpin}
            disabled={isSpinning && !autoSpin}
            variant="default"
            className="w-full h-[52px] bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
          >
            {isSpinning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {autoSpin ? "Auto Spinning" : "Spinning..."}
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                {autoSpin ? "Stop Auto Spin" : "Spin"}
              </>
            )}
          </Button>
          
          {spinResults && (
            <div className={`text-center p-2 rounded ${spinResults.win ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
              {spinResults.win ? (
                <div className="text-green-400 font-bold">
                  You won {spinResults.winAmount.toFixed(2)} INR!
                  <div className="text-sm text-green-300 mt-1">
                    {spinResults.multiplier}x multiplier
                  </div>
                </div>
              ) : (
                <div className="text-red-400 font-bold">
                  You lost {betAmount.toFixed(2)} INR
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;