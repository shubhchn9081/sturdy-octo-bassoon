import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Star, LayoutGrid, BarChart2, Settings } from 'lucide-react';

const DiceGame = () => {
  // Game state
  const [betAmount, setBetAmount] = useState('0.00000000');
  const [target, setTarget] = useState(50.50);
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
  
  const handleModeChange = (value: 'manual' | 'auto') => {
    setMode(value);
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
    <div className="min-h-screen bg-[#1A1D27] flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel (Controls) */}
        <div className="w-full lg:w-[220px] bg-[#1E2328]">
          <div className="p-4">
            {/* Manual/Auto Tabs */}
            <div className="rounded-full bg-[#24282F] mb-5 flex">
              <button 
                className={`w-1/2 py-2 rounded-full text-center ${mode === 'manual' ? 'bg-[#3F444E] text-white' : 'text-[#6E7682]'}`}
                onClick={() => handleModeChange('manual')}
              >
                Manual
              </button>
              <button 
                className={`w-1/2 py-2 rounded-full text-center ${mode === 'auto' ? 'bg-[#3F444E] text-white' : 'text-[#6E7682]'}`}
                onClick={() => handleModeChange('auto')}
              >
                Auto
              </button>
            </div>
            
            {/* Bet Amount */}
            <div className="mb-4">
              <div className="flex justify-between">
                <div className="text-[#6E7682] text-xs">Bet Amount</div>
                <div className="text-[#6E7682] text-xs">$0.00</div>
              </div>
              <div className="relative mt-1">
                <Input 
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  className="bg-[#24282F] border-0 text-white h-10 rounded-sm"
                />
                <div className="absolute right-0 top-0 flex h-full">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleHalfBet}
                    className="h-full px-2 text-[#8B8E99] hover:text-white bg-transparent hover:bg-[#3F444E] rounded-none"
                  >
                    ½
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleDoubleBet}
                    className="h-full px-2 text-[#8B8E99] hover:text-white bg-transparent hover:bg-[#3F444E] rounded-none"
                  >
                    2×
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Profit on Win */}
            <div className="mb-6">
              <div className="flex justify-between">
                <div className="text-[#6E7682] text-xs">Profit on Win</div>
                <div className="text-[#6E7682] text-xs">$0.00</div>
              </div>
              <div className="relative mt-1">
                <Input 
                  value={profit}
                  readOnly
                  className="bg-[#24282F] border-0 text-white h-10 rounded-sm"
                />
              </div>
            </div>
            
            {/* Bet Button */}
            <Button 
              onClick={handleBet}
              disabled={rolling}
              className="w-full h-12 bg-[#5AEF7B] hover:bg-[#4CD66A] text-black font-medium rounded"
            >
              {rolling ? 'Rolling...' : 'Bet'}
            </Button>
          </div>
        </div>
        
        {/* Right Panel (Game) */}
        <div className="flex-1 flex flex-col p-0">
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between text-[#6E7682] text-sm mb-2">
              <div>0</div>
              <div>25</div>
              <div>50</div>
              <div>75</div>
              <div>100</div>
            </div>
            
            {/* Slider Component */}
            <div className="relative h-10 rounded-full border-4 border-[#24272C] overflow-hidden mb-auto">
              {/* Red section */}
              <div 
                className="absolute left-0 top-0 h-full bg-[#EB5757]"
                style={{ width: `${target}%` }}
              />
              
              {/* Green section */}
              <div 
                className="absolute right-0 top-0 h-full bg-[#5AEF7B]"
                style={{ width: `${100 - target}%` }}
              />
              
              {/* Slider Thumb */}
              <div 
                className="absolute top-0 bottom-0 w-8 bg-[#5583EA] z-10 rounded"
                style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
              />
              
              {/* Hidden interactive slider */}
              <Slider
                value={[target]}
                min={1}
                max={98}
                step={0.5}
                onValueChange={handleTargetChange}
                className="absolute inset-0 z-30 opacity-0"
              />
            </div>
            
            {/* Stats Panel */}
            <div className="mt-auto bg-[#24282F] rounded p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-[#6E7682] text-xs mb-1">Multiplier</div>
                  <div className="flex items-center justify-center">
                    <span className="text-white">{multiplier.toFixed(4)}</span>
                    <span className="text-[#6E7682]">×</span>
                  </div>
                </div>
                
                <div 
                  className="text-center cursor-pointer"
                  onClick={handleRollModeChange}
                >
                  <div className="text-[#6E7682] text-xs mb-1">Roll {rollMode === 'over' ? 'Over' : 'Under'}</div>
                  <div className="flex items-center justify-center">
                    <span className="text-white">{target.toFixed(2)}</span>
                    <RefreshCw size={14} className="ml-1 text-[#6E7682]" />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-[#6E7682] text-xs mb-1">Win Chance</div>
                  <div className="flex items-center justify-center">
                    <span className="text-white">{winChance.toFixed(4)}</span>
                    <span className="text-[#6E7682]">%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom toolbar */}
            <div className="flex justify-between items-center mt-4 text-[#6E7682]">
              <div className="flex space-x-6">
                <button className="hover:text-white"><Star size={16} /></button>
                <button className="hover:text-white"><LayoutGrid size={16} /></button>
                <button className="hover:text-white"><BarChart2 size={16} /></button>
                <button className="hover:text-white"><Settings size={16} /></button>
              </div>
              <div className="text-xs">Fairness</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;