import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, AlertTriangle, TrendingUp, Wind } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/use-wallet';

type CrashCarBettingPanelProps = {
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
};

const CrashCarBettingPanel: React.FC<CrashCarBettingPanelProps> = ({
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
  // Access wallet balance
  const { balance } = useWallet();
  
  // Local state for forms
  const [localBetAmount, setLocalBetAmount] = useState<string>(betAmount.toString());
  const [localAutoCashout, setLocalAutoCashout] = useState<string>(autoCashoutValue?.toString() || '');
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState<boolean>(!!autoCashoutValue);
  
  // Preset bet amounts
  const presetAmounts = [100, 500, 5000, 10000];
  
  // Sync local form values when props change
  useEffect(() => {
    setLocalBetAmount(betAmount.toString());
  }, [betAmount]);
  
  useEffect(() => {
    setLocalAutoCashout(autoCashoutValue?.toString() || '');
    setIsAutoCashoutEnabled(!!autoCashoutValue);
  }, [autoCashoutValue]);
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBetAmount(value);
    
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 100) {
      setBetAmount(numericValue);
    }
  };
  
  // Handle auto cashout change
  const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAutoCashout(value);
    
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 1.1) {
      setAutoCashoutValue(numericValue);
    }
  };
  
  // Handle preset amount click
  const handlePresetClick = (amount: number) => {
    setBetAmount(amount);
    setLocalBetAmount(amount.toString());
  };
  
  // Handle auto cashout toggle
  const handleAutoCashoutToggle = (checked: boolean) => {
    setIsAutoCashoutEnabled(checked);
    if (checked) {
      const defaultValue = 2.0;
      setAutoCashoutValue(defaultValue);
      setLocalAutoCashout(defaultValue.toString());
    } else {
      setAutoCashoutValue(null);
      setLocalAutoCashout('');
    }
  };
  
  // Handle bet amount blur - ensure minimum amount
  const handleBetAmountBlur = () => {
    const numericValue = parseFloat(localBetAmount);
    if (isNaN(numericValue) || numericValue < 100) {
      setBetAmount(100); // Default to 100 if invalid
      setLocalBetAmount('100');
    }
  };
  
  // Handle auto cashout blur - ensure minimum value
  const handleAutoCashoutBlur = () => {
    if (!isAutoCashoutEnabled) return;
    
    const numericValue = parseFloat(localAutoCashout);
    if (isNaN(numericValue) || numericValue < 1.1) {
      setAutoCashoutValue(1.1); // Default to 1.1 if invalid
      setLocalAutoCashout('1.1');
    }
  };
  
  // Format balance with commas for thousands
  const formattedBalance = typeof balance === 'number' 
    ? balance.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0.00';
  
  // Check if buttons should be disabled
  const canPlaceBet = gameState !== 'running' && !isWaiting && betAmount >= 100;
  const canCashOut = gameState === 'running' && cashoutTriggered === null;
  
  // Get potential win amount
  const getPotentialWin = () => {
    if (cashoutTriggered !== null) {
      return betAmount * cashoutTriggered;
    } else if (gameState === 'running') {
      return betAmount * currentMultiplier;
    } else if (autoCashoutValue) {
      return betAmount * autoCashoutValue;
    }
    return 0;
  };
  
  // Calculate profit
  const getPotentialProfit = () => {
    return getPotentialWin() - betAmount;
  };
  
  // Render game status/multiplier information
  const renderGameStatus = () => {
    if (gameState === 'running') {
      return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-indigo-900 p-2 rounded-lg mb-2 shadow">
          <div className="text-xs text-gray-300">Current Multiplier</div>
          <div className="text-2xl font-bold text-white flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
            {currentMultiplier.toFixed(2)}×
          </div>
        </div>
      );
    } else if (gameState === 'crashed') {
      return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-red-900 to-rose-900 p-2 rounded-lg mb-2 shadow">
          <div className="text-xs text-gray-300">Crashed At</div>
          <div className="text-2xl font-bold text-white">
            {currentMultiplier.toFixed(2)}×
          </div>
        </div>
      );
    } else if (isWaiting) {
      return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-yellow-800 to-amber-900 p-2 rounded-lg mb-2 shadow">
          <div className="text-xs text-gray-300">Starting Soon</div>
          <div className="text-2xl font-bold text-white">
            Bet Placed
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 p-2 rounded-lg mb-2 shadow">
        <div className="text-xs text-gray-300">Ready</div>
        <div className="text-2xl font-bold text-white">
          Place Your Bet
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto bg-gray-900 p-3 border border-gray-800 rounded-lg shadow-xl">
      {/* Error message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-1 py-1">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-0 right-0 h-6 w-6"
            onClick={clearError}
          >
            ✕
          </Button>
        </Alert>
      )}
      
      {/* Game Status Display */}
      {renderGameStatus()}
      
      {/* Win display */}
      {cashoutTriggered !== null && (
        <div className="flex justify-center items-center mb-2 bg-green-900/30 p-2 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-green-400">
              Cashed Out at {cashoutTriggered.toFixed(2)}×
            </p>
            <p className="text-lg font-bold text-green-500">
              +{(betAmount * cashoutTriggered - betAmount).toFixed(2)} INR
            </p>
          </div>
        </div>
      )}
      
      {/* Betting controls - more compact for car game */}
      <div className="grid grid-cols-1 gap-2 mb-2">
        {/* Balance display */}
        <div className="flex justify-between items-center bg-gray-800 p-2 rounded-lg">
          <span className="text-sm text-gray-400">Balance:</span>
          <span className="text-sm font-semibold">₹{formattedBalance}</span>
        </div>
        
        {/* Bet amount controls */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="betAmount" className="text-sm">Bet Amount (min. ₹100)</Label>
            
            <div className="flex items-center gap-1">
              <Label htmlFor="autoCashout" className="text-sm mr-1">Auto Cashout</Label>
              <Switch
                id="autoCashout"
                checked={isAutoCashoutEnabled}
                onCheckedChange={handleAutoCashoutToggle}
                disabled={gameState === 'running' || isWaiting}
                className="scale-75"
              />
            </div>
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
            <Input
              id="betAmount"
              type="number"
              min="100"
              placeholder="Enter bet amount"
              value={localBetAmount}
              onChange={handleBetAmountChange}
              onBlur={handleBetAmountBlur}
              className="w-full pl-8"
              disabled={gameState === 'running' || isWaiting}
            />
          </div>
          
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-1 mt-1">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="text-xs py-0 h-7"
                onClick={() => handlePresetClick(amount)}
                disabled={gameState === 'running' || isWaiting}
              >
                ₹{amount}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Auto cashout input (only shown when enabled) */}
        {isAutoCashoutEnabled && (
          <div className="space-y-1">
            <Label htmlFor="autoCashoutValue" className="text-sm">Auto Cashout at Multiplier (min. 1.1×)</Label>
            <div className="relative">
              <Input
                id="autoCashoutValue"
                type="number"
                min="1.1"
                step="0.1"
                placeholder="Auto cashout at multiplier"
                value={localAutoCashout}
                onChange={handleAutoCashoutChange}
                onBlur={handleAutoCashoutBlur}
                className="w-full pr-7"
                disabled={gameState === 'running' || isWaiting}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">×</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div>
        {gameState === 'running' ? (
          /* Cash Out Button - only during game */
          <Button
            variant="default"
            className={cn(
              "w-full h-14 text-lg font-bold rounded-lg transition-all",
              canCashOut 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg" 
                : "bg-gray-700 text-gray-300",
              canCashOut && "animate-pulse"
            )}
            onClick={cashOut}
            disabled={!canCashOut}
          >
            {cashoutTriggered !== null ? (
              "CASHED OUT"
            ) : (
              <>
                <span>CASH OUT</span>
                <span className="block text-sm font-normal">
                  ₹{(betAmount * currentMultiplier).toFixed(2)}
                </span>
              </>
            )}
          </Button>
        ) : (
          /* Place Bet Button - when not in game */
          <Button
            variant="default"
            className={cn(
              "w-full h-14 text-lg font-bold rounded-lg",
              canPlaceBet
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                : "bg-gray-700 text-gray-300"
            )}
            onClick={placeBet}
            disabled={!canPlaceBet}
          >
            {isWaiting ? (
              <div className="flex items-center">
                <Wind className="mr-2 h-5 w-5 animate-spin" />
                <span>WAITING</span>
              </div>
            ) : (
              "PLACE BET"
            )}
          </Button>
        )}
        
        {/* Insufficient balance warning */}
        {typeof balance === 'number' && betAmount > balance && (
          <p className="text-xs text-red-500 flex items-center justify-center mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Insufficient balance
          </p>
        )}
        
        {/* Potential profit display */}
        {betAmount >= 100 && gameState === 'running' && cashoutTriggered === null && (
          <div className="mt-2 text-center text-sm">
            <span className="text-gray-400">Profit if cashed out now: </span>
            <span className="text-green-500 font-semibold">₹{getPotentialProfit().toFixed(2)}</span>
          </div>
        )}
        
        {/* Auto cashout display */}
        {isAutoCashoutEnabled && autoCashoutValue && betAmount >= 100 && gameState !== 'running' && (
          <div className="mt-2 text-center text-sm">
            <span className="text-gray-400">Auto cashout at: </span>
            <span className="text-yellow-500 font-semibold">{autoCashoutValue.toFixed(2)}× (₹{(betAmount * autoCashoutValue).toFixed(2)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrashCarBettingPanel;