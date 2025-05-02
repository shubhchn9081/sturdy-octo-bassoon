import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWallet, useWalletData } from '@/hooks/use-wallet';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';

export type GameState = 'idle' | 'active' | 'complete';

export interface BettingPanelProps {
  gameId: number;
  minBet?: number;
  maxBet?: number;
  gameState: GameState;
  onPlaceBet: (betAmount: number, autoCashout?: number | null) => void;
  onCashout?: () => void;
  currentMultiplier?: number;
  autoCashoutSupported?: boolean;
  className?: string;
  disableBetActions?: boolean;
}

const DEFAULT_BETTING_PRESETS = [100, 500, 1000, 5000];

export const UniversalBettingPanel: React.FC<BettingPanelProps> = ({
  gameId,
  minBet = 100,
  maxBet = 1000000,
  gameState,
  onPlaceBet,
  onCashout,
  currentMultiplier = 1,
  autoCashoutSupported = false,
  className,
  disableBetActions = false
}) => {
  // State
  const [betAmount, setBetAmount] = useState<number>(minBet);
  const [autoCashoutAmount, setAutoCashoutAmount] = useState<number | null>(null);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [isAutoBetEnabled, setIsAutoBetEnabled] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buttonAnimating, setButtonAnimating] = useState<boolean>(false);

  // Get wallet data
  const walletStore = useWallet();
  const { balance, isLoading, formatBalance } = useWalletData();
  const { toast } = useToast();

  // Handle auto-cashout toggle
  const handleAutoCashoutToggle = () => {
    if (!autoCashoutSupported) return;
    
    if (autoCashoutEnabled) {
      setAutoCashoutAmount(null);
      setAutoCashoutEnabled(false);
    } else {
      setAutoCashoutAmount(2.0); // Default
      setAutoCashoutEnabled(true);
    }
  };

  // Adjust bet amount with constraints
  const adjustBetAmount = (adjustment: number) => {
    const newAmount = Math.max(minBet, Math.min(maxBet, betAmount + adjustment));
    setBetAmount(newAmount);
  };

  // Handle place bet with validation
  const handlePlaceBet = () => {
    // Clear any error
    setErrorMessage(null);

    // Validate minimum bet
    if (betAmount < minBet) {
      setErrorMessage(`Minimum bet amount is ₹${minBet}`);
      toast({
        variant: "destructive",
        title: "Bet Failed",
        description: `Minimum bet amount is ₹${minBet}`
      });
      return;
    }

    // Validate maximum bet
    if (betAmount > maxBet) {
      setErrorMessage(`Maximum bet amount is ₹${maxBet}`);
      toast({
        variant: "destructive",
        title: "Bet Failed",
        description: `Maximum bet amount is ₹${maxBet}`
      });
      return;
    }

    // Validate balance
    if (betAmount > balance) {
      setErrorMessage(`Insufficient balance. You have ₹${formatBalance(balance)}`);
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You need ₹${formatBalance(betAmount)} but only have ₹${formatBalance(balance)}`
      });
      return;
    }

    // Animate button click
    setButtonAnimating(true);
    setTimeout(() => {
      setButtonAnimating(false);
      onPlaceBet(betAmount, autoCashoutEnabled ? autoCashoutAmount : null);
    }, 200);
  };

  // Handle auto-bet functionality
  useEffect(() => {
    if (gameState === 'complete' && isAutoBetEnabled && !disableBetActions) {
      const timer = setTimeout(() => {
        handlePlaceBet();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isAutoBetEnabled, disableBetActions]);

  // Clear error message after timeout
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Define appropriate action button based on game state
  const getActionButton = () => {
    // If game is active and has cashout
    if (gameState === 'active' && onCashout) {
      const potentialWin = betAmount * currentMultiplier;
      const profit = potentialWin - betAmount;
      
      return (
        <Button
          onClick={onCashout}
          disabled={disableBetActions}
          className={cn(
            "w-full py-6 text-lg font-bold transition-all duration-300 animate-pulse",
            "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300",
            "text-white shadow-lg shadow-green-500/30",
            disableBetActions && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center">
            <span className="text-base uppercase">CASH OUT</span>
            <span className="text-xl font-mono font-bold">
              ₹{potentialWin.toFixed(2)}
            </span>
            {profit > 0 && (
              <span className="text-sm">
                +₹{profit.toFixed(2)}
              </span>
            )}
          </div>
        </Button>
      );
    }
    
    // Default place bet button
    return (
      <Button
        onClick={handlePlaceBet}
        disabled={gameState === 'active' || disableBetActions || betAmount < minBet}
        className={cn(
          "w-full py-6 text-lg font-bold relative overflow-hidden",
          buttonAnimating ? "scale-95" : "",
          gameState === 'active' || disableBetActions || betAmount < minBet
            ? "bg-gray-700 text-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/30"
        )}
      >
        <div className="relative z-10">
          {betAmount < minBet ? (
            <div className="flex flex-col items-center">
              <span>PLACE BET</span>
              <span className="text-xs opacity-70">Min. bet: ₹{minBet}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-md uppercase">PLACE BET</span>
              <span className="text-sm opacity-90">₹{betAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className={cn("bg-gray-900/90 border border-gray-800 rounded-lg p-4", className)}>
      {/* Error message display */}
      {errorMessage && (
        <div className="mb-3 p-2 bg-red-900/40 border border-red-800 rounded flex items-center text-red-300 text-sm">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* User balance display */}
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-gray-400">Your Balance</span>
        <span className="font-medium">
          {isLoading ? "Loading..." : `₹${formatBalance(balance)}`}
        </span>
      </div>
      
      {/* Bet amount input */}
      <div className="mb-4">
        <Label htmlFor="bet-amount" className="text-sm text-gray-400 mb-1 block">
          Bet Amount
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => adjustBetAmount(-100)}
            disabled={gameState === 'active' || betAmount <= minBet || disableBetActions}
          >
            -
          </Button>
          
          <div className="relative flex-1">
            <Input
              id="bet-amount"
              type="number"
              min={minBet}
              max={maxBet}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value) || minBet)}
              disabled={gameState === 'active' || disableBetActions}
              className={cn(
                "bg-gray-800 border-gray-700",
                betAmount < minBet && "border-red-500 text-red-400"
              )}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => adjustBetAmount(100)}
            disabled={gameState === 'active' || betAmount >= maxBet || disableBetActions}
          >
            +
          </Button>
        </div>
      </div>
      
      {/* Quick amount buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {DEFAULT_BETTING_PRESETS.map(preset => (
          <Button
            key={`preset-${preset}`}
            variant="outline"
            size="sm"
            onClick={() => setBetAmount(preset)}
            disabled={gameState === 'active' || disableBetActions}
            className="py-1"
          >
            ₹{preset}
          </Button>
        ))}
      </div>
      
      {/* Auto options */}
      <div className="flex justify-between mb-6">
        {/* Auto-cashout (if supported) */}
        {autoCashoutSupported && (
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-cashout"
                checked={autoCashoutEnabled}
                onCheckedChange={handleAutoCashoutToggle}
                disabled={gameState === 'active' || disableBetActions}
              />
              <Label htmlFor="auto-cashout" className="text-xs text-gray-400">
                Auto cashout
              </Label>
            </div>
            
            {autoCashoutEnabled && (
              <Input
                type="number"
                value={autoCashoutAmount || 2.0}
                onChange={(e) => setAutoCashoutAmount(Number(e.target.value) || null)}
                disabled={gameState === 'active' || disableBetActions || !autoCashoutEnabled}
                className="w-20 h-7 bg-gray-800 border-gray-700 text-sm"
                placeholder="2.0x"
              />
            )}
          </div>
        )}
        
        {/* Auto-bet toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-bet"
            checked={isAutoBetEnabled}
            onCheckedChange={setIsAutoBetEnabled}
            disabled={disableBetActions}
          />
          <Label htmlFor="auto-bet" className="text-xs text-gray-400">
            Auto-bet
          </Label>
        </div>
      </div>
      
      {/* Action button (place bet or cash out) */}
      {getActionButton()}
      
      {/* Potential win calculation */}
      <div className="mt-3 text-sm flex justify-between">
        <span className="text-gray-400">Potential win:</span>
        <span className="font-medium text-green-400">
          ₹{(betAmount * (autoCashoutEnabled ? (autoCashoutAmount || 1) : currentMultiplier)).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default UniversalBettingPanel;