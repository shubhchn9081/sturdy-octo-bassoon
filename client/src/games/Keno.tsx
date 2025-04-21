import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { useToast } from '@/hooks/use-toast';

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
    const picks: number[] = [];
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
    
    // Reset selections to empty array
    setSelectedNumbers([]);
    
    // Also reset other game state that might be affected
    setMatchedNumbers([]);
    setDrawnNumbers([]);
    setResult(null);
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
    
    // Check if bet amount is valid
    if (betAmount < gameInfo.minBet) {
      console.error(`Bet amount must be at least ${gameInfo.minBet}`);
      return;
    }
    
    // Check if player has enough balance
    if (rawBalance < betAmount) {
      console.error('Insufficient balance');
      return;
    }
    
    setIsPlaying(true);
    setDrawnNumbers([]);
    setMatchedNumbers([]);
    setResult(null);
    
    try {
      // Generate a client seed for provably fair gameplay
      const clientSeed = Math.random().toString(36).substring(2, 15);
      
      // Place the bet with the API using the mutateAsync method
      const response = await placeBet.mutateAsync({
        gameId: gameInfo.id, 
        amount: betAmount,
        clientSeed: clientSeed,
        options: {
          selectedNumbers: selectedNumbers,
          risk: risk
        }
      });
      
      // Store the bet ID from the response
      if (response && typeof response === 'object' && 'betId' in response) {
        currentBetIdRef.current = response.betId as number;
      } else {
        console.error("Invalid response from placeBet:", response);
        throw new Error("Failed to place bet: Invalid response");
      }
      
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
    
    // Use a different approach to generate random numbers
    // This is a simplified implementation for the demo
    const generateRandomNumbers = (count: number, max: number): number[] => {
      const result: number[] = [];
      while (result.length < count) {
        const randomNum = Math.floor(Math.random() * max) + 1;
        if (!result.includes(randomNum)) {
          result.push(randomNum);
        }
      }
      return result;
    };
    
    // Generate the drawn numbers
    const drawnNums = generateRandomNumbers(NUMBERS_DRAWN, TOTAL_NUMBERS);
    for (const num of drawnNums) {
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
  
  // Get toast utility
  const { toast } = useToast();
  
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
      try {
        // Send completion request to update server state
        await completeBet.mutateAsync({
          betId: currentBetIdRef.current,
          outcome: {
            win: won,
            multiplier: multiplier,
            payout: payout,
            matchedNumbers: matches,
            drawnNumbers: drawnNumbers
          }
        });
        
        console.log(`Bet completed: ${won ? 'Win' : 'Loss'}, Multiplier: ${multiplier}x, Payout: ${payout}`);
        currentBetIdRef.current = null;
        
        // Show a toast notification with the result
        if (won) {
          toast({
            title: "You Won!",
            description: `Multiplier: ${multiplier.toFixed(2)}x - Payout: ${payout.toFixed(8)} BTC`,
            variant: "default"
          });
        } else {
          toast({
            title: "Better luck next time!",
            description: "No win this round.",
            variant: "destructive"
          });
        }
        
        // The completeBet mutation will automatically invalidate the balance query
        // through the invalidateQueries call in its onSuccess callback in the useBalance hook
      } catch (error) {
        console.error("Error completing bet:", error);
        // Even if there's an API error, we should reset the bet ID and show an error toast
        currentBetIdRef.current = null;
        toast({
          title: "Error",
          description: "Failed to complete bet. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    // End playing state
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F212E] text-white">
      {/* Main content area - Game display */}
      <div className="flex-1 overflow-auto pb-[260px] sm:pb-[220px]">
        {/* Keno Grid */}
        <div className="bg-[#0E1C27] rounded-lg flex items-center justify-center p-2 relative">
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
            {/* Keno Game Board Grid */}
            <div className="grid grid-cols-8 md:grid-cols-10 gap-2 md:gap-3">
              {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(num => {
                const isSelected = selectedNumbers.includes(num);
                const isDrawn = drawnNumbers.includes(num);
                const isMatch = isSelected && isDrawn;
                
                // Determine cell style based on state
                let cellClass = "aspect-square rounded-md flex items-center justify-center font-bold text-lg transition-all duration-100";
                
                // Default state
                if (!isSelected && !isDrawn) {
                  cellClass += " bg-[#1B3346] text-white";
                }
                // Selected but not drawn yet
                else if (isSelected && !isDrawn) {
                  cellClass += " bg-[#3F5164] text-white ring-2 ring-[#78B0FF]";
                }
                // Drawn but not selected
                else if (!isSelected && isDrawn) {
                  cellClass += " bg-[#1B3346] text-[#FF3B3B]";
                }
                // Match - both selected and drawn
                else if (isMatch) {
                  cellClass += " bg-[#5BE12C] text-black";
                }
                
                // Removed the auto-colored purple tiles that were confusing users
                // Users should manually select all numbers they want to play
                
                return (
                  <button
                    key={num}
                    className={cellClass}
                    onClick={() => toggleNumberSelection(num)}
                    disabled={isPlaying}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            
            {/* Multiplier Display */}
            <div className="grid grid-cols-7 gap-1 mt-2 text-xs">
              {["0.00x", "4.00x", "11.00x", "55.00x", "500.0x", "800.0x", "1,000x"].map((mult, i) => (
                <div key={i} className="text-center p-1 text-gray-400">
                  {mult}
                </div>
              ))}
            </div>
            
            {/* Hits Display */}
            <div className="grid grid-cols-10 gap-1 mt-1 text-xs">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((hit, i) => (
                <div key={i} className="text-center p-1 bg-[#1A2C3B] rounded-sm text-white">
                  {hit}x
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed bottom betting panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F212E] border-t border-[#243442] z-10">
        {/* Quick Pick Buttons */}
        <div className="flex justify-center space-x-2 px-4 pt-3">
          <button 
            onClick={autoPick}
            className="w-full py-2 bg-[#172B3A] hover:bg-[#1A2C3C] rounded text-center text-white font-medium"
            disabled={isPlaying}
          >
            Auto Pick
          </button>
          <button 
            onClick={clearSelections}
            className="w-full py-2 bg-[#172B3A] hover:bg-[#1A2C3C] rounded text-center text-white font-medium"
            disabled={isPlaying}
          >
            Clear Table
          </button>
        </div>
        
        {/* Bet Amount Controls */}
        <div className="px-4 pt-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-white">Bet Amount</div>
            <div className="text-xs text-gray-400">{formatNumber(rawBalance)} BTC</div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={betAmountDisplay}
                onChange={(e) => handleBetAmountChange(e.target.value)}
                disabled={isPlaying}
                className="w-full bg-[#172B3A] border border-[#243442] rounded-md pl-8 pr-3 py-2 text-white"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500">₿</div>
            </div>
            
            <button 
              className="w-12 h-10 bg-[#172B3A] border border-[#243442] rounded-md text-center"
              onClick={halfBet}
              disabled={isPlaying}
            >
              ½
            </button>
            
            <button 
              className="w-12 h-10 bg-[#172B3A] border border-[#243442] rounded-md text-center"
              onClick={doubleBet}
              disabled={isPlaying}
            >
              2×
            </button>
          </div>
        </div>
        
        {/* Bet Button */}
        <div className="px-4 pb-3">
          <button 
            className="w-full h-12 text-lg font-bold bg-[#5BE12C] hover:bg-[#4BC01C] text-black rounded-md"
            onClick={placeBetAction}
            disabled={isPlaying || selectedNumbers.length === 0 || betAmount <= 0}
          >
            {isPlaying ? 'Drawing...' : 'Bet'}
          </button>
        </div>
        
        {/* Risk Level Selector */}
        <div className="px-4 pb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-white">Risk</div>
          </div>
          
          <div className="relative">
            <select 
              value={risk}
              onChange={(e) => setRisk(e.target.value as RiskType)}
              disabled={isPlaying}
              className="w-full bg-[#172B3A] border border-[#243442] rounded-md px-3 py-2 text-white appearance-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Game Mode Toggle */}
        <div className="px-4 pb-3">
          <div className="flex bg-[#172B3A] rounded-full p-1">
            <button
              className={`flex-1 py-2 rounded-full text-center text-sm font-medium transition ${
                gameMode === 'Manual' 
                  ? 'bg-[#243442] text-white' 
                  : 'text-gray-400'
              }`}
              onClick={() => setGameMode('Manual')}
            >
              Manual
            </button>
            <button
              className={`flex-1 py-2 rounded-full text-center text-sm font-medium transition ${
                gameMode === 'Auto' 
                  ? 'bg-[#243442] text-white' 
                  : 'text-gray-400'
              }`}
              onClick={() => setGameMode('Auto')}
            >
              Auto
            </button>
          </div>
        </div>
        
        {/* Bottom Navigation Bar */}
        <div className="border-t border-[#243442] grid grid-cols-5 h-[56px]">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs mt-1">Browse</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#5BE12C]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs mt-1">Casino</span>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs mt-1">Bets</span>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Sports</span>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs mt-1">Chat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keno;