import React, { useState, useEffect } from 'react';

// Simple formatCrypto implementation to avoid dependency
const formatCryptoAmount = (amount: number): string => {
  return amount.toFixed(8);
};

const DiceGame = () => {
  // Local state for bet amount
  const [betAmount, setBetAmount] = useState(0.00000000);
  
  // Game state
  const [target, setTarget] = useState(50.00);
  const [multiplier, setMultiplier] = useState(2.0000);
  const [winChance, setWinChance] = useState(50.0000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [rollMode, setRollMode] = useState<'over' | 'under'>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [profit, setProfit] = useState(0);
  
  // Update multiplier and win chance when target changes
  useEffect(() => {
    const newMultiplier = parseFloat((100 / (rollMode === 'over' ? (100 - target) : target)).toFixed(4));
    setMultiplier(newMultiplier);
    setWinChance(rollMode === 'over' ? (100 - target) : target);
  }, [target, rollMode]);
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    const profitValue = betAmount * (multiplier - 1);
    setProfit(profitValue);
  }, [betAmount, multiplier]);
  
  const handleTargetChange = (value: number) => {
    setTarget(value);
  };
  
  const handleHalfBet = () => {
    setBetAmount(betAmount / 2);
  };
  
  const handleDoubleBet = () => {
    setBetAmount(betAmount * 2);
  };
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(parseFloat(value) || 0);
  };
  
  const handleRollModeChange = () => {
    setRollMode(rollMode === 'over' ? 'under' : 'over');
  };
  
  const handleBet = async () => {
    if (rolling || betAmount <= 0) return;
    
    setRolling(true);
    setResult(null);
    setWon(null);
    
    try {
      // Simulate dice roll with random number between 0-100
      const diceResult = Math.random() * 100;
      
      // Wait a bit to simulate the roll
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    <div className="flex flex-1 flex-col bg-[#0F212E] min-h-screen">
      <div className="flex flex-1 p-4 space-x-4">
        {/* Left side panel (controls) */}
        <div className="w-[210px] shrink-0">
          <div className="bg-[#172B3A] rounded-lg overflow-hidden">
            <div className="p-4">
              {/* Manual/Auto toggle */}
              <div className="bg-[#0F212E] rounded-full p-1 flex mb-4">
                <button 
                  className={`flex-1 py-2 rounded-full text-sm font-medium ${mode === 'manual' ? 'bg-[#172B3A] text-white' : 'text-[#7F8990]'}`}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button 
                  className={`flex-1 py-2 rounded-full text-sm font-medium ${mode === 'auto' ? 'bg-[#172B3A] text-white' : 'text-[#7F8990]'}`}
                  onClick={() => setMode('auto')}
                >
                  Auto
                </button>
              </div>
              
              {/* Bet Amount */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-[#7F8990]">Bet Amount</div>
                  <div className="text-xs text-[#7F8990]">$0.00</div>
                </div>
                <div className="bg-[#0F212E] rounded flex items-center">
                  <div className="pl-2.5 pr-1">
                    <div className="w-5 h-5 rounded-full bg-[#FFB119] text-center text-xs font-bold text-black leading-5">₿</div>
                  </div>
                  <input
                    type="text"
                    value={formatCryptoAmount(betAmount)}
                    onChange={handleBetAmountChange}
                    className="bg-transparent border-none outline-none h-9 text-sm text-white px-0 flex-1 min-w-0"
                  />
                  <div className="flex h-full">
                    <button 
                      onClick={handleHalfBet}
                      className="h-9 w-8 text-[#7F8990] hover:text-white border-l border-[#172B3A] flex items-center justify-center"
                    >
                      ½
                    </button>
                    <button 
                      onClick={handleDoubleBet}
                      className="h-9 w-8 text-[#7F8990] hover:text-white border-l border-[#172B3A] flex items-center justify-center"
                    >
                      2×
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Profit on Win */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-[#7F8990]">Profit on Win</div>
                  <div className="text-xs text-[#7F8990]">$0.00</div>
                </div>
                <div className="bg-[#0F212E] rounded flex items-center">
                  <div className="pl-2.5 pr-1">
                    <div className="w-5 h-5 rounded-full bg-[#FFB119] text-center text-xs font-bold text-black leading-5">₿</div>
                  </div>
                  <input
                    value={formatCryptoAmount(profit)}
                    readOnly
                    className="bg-transparent border-none outline-none h-9 text-sm text-white px-0 flex-1"
                  />
                </div>
              </div>
              
              {/* Bet Button */}
              <button 
                onClick={handleBet}
                disabled={rolling || betAmount <= 0}
                className="w-full bg-[#73FC8A] hover:bg-[#65E07A] text-black font-medium h-10 rounded text-sm"
              >
                {rolling ? 'Rolling...' : 'Bet'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right side (game interface) */}
        <div className="flex-1">
          <div className="bg-[#172B3A] rounded-lg h-full flex flex-col p-5">
            <div className="flex-1 flex flex-col">
              {/* Slider scale numbers */}
              <div className="flex justify-between text-[#7F8990] text-xs mb-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              
              {/* Slider */}
              <div className="relative h-10 rounded-full overflow-hidden bg-[#121A20] mb-6">
                {/* Red section */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-[#FF5359]"
                  style={{ width: `${target}%` }}
                ></div>
                
                {/* Green section */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-[#73FC8A]"
                  style={{ width: `${100 - target}%` }}
                ></div>
                
                {/* Slider thumb */}
                <div 
                  className="absolute top-0 bottom-0 w-10 bg-[#3D94F4] rounded-full z-10"
                  style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
                ></div>
                
                {/* Hidden interactive slider */}
                <input 
                  type="range"
                  min={1}
                  max={99}
                  step={0.01}
                  value={target}
                  onChange={(e) => handleTargetChange(parseFloat(e.target.value))}
                  className="absolute inset-0 z-20 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              
              {/* Result display */}
              {result !== null && (
                <div className={`text-center my-4 text-2xl font-bold ${won ? 'text-[#73FC8A]' : 'text-[#FF5359]'}`}>
                  {result.toFixed(2)} - {won ? 'WIN!' : 'LOSE'}
                </div>
              )}
              
              {/* Spacer */}
              <div className="flex-grow"></div>
              
              {/* Stats Panel */}
              <div className="bg-[#121A20] rounded-lg p-4">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-xs text-[#7F8990] mb-1">Multiplier</div>
                    <div className="text-white flex items-center justify-center">
                      <span>{multiplier.toFixed(4)}</span>
                      <span className="text-[#7F8990] ml-0.5">×</span>
                    </div>
                  </div>
                  
                  <div 
                    className="text-center cursor-pointer"
                    onClick={handleRollModeChange}
                  >
                    <div className="text-xs text-[#7F8990] mb-1">Roll {rollMode === 'over' ? 'Over' : 'Under'}</div>
                    <div className="text-white flex items-center justify-center">
                      <span>{target.toFixed(2)}</span>
                      <button className="ml-1 text-[#7F8990] hover:text-white">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 2v6h-6"></path>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                          <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                          <path d="M21 22v-6h-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-[#7F8990] mb-1">Win Chance</div>
                    <div className="text-white flex items-center justify-center">
                      <span>{winChance.toFixed(4)}</span>
                      <span className="text-[#7F8990] ml-0.5">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom toolbar */}
              <div className="flex justify-end items-center mt-4">
                <div className="text-xs text-[#7F8990]">
                  <span className="cursor-pointer hover:text-white">Fairness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;