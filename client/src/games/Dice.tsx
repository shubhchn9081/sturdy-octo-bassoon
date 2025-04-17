import React, { useState, useEffect } from 'react';
import { formatCrypto } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Settings, LayoutGrid, BarChart2, Star } from 'lucide-react';

const DiceGame = () => {
  // Mock state for now
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
    <div className="min-h-[calc(100vh-64px)] bg-[#1A1D27]">
      <div className="flex flex-col min-h-full">
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Panel (Controls) */}
          <div className="w-full lg:w-[270px] bg-[#1E2328] border-r border-[#2A2F3C]">
            <div className="p-4">
              <Tabs value={mode} onValueChange={handleModeChange} className="mb-5">
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
                <div className="flex justify-between mb-1">
                  <div className="text-[#6E7682] text-xs">Bet Amount</div>
                  <div className="text-[#8B8E99] text-xs">$0.00</div>
                </div>
                <div className="relative mb-3">
                  <Input 
                    value={betAmount}
                    onChange={handleBetAmountChange}
                    className="bg-[#24282F] border-0 text-white h-10 rounded pl-3 pr-16"
                  />
                  <div className="absolute right-0 top-0 flex h-10">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleHalfBet}
                      className="h-10 px-2 text-[#8B8E99] hover:text-white bg-transparent hover:bg-[#3F444E]"
                    >
                      ½
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleDoubleBet}
                      className="h-10 px-2 text-[#8B8E99] hover:text-white bg-transparent hover:bg-[#3F444E]"
                    >
                      2×
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <div className="text-[#6E7682] text-xs">Profit on Win</div>
                  <div className="text-[#8B8E99] text-xs">$0.00</div>
                </div>
                <div className="relative">
                  <Input 
                    value={profit}
                    readOnly
                    className="bg-[#24282F] border-0 text-white h-10 rounded pl-3"
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
          </div>
          
          {/* Right Panel (Game) */}
          <div className="flex-1 flex flex-col p-6">
            <div className="flex justify-between mb-3 text-sm text-[#6E7682]">
              <div>0</div>
              <div>25</div>
              <div>50</div>
              <div>75</div>
              <div>100</div>
            </div>
            
            <div className="relative h-10 bg-[#24282F] rounded-full overflow-hidden mb-8">
              {/* Red background for under section */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[#EB5757] rounded-l-full"
                style={{ width: `${target}%` }}
              />
              
              {/* Green background for over section */}
              <div 
                className="absolute top-0 bottom-0 right-0 bg-[#5AEF7B] rounded-r-full"
                style={{ width: `${100 - target}%` }}
              />
              
              {/* Slider Thumb */}
              <div 
                className="absolute top-0 bottom-0 w-8 bg-[#5583EA] rounded z-10"
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
            
            {/* Game Stats */}
            <div className="mt-auto">
              <div className="bg-[#24282F] rounded-lg grid grid-cols-3 p-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs text-[#6E7682] mb-1">Multiplier</div>
                  <div className="text-white flex items-center">
                    {multiplier.toFixed(4)}<span className="text-[#6E7682]">×</span>
                  </div>
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
                  <div className="text-white flex items-center">
                    {winChance.toFixed(4)}<span className="text-[#6E7682]">%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Row with Icons and Logo */}
            <div className="flex justify-between items-center mt-4 text-[#6E7682]">
              <div className="flex space-x-4">
                <button className="hover:text-white"><Settings size={18} /></button>
                <button className="hover:text-white"><LayoutGrid size={18} /></button>
                <button className="hover:text-white"><BarChart2 size={18} /></button>
                <button className="hover:text-white"><Star size={18} /></button>
              </div>
              
              <div className="flex items-center">
                <span className="text-white font-bold italic text-lg mr-4">Stake</span>
                <span className="text-xs">Fairness</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;