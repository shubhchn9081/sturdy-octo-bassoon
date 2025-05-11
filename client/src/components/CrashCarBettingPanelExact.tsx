import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/use-wallet';
import { useCrashCarStore } from '@/games/useCrashCarStore';

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

const CrashCarBettingPanel = ({
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
}: CrashCarBettingPanelProps) => {
  // Add check for player having an active bet
  const activeBets = useCrashCarStore(state => state.activeBets);
  const hasActiveBet = activeBets.some(bet => bet.isPlayer && bet.status === 'active');
  const { balance } = useWallet();
  const [localBetAmount, setLocalBetAmount] = useState<string>(betAmount.toString());
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  
  // Preset bet amounts - exactly matching slots game
  const presetAmounts = [1, 100, 10000, 50000];
  
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
  const formattedBalance = typeof balance === 'number' 
    ? balance.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0.00';
  
  // Win amount if cashed out
  const getWinAmount = () => {
    if (cashoutTriggered) {
      return betAmount * cashoutTriggered;
    }
    return 0;
  };
  
  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto">
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
      
      {/* Win display */}
      {cashoutTriggered && (
        <div className="flex justify-center items-center mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-green-500">
              +{getWinAmount().toFixed(2)} INR
            </p>
          </div>
        </div>
      )}
      
      {/* Betting controls at top - exact copy from slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        {/* Bet amount & presets */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="betAmount" className="text-sm">Bet Amount</Label>
            
            <div className="flex items-center gap-1">
              <Label htmlFor="autoPlay" className="text-sm mr-1">Auto</Label>
              <Switch
                id="autoPlay"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
                disabled={gameState === 'running' || isWaiting}
                className="scale-75"
              />
            </div>
          </div>
          
          <Input
            id="betAmount"
            type="number"
            min="0.00000001"
            max="50000"
            step="0.01"
            value={localBetAmount}
            onChange={handleBetAmountChange}
            onBlur={handleBetAmountBlur}
            className="w-full h-8"
            disabled={gameState === 'running' || isWaiting}
          />
          
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-1 mt-1">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="text-xs py-0 h-6"
                onClick={() => handlePresetClick(amount)}
                disabled={gameState === 'running' || isWaiting}
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Auto-cashout selection */}
        <div className="space-y-1">
          <Label htmlFor="autoCashout" className="text-sm">Auto Cashout (Multiplier)</Label>
          <Input
            id="autoCashout"
            type="number"
            min="1.1"
            step="0.1"
            value={autoCashoutValue || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && value >= 1.1) {
                setAutoCashoutValue(value);
              } else {
                setAutoCashoutValue(null);
              }
            }}
            className="w-full h-8"
            placeholder="e.g. 2.0"
            disabled={gameState === 'running' || isWaiting}
          />
          
          {/* Multiplier display during game */}
          {gameState === 'running' && (
            <div className="mt-1 p-1 bg-gradient-to-r from-blue-900 to-indigo-800 rounded text-center">
              <span className="text-white text-lg font-bold">{currentMultiplier.toFixed(2)}×</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Button - copying the style from slots game */}
      <div>
        {gameState === 'running' && hasActiveBet ? (
          <Button
            variant="default"
            className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-black rounded-lg shadow-lg shadow-green-500/30"
            onClick={cashOut}
            disabled={cashoutTriggered !== null}
          >
            {cashoutTriggered !== null ? (
              'CASHED OUT'
            ) : (
              <>
                CASH OUT ({currentMultiplier.toFixed(2)}×)
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-black rounded-lg shadow-lg shadow-green-500/30"
            onClick={placeBet}
            disabled={isWaiting || betAmount <= 0 || gameState === 'running'}
          >
            {isWaiting ? (
              <>
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                Waiting...
              </>
            ) : gameState === 'running' ? (
              'IN PROGRESS'
            ) : (
              'PLACE BET'
            )}
          </Button>
        )}
        
        {/* Only show insufficient balance warning when both values are valid numbers and there's not enough balance */}
        {typeof balance === 'number' && 
         typeof betAmount === 'number' && 
         betAmount > 0 && 
         balance > 0 && 
         betAmount > balance && (
          <p className="text-xs text-red-500 flex items-center justify-center mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Insufficient balance
          </p>
        )}
      </div>
    </div>
  );
};

export default CrashCarBettingPanel;