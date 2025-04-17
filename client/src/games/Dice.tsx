import React, { useState, useEffect } from 'react';

// Simple formatCrypto implementation to avoid dependency
const formatCryptoAmount = (amount: number): string => {
  return amount.toFixed(8);
};

const DiceGame = () => {
  // Local state for bet amount
  const [betAmount, setBetAmount] = useState(0.0001);
  
  // Game state
  const [target, setTarget] = useState(50.50);
  const [multiplier, setMultiplier] = useState(2.0000);
  const [winChance, setWinChance] = useState(49.5000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [rollMode, setRollMode] = useState<'over' | 'under'>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [profit, setProfit] = useState(0);
  const [currency, setCurrency] = useState('btc');
  
  // Update multiplier and win chance when target changes
  useEffect(() => {
    const newMultiplier = parseFloat((99 / (rollMode === 'over' ? (99 - target) : target)).toFixed(4));
    setMultiplier(newMultiplier);
    setWinChance(rollMode === 'over' ? (99 - target) : target);
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
    <div className="bg-[#0F212E] min-h-screen flex flex-col">
      <div className="flex-grow flex">
        {/* Main content container */}
        <div className="flex-grow bg-[#0F212E] flex flex-col md:flex-row p-5">
          {/* Left side panel (controls) */}
          <div className="w-full md:w-[340px] md:mr-5">
            <div className="bg-[#172B3A] rounded-lg mb-5">
              <div className="p-4">
                {/* Manual/Auto toggle */}
                <div className="bg-[#091C2C] rounded-full p-1 flex mb-5">
                  <button 
                    className={`w-1/2 py-2 text-sm rounded-full ${mode === 'manual' ? 'bg-[#243442] text-white' : 'text-[#8B929A]'}`}
                    onClick={() => setMode('manual')}
                  >
                    Manual
                  </button>
                  <button 
                    className={`w-1/2 py-2 text-sm rounded-full ${mode === 'auto' ? 'bg-[#243442] text-white' : 'text-[#8B929A]'}`}
                    onClick={() => setMode('auto')}
                  >
                    Auto
                  </button>
                </div>
                
                {/* Bet Amount */}
                <div className="mb-4">
                  <div className="flex justify-between">
                    <label className="text-xs text-[#8B929A] mb-1">Bet Amount</label>
                    <div className="text-xs text-[#8B929A] mb-1">${(betAmount * 0.00026).toFixed(2)}</div>
                  </div>
                  <div className="bg-[#12202D] rounded flex items-center relative">
                    <div className="absolute left-3 text-[#6F767F] text-sm">{currency === 'btc' ? '₿' : '$'}</div>
                    <input
                      type="text"
                      value={formatCryptoAmount(betAmount)}
                      onChange={handleBetAmountChange}
                      className="w-full h-10 bg-transparent outline-none text-white pl-8 pr-20 text-sm"
                      placeholder="0.00000000"
                    />
                    <div className="absolute right-0 flex h-full border-l border-[#1B3144]">
                      <button 
                        onClick={handleHalfBet}
                        className="h-full px-2 text-[#8B929A] hover:text-white bg-transparent hover:bg-[#1F3347] border-r border-[#1B3144]"
                      >
                        ½
                      </button>
                      <button 
                        onClick={handleDoubleBet}
                        className="h-full px-2 text-[#8B929A] hover:text-white bg-transparent hover:bg-[#1F3347]"
                      >
                        2×
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Profit on Win */}
                <div className="mb-5">
                  <div className="flex justify-between">
                    <label className="text-xs text-[#8B929A] mb-1">Profit on Win</label>
                    <div className="text-xs text-[#8B929A] mb-1">${(profit * 0.00026).toFixed(2)}</div>
                  </div>
                  <div className="bg-[#12202D] rounded flex items-center relative">
                    <div className="absolute left-3 text-[#6F767F] text-sm">{currency === 'btc' ? '₿' : '$'}</div>
                    <input
                      value={formatCryptoAmount(profit)}
                      readOnly
                      className="w-full h-10 bg-transparent outline-none text-white pl-8 text-sm"
                      placeholder="0.00000000"
                    />
                  </div>
                </div>
                
                {/* Bet Button */}
                <button 
                  onClick={handleBet}
                  disabled={rolling || betAmount <= 0}
                  className="w-full bg-[#18BA9C] hover:bg-[#15A78B] text-white font-medium py-3 rounded text-sm"
                >
                  {rolling ? 'Rolling...' : 'Bet'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Main game area */}
          <div className="flex-grow">
            <div className="bg-[#172B3A] rounded-lg p-5 h-full flex flex-col">
              {/* Game title and controls */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-medium text-white">Dice</h1>
                <div className="flex space-x-1">
                  <button className="bg-[#12202D] hover:bg-[#1D2D3D] p-2 rounded">
                    <svg className="w-4 h-4 text-[#8B929A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                  <button className="bg-[#12202D] hover:bg-[#1D2D3D] p-2 rounded">
                    <svg className="w-4 h-4 text-[#8B929A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  <button className="bg-[#12202D] hover:bg-[#1D2D3D] p-2 rounded">
                    <svg className="w-4 h-4 text-[#8B929A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Game content */}
              <div className="flex-grow flex flex-col">
                {/* Slider section */}
                <div className="my-3">
                  <div className="flex justify-between text-[#8B929A] text-xs mb-2 px-1">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                  
                  <div className="w-full bg-[#12202D] h-12 rounded-full relative overflow-hidden mb-4">
                    {/* Red section */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-[#F3403F]"
                      style={{ width: `${target}%` }}
                    ></div>
                    
                    {/* Green section */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#18BA9C]"
                      style={{ width: `${100 - target}%` }}
                    ></div>
                    
                    {/* Slider Thumb */}
                    <div 
                      className="absolute top-0 bottom-0 w-6 bg-[#1470DC] rounded cursor-pointer z-10"
                      style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
                    ></div>
                    
                    {/* Hidden interactive slider */}
                    <input 
                      type="range"
                      min={1}
                      max={98}
                      step={0.1}
                      value={target}
                      onChange={(e) => handleTargetChange(parseFloat(e.target.value))}
                      className="absolute inset-0 z-20 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Result display */}
                {result !== null && (
                  <div className={`text-center my-4 text-2xl font-bold ${won ? 'text-[#18BA9C]' : 'text-[#F3403F]'}`}>
                    {result.toFixed(2)} - {won ? 'WIN!' : 'LOSE'}
                  </div>
                )}
                
                {/* Spacer */}
                <div className="flex-grow"></div>
                
                {/* Stats Panel */}
                <div className="mt-auto">
                  <div className="bg-[#12202D] rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-[#8B929A] text-xs mb-1">Multiplier</div>
                        <div className="flex items-center justify-center">
                          <span className="text-white text-sm">{multiplier.toFixed(4)}</span>
                          <span className="text-[#8B929A] ml-1">×</span>
                        </div>
                      </div>
                      
                      <div 
                        className="text-center cursor-pointer"
                        onClick={handleRollModeChange}
                      >
                        <div className="text-[#8B929A] text-xs mb-1">Roll {rollMode === 'over' ? 'Over' : 'Under'}</div>
                        <div className="flex items-center justify-center">
                          <span className="text-white text-sm">{target.toFixed(2)}</span>
                          <button className="ml-1 text-[#8B929A]">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 2v6h-6"></path>
                              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                              <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                              <path d="M21 22v-6h-6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-[#8B929A] text-xs mb-1">Win Chance</div>
                        <div className="flex items-center justify-center">
                          <span className="text-white text-sm">{winChance.toFixed(4)}</span>
                          <span className="text-[#8B929A] ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom toolbar */}
                <div className="flex justify-end items-center mt-4">
                  <div className="text-xs text-[#8B929A]">
                    <span className="cursor-pointer border-b border-dotted border-[#8B929A] hover:text-white hover:border-white">Provably Fair</span>
                  </div>
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