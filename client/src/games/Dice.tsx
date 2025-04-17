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
    <div className="bg-[#0F212E] min-h-screen text-white">
      <div className="flex">
        {/* Left Panel (Controls) */}
        <div className="w-64 bg-[#172B3A] p-4">
          {/* Manual/Auto Tabs */}
          <div className="flex bg-[#1B3549] rounded-full overflow-hidden mb-6">
            <button 
              className={`flex-1 py-2 text-center ${mode === 'manual' ? 'bg-[#243442]' : 'text-gray-400'} rounded-l-full`}
              onClick={() => setMode('manual')}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center ${mode === 'auto' ? 'bg-[#243442]' : 'text-gray-400'} rounded-r-full`}
              onClick={() => setMode('auto')}
            >
              Auto
            </button>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <div className="bg-[#243442] p-2 rounded">
              <div className="flex justify-between">
                <label className="text-xs text-gray-400">Bet Amount</label>
                <div className="text-xs text-gray-400">${(betAmount * 0.00026).toFixed(2)}</div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formatCryptoAmount(betAmount)}
                  onChange={handleBetAmountChange}
                  className="w-full bg-transparent outline-none text-white h-6"
                  placeholder="0.00000000"
                />
                <div className="absolute right-0 top-0 flex h-full">
                  <button 
                    onClick={handleHalfBet}
                    className="h-full px-2 text-gray-400 hover:text-white bg-transparent hover:bg-[#1B3549] rounded-none"
                  >
                    ½
                  </button>
                  <button 
                    onClick={handleDoubleBet}
                    className="h-full px-2 text-gray-400 hover:text-white bg-transparent hover:bg-[#1B3549] rounded-none"
                  >
                    2×
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profit on Win */}
          <div className="mb-6">
            <div className="bg-[#243442] p-2 rounded">
              <div className="flex justify-between">
                <label className="text-xs text-gray-400">Profit on Win</label>
                <div className="text-xs text-gray-400">${(profit * 0.00026).toFixed(2)}</div>
              </div>
              <input
                value={formatCryptoAmount(profit)}
                readOnly
                className="w-full bg-transparent outline-none text-white h-6"
                placeholder="0.00000000"
              />
            </div>
          </div>
          
          {/* Bet Button */}
          <button 
            onClick={handleBet}
            disabled={rolling || betAmount <= 0}
            className="w-full bg-[#4ECD5D] hover:bg-[#3DBB4C] text-black font-medium py-2 rounded"
          >
            {rolling ? 'Rolling...' : 'Bet'}
          </button>
        </div>
        
        {/* Right Panel (Game) */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Number labels */}
            <div className="flex justify-between text-gray-400 text-sm mb-4">
              <div>0</div>
              <div>25</div>
              <div>50</div>
              <div>75</div>
              <div>100</div>
            </div>
            
            {/* Slider */}
            <div className="w-full bg-[#293742] h-10 rounded-full relative overflow-hidden mb-10">
              {/* Red section */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[#D13B4A]"
                style={{ width: `${target}%` }}
              ></div>
              
              {/* Green section */}
              <div 
                className="absolute right-0 top-0 bottom-0 bg-[#49B26C]"
                style={{ width: `${100 - target}%` }}
              ></div>
              
              {/* Slider Thumb */}
              <div 
                className="absolute top-0 bottom-0 w-5 bg-[#4A7BC6] rounded cursor-pointer"
                style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
              ></div>
              
              {/* Hidden interactive slider */}
              <input 
                type="range"
                min={1}
                max={98}
                step={0.5}
                value={target}
                onChange={(e) => handleTargetChange(parseFloat(e.target.value))}
                className="absolute inset-0 z-30 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            
            {/* Result display */}
            {result !== null && (
              <div className={`text-center mb-4 text-2xl font-bold ${won ? 'text-[#49B26C]' : 'text-[#D13B4A]'}`}>
                {result.toFixed(2)} - {won ? 'WIN!' : 'LOSE'}
              </div>
            )}
            
            {/* Spacer */}
            <div className="flex-grow"></div>
            
            {/* Stats Panel */}
            <div className="bg-[#172B3A] rounded-lg p-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <div>Multiplier</div>
                <div>Roll {rollMode === 'over' ? 'Over' : 'Under'}</div>
                <div>Win Chance</div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <span className="text-white">{multiplier.toFixed(4)}</span>
                  <span className="text-gray-400">×</span>
                </div>
                
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={handleRollModeChange}
                >
                  <span className="text-white">{target.toFixed(2)}</span>
                  <button className="ml-1 text-gray-400">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2v6h-6"></path>
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                      <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                      <path d="M21 22v-6h-6"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <span className="text-white">{winChance.toFixed(4)}</span>
                  <span className="text-gray-400">%</span>
                </div>
              </div>
            </div>
            
            {/* Bottom toolbar */}
            <div className="flex justify-between items-center mt-4 text-gray-400">
              <div className="flex space-x-4">
                <button className="hover:text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
                <button className="hover:text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button className="hover:text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </button>
                <button className="hover:text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
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