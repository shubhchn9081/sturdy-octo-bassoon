import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';

interface MobileBettingPanelProps {
  gameState: string; // Game state as string
  betAmount: number;
  autoCashoutValue: number | null;
  currentMultiplier: number;
  cashoutTriggered: number | null;
  errorMessage: string | null;
  isWaiting: boolean;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number | null) => void;
  placeBet: () => void;
  cashOut: () => void;
  clearError: () => void;
}

export const MobileBettingPanel: React.FC<MobileBettingPanelProps> = ({
  gameState,
  betAmount,
  autoCashoutValue,
  currentMultiplier,
  cashoutTriggered,
  errorMessage,
  isWaiting,
  setBetAmount,
  setAutoCashoutValue,
  placeBet,
  cashOut,
  clearError
}) => {
  const { balance } = useWallet();
  
  const [betAmountInput, setBetAmountInput] = useState(betAmount.toString());
  const [autoCashoutInput, setAutoCashoutInput] = useState(autoCashoutValue?.toString() || '');
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(!!autoCashoutValue);
  const [presetAmounts] = useState([100, 500, 1000, 5000]);
  const [buttonAnimating, setButtonAnimating] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setBetAmountInput(betAmount.toString());
  }, [betAmount]);

  useEffect(() => {
    setAutoCashoutInput(autoCashoutValue?.toString() || '');
    setIsAutoCashoutEnabled(!!autoCashoutValue);
  }, [autoCashoutValue]);

  // Handle bet amount change
  const handleBetAmountChange = (newAmount: number) => {
    const amount = Math.max(100, newAmount); // Minimum 100 INR
    setBetAmount(amount);
    setBetAmountInput(amount.toString());
  };

  // Handle auto cashout toggle
  const handleAutoCashoutToggle = () => {
    if (isAutoCashoutEnabled) {
      setAutoCashoutValue(null);
      setIsAutoCashoutEnabled(false);
    } else {
      setAutoCashoutValue(2.0);
      setAutoCashoutInput('2.0');
      setIsAutoCashoutEnabled(true);
    }
  };

  // Handle place bet with animation - disabled as per user request
  const handlePlaceBet = () => {
    // Do nothing - buttons are removed
    return;
  };

  // Calculate potential payout based on current state
  const getPotentialPayout = () => {
    if (gameState === 'running') {
      return betAmount * currentMultiplier;
    } else if (autoCashoutValue) {
      return betAmount * autoCashoutValue;
    }
    return betAmount * 2; // Default to 2x
  };

  // Render appropriate action button based on game state
  const renderActionButton = () => {
    if (gameState === 'running') {
      const potentialPayout = betAmount * currentMultiplier;
      const profit = potentialPayout - betAmount;
      
      return (
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="flex flex-col items-center">
            <span className="text-lg text-gray-300">
              Current Potential Payout
            </span>
            <span className="text-xl font-mono font-bold text-white">
              ₹{potentialPayout.toFixed(2)}
            </span>
            {profit > 0 && (
              <span className="text-sm text-green-400">
                +₹{profit.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      );
    } else if (isWaiting) {
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="px-4 py-2 text-center">
            Waiting for next round...
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="px-4 py-2 text-center bg-gray-800">
            Ready for next round
          </Badge>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm p-3 border border-gray-700 z-30 overflow-hidden rounded-xl mt-4">
      {/* Game status indicator */}
      <div className="relative w-full h-1 bg-gray-800 mb-3">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            gameState === 'running' ? "bg-green-500" : 
            gameState === 'crashed' ? "bg-red-500" : "bg-amber-500"
          )}
          style={{ 
            width: gameState === 'running' ? `${Math.min(100, (currentMultiplier / 10) * 100)}%` : '100%'
          }}
        />
      </div>
      
      {/* Main container */}
      <div className="flex flex-col gap-3 mt-1">
        {/* Top section: Balance + Current Multiplier + Auto cashout toggle */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
          <div className="flex-1 flex flex-col">
            <span className="text-xs text-gray-400">Balance</span>
            <span className="text-white font-bold">₹{typeof balance === 'number' ? balance.toFixed(2) : '0.00'}</span>
          </div>
          
          {gameState === 'running' && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-400">Multiplier</span>
              <span className="text-white font-bold text-2xl">{currentMultiplier.toFixed(2)}x</span>
            </div>
          )}
          
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="text-xs text-gray-400">Auto Cashout</span>
            <button 
              onClick={handleAutoCashoutToggle}
              disabled={gameState === 'active'}
              className={cn(
                "w-10 h-5 rounded-full transition-colors flex items-center px-0.5",
                isAutoCashoutEnabled ? "bg-green-500 justify-end" : "bg-gray-700 justify-start",
                gameState === 'active' ? "opacity-50" : "opacity-100"
              )}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
        </div>
        
        {/* Bet amount presets */}
        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map(amount => (
            <Button
              key={`preset-${amount}`}
              variant="outline"
              onClick={() => handleBetAmountChange(amount)}
              disabled={gameState === 'active'}
              className="py-1 font-mono text-xs"
            >
              ₹{amount}
            </Button>
          ))}
        </div>
        
        {/* Bet amount input + Auto cashout value (if enabled) */}
        <div className={cn("grid gap-2", isAutoCashoutEnabled ? "grid-cols-2" : "grid-cols-1")}>
          <div className="relative">
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <span className="text-gray-400">₹</span>
            </div>
            <input
              type="number"
              min="100"
              value={betAmountInput}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setBetAmountInput(e.target.value);
                if (value >= 100) {
                  setBetAmount(value);
                }
              }}
              onBlur={() => {
                const value = parseFloat(betAmountInput) || 0;
                handleBetAmountChange(value);
              }}
              disabled={gameState === 'active'}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl text-white pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {isAutoCashoutEnabled && (
            <div className="relative">
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <span className="text-gray-400">x</span>
              </div>
              <input
                type="number"
                min="1.1"
                step="0.1"
                value={autoCashoutInput}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setAutoCashoutInput(e.target.value);
                  if (value >= 1.1) {
                    setAutoCashoutValue(value);
                  }
                }}
                onBlur={() => {
                  const value = parseFloat(autoCashoutInput) || 0;
                  if (value >= 1.1) {
                    setAutoCashoutValue(value);
                  } else {
                    setAutoCashoutValue(1.1);
                    setAutoCashoutInput('1.1');
                  }
                }}
                disabled={gameState === 'active'}
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl text-white px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto x"
              />
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <div className="mt-1">
          {renderActionButton()}
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="mt-2 text-center text-red-400 text-sm animate-pulse">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};