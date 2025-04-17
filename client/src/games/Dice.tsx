import React, { useState, useEffect } from 'react';
import { formatCrypto } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';

const DiceGame = () => {
  // Mock state for now
  const [betAmount, setBetAmount] = useState('0.00000000');
  const [target, setTarget] = useState(50.5);
  const [multiplier, setMultiplier] = useState(2.0000);
  const [winChance, setWinChance] = useState(49.5000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [rollMode, setRollMode] = useState<'over' | 'under'>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [profit, setProfit] = useState('0.00000000');
  
  // Update multiplier and win chance when target changes
  useEffect(() => {
    const newMultiplier = parseFloat((99 / (rollMode === 'over' ? (99 - target) : target)).toFixed(4));
    setMultiplier(newMultiplier);
    setWinChance(rollMode === 'over' ? (99 - target) : target);
  }, [target, rollMode]);
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (multiplier - 1);
    setProfit(profitValue.toFixed(8));
  }, [betAmount, multiplier]);
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(e.target.value);
  };
  
  const handleHalfBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount((amount / 2).toFixed(8));
  };
  
  const handleDoubleBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount((amount * 2).toFixed(8));
  };
  
  const handleTargetChange = (value: number[]) => {
    setTarget(value[0]);
  };
  
  const handleModeChange = (value: string) => {
    setMode(value as 'manual' | 'auto');
  };
  
  const handleRollModeChange = () => {
    setRollMode(rollMode === 'over' ? 'under' : 'over');
  };
  
  const handleBet = async () => {
    if (rolling) return;
    
    setRolling(true);
    setResult(null);
    setWon(null);
    
    try {
      // Simulate dice roll with random number between 0-100
      const diceResult = Math.random() * 100;
      
      // Wait a bit to simulate the roll
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setResult(diceResult);
      
      // Check if win
      const isWin = rollMode === 'over' 
        ? diceResult > target 
        : diceResult < target;
        
      setWon(isWin);
      
    } catch (error) {
      console.error('Error rolling dice:', error);
    } finally {
      setRolling(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-8 p-4">
      {/* Left Panel (Controls) */}
      <div className="w-full md:w-72 bg-[#1E2328] rounded-lg p-4">
        <Tabs value={mode} onValueChange={handleModeChange} className="mb-4">
          <TabsList className="w-full grid grid-cols-2 rounded-full bg-[#24282F]">
            <TabsTrigger 
              value="manual" 
              className="rounded-full data-[state=active]:bg-[#3F444E] data-[state=active]:text-white"
            >
              Manual
            </TabsTrigger>
            <TabsTrigger 
              value="auto" 
              className="rounded-full data-[state=active]:bg-[#3F444E] data-[state=active]:text-white"
            >
              Auto
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mb-4">
          <div className="text-[#6E7682] text-xs mb-1">Bet Amount</div>
          <div className="text-[#8B8E99] text-xs mb-1 text-right">$0.00</div>
          <div className="relative mb-2">
            <Input 
              value={betAmount}
              onChange={handleBetAmountChange}
              className="bg-[#24282F] border-0 text-white h-10 rounded pr-16"
            />
            <div className="absolute right-1 top-1 flex">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleHalfBet}
                className="h-8 px-2 text-[#8B8E99] hover:text-white"
              >
                ½
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDoubleBet}
                className="h-8 px-2 text-[#8B8E99] hover:text-white"
              >
                2×
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-[#6E7682] text-xs mb-1">Profit on Win</div>
          <div className="text-[#8B8E99] text-xs mb-1 text-right">$0.00</div>
          <div className="relative">
            <Input 
              value={profit}
              readOnly
              className="bg-[#24282F] border-0 text-white h-10 rounded"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleBet}
          disabled={rolling}
          className="w-full h-12 bg-[#5AEF7B] hover:bg-[#4CD66A] text-black font-medium rounded"
        >
          {rolling ? 'Rolling...' : 'Bet'}
        </Button>
      </div>
      
      {/* Right Panel (Game) */}
      <div className="flex-1 flex flex-col">
        <div className="text-center text-2xl font-light mb-8">
          {result !== null && (
            <div>{result.toFixed(2)}</div>
          )}
        </div>
        
        <div className="mb-4 text-sm text-[#6E7682] flex justify-between">
          <div>0</div>
          <div>25</div>
          <div>50</div>
          <div>75</div>
          <div>100</div>
        </div>
        
        <div className="relative h-16 bg-[#24282F] rounded-lg mb-8">
          {/* Slider Track with colors */}
          <div className="absolute inset-0 flex rounded-lg overflow-hidden">
            <div 
              className="h-full bg-red-500" 
              style={{ 
                width: rollMode === 'under' ? `${target}%` : '0%',
                backgroundColor: '#EB5757'
              }}
            ></div>
            <div 
              className="h-full" 
              style={{ 
                width: rollMode === 'under' ? '0%' : `${target}%`,
                backgroundColor: '#24282F'
              }}
            ></div>
            <div 
              className="h-full" 
              style={{ 
                width: rollMode === 'under' ? '0%' : `${100-target}%`,
                backgroundColor: '#5AEF7B'
              }}
            ></div>
          </div>
          
          {/* Result marker */}
          {result !== null && (
            <div 
              className={`absolute top-0 h-16 w-1 bg-white ${won ? 'animate-pulse' : ''}`}
              style={{ left: `${result}%` }}
            ></div>
          )}
          
          {/* Slider Thumb */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="h-8 w-8 bg-[#5583EA] rounded-sm text-white flex items-center justify-center cursor-pointer z-10"
              style={{ marginLeft: `${target}%`, transform: 'translateX(-50%)' }}
            >
              {rollMode === 'over' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            </div>
          </div>
          
          <Slider
            value={[target]}
            min={1}
            max={98}
            step={0.5}
            onValueChange={handleTargetChange}
            className="absolute inset-0 z-10 opacity-0"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-auto bg-[#24282F] p-4 rounded-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-[#6E7682] mb-1">Multiplier</div>
            <div className="text-white">{multiplier.toFixed(4)}<span className="text-[#6E7682]">×</span></div>
          </div>
          
          <div 
            className="flex flex-col items-center justify-center cursor-pointer" 
            onClick={handleRollModeChange}
          >
            <div className="text-xs text-[#6E7682] mb-1">Roll {rollMode === 'over' ? 'Over' : 'Under'}</div>
            <div className="text-white flex items-center">
              {target.toFixed(2)} 
              <RefreshCw size={14} className="ml-2 text-[#6E7682]" />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-[#6E7682] mb-1">Win Chance</div>
            <div className="text-white">{winChance.toFixed(4)}<span className="text-[#6E7682]">%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;