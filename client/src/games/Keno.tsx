import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  
  // No need for mobile controls references or toggle functions anymore
  // since we're using a fixed panel at the bottom

  return (
    <div className="flex flex-col h-screen w-full bg-[#0F212E] text-white overflow-y-auto">
      {/* Main Game Container */}
      <div className="flex flex-col md:flex-row h-full pb-20 md:pb-0">
        {/* Game Header with Back Button */}
        <div className="w-full p-2 bg-[#172B3A] md:hidden">
          <div className="flex items-center justify-between">
            <button onClick={() => window.history.back()} className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Keno</h1>
            <div className="w-6"></div> {/* For balance */}
          </div>
        </div>
        
        {/* Fixed Bottom Bet Panel for Mobile */}
        <div className="fixed bottom-12 left-0 right-0 px-4 py-3 bg-[#0F171E] border-t border-[#243442] z-20 md:hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex flex-col justify-center flex-grow">
              <div className="text-xs text-gray-400 font-medium mb-0.5">Bet Amount</div>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={betAmountDisplay}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  className="bg-transparent border-none text-white outline-none text-lg font-bold w-full"
                />
              </div>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={halfBet}
                className="h-9 px-3 bg-[#1A262F] text-white hover:bg-[#243442] rounded text-sm font-medium"
              >
                ½
              </button>
              <button 
                onClick={doubleBet}
                className="h-9 px-3 bg-[#1A262F] text-white hover:bg-[#243442] rounded text-sm font-medium"
              >
                2×
              </button>
            </div>
          </div>
          <Button 
            className="w-full h-12 text-lg font-bold bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-md transition-colors"
            onClick={placeBetAction}
            disabled={isPlaying || selectedNumbers.length === 0 || betAmount <= 0}
          >
            {isPlaying ? 'Drawing...' : 'Bet'}
          </Button>
        </div>
        
        {/* Right Side - Game Area - Shows first on mobile */}
        <div className="w-full md:w-3/4 p-2 md:p-4 flex flex-col h-full order-first">
          {/* Compact Game Stats for Mobile */}
          <div className="md:hidden bg-gradient-to-r from-[#192B3A] to-[#222B36] p-3 rounded-lg flex justify-between mb-3 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 font-medium">Bet</div>
              <div className="font-bold text-sm text-white">{betAmount.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 font-medium">Numbers</div>
              <div className="font-bold text-sm text-white">{selectedNumbers.length}/10</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 font-medium">Hits</div>
              <div className="font-bold text-sm text-white">{matchedNumbers.length}/{selectedNumbers.length}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-300 font-medium">Win</div>
              <div className="font-bold text-sm text-[#5BE12C]">{result ? result.payout.toFixed(2) : '0.00'}</div>
            </div>
          </div>

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
              {/* Result Display - Shown when playing/winning */}
              {result?.won && (
                <div className="w-full max-w-[240px] mx-auto mb-6 bg-[#162129] border-2 border-[#00FF00] rounded-lg p-4 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                  <div className="text-[#00FF00] text-center text-3xl font-bold mb-2">
                    {result.multiplier.toFixed(2)}x
                  </div>
                  <div className="h-px w-full bg-[#1E3048] my-2"></div>
                  <div className="text-[#00FF00] text-center text-xl font-semibold flex items-center justify-center">
                    <span className="text-[#00FF00]">${(betAmount * result.multiplier).toFixed(2)}</span>
                  </div>
                </div>
              )}
            
              {/* Main Number Grid */}
              <div className="grid grid-cols-8 gap-1.5 mb-6">
                {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => {
                  const isSelected = selectedNumbers.includes(num);
                  const isDrawn = drawnNumbers.includes(num);
                  const isMatched = isDrawn && isSelected;
                  
                  // Apply styling similar to the screenshot
                  let bgColor = 'bg-[#1A262F]'; // Default dark background
                  let borderColor = 'border-[#243442]'; // Default border
                  let textColor = 'text-white';
                  let highlightEffect = '';
                  
                  if (isSelected) {
                    bgColor = 'bg-[#8833FF]'; // Purple for selected
                    borderColor = 'border-[#AA66FF]';
                    textColor = 'text-white';
                    highlightEffect = 'shadow-[0_0_8px_rgba(136,51,255,0.6)]';
                  }
                  
                  if (isDrawn) {
                    if (isMatched) {
                      bgColor = 'bg-[#00FF00]'; // Bright green for matches
                      borderColor = 'border-[#33FF33]';
                      textColor = 'text-black';
                      highlightEffect = 'shadow-[0_0_8px_rgba(0,255,0,0.6)]';
                    } else {
                      bgColor = 'bg-[#FF3333]'; // Red for drawn but not matched
                      borderColor = 'border-[#FF6666]';
                    }
                  }

                  return (
                    <div key={num} className="relative">
                      <button
                        onClick={() => toggleNumberSelection(num)}
                        disabled={isPlaying}
                        className={`
                          w-full aspect-square rounded-md flex items-center justify-center 
                          text-lg font-bold border-2 ${borderColor} ${bgColor} ${textColor}
                          ${highlightEffect}
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
              <div className="mb-2 md:mb-4 md:hidden">
                <div className="grid grid-cols-3 gap-1">
                  {['Low', 'Medium', 'High'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRisk(r as RiskType)}
                      className={`
                        py-1 rounded-md text-sm font-medium
                        ${risk === r ? 'bg-[#00CC00] text-black' : 'bg-[#172B3A] text-white'}
                      `}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Risk Level Display (Desktop) */}
              <div className="mb-4 hidden md:block">
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
              
              {/* Fixed Multiplier Values Display - Row 1 */}
              <div className="grid grid-cols-8 gap-1.5 mb-1.5">
                {[0, 0, 5, 20, 270, 600, 900].map((multiplier, index) => (
                  <div
                    key={`multiplier-row1-${index}`}
                    className="py-1.5 text-center bg-[#1A262F] text-[#8c8c8c] text-xs rounded"
                  >
                    {multiplier > 0 ? `${multiplier}.0×` : "0.00×"}
                  </div>
                ))}
              </div>
              
              {/* Fixed Multiplier Values Display - Row 2 */}
              <div className="grid grid-cols-8 gap-1.5 mb-6">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((hits, index) => (
                  <div
                    key={`hits-row2-${index}`}
                    className="py-1 text-center bg-[#1A262F] text-white text-xs rounded"
                  >
                    {hits}×
                  </div>
                ))}
              </div>
              
              {/* Game Stats - Only on desktop */}
              <div className="hidden md:grid grid-cols-2 gap-2 md:gap-4">
                <div className="bg-[#172B3A] p-2 rounded">
                  <div className="text-xs text-gray-400">Hits</div>
                  <div className="text-lg md:text-xl font-bold">{matchedNumbers.length}/{selectedNumbers.length}</div>
                </div>
                <div className="bg-[#172B3A] p-2 rounded">
                  <div className="text-xs text-gray-400">Win</div>
                  <div className="text-lg md:text-xl font-bold flex items-center">
                    <span className="truncate">{result ? result.payout.toFixed(8) : '0.00000000'}</span> 
                    <span className="text-yellow-500 ml-1 flex-shrink-0">₿</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Controls - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block md:w-1/4 p-2 bg-[#172B3A]">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#172B3A] border-t border-gray-800 flex justify-around py-2 z-10">
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span className="text-xs">Casino</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-xs">Bets</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Support</span>
        </button>
      </div>
    </div>
  );
};

export default Keno;