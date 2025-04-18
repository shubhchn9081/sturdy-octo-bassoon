import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';

// Component for Limbo game based on the reference screenshots
const LimboFinal: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<'Manual' | 'Auto'>('Manual');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.00);
  const [winChance, setWinChance] = useState<number>(49.5);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [numberBets, setNumberBets] = useState<number>(0);
  const [onWinIncrease, setOnWinIncrease] = useState<number>(0);
  const [onLossIncrease, setOnLossIncrease] = useState<number>(0);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const [autoRunning, setAutoRunning] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean | null>(null);
  
  // Quick multiplier options
  const quickMultipliers = [
    { value: 1.00, label: "1.00x" },
    { value: 1.25, label: "1.25x" },
    { value: 1.07, label: "1.07x" },
    { value: 1.56, label: "1.56x" },
    { value: 12.13, label: "12.13x", highlight: true },
    { value: 2.00, label: "2.00x" },
    { value: 1.19, label: "1.19x" },
    { value: 4.12, label: "4.12x" },
    { value: 1.25, label: "1.25x" },
    { value: 2.89, label: "2.89x" }
  ];
  
  // Calculate the win chance based on target multiplier
  useEffect(() => {
    const chance = Math.floor(((1 / targetMultiplier) * 0.99) * 100 * 100000) / 100000;
    setWinChance(chance);
  }, [targetMultiplier]);
  
  // Bet function
  const placeBet = () => {
    // Generate a random multiplier between 1.00 and 100.00
    const randomMultiplier = Math.floor(Math.random() * 9900) / 100 + 1.00;
    
    // Animation for multiplier reveal
    let current = 1.00;
    const startTime = Date.now();
    const duration = 1000; // 1 second animation
    
    const animateMultiplier = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Ease-out function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        current = 1.00 + (randomMultiplier - 1.00) * easeOut;
        setCurrentMultiplier(parseFloat(current.toFixed(2)));
        requestAnimationFrame(animateMultiplier);
      } else {
        // Animation complete - set final value
        setCurrentMultiplier(randomMultiplier);
        setIsWon(randomMultiplier >= targetMultiplier);
      }
    };
    
    requestAnimationFrame(animateMultiplier);
  };
  
  // Start/stop autobet
  const toggleAutobet = () => {
    if (autoRunning) {
      setAutoRunning(false);
    } else {
      setAutoRunning(true);
      // In a real implementation, this would start a sequence of bets
      // For demo, we'll just show a different multiplier
      setCurrentMultiplier(2.89);
      setIsWon(true);
    }
  };
  
  // Get color for multiplier based on value
  const getMultiplierColor = () => {
    if (currentMultiplier < 1.2) return 'text-[#FF3B3B]'; // Red for very low
    if (currentMultiplier < 1.5) return 'text-[#FF6B00]'; // Orange for low
    if (currentMultiplier < 2.0) return 'text-[#FFA800]'; // Yellow-orange for medium-low
    if (currentMultiplier < 10) return 'text-[#5BE12C]';  // Green for medium
    return 'text-[#49E]';  // Blue for high
  };
  
  return (
    <div className="flex flex-col h-full w-full bg-[#0F212E] text-white overflow-hidden">
      {/* Mobile/Desktop Responsive Layout */}
      <div className="flex flex-col md:flex-row w-full h-full">
      
        {/* Game Area - Left Side */}
        <div className="w-full md:w-3/4 px-2 md:p-4 flex flex-col">
          {/* Quick Multiplier Buttons - Top row */}
          <div className="flex overflow-x-auto gap-2 mb-2 py-2">
            {quickMultipliers.map((mult, i) => (
              <button
                key={i}
                className={`shrink-0 px-3 py-1 rounded-full ${
                  mult.highlight ? 'bg-[#5BE12C] text-black' : 'bg-[#11232F]'
                } text-xs font-semibold`}
                onClick={() => setTargetMultiplier(mult.value)}
              >
                {mult.label}
              </button>
            ))}
          </div>
          
          {/* Game Display - Main Multiplier Display */}
          <div className="relative bg-[#0E1C27] rounded-lg overflow-hidden w-full flex-grow flex items-center justify-center">
            {/* Auto bet notification */}
            {autoRunning && (
              <div className="absolute top-4 left-4 bg-[#11232F] text-white px-3 py-1 rounded-lg flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-sm">Autobet started</span>
                <button className="ml-4 text-gray-400">&times;</button>
              </div>
            )}
          
            {/* Central multiplier display */}
            <div className="text-center">
              <div className={`text-8xl md:text-9xl font-bold ${getMultiplierColor()}`}>
                {currentMultiplier.toFixed(2)}×
              </div>
            </div>
            
            {/* Target + Win Chance - Bottom info box */}
            <div className="absolute bottom-4 inset-x-4">
              <div className="bg-[#11232F] rounded-lg p-4 flex justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Target Multiplier</div>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      value={targetMultiplier}
                      onChange={(e) => setTargetMultiplier(Number(e.target.value))}
                      className="bg-transparent w-20 text-white text-lg border-none outline-none"
                    />
                    <button className="text-gray-400 ml-2">&times;</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Win Chance</div>
                  <div className="flex items-center justify-end">
                    <span className="text-white text-lg">{winChance.toFixed(8)}</span>
                    <span className="text-gray-400 ml-1">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Betting Controls */}
        <div className="w-full md:w-1/4 p-4 bg-[#11232F]">
          {/* Game Mode Toggle */}
          <div className="flex rounded-md overflow-hidden mb-4">
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'Manual' ? 'bg-[#0F212E]' : 'bg-[#11232F]'}`}
              onClick={() => setGameMode('Manual')}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'Auto' ? 'bg-[#0F212E]' : 'bg-[#11232F]'}`}
              onClick={() => setGameMode('Auto')}
            >
              Auto
            </button>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Bet Amount</label>
            <div className="flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
              />
              <div className="absolute right-8 flex">
                <button className="text-gray-400 px-1">½</button>
                <button className="text-gray-400 px-1">2×</button>
              </div>
            </div>
          </div>
          
          {/* Number of Bets (Auto mode) */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Number of Bets</label>
            <div className="relative flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={numberBets}
                onChange={(e) => setNumberBets(Number(e.target.value))}
              />
              <div className="absolute right-2">
                <button className="text-gray-400 px-1">∞</button>
              </div>
            </div>
          </div>
          
          {/* On Win */}
          <div className="mb-4">
            <label className="block text-sm mb-1">On Win</label>
            <div className="flex mb-2">
              <button className="bg-[#0F212E] px-3 py-1 rounded-l text-xs">Reset</button>
              <div className="flex-1 bg-[#0F212E] px-2 py-1 rounded-r flex items-center">
                <div className="text-xs text-gray-400 mr-2">Increase by:</div>
                <input 
                  type="number" 
                  className="w-full bg-transparent border-none text-white text-right"
                  value={onWinIncrease}
                  onChange={(e) => setOnWinIncrease(Number(e.target.value))}
                />
                <div className="ml-1 text-gray-400">%</div>
              </div>
            </div>
          </div>
          
          {/* On Loss */}
          <div className="mb-4">
            <label className="block text-sm mb-1">On Loss</label>
            <div className="flex mb-2">
              <button className="bg-[#0F212E] px-3 py-1 rounded-l text-xs">Reset</button>
              <div className="flex-1 bg-[#0F212E] px-2 py-1 rounded-r flex items-center">
                <div className="text-xs text-gray-400 mr-2">Increase by:</div>
                <input 
                  type="number" 
                  className="w-full bg-transparent border-none text-white text-right"
                  value={onLossIncrease}
                  onChange={(e) => setOnLossIncrease(Number(e.target.value))}
                />
                <div className="ml-1 text-gray-400">%</div>
              </div>
            </div>
          </div>
          
          {/* Stop on Profit */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Stop on Profit</label>
            <div className="flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={stopOnProfit}
                onChange={(e) => setStopOnProfit(Number(e.target.value))}
              />
            </div>
          </div>
          
          {/* Stop on Loss */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Stop on Loss</label>
            <div className="flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={stopOnLoss}
                onChange={(e) => setStopOnLoss(Number(e.target.value))}
              />
            </div>
          </div>
          
          {/* Bet Button / Start Autobet */}
          <div className="mb-4">
            {gameMode === 'Manual' ? (
              <Button 
                className="w-full py-4 text-lg bg-[#5BE12C] hover:bg-[#4CC124] text-black rounded-md"
                onClick={placeBet}
              >
                Bet
              </Button>
            ) : (
              <Button 
                className={`w-full py-4 text-lg ${
                  autoRunning 
                    ? 'bg-[#FF6B00] hover:bg-[#FF8F3F]' 
                    : 'bg-[#5BE12C] hover:bg-[#4CC124] text-black'
                } rounded-md`}
                onClick={toggleAutobet}
              >
                {autoRunning ? 'Stop Autobet' : 'Start Autobet'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0e1c27] flex justify-between border-t border-gray-800 md:hidden py-2">
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <BrowseIcon />
          <span className="text-xs text-gray-400">Browse</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <CasinoIcon />
          <span className="text-xs text-white">Casino</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <BetsIcon />
          <span className="text-xs text-gray-400">Bets</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <SportsIcon />
          <span className="text-xs text-gray-400">Sports</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <ChatIcon />
          <span className="text-xs text-gray-400">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default LimboFinal;