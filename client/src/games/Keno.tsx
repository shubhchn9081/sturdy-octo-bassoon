import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';

// Types for Risk level
type RiskType = 'Low' | 'Medium' | 'High';

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
  const [risk, setRisk] = useState<RiskType>('Medium');
  
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
  
  // Handle bet amount change
  const handleBetAmountChange = (value: string) => {
    if (value === '' || value === '0') {
      setBetAmountDisplay('0.00000000');
      setBetAmount(0);
      return;
    }
    
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    
    // Parse to number and update state
    const numValue = parseFloat(formattedValue);
    if (!isNaN(numValue)) {
      setBetAmountDisplay(formattedValue);
      setBetAmount(numValue);
    }
  };
  
  // Half the bet amount
  const halfBet = () => {
    if (betAmount > 0) {
      const newAmount = betAmount / 2;
      setBetAmount(newAmount);
      setBetAmountDisplay(newAmount.toString());
    }
  };
  
  // Double the bet amount
  const doubleBet = () => {
    if (betAmount > 0) {
      const newAmount = betAmount * 2;
      setBetAmount(newAmount);
      setBetAmountDisplay(newAmount.toString());
    }
  };
  
  // Toggle number selection
  const toggleNumberSelection = (num: number) => {
    if (isPlaying) return;
    
    if (selectedNumbers.includes(num)) {
      // Deselect the number
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      // Check if max selections reached
      if (selectedNumbers.length >= MAX_SELECTIONS) {
        // Could display a message here
        return;
      }
      // Select the number
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };
  
  // Auto-pick random numbers
  const autoPick = () => {
    if (isPlaying) return;
    
    // Clear current selections
    setSelectedNumbers([]);
    
    // Generate random selections
    const picks = [];
    while (picks.length < 5) { // Auto-pick 5 numbers
      const randomNum = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!picks.includes(randomNum)) {
        picks.push(randomNum);
      }
    }
    
    setSelectedNumbers(picks);
  };
  
  // Clear all selections
  const clearSelections = () => {
    if (isPlaying) return;
    setSelectedNumbers([]);
  };
  
  // Get the payout multiplier based on hits
  const getPayoutMultiplier = (selections: number, hits: number): number => {
    // Simplified multiplier calculation - can be adjusted for different risk levels
    const multiplierTable: { [key: string]: number[][] } = {
      'Low': [
        [0, 0, 0, 0, 0, 0], // 0 selections (not valid)
        [0, 2.8, 0, 0, 0, 0], // 1 selection
        [0, 1.4, 5.2, 0, 0, 0], // 2 selections
        [0, 0, 2.2, 42, 0, 0], // 3 selections
        [0, 0, 1.0, 8, 80, 0], // 4 selections
        [0, 0, 0.5, 3, 14, 100], // 5 selections
        [0, 0, 0, 2, 6, 40], // 6 selections
        [0, 0, 0, 1.4, 4, 12], // 7 selections
        [0, 0, 0, 1, 2.7, 8], // 8 selections
        [0, 0, 0, 0.6, 1.8, 5], // 9 selections
        [0, 0, 0, 0.5, 1.3, 3.5] // 10 selections
      ],
      'Medium': [
        [0, 0, 0, 0, 0, 0], // 0 selections (not valid)
        [0, 3.8, 0, 0, 0, 0], // 1 selection
        [0, 1.8, 8.5, 0, 0, 0], // 2 selections
        [0, 0, 2.8, 85, 0, 0], // 3 selections
        [0, 0, 1.5, 12, 120, 0], // 4 selections
        [0, 0, 0.8, 4, 22, 350], // 5 selections
        [0, 0, 0, 3, 9, 55], // 6 selections
        [0, 0, 0, 2, 5, 17], // 7 selections
        [0, 0, 0, 1.5, 3.3, 10], // 8 selections
        [0, 0, 0, 1, 2.3, 6.5], // 9 selections
        [0, 0, 0, 0.8, 1.7, 4.5] // 10 selections
      ],
      'High': [
        [0, 0, 0, 0, 0, 0], // 0 selections
        [0, 5.9, 0, 0, 0, 0], // 1 selection
        [0, 2.2, 16, 0, 0, 0], // 2 selections
        [0, 0, 3.5, 200, 0, 0], // 3 selections
        [0, 0, 1.8, 15, 200, 0], // 4 selections
        [0, 0, 1, 5, 35, 740], // 5 selections
        [0, 0, 0, 3.6, 11, 80], // 6 selections
        [0, 0, 0, 2.5, 6, 22], // 7 selections
        [0, 0, 0, 2, 4, 13], // 8 selections
        [0, 0, 0, 1.4, 2.8, 9], // 9 selections
        [0, 0, 0, 1, 2.1, 6] // 10 selections
      ]
    };
    
    // Return the multiplier or 0 if not found
    if (selections <= 0 || selections > 10 || hits < 0 || hits > 5) {
      return 0;
    }
    
    return multiplierTable[risk][selections][hits] || 0;
  };
  
  // Place a bet and start the draw
  const placeBetAction = async () => {
    if (isPlaying || selectedNumbers.length === 0 || betAmount <= 0) return;
    
    setIsPlaying(true);
    setDrawnNumbers([]);
    setMatchedNumbers([]);
    setResult(null);
    
    try {
      // Actually place the bet
      const betId = await placeBet(betAmount);
      currentBetIdRef.current = betId;
      
      // Simulate drawing process
      await drawNumbers();
      
    } catch (error) {
      console.error('Error placing bet:', error);
      setIsPlaying(false);
    }
  };
  
  // Simulate drawing numbers with animation
  const drawNumbers = async () => {
    // Get provably fair result
    const gameResult = await getGameResult();
    
    // Generate drawn numbers based on provably fair result
    const newDrawnNumbers: number[] = [];
    for (let i = 0; i < NUMBERS_DRAWN; i++) {
      // Use the randomness from the result to generate a number 1-40
      let num: number;
      do {
        num = 1 + Math.floor((gameResult.hashedServerSeed[i % 32].charCodeAt(0) / 255) * TOTAL_NUMBERS);
      } while (newDrawnNumbers.includes(num));
      
      newDrawnNumbers.push(num);
    }
    
    // Draw numbers one by one with animation
    const drawnSequence: number[] = [];
    for (const num of newDrawnNumbers) {
      // Add a small delay for animation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      drawnSequence.push(num);
      setDrawnNumbers([...drawnSequence]);
      
      // Check if it matches any selected number
      if (selectedNumbers.includes(num)) {
        setMatchedNumbers(prev => [...prev, num]);
      }
    }
    
    // Calculate the result
    finalizeResult(newDrawnNumbers);
  };
  
  // Calculate and display the final result
  const finalizeResult = async (drawnNumbers: number[]) => {
    // Calculate matches
    const matches = selectedNumbers.filter(num => drawnNumbers.includes(num));
    
    // Get multiplier based on selections and matches
    const multiplier = getPayoutMultiplier(selectedNumbers.length, matches.length);
    
    // Calculate payout
    const payout = betAmount * multiplier;
    
    // Determine if won
    const won = payout > 0;
    
    // Set the result
    const resultData = {
      won,
      multiplier,
      payout
    };
    
    setResult(resultData);
    
    // Record in bet history
    setBetHistory(prev => [{ multiplier, won }, ...prev].slice(0, 10));
    
    // Complete the bet with the calculated result
    if (currentBetIdRef.current !== null) {
      await completeBet(currentBetIdRef.current, won, payout);
      currentBetIdRef.current = null;
    }
    
    // End playing state
    setIsPlaying(false);
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#0F212E] text-white overflow-hidden">
      {/* Main Game Container */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Right Side - Game Area - Shows first on mobile */}
        <div className="w-full md:w-3/4 p-4 flex flex-col h-full order-first">
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
              {/* Main Number Grid */}
              <div className="grid grid-cols-5 md:grid-cols-8 gap-1 md:gap-4 mb-4">
                {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => {
                  const isSelected = selectedNumbers.includes(num);
                  const isDrawn = drawnNumbers.includes(num);
                  const isMatched = isDrawn && isSelected;
                  
                  let bgColor = 'bg-[#172B3A]';
                  let textColor = 'text-white';
                  
                  if (isSelected) {
                    bgColor = 'bg-white';
                    textColor = 'text-[#172B3A]';
                  }
                  
                  if (isDrawn) {
                    if (isMatched) {
                      bgColor = 'bg-[#5BE12C]';
                      textColor = 'text-black';
                    } else {
                      bgColor = 'bg-[#FF3B3B]';
                      textColor = 'text-white';
                    }
                  }

                  return (
                    <div key={num} className="relative">
                      {/* Shadow below button (3D effect) */}
                      <div className="absolute bottom-[-6px] left-0 right-0 h-[6px] bg-black/40 rounded-b-md"></div>
                      
                      {/* Main button */}
                      <button
                        onClick={() => toggleNumberSelection(num)}
                        disabled={isPlaying}
                        className={`
                          w-full aspect-square rounded-md flex items-center justify-center text-xl font-bold
                          ${bgColor} ${textColor}
                          ${isPlaying ? 'cursor-not-allowed' : 'hover:brightness-110'}
                          transition-all duration-150
                        `}
                      >
                        {num}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Risk Level Display */}
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-4">
                  {['Low', 'Medium', 'High'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRisk(r as RiskType)}
                      className={`
                        py-2 rounded-md font-medium
                        ${risk === r ? 'bg-[#00CC00] text-black' : 'bg-[#172B3A] text-white'}
                      `}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Multiplier Values Display */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((hits) => {
                  const multiplier = getPayoutMultiplier(selectedNumbers.length, hits);
                  const isActive = matchedNumbers.length === hits;
                  const isCompleted = matchedNumbers.length > 0 && matchedNumbers.length >= hits;
                  
                  return (
                    <div
                      key={`multiplier-${hits}`}
                      className={`
                        py-1 px-2 rounded text-center
                        ${isActive ? 'bg-[#5BE12C] text-black' : 'bg-[#172B3A]'}
                        ${isCompleted && !isActive ? 'bg-[#2D4B5A]' : ''}
                      `}
                    >
                      <div className="text-xs">{hits}</div>
                      <div className="font-bold">{multiplier.toFixed(2)}x</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#172B3A] p-2 rounded">
                  <div className="text-xs text-gray-400">Hits</div>
                  <div className="text-xl font-bold">{matchedNumbers.length}/{selectedNumbers.length}</div>
                </div>
                <div className="bg-[#172B3A] p-2 rounded">
                  <div className="text-xs text-gray-400">Win</div>
                  <div className="text-xl font-bold">
                    {result ? result.payout.toFixed(8) : '0.00000000'} <span className="text-yellow-500">₿</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Controls - Shows second on mobile */}
        <div className="w-full md:w-1/4 p-2 bg-[#172B3A] order-last">
          {/* Game Mode Tabs */}
          <div className="flex rounded-md overflow-hidden mb-2 bg-[#0F212E]">
            <button 
              className={`flex-1 py-1 text-center ${gameMode === 'Manual' ? 'bg-[#172B3A]' : ''}`}
              onClick={() => setGameMode('Manual')}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-1 text-center ${gameMode === 'Auto' ? 'bg-[#172B3A]' : ''}`}
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
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#172B3A] border-t border-gray-800 flex justify-around py-2">
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <BrowseIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Browse</span>
        </button>
        <button className="flex flex-col items-center text-green-500">
          <CasinoIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Casino</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <BetsIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Bets</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <SportsIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Sports</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <ChatIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default Keno;