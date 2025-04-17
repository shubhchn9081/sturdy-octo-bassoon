import React, { useState, useEffect } from 'react';

// Simple formatCrypto implementation to avoid dependency
const formatCryptoAmount = (amount: number): string => {
  return amount.toFixed(8);
};

const DiceGame = () => {
  // Local state for bet amount
  const [betAmount, setBetAmount] = useState(0.00020000);
  
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
    <div className="min-h-screen bg-[#0F212E] text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-full">
        {/* Left side - Controls */}
        <div className="bg-[#0F212E] p-4 h-full">
          <div className="bg-[#172B3A] rounded-md overflow-hidden shadow-md">
            <div className="px-4 pt-4 pb-5">
              <div className="bg-[#0A161E] h-10 rounded-full p-1 flex mb-5">
                <button 
                  className={`w-1/2 py-2 text-xs font-medium rounded-full transition ${
                    mode === 'manual' 
                      ? 'bg-[#19344A] text-white' 
                      : 'text-[#7E8A93] hover:text-white'
                  }`}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button 
                  className={`w-1/2 py-2 text-xs font-medium rounded-full transition ${
                    mode === 'auto' 
                      ? 'bg-[#19344A] text-white' 
                      : 'text-[#7E8A93] hover:text-white'
                  }`}
                  onClick={() => setMode('auto')}
                >
                  Auto
                </button>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="text-[11px] text-[#7E8A93]">Bet Amount</div>
                  <div className="text-[11px] text-[#7E8A93]">$0.00</div>
                </div>
                <div className="relative">
                  <div className="absolute left-3 text-[#7E8A93] text-sm flex items-center h-full">₿</div>
                  <input
                    type="text"
                    value={formatCryptoAmount(betAmount)}
                    onChange={handleBetAmountChange}
                    className="w-full h-9 bg-[#0A161E] rounded border border-[#192F3D] outline-none text-white pl-8 pr-16 text-sm"
                  />
                  <div className="absolute right-0 top-0 h-full flex">
                    <button 
                      onClick={handleHalfBet}
                      className="h-full px-2 text-[#7E8A93] hover:text-white border-l border-[#192F3D] flex items-center text-xs font-medium"
                    >
                      ½
                    </button>
                    <button 
                      onClick={handleDoubleBet}
                      className="h-full px-2 text-[#7E8A93] hover:text-white border-l border-[#192F3D] flex items-center text-xs font-medium"
                    >
                      2×
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="text-[11px] text-[#7E8A93]">Profit On Win</div>
                  <div className="text-[11px] text-[#7E8A93]">$0.00</div>
                </div>
                <div className="relative">
                  <div className="absolute left-3 text-[#7E8A93] text-sm flex items-center h-full">₿</div>
                  <input
                    value={formatCryptoAmount(profit)}
                    readOnly
                    className="w-full h-9 bg-[#0A161E] rounded border border-[#192F3D] outline-none text-white pl-8 text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleBet}
                disabled={rolling || betAmount <= 0}
                className="w-full bg-[#00BFAA] hover:bg-[#00AB98] h-10 rounded text-white font-medium text-sm transition"
              >
                {rolling ? 'Rolling...' : 'Bet'}
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Game */}
        <div className="bg-[#0F212E] p-4 flex flex-col h-full">
          <div className="bg-[#172B3A] rounded-md shadow-md p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-medium text-white">Dice</h1>
              <div className="flex space-x-1">
                <button className="p-2 rounded bg-[#0F212E] hover:bg-[#19344A] text-[#7E8A93] hover:text-white transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
                <button className="p-2 rounded bg-[#0F212E] hover:bg-[#19344A] text-[#7E8A93] hover:text-white transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button className="p-2 rounded bg-[#0F212E] hover:bg-[#19344A] text-[#7E8A93] hover:text-white transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col mt-5">
              <div className="mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] text-[#7E8A93]">0</span>
                  <span className="text-[11px] text-[#7E8A93]">25</span>
                  <span className="text-[11px] text-[#7E8A93]">50</span>
                  <span className="text-[11px] text-[#7E8A93]">75</span>
                  <span className="text-[11px] text-[#7E8A93]">100</span>
                </div>

                <div className="relative h-12 rounded-full overflow-hidden">
                  {/* Background */}
                  <div className="absolute inset-0 bg-[#0A161E]"></div>
                  
                  {/* Red section */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-[#E64C4C]"
                    style={{ width: `${target}%` }}
                  />
                  
                  {/* Green section */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-[#00BFAA]"
                    style={{ width: `${100 - target}%` }}
                  />
                  
                  {/* Slider thumb */}
                  <div 
                    className="absolute top-0 bottom-0 w-6 bg-[#0F80FF] rounded-full z-10 cursor-pointer"
                    style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
                  />
                  
                  {/* Hidden slider input */}
                  <input 
                    type="range"
                    min={1}
                    max={98}
                    step={0.1}
                    value={target}
                    onChange={(e) => handleTargetChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Result display */}
              {result !== null && (
                <div className={`text-center py-3 my-2 text-2xl font-bold ${won ? 'text-[#00BFAA]' : 'text-[#E64C4C]'}`}>
                  {result.toFixed(2)} - {won ? 'WIN!' : 'LOSE'}
                </div>
              )}
              
              {/* Spacer */}
              <div className="flex-grow"></div>
              
              {/* Stats Panel */}
              <div className="mt-3">
                <div className="bg-[#0A161E] rounded-md p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-[11px] text-[#7E8A93] mb-1">Multiplier</div>
                      <div className="text-white font-medium flex items-center justify-center">
                        <span>{multiplier.toFixed(4)}</span>
                        <span className="text-[#7E8A93] ml-0.5">×</span>
                      </div>
                    </div>
                    
                    <div 
                      className="text-center cursor-pointer"
                      onClick={handleRollModeChange}
                    >
                      <div className="text-[11px] text-[#7E8A93] mb-1">Roll {rollMode === 'over' ? 'Over' : 'Under'}</div>
                      <div className="text-white font-medium flex items-center justify-center">
                        <span>{target.toFixed(2)}</span>
                        <button className="ml-1 text-[#7E8A93] hover:text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                            <path d="M21 22v-6h-6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-[11px] text-[#7E8A93] mb-1">Win Chance</div>
                      <div className="text-white font-medium flex items-center justify-center">
                        <span>{winChance.toFixed(4)}</span>
                        <span className="text-[#7E8A93] ml-0.5">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom toolbar */}
              <div className="flex justify-end mt-3">
                <div className="text-[11px] text-[#7E8A93] cursor-pointer hover:text-white">
                  <span className="border-b border-dotted border-[#7E8A93] hover:border-white">Provably Fair</span>
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