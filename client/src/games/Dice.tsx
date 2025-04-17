import React, { useState, useEffect } from 'react';
import { formatCrypto, formatPercentage } from '@/lib/utils';
import GameLayout, { GameControls, GameTabs } from '@/components/games/GameLayout';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';

const DiceGame = () => {
  const { getGameResult } = useProvablyFair('dice');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [target, setTarget] = useState(50.5);
  const [multiplier, setMultiplier] = useState(2.00);
  const [winChance, setWinChance] = useState(49.5);
  const [mode, setMode] = useState<'over' | 'under'>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [profit, setProfit] = useState('0.00000000');
  
  // Update multiplier and win chance when target changes
  useEffect(() => {
    const newMultiplier = parseFloat((99 / (mode === 'over' ? (99 - target) : target)).toFixed(4));
    setMultiplier(newMultiplier);
    setWinChance(mode === 'over' ? (99 - target) : target);
  }, [target, mode]);
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (multiplier - 1);
    setProfit(formatCrypto(profitValue));
  }, [betAmount, multiplier]);
  
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
  
  const handleTargetChange = (value: number[]) => {
    setTarget(value[0]);
  };
  
  const handleModeChange = (newMode: string) => {
    setMode(newMode as 'over' | 'under');
  };
  
  const handleBet = async () => {
    if (rolling) return;
    
    setRolling(true);
    setResult(null);
    setWon(null);
    
    try {
      // In a real app, this would call the API
      const diceResult = getGameResult() as number;
      
      // Wait a bit to simulate the roll
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setResult(diceResult);
      
      // Check if win
      const isWin = mode === 'over' 
        ? diceResult > target 
        : diceResult < target;
        
      setWon(isWin);
      
      // In a real app, this would be handled by the API
      // placeBet.mutate({
      //   amount: parseFloat(betAmount),
      //   gameId: 1, // Dice game id
      //   clientSeed: 'seed',
      //   options: { target, mode }
      // });
      
    } catch (error) {
      console.error('Error rolling dice:', error);
    } finally {
      setRolling(false);
    }
  };
  
  // Game visualization panel
  const gamePanel = (
    <div>
      <div className="flex justify-between mb-2 text-sm">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
      
      <div className="h-16 bg-panel-bg rounded-full mb-8 relative">
        {/* Slider Track with colors */}
        <div className="absolute inset-0 flex rounded-full overflow-hidden">
          <div className="h-full bg-red-500" style={{ width: `${target}%` }}></div>
          <div className="h-full bg-green-500" style={{ width: `${100 - target}%` }}></div>
        </div>
        
        {/* Result marker */}
        {result !== null && (
          <div 
            className={`absolute top-0 h-16 w-1 bg-white ${won ? 'animate-pulse' : ''}`}
            style={{ left: `${result}%` }}
          ></div>
        )}
        
        {/* Slider Thumb */}
        <Slider
          value={[target]}
          min={1}
          max={98}
          step={0.5}
          onValueChange={handleTargetChange}
          className="absolute inset-0 z-10"
        />
      </div>
      
      {/* Result display */}
      {result !== null && (
        <div className={`text-center mb-6 p-3 rounded-lg ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            {result.toFixed(2)} - {won ? 'You Won!' : 'You Lost!'}
          </div>
          {won && <div>{profit} profit</div>}
        </div>
      )}
      
      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-1 text-xs">Multiplier</div>
          <div className="text-foreground font-medium">{multiplier.toFixed(4)}</div>
        </div>
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-1 text-xs">
            Roll {mode === 'over' ? 'Over' : 'Under'}
          </div>
          <div className="text-foreground font-medium">{target.toFixed(2)}</div>
        </div>
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-1 text-xs">Win Chance</div>
          <div className="text-foreground font-medium">{winChance.toFixed(4)}%</div>
        </div>
      </div>
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <>
      <GameTabs
        tabs={[
          { id: 'over', label: 'Roll Over' },
          { id: 'under', label: 'Roll Under' }
        ]}
        activeTab={mode}
        onTabChange={handleModeChange}
      />
      
      <GameControls
        betAmount={betAmount}
        onBetAmountChange={handleBetAmountChange}
        onHalfBet={handleHalfBet}
        onDoubleBet={handleDoubleBet}
        onBet={handleBet}
        betButtonText={rolling ? 'Rolling...' : 'Bet'}
        betButtonDisabled={rolling}
      >
        <div>
          <label className="block text-muted-foreground mb-2">Profit on Win</label>
          <Input
            type="text"
            value={profit}
            readOnly
            className="w-full bg-panel-bg text-foreground"
          />
        </div>
      </GameControls>
    </>
  );
  
  return (
    <GameLayout
      title="Dice"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default DiceGame;
