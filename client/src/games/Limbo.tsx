import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Clock } from 'lucide-react';

const LimboGame = () => {
  const { getGameResult } = useProvablyFair('limbo');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [targetMultiplierInput, setTargetMultiplierInput] = useState('2.00');
  const [profit, setProfit] = useState('0.00000000');
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [winChance, setWinChance] = useState('49.50');
  
  // Calculate win chance based on target multiplier
  useEffect(() => {
    // Simplified calculation: (99/x)% chance to win
    // This is how Stake calculates it for 99% RTP
    const chance = (99 / targetMultiplier).toFixed(2);
    setWinChance(chance);
    
    // Calculate potential profit
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (targetMultiplier - 1);
    setProfit(formatCrypto(profitValue));
  }, [targetMultiplier, betAmount]);
  
  const handleBetAmountChange = (value: string) => {
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount / 2));
  };
  
  const handleDoubleBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount * 2));
  };
  
  const handleTargetMultiplierChange = (value: string) => {
    // Validate input
    const numValue = parseFloat(value);
    setTargetMultiplierInput(value);
    
    if (!isNaN(numValue) && numValue >= 1.01) {
      setTargetMultiplier(numValue);
    }
  };
  
  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    setTargetMultiplier(value);
    setTargetMultiplierInput(value.toFixed(2));
  };
  
  const handleBet = async () => {
    if (playing) return;
    
    setPlaying(true);
    setResult(null);
    setWon(null);
    
    try {
      // Generate result using provably fair algorithm
      const limboResult = getGameResult() as number;
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setResult(limboResult);
      
      // Check if win (result >= target)
      const isWin = limboResult >= targetMultiplier;
      setWon(isWin);
      
      // In a real app, this would call the API
      // placeBet.mutate({
      //   amount: parseFloat(betAmount),
      //   gameId: 5, // Limbo game id
      //   clientSeed: 'seed',
      //   options: { targetMultiplier }
      // });
      
    } catch (error) {
      console.error('Error playing Limbo:', error);
    } finally {
      setPlaying(false);
    }
  };
  
  // Game visualization panel
  const gamePanel = (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8 flex flex-col items-center">
        <Clock className="h-24 w-24 text-yellow-400 mb-4" />
        
        <div className="text-center mb-4">
          <div className="text-gray-400 mb-2">Target</div>
          <div className="text-5xl font-bold">{targetMultiplier.toFixed(2)}x</div>
        </div>
        
        <div className="w-full max-w-md mb-6">
          <Slider
            value={[targetMultiplier]}
            min={1.01}
            max={1000}
            step={0.01}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>1.01x</span>
            <span>1000.00x</span>
          </div>
        </div>
      </div>
      
      {/* Result display */}
      {result !== null && (
        <div className={`text-center mb-6 p-3 w-full rounded-lg ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            Result: {result.toFixed(2)}x
          </div>
          <div>
            {won ? `You won ${profit}!` : 'You lost.'}
          </div>
        </div>
      )}
      
      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-panel-bg p-3 rounded text-center">
          <div className="text-muted-foreground mb-1 text-xs">Win Chance</div>
          <div className="text-foreground font-medium">{winChance}%</div>
        </div>
        <div className="bg-panel-bg p-3 rounded text-center">
          <div className="text-muted-foreground mb-1 text-xs">Payout</div>
          <div className="text-foreground font-medium">{targetMultiplier.toFixed(2)}x</div>
        </div>
      </div>
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <GameControls
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      onHalfBet={handleHalfBet}
      onDoubleBet={handleDoubleBet}
      onBet={handleBet}
      betButtonText={playing ? 'Playing...' : 'Bet'}
      betButtonDisabled={playing}
    >
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Target Multiplier</label>
        <Input
          type="text"
          value={targetMultiplierInput}
          onChange={(e) => handleTargetMultiplierChange(e.target.value)}
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Profit on Win</label>
        <Input
          type="text"
          value={profit}
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
    </GameControls>
  );
  
  return (
    <GameLayout
      title="Limbo"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default LimboGame;
