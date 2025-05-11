import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import { Sparkle, AlertTriangle } from 'lucide-react';

interface CrashCarBettingPanelProps {
  gameState: string;
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

export const CrashCarBettingPanel: React.FC<CrashCarBettingPanelProps> = ({
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
  // Hooks
  const { balance } = useWallet();
  
  // State variables
  const [betAmountInput, setBetAmountInput] = useState(betAmount.toString());
  const [autoCashoutInput, setAutoCashoutInput] = useState(autoCashoutValue?.toString() || '');
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(!!autoCashoutValue);
  const [presetAmounts] = useState([100, 500, 1000, 5000]);
  const [showProfitInfo, setShowProfitInfo] = useState(false);
  
  // Calculate potential profit based on current values
  const getPotentialProfit = () => {
    if (gameState === 'running') {
      const payout = betAmount * currentMultiplier;
      return payout - betAmount;
    } else if (autoCashoutValue) {
      const payout = betAmount * autoCashoutValue;
      return payout - betAmount;
    }
    return 0;
  };
  
  // Calculate maximum possible cash out
  const getMaxPayout = () => {
    return betAmount * (gameState === 'running' ? currentMultiplier : (autoCashoutValue || 2));
  };
  
  // Update local state when props change
  useEffect(() => {
    setBetAmountInput(betAmount.toString());
  }, [betAmount]);

  useEffect(() => {
    setAutoCashoutInput(autoCashoutValue?.toString() || '');
    setIsAutoCashoutEnabled(!!autoCashoutValue);
  }, [autoCashoutValue]);
  
  // Handle bet amount change
  const handleBetAmountChange = (amount: number) => {
    // Ensure minimum bet amount
    const validAmount = Math.max(100, amount);
    setBetAmount(validAmount);
    setBetAmountInput(validAmount.toString());
  };
  
  // Preset value handlers
  const handleBetPresetClick = (value: number) => {
    handleBetAmountChange(value);
  };
  
  // Half and double buttons
  const handleHalfBet = () => {
    handleBetAmountChange(Math.floor(betAmount / 2));
  };
  
  const handleDoubleBet = () => {
    // Don't let user bet more than their balance
    const maxPossibleBet = typeof balance === 'number' ? balance : 0;
    handleBetAmountChange(Math.min(betAmount * 2, maxPossibleBet));
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
  
  // Explicit bet placement handler (for button click)
  const handlePlaceBet = () => {
    clearError();
    if (betAmount < 100) {
      return; // Silently prevent invalid bets
    }
    
    // Make sure we show some indication that bet is being placed
    console.log("Placing bet with amount:", betAmount);
    
    // Call the placeBet function from props
    placeBet();
  };
  
  // Explicit cash out handler (for button click)
  const handleCashOut = () => {
    // Make sure we show some indication that cashout is happening
    console.log("Cashing out at multiplier:", currentMultiplier);
    
    // Call the cashOut function from props
    cashOut();
  };
  
  // Render game status indicators
  const renderGameStatus = () => {
    if (gameState === 'running') {
      return (
        <div className="flex items-center justify-between gap-2 bg-gray-800 rounded-lg p-2">
          <div className="flex-1">
            <div className="text-xs text-gray-400">Current</div>
            <div className="text-lg font-bold text-white">{currentMultiplier.toFixed(2)}×</div>
          </div>
          
          {autoCashoutValue && (
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400">Auto-Cashout</div>
              <div className="text-lg font-bold text-yellow-500">{autoCashoutValue.toFixed(2)}×</div>
            </div>
          )}
          
          <div className="flex-1 text-right">
            <div className="text-xs text-gray-400">Potential</div>
            <div className="text-lg font-bold text-green-500">₹{getMaxPayout().toFixed(2)}</div>
          </div>
        </div>
      );
    } else if (gameState === 'crashed') {
      return (
        <div className="bg-red-900/40 text-white p-2 rounded-lg text-center">
          <div className="text-xs">Crashed at</div>
          <div className="text-xl font-bold">{currentMultiplier.toFixed(2)}×</div>
        </div>
      );
    } else {
      return (
        <div className="bg-amber-900/40 text-white p-2 rounded-lg text-center">
          <div className="text-xs">{isWaiting ? 'Starting in' : 'Ready to bet'}</div>
          <div className="text-xl font-bold">{isWaiting && countdown !== null ? `${countdown}s` : 'Place your bet'}</div>
        </div>
      );
    }
  };
  
  // A countdown variable for the waiting state
  const countdown = isWaiting ? 5 : null; // Example countdown, should come from props
  
  // Determine if a bet can be placed
  const canPlaceBet = gameState !== 'running' && gameState !== 'waiting';
  
  // Determine if user can cash out - add check for bet amount
  const hasPlacedBet = betAmount > 0;
  const canCashOut = gameState === 'running' && cashoutTriggered === null && hasPlacedBet;
  
  // Determine if user has an active bet
  const hasActiveBet = !!autoCashoutValue || gameState === 'waiting' || gameState === 'running';
  
  return (
    <div className="bg-gray-900/90 p-4 border border-gray-800 rounded-xl shadow-xl">
      {/* Game Status Display */}
      <div className="mb-4">
        {renderGameStatus()}
      </div>
      
      {/* Wallet Balance & Status */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-gray-400">Balance</div>
          <div className="text-md font-semibold">₹{typeof balance === 'number' ? balance.toFixed(2) : '0.00'}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">Auto Cashout</div>
          <button
            onClick={handleAutoCashoutToggle}
            disabled={gameState === 'running'}
            className={cn(
              "w-10 h-5 rounded-full transition-colors flex items-center px-0.5",
              isAutoCashoutEnabled ? "bg-green-600 justify-end" : "bg-gray-700 justify-start",
              gameState === 'running' ? "opacity-50 cursor-not-allowed" : "opacity-100"
            )}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>
      </div>
      
      {/* Bet Amount & Cashout Controls */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Bet Amount Input with Currency Symbol */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <span className="text-gray-400">₹</span>
          </div>
          <input
            type="number"
            min="100"
            value={betAmountInput}
            onChange={(e) => {
              const value = e.target.value;
              setBetAmountInput(value);
              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue >= 100) {
                setBetAmount(numValue);
              }
            }}
            onBlur={() => {
              const value = parseFloat(betAmountInput);
              if (isNaN(value) || value < 100) {
                handleBetAmountChange(100);
              } else {
                handleBetAmountChange(value);
              }
            }}
            disabled={gameState === 'running' || gameState === 'waiting'}
            className={cn(
              "w-full h-12 bg-gray-800 border border-gray-700 rounded-lg text-white pl-8 pr-3",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
              (gameState === 'running' || gameState === 'waiting') && "opacity-70 cursor-not-allowed"
            )}
            placeholder="Bet amount (min. ₹100)"
          />
        </div>
        
        {/* 1/2 and 2x Quick Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleHalfBet}
            disabled={gameState === 'running' || gameState === 'waiting'}
            className="text-xs"
          >
            1/2
          </Button>
          <Button
            variant="outline"
            onClick={handleDoubleBet}
            disabled={gameState === 'running' || gameState === 'waiting'}
            className="text-xs"
          >
            2×
          </Button>
        </div>
        
        {/* Auto-Cashout Value (only shown when enabled) */}
        {isAutoCashoutEnabled && (
          <div className="relative">
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="text-gray-400">×</span>
            </div>
            <input
              type="number"
              min="1.1"
              step="0.1"
              value={autoCashoutInput}
              onChange={(e) => {
                const value = e.target.value;
                setAutoCashoutInput(value);
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue >= 1.1) {
                  setAutoCashoutValue(numValue);
                }
              }}
              onBlur={() => {
                const value = parseFloat(autoCashoutInput);
                if (isNaN(value) || value < 1.1) {
                  setAutoCashoutValue(1.1);
                  setAutoCashoutInput('1.1');
                }
              }}
              disabled={gameState === 'running' || gameState === 'waiting'}
              className={cn(
                "w-full h-12 bg-gray-800 border border-gray-700 rounded-lg text-white px-3 pr-8",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                (gameState === 'running' || gameState === 'waiting') && "opacity-70 cursor-not-allowed"
              )}
              placeholder="Auto cashout at (e.g., 2.0)"
            />
          </div>
        )}
      </div>
      
      {/* Preset Bet Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {presetAmounts.map(amount => (
          <Button
            key={`preset-${amount}`}
            variant="secondary"
            onClick={() => handleBetPresetClick(amount)}
            disabled={gameState === 'running' || gameState === 'waiting'}
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs py-1"
          >
            ₹{amount}
          </Button>
        ))}
      </div>
      
      {/* Main Action Button */}
      <div className="mb-3">
        {gameState === 'running' ? (
          /* During active game, show either cashout button or already cashed out status */
          cashoutTriggered !== null ? (
            <div className="bg-green-900/40 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1">
                <Sparkle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-semibold">
                  Cashed out at {cashoutTriggered.toFixed(2)}×
                </span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                ₹{(betAmount * cashoutTriggered).toFixed(2)}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleCashOut}
              disabled={!canCashOut}
              className={cn(
                "w-full h-14 text-white font-semibold rounded-lg transition-all transform",
                canCashOut 
                  ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                  : "bg-gray-700 cursor-not-allowed",
                "flex flex-col items-center"
              )}
              style={{
                animation: canCashOut ? "pulse 1.5s infinite" : "none"
              }}
            >
              <span className="text-sm">CASH OUT</span>
              <span className="text-lg font-bold">
                {hasPlacedBet 
                  ? `₹${(betAmount * currentMultiplier).toFixed(2)}` 
                  : "NO BET PLACED"}
              </span>
            </Button>
          )
        ) : isWaiting ? (
          /* During waiting period, show countdown */
          <div className="bg-amber-900/30 p-3 rounded-lg text-center">
            <span className="text-amber-400 text-sm">
              Waiting for next round...
            </span>
            <div className="text-xl font-bold text-white mt-1">
              Bet placed: ₹{betAmount.toFixed(2)}
            </div>
          </div>
        ) : (
          /* When game is in ready state, show bet button */
          <Button
            onClick={handlePlaceBet}
            disabled={betAmount < 100 || gameState === 'running'}
            className={cn(
              "w-full h-14 text-white font-semibold rounded-lg transition-all",
              betAmount < 100 || gameState === 'running'
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            )}
          >
            <span className="text-lg">PLACE BET</span>
          </Button>
        )}
      </div>
      
      {/* Info about potential profit */}
      {betAmount >= 100 && (
        <div className="text-center text-sm">
          {autoCashoutValue ? (
            <div className="text-gray-400">
              Auto cashout set to {autoCashoutValue.toFixed(2)}× (₹{(betAmount * autoCashoutValue).toFixed(2)})
            </div>
          ) : (
            <div className="text-gray-400">
              Set auto cashout multiplier for automatic wins
            </div>
          )}
        </div>
      )}
      
      {/* Error Messages */}
      {errorMessage && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-800 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrashCarBettingPanel;