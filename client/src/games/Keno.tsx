import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';

// Component for Keno game based on the reference screenshots and logic
const Keno: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<'Manual' | 'Auto'>('Manual');
  const [betAmount, setBetAmount] = useState<number>(0.00000001);
  const [betAmountDisplay, setBetAmountDisplay] = useState<string>("0.00000000");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [matchedNumbers, setMatchedNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<{ won: boolean; multiplier: number; payout: number } | null>(null);
  const [betHistory, setBetHistory] = useState<Array<{multiplier: number, won: boolean}>>([]);
  
  // Maximum numbers player can select
  const MAX_SELECTIONS = 10;
  // Total numbers on the board
  const TOTAL_NUMBERS = 40;
  // Numbers drawn each round
  const NUMBERS_DRAWN = 10;
  
  // Hooks for actual game logic
  const { getGameResult } = useProvablyFair('keno');
  const { rawBalance, placeBet, completeBet } = useBalance('BTC');
  
  // Fixed game info for Keno
  const gameInfo = {
    id: 5,
    name: "KENO",
    slug: "keno",
    type: "STAKE ORIGINALS",
    description: "Select numbers and win big",
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97
  };
  
  // Ref for autobet interval and current bet ID
  const autoBetIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentBetIdRef = React.useRef<number | null>(null);
  
  // Format number with up to 8 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(8).replace(/\.?0+$/, '');
  };
  
  // Update displayed bet amount when changed
  useEffect(() => {
    setBetAmountDisplay(betAmount.toFixed(8));
  }, [betAmount]);
  
  // Clean up autobet on unmount
  useEffect(() => {
    return () => {
      if (autoBetIntervalRef.current) {
        clearInterval(autoBetIntervalRef.current);
      }
    };
  }, []);
  
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
  
  // Generate client seed
  const generateClientSeed = () => {
    return Math.random().toString(36).substring(2, 15);
  };
  
  // Toggle number selection
  const toggleNumberSelection = (num: number) => {
    if (isPlaying) return;
    
    setSelectedNumbers(prev => {
      // Create a copy of the current selections array
      const newSelections = [...prev];
      
      // If already selected, remove it
      const index = newSelections.indexOf(num);
      if (index !== -1) {
        newSelections.splice(index, 1);
        return newSelections;
      }
      
      // If max selections reached, don't add
      if (newSelections.length >= MAX_SELECTIONS) {
        console.log(`Max selections (${MAX_SELECTIONS}) reached`);
        return newSelections;
      }
      
      // Add number to selections
      return [...newSelections, num];
    });
  };
  
  // Clear all selected numbers and reset the game state
  const clearSelections = () => {
    if (isPlaying) return;
    console.log("Clearing game state");
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setMatchedNumbers([]);
    setResult(null);
  };
  
  // Auto pick random numbers
  const autoPick = () => {
    if (isPlaying) return;
    
    // Generate an array of random numbers between 1 and TOTAL_NUMBERS
    const count = Math.min(5, MAX_SELECTIONS); // Auto pick 5 numbers by default
    const numbers: number[] = [];
    
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    setSelectedNumbers(numbers);
  };
  
  // Get payout multiplier based on matches and selections
  const getPayoutMultiplier = (selected: number, matched: number): number => {
    // Payout table based on number of selections and matches
    const payoutTable: Record<number, number[]> = {
      1: [0, 3.8],
      2: [0, 1, 5.7],
      3: [0, 0, 2.1, 48],
      4: [0, 0, 1, 5, 90],
      5: [0, 0, 0.5, 3, 14, 200],
      6: [0, 0, 0.5, 1.5, 3, 40, 500],
      7: [0, 0, 0.5, 1, 2, 7, 30, 700],
      8: [0, 0, 0.5, 0.8, 2, 5, 20, 80, 1000],
      9: [0, 0, 0.5, 0.8, 1.5, 3, 10, 30, 300, 4000],
      10: [0, 0, 0, 0.5, 1.5, 3, 5, 20, 100, 500, 5000],
    };
    
    // Default to zero if not in the table
    if (!payoutTable[selected] || matched >= payoutTable[selected].length) {
      return 0;
    }
    
    return payoutTable[selected][matched];
  };
  
  // Handle bet placement (Manual mode)
  const placeBetAction = async () => {
    if (isPlaying || selectedNumbers.length === 0) return;
    
    try {
      setIsPlaying(true);
      setDrawnNumbers([]);
      setMatchedNumbers([]);
      setResult(null);
      
      // Generate a client seed
      const clientSeed = generateClientSeed();
      
      // Attempt to place bet with API, but don't block the demo on API errors
      try {
        await placeBet.mutateAsync({
          gameId: gameInfo.id,
          clientSeed,
          amount: betAmount,
          options: {
            selectedNumbers
          }
        });
      } catch (apiError) {
        console.log("API error (continuing with demo)", apiError);
      }
      
      // Set a mock response for the demo
      const response = { betId: Math.floor(Math.random() * 10000) };
      
      // Store the bet ID from the response
      if (response && typeof response === 'object' && 'betId' in response) {
        currentBetIdRef.current = response.betId as number;
      }
      
      // For Keno, we'll just generate random numbers
      // We're not directly using getGameResult() since we need a specific format
      // This is for demo purposes - in production this would come from a provably fair system
      
      // Draw 10 random numbers from 1-40 (for demo)
      const drawn: number[] = [];
      while (drawn.length < NUMBERS_DRAWN) {
        const num = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
        if (!drawn.includes(num)) {
          drawn.push(num);
        }
      }
      
      // Simulate the drawing of numbers with animation
      const drawAnimation = () => {
        const drawnSoFar: number[] = [];
        
        const interval = setInterval(() => {
          if (drawnSoFar.length >= NUMBERS_DRAWN) {
            clearInterval(interval);
            
            // Calculate matches
            const matches = selectedNumbers.filter(num => drawn.includes(num));
            setMatchedNumbers(matches);
            
            // Calculate payout
            const multiplier = getPayoutMultiplier(selectedNumbers.length, matches.length);
            const payout = betAmount * multiplier;
            const won = payout > 0;
            
            // Set result
            setResult({
              won,
              multiplier,
              payout
            });
            
            // Add to history
            setBetHistory(prev => [
              { 
                multiplier, 
                won
              }, 
              ...prev.slice(0, 9)
            ]);
            
            // Complete the bet
            if (currentBetIdRef.current) {
              try {
                completeBet.mutate({
                  betId: currentBetIdRef.current,
                  outcome: {
                    selectedNumbers,
                    drawnNumbers: drawn,
                    matches: matches.length,
                    multiplier,
                    win: won
                  }
                });
              } catch (error) {
                console.log("API error completing bet (demo continues)", error);
              }
              currentBetIdRef.current = null;
            }
            
            // Game round complete
            setTimeout(() => {
              setIsPlaying(false);
            }, 1000);
            
            return;
          }
          
          const nextNumber = drawn[drawnSoFar.length];
          drawnSoFar.push(nextNumber);
          setDrawnNumbers([...drawnSoFar]);
        }, 200); // Draw a new number every 200ms
      };
      
      // Start animation after a short delay
      setTimeout(drawAnimation, 500);
      
    } catch (error) {
      console.error('Error placing bet:', error);
      setIsPlaying(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#0F212E] text-white overflow-hidden">
      {/* Main Game Container */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side - Controls */}
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
          
          {/* Risk Level */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Risk</div>
            <div className="bg-[#0F212E] p-2 rounded flex items-center">
              <span className="text-white">Medium</span>
              <div className="ml-auto">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>
          
          {/* Quick buttons */}
          <div className="mb-4 flex gap-2">
            {/* Auto Pick Button with 3D effect */}
            <div className="flex-1 relative">
              {/* Shadow below button (3D effect) */}
              <div className="absolute bottom-[-4px] left-0 right-0 h-[4px] bg-black/40 rounded-b-md"></div>
              
              <button 
                onClick={autoPick}
                className="w-full py-2 bg-[#0F212E] hover:bg-[#1A2C3C] rounded text-center text-white font-medium"
                disabled={isPlaying}
              >
                Auto Pick
              </button>
            </div>
            
            {/* Clear Table Button with 3D effect */}
            <div className="flex-1 relative">
              {/* Shadow below button (3D effect) */}
              <div className="absolute bottom-[-4px] left-0 right-0 h-[4px] bg-black/40 rounded-b-md"></div>
              
              <button 
                onClick={clearSelections}
                className="w-full py-2 bg-[#0F212E] hover:bg-[#1A2C3C] rounded text-center text-white font-medium"
                disabled={isPlaying}
              >
                Clear Table
              </button>
            </div>
          </div>
          
          {/* Bet Button with 3D effect */}
          <div className="mb-4 relative">
            {/* Shadow below button (3D effect) */}
            <div className="absolute bottom-[-6px] left-0 right-0 h-[6px] bg-[#277312]/70 rounded-b-md"></div>
            
            <Button 
              className="w-full py-3 text-base font-bold bg-[#5BE12C] hover:bg-[#4CC124] text-black rounded-md"
              onClick={placeBetAction}
              disabled={isPlaying || selectedNumbers.length === 0 || betAmount <= 0}
            >
              {isPlaying ? 'Drawing...' : 'Bet'}
            </Button>
          </div>
          
          {/* Results */}
          {result && (
            <div className="mb-4 p-3 rounded bg-[#0F212E]">
              <div className="text-sm text-gray-400 mb-1">Result</div>
              <div className={`text-lg font-bold ${result.won ? 'text-[#5BE12C]' : 'text-[#FF3B3B]'}`}>
                {result.won ? 'WIN!' : 'LOSS'}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">Matches:</span>
                <span className="text-sm">{matchedNumbers.length}/{selectedNumbers.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">Multiplier:</span>
                <span className="text-sm">{result.multiplier}x</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">Payout:</span>
                <span className="text-sm">{result.payout.toFixed(8)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side - Game Area */}
        <div className="w-full md:w-3/4 p-4 flex flex-col h-full">
          {/* Keno Grid */}
          <div className="flex-grow bg-[#0E1C27] rounded-lg flex items-center justify-center p-2 relative">
            {/* Win Overlay - Only shown when winning */}
            {result?.won && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-[#172B3A] text-[#5BE12C] font-bold text-5xl py-4 px-10 rounded-lg shadow-lg border-4 border-[#5BE12C] flex flex-col items-center">
                  <div className="flex items-center">
                    {result.multiplier.toFixed(2)}x
                  </div>
                  <div className="h-px w-40 bg-gray-600 my-2"></div>
                  <div className="text-2xl flex items-center">
                    <span>{betAmount > 0 ? (betAmount * result.multiplier).toFixed(8) : '0.00000000'}</span> 
                    <span className="ml-1">
                      <span className="inline-flex items-center justify-center w-4 h-4 bg-[#F7931A] rounded-full text-white text-xs">₿</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="w-full max-w-4xl">
              {/* Main Number Grid - 5x8 layout */}
              <div className="grid grid-cols-8 gap-4 mb-4">
                {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => {
                  const isSelected = selectedNumbers.includes(num);
                  const isDrawn = drawnNumbers.includes(num);
                  const isMatched = isDrawn && isSelected;
                  
                  // Colors based on screenshots - reproducing exact styles
                  let bgColor = 'bg-[#172B3A]'; // Default dark blue
                  let textColor = 'text-white';
                  
                  if (isSelected && !isDrawn) {
                    // Purple for selected but not yet drawn
                    bgColor = 'bg-[#9333EA]';
                  } else if (isMatched) {
                    // Green with black text for matched (selected and drawn)
                    bgColor = 'bg-[#5BE12C]';
                    textColor = 'text-[#2A8617]';
                  } else if (isDrawn) {
                    // For drawn but not selected, show it as red text on dark bg
                    bgColor = 'bg-[#172B3A]';
                    textColor = 'text-[#FF3B3B]';
                  }
                  
                  // Border styling for different states
                  let borderClass = '';
                  if (isSelected && !isMatched) {
                    borderClass = 'border-4 border-[#9333EA]';
                  } else if (isMatched) {
                    borderClass = 'border-4 border-[#9333EA]';
                  }
                  
                  return (
                    <div key={num} className="relative">
                      {/* Shadow below button (3D effect) */}
                      <div className="absolute bottom-[-6px] left-0 right-0 h-[6px] bg-black/40 rounded-b-md"></div>
                      
                      {/* Main button */}
                      <button
                        className={`
                          w-full h-full aspect-square rounded-md flex items-center justify-center text-xl font-bold
                          ${bgColor} ${textColor} ${borderClass}
                          ${isPlaying ? 'cursor-not-allowed' : 'cursor-pointer'}
                          ${isMatched ? 'bg-gradient-to-br from-[#5BE12C] to-[#3DA61F]' : ''}
                        `}
                        onClick={() => toggleNumberSelection(num)}
                        disabled={isPlaying}
                      >
                        {num}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Multiplier Displays */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                {/* Creating 3D effect for all multiplier buttons */}
                {[0.00, 0.00, 1.40, 4.00, 14.00, 390.00].map((multiplier, index) => (
                  <div key={index} className="relative">
                    {/* Shadow below button (3D effect) */}
                    <div className="absolute bottom-[-4px] left-0 right-0 h-[4px] bg-black/40 rounded-b-md"></div>
                    
                    {/* Main button */}
                    <div className={`
                      aspect-[3/1] bg-[#172B3A] rounded-md flex items-center justify-center text-center
                      ${result?.multiplier === multiplier ? 'border-2 border-[#5BE12C]' : ''}
                    `}>
                      <span className={`text-sm ${result?.multiplier === multiplier ? 'text-[#5BE12C] font-bold' : ''}`}>
                        {multiplier.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Hits Counter */}
              <div className="grid grid-cols-6 gap-2">
                {/* Adding 3D effect to hit counter buttons */}
                {[0, 1, 2, 3, 4, 5].map((hits) => (
                  <div key={hits} className="relative">
                    {/* Shadow below button (3D effect) */}
                    <div className="absolute bottom-[-4px] left-0 right-0 h-[4px] bg-black/40 rounded-b-md"></div>
                    
                    {/* Main button */}
                    <div className="aspect-[3/1] bg-[#0F212E] rounded-md flex items-center justify-center text-center">
                      <span className="text-xs text-gray-400">{hits}x</span>
                      <div className={`w-3 h-3 ml-1 rounded-full 
                        ${matchedNumbers.length === hits ? 
                          (hits === 0 ? 'bg-white' : 'bg-[#5BE12C]') : 
                          'bg-[#172B3A]'}
                      `}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selection info */}
              <div className="mt-4 text-center text-gray-400 text-sm">
                Select 1-{MAX_SELECTIONS} numbers to play • {selectedNumbers.length} selected
              </div>
            </div>
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

export default Keno;