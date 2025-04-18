import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';
import { calculateLimboResult } from '../../server/games/provably-fair'; // Import the function for actual provably fair logic
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { useGame } from '@/context/GameContext';
import { LimboOutcome } from '@/shared/schema';

// Component for Limbo game based on the reference screenshots
const LimboFinal: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<'Manual' | 'Auto'>('Manual');
  const [betAmount, setBetAmount] = useState<number>(0.00000001);
  const [betAmountDisplay, setBetAmountDisplay] = useState<string>("0.00000000");
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
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [betHistory, setBetHistory] = useState<Array<{multiplier: number, won: boolean}>>([]);
  
  // Hooks for actual game logic
  const { getGameResult } = useProvablyFair('limbo');
  const { balance, placeBet, completeBet } = useBalance();
  const { selectedGame } = useGame();
  
  // Ref for autobet interval
  const autoBetIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentBetIdRef = useRef<number | null>(null);
  
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
  
  // Format number with up to 8 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(8).replace(/\.?0+$/, '');
  };
  
  // Clean up autobet on unmount
  useEffect(() => {
    return () => {
      if (autoBetIntervalRef.current) {
        clearInterval(autoBetIntervalRef.current);
      }
    };
  }, []);
  
  // Calculate the win chance based on target multiplier
  useEffect(() => {
    // Formula: Win Chance (%) = (1 / Target Multiplier) * (100 - House Edge)
    // Where House Edge is 1%
    const chance = ((1 / targetMultiplier) * 99);
    setWinChance(Number(chance.toFixed(8)));
  }, [targetMultiplier]);
  
  // Update displayed bet amount when changed
  useEffect(() => {
    setBetAmountDisplay(betAmount.toFixed(8));
  }, [betAmount]);

  // Handle bet amount changes
  const handleBetAmountChange = (value: string) => {
    const newAmount = parseFloat(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setBetAmount(newAmount);
      setBetAmountDisplay(value);
    } else if (value === '' || value === '0') {
      setBetAmount(0);
      setBetAmountDisplay(value);
    }
  };
  
  // Half bet amount
  const halfBet = () => {
    const newAmount = betAmount / 2;
    setBetAmount(newAmount);
    setBetAmountDisplay(newAmount.toFixed(8));
  };
  
  // Double bet amount
  const doubleBet = () => {
    const newAmount = betAmount * 2;
    setBetAmount(newAmount);
    setBetAmountDisplay(newAmount.toFixed(8));
  };
  
  // Animate multiplier reveal
  const animateMultiplier = useCallback((finalMultiplier: number, duration: number = 800) => {
    setIsAnimating(true);
    
    let startValue = 1.00;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (finalMultiplier - startValue) * easeOut;
      
      setCurrentMultiplier(parseFloat(currentValue.toFixed(2)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        setCurrentMultiplier(finalMultiplier);
        setIsAnimating(false);
        setIsWon(finalMultiplier >= targetMultiplier);
        
        // Add to history
        setBetHistory(prev => [
          { 
            multiplier: finalMultiplier, 
            won: finalMultiplier >= targetMultiplier 
          }, 
          ...prev.slice(0, 9)
        ]);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetMultiplier]);
  
  // Handle single bet (Manual mode)
  const handleManualBet = async () => {
    if (isAnimating || !selectedGame) return;
    
    try {
      // Place the bet
      const bet = await placeBet.mutateAsync({
        gameId: selectedGame.id,
        userId: 1, // Default user for now
        amount: betAmount,
        options: {
          targetMultiplier
        }
      });
      
      currentBetIdRef.current = bet.betId;
      
      // Generate game result (this would normally come from the server)
      const result = getGameResult() as number;
      const limboResult = parseFloat(result.toFixed(2));
      
      // Animate the multiplier
      animateMultiplier(limboResult);
      
      // Create outcome object
      const outcome: LimboOutcome = {
        targetMultiplier,
        result: limboResult,
        win: limboResult >= targetMultiplier
      };
      
      // Complete the bet after animation
      setTimeout(() => {
        if (currentBetIdRef.current) {
          completeBet.mutate({
            betId: currentBetIdRef.current,
            outcome: {
              ...outcome,
              multiplier: outcome.win ? targetMultiplier : 0
            }
          });
          currentBetIdRef.current = null;
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };
  
  // Handle auto betting
  const handleAutoBet = useCallback(async () => {
    if (!selectedGame) return;
    
    try {
      // Place the bet
      const bet = await placeBet.mutateAsync({
        gameId: selectedGame.id,
        userId: 1, // Default user for now
        amount: betAmount,
        options: {
          targetMultiplier
        }
      });
      
      currentBetIdRef.current = bet.betId;
      
      // Generate game result (this would normally come from the server)
      const result = getGameResult() as number;
      const limboResult = parseFloat(result.toFixed(2));
      
      // Animate the multiplier
      animateMultiplier(limboResult);
      
      // Create outcome object
      const outcome: LimboOutcome = {
        targetMultiplier,
        result: limboResult,
        win: limboResult >= targetMultiplier
      };
      
      // Complete the bet after animation
      setTimeout(() => {
        if (currentBetIdRef.current) {
          completeBet.mutate({
            betId: currentBetIdRef.current,
            outcome: {
              ...outcome,
              multiplier: outcome.win ? targetMultiplier : 0
            }
          });
          currentBetIdRef.current = null;
          
          // Adjust bet amount based on win/loss if set
          if (outcome.win && onWinIncrease > 0) {
            const newAmount = betAmount * (1 + onWinIncrease / 100);
            setBetAmount(parseFloat(newAmount.toFixed(8)));
          } else if (!outcome.win && onLossIncrease > 0) {
            const newAmount = betAmount * (1 + onLossIncrease / 100);
            setBetAmount(parseFloat(newAmount.toFixed(8)));
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  }, [selectedGame, betAmount, targetMultiplier, onWinIncrease, onLossIncrease, placeBet, getGameResult, animateMultiplier, completeBet]);
  
  // Start/stop autobet
  const toggleAutobet = () => {
    if (autoRunning) {
      setAutoRunning(false);
      if (autoBetIntervalRef.current) {
        clearInterval(autoBetIntervalRef.current);
        autoBetIntervalRef.current = null;
      }
    } else {
      setAutoRunning(true);
      
      // Start with one bet immediately
      handleAutoBet();
      
      // Set up interval for subsequent bets
      autoBetIntervalRef.current = setInterval(() => {
        // Stop if we've reached the number of bets
        if (numberBets > 0 && betHistory.length >= numberBets) {
          toggleAutobet();
          return;
        }
        
        // Check profit/loss stop conditions
        // (In a real implementation, this would check actual profit/loss)
        
        // If not stopped by conditions, place another bet
        if (!isAnimating) {
          handleAutoBet();
        }
      }, 2000); // Wait 2 seconds between bets
    }
  };
  
  // Get color for multiplier based on value
  const getMultiplierColor = () => {
    if (currentMultiplier <= 1.08) return 'text-[#FF3B3B]'; // Red for very low
    if (currentMultiplier < 1.5) return 'text-[#FF6B00]'; // Orange for low
    if (currentMultiplier < 2.0) return 'text-[#FFA800]'; // Yellow-orange for medium-low
    if (currentMultiplier < 10) return 'text-[#5BE12C]';  // Green for medium
    return 'text-[#49E]';  // Blue for high
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#0F212E] text-white overflow-hidden">
      {/* Main Game Container */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side - Game Area */}
        <div className="w-full md:w-3/4 p-4 flex flex-col h-full">
          {/* Quick Multiplier Buttons */}
          <div className="flex overflow-x-auto gap-2 py-2 mb-4">
            {quickMultipliers.map((mult, i) => (
              <button
                key={i}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                  mult.highlight ? 'bg-[#5BE12C] text-black' : 'bg-[#172B3A]'
                }`}
                onClick={() => setTargetMultiplier(mult.value)}
              >
                {mult.label}
              </button>
            ))}
          </div>
          
          {/* Main Game Display Area */}
          <div className="relative flex-grow bg-[#0E1C27] rounded-lg flex items-center justify-center overflow-hidden">
            {/* Notification banner for autobet */}
            {autoRunning && (
              <div className="absolute top-4 left-4 bg-[#172B3A] text-white px-3 py-1 rounded-lg flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-sm">Autobet started</span>
                <button className="ml-4 text-gray-400" onClick={toggleAutobet}>&times;</button>
              </div>
            )}
            
            {/* Center Multiplier Display */}
            <div className="text-center">
              <div className={`text-9xl font-bold ${getMultiplierColor()}`}>
                {currentMultiplier.toFixed(2)}×
              </div>
            </div>
            
            {/* Bottom Info Box */}
            <div className="absolute bottom-4 inset-x-4">
              <div className="bg-[#172B3A] rounded-lg p-4 flex justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Target Multiplier</div>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      min="1.01"
                      step="0.01"
                      value={targetMultiplier}
                      onChange={(e) => setTargetMultiplier(Math.max(1.01, Number(e.target.value)))}
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
        
        {/* Right Side - Controls */}
        <div className="w-full md:w-1/4 p-4 bg-[#172B3A]">
          {/* Game Mode Tabs */}
          <div className="flex rounded-md overflow-hidden mb-4 bg-[#0F212E]">
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'Manual' ? 'bg-[#172B3A]' : ''}`}
              onClick={() => setGameMode('Manual')}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'Auto' ? 'bg-[#172B3A]' : ''}`}
              onClick={() => setGameMode('Auto')}
            >
              Auto
            </button>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Bet Amount</div>
            <div className="bg-[#0F212E] p-2 rounded mb-2 relative">
              <div className="flex items-center">
                <span className="text-white">$0.00</span>
              </div>
              <input 
                type="text" 
                value={betAmountDisplay}
                onChange={(e) => handleBetAmountChange(e.target.value)}
                className="w-full bg-transparent border-none text-white outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex">
                <button onClick={halfBet} className="px-2 text-gray-400 hover:text-white">½</button>
                <button onClick={doubleBet} className="px-2 text-gray-400 hover:text-white">2×</button>
              </div>
            </div>
          </div>
          
          {/* Number of Bets (Auto mode only) */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Number of Bets</div>
            <div className="bg-[#0F212E] p-2 rounded mb-2 relative">
              <input 
                type="number"
                min="0" 
                value={numberBets}
                onChange={(e) => setNumberBets(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-transparent border-none text-white outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button 
                  onClick={() => setNumberBets(0)}
                  className="px-2 text-gray-400 hover:text-white"
                >
                  ∞
                </button>
              </div>
            </div>
          </div>
          
          {/* On Win (Auto mode only) */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">On Win</div>
            <div className="flex mb-2">
              <button 
                className="bg-[#0F212E] px-3 py-1 rounded-l text-xs"
                onClick={() => setOnWinIncrease(0)}
              >
                Reset
              </button>
              <div className="flex-1 bg-[#0F212E] px-2 py-1 rounded-r flex items-center">
                <span className="text-xs text-gray-400 mr-2">Increase by:</span>
                <input 
                  type="number" 
                  min="0"
                  value={onWinIncrease}
                  onChange={(e) => setOnWinIncrease(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent border-none text-white text-right outline-none"
                />
                <span className="ml-1 text-gray-400">%</span>
              </div>
            </div>
          </div>
          
          {/* On Loss (Auto mode only) */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">On Loss</div>
            <div className="flex mb-2">
              <button 
                className="bg-[#0F212E] px-3 py-1 rounded-l text-xs"
                onClick={() => setOnLossIncrease(0)}
              >
                Reset
              </button>
              <div className="flex-1 bg-[#0F212E] px-2 py-1 rounded-r flex items-center">
                <span className="text-xs text-gray-400 mr-2">Increase by:</span>
                <input 
                  type="number"
                  min="0" 
                  value={onLossIncrease}
                  onChange={(e) => setOnLossIncrease(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent border-none text-white text-right outline-none"
                />
                <span className="ml-1 text-gray-400">%</span>
              </div>
            </div>
          </div>
          
          {/* Stop on Profit (Auto mode only) */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Stop on Profit</div>
            <div className="bg-[#0F212E] p-2 rounded mb-2">
              <input 
                type="number"
                min="0"
                value={stopOnProfit}
                onChange={(e) => setStopOnProfit(Math.max(0, Number(e.target.value)))}
                className="w-full bg-transparent border-none text-white outline-none"
              />
              <div className="text-xs text-gray-400 mt-1">$0.00</div>
            </div>
          </div>
          
          {/* Stop on Loss (Auto mode only) */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Stop on Loss</div>
            <div className="bg-[#0F212E] p-2 rounded mb-2">
              <input 
                type="number"
                min="0"
                value={stopOnLoss}
                onChange={(e) => setStopOnLoss(Math.max(0, Number(e.target.value)))}
                className="w-full bg-transparent border-none text-white outline-none"
              />
              <div className="text-xs text-gray-400 mt-1">$0.00</div>
            </div>
          </div>
          
          {/* Bet Button / Start Autobet */}
          <div className="mb-4">
            {gameMode === 'Manual' ? (
              <Button 
                className="w-full py-3 text-base font-medium bg-[#5BE12C] hover:bg-[#4CC124] text-black rounded-md"
                onClick={handleManualBet}
                disabled={isAnimating || betAmount <= 0}
              >
                Bet
              </Button>
            ) : (
              <Button 
                className={`w-full py-3 text-base font-medium ${
                  autoRunning 
                    ? 'bg-[#FF6B00] hover:bg-[#FF8F3F]' 
                    : 'bg-[#5BE12C] hover:bg-[#4CC124] text-black'
                } rounded-md`}
                onClick={toggleAutobet}
                disabled={betAmount <= 0}
              >
                {autoRunning ? 'Stop Autobet' : 'Start Autobet'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation (hidden on desktop) */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0E1C27] flex justify-between border-t border-gray-800 md:hidden py-2">
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