import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBalance } from '@/hooks/use-balance';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gsap } from 'gsap';
import BettingPanel from './components/slots/BettingPanel';
import SlotMachine from './components/slots/SlotMachine';
import GameRules from './components/slots/GameRules';

// Type definitions
type SpinResult = {
  reels: number[];
  multiplier: number;
  win: boolean;
  winAmount: number;
  luckyNumberHit?: boolean;
};

// Main Slots component
const Slots = () => {
  const provablyFair = useProvablyFair("slots");
  const { balance, refetch: refreshBalance } = useBalance();
  const { toast } = useToast();
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [spinResults, setSpinResults] = useState<SpinResult | null>(null);
  const [reelValues, setReelValues] = useState<number[]>([0, 0, 0]);
  const [error, setError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<SpinResult[]>([]);
  const [luckyNumber, setLuckyNumber] = useState<number>(7); // Default lucky number is 7
  
  // Handle spin button click
  const handleSpin = async () => {
    if (isSpinning) return;
    
    // Validate bet amount
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    if (betAmount > Number(balance)) {
      setError('Insufficient balance');
      return;
    }
    
    setError(null);
    setIsSpinning(true);
    setSpinResults(null);
    
    try {
      // Generate seeds for provably fair gameplay
      const clientSeed = Math.random().toString(36).substring(2, 15);
      
      // Make bet API request to slots-specific endpoint
      const response = await fetch('/api/slots/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId: 9, // Slots game ID
          amount: betAmount,
          clientSeed,
          luckyNumber, // Include the player's lucky number
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bet');
      }
      
      const result = await response.json();
      
      // Extract reel values from the result
      const newReels: number[] = result.outcome.reels || [0, 0, 0];
      
      // Start spinning animation
      await animateReels(newReels);
      
      // Set results after animation completes
      const spinResult: SpinResult = {
        reels: newReels,
        multiplier: result.multiplier || 0,
        win: result.profit > 0,
        winAmount: result.profit > 0 ? result.profit : 0,
        luckyNumberHit: result.luckyNumberHit || false
      };
      
      setSpinResults(spinResult);
      setGameHistory(prev => [spinResult, ...prev].slice(0, 10));
      
      // Refresh balance after spin
      if (typeof refreshBalance === 'function') {
        refreshBalance();
      } else {
        // Fallback: refresh the page to get updated balance
        setTimeout(() => window.location.reload(), 2000);
      }
      
      // Notify user of result
      if (spinResult.win) {
        if (spinResult.luckyNumberHit) {
          toast({
            title: "Jackpot! Lucky Number Hit!",
            description: `Your lucky number ${luckyNumber} appeared! You won ${spinResult.winAmount.toFixed(2)} INR with a ${spinResult.multiplier}x multiplier!`,
            variant: "default"
          });
        } else {
          toast({
            title: "You won!",
            description: `You won ${spinResult.winAmount.toFixed(2)} INR with a ${spinResult.multiplier}x multiplier!`,
            variant: "default"
          });
        }
      }
      
      // Continue auto spin if enabled after a delay
      if (autoSpin && !error) {
        setTimeout(() => {
          setIsSpinning(false);
          if (autoSpin) handleSpin();
        }, 2000);
      } else {
        setIsSpinning(false);
      }
      
    } catch (err: any) {
      console.error('Error placing bet:', err);
      setError(err.message || 'Failed to place bet');
      setIsSpinning(false);
      toast({
        title: "Error",
        description: err.message || 'Failed to place bet',
        variant: "destructive"
      });
    }
  };
  
  // Animate slot machine reels with staggered stopping
  const animateReels = async (finalValues: number[]) => {
    return new Promise<void>((resolve) => {
      // Create temporary values array for animation
      let tempValues = [...reelValues];
      
      // Define animation durations for each reel
      const spinDurations = [1000, 1500, 2000]; // First reel stops first, last reel stops last
      
      // Spin animation for each reel with staggered stopping
      for (let i = 0; i < 3; i++) {
        // Start rapid number changes to simulate spinning
        const spinInterval = setInterval(() => {
          tempValues = [...tempValues];
          tempValues[i] = Math.floor(Math.random() * 10);
          setReelValues(tempValues);
        }, 100);
        
        // After the spin duration, stop this reel on its final value
        setTimeout(() => {
          clearInterval(spinInterval);
          tempValues = [...tempValues];
          tempValues[i] = finalValues[i];
          setReelValues(tempValues);
          
          // When last reel stops, resolve the promise
          if (i === 2) {
            setTimeout(resolve, 500); // Give a moment to see the final result
          }
        }, spinDurations[i]);
      }
    });
  };
  
  // Stop auto spin
  const stopAutoSpin = () => {
    setAutoSpin(false);
  };
  
  // Clear error messages
  const clearError = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F212E] text-white">
      <div className="flex-1 overflow-auto pb-[420px] sm:pb-[300px] md:pb-[260px]">
        <div className="bg-[#0E1C27] rounded-lg p-4 mx-auto max-w-4xl">
          {/* Main slot machine component */}
          <SlotMachine 
            reelValues={reelValues} 
            isSpinning={isSpinning} 
            spinResults={spinResults}
            luckyNumber={luckyNumber}
          />
          
          {/* Game information and history tabs */}
          <div className="mt-6">
            <Tabs defaultValue="rules">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rules" className="mt-4">
                <GameRules />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <div className="space-y-2">
                  {gameHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No game history yet</p>
                  ) : (
                    gameHistory.map((result, index) => (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center p-2 rounded ${
                          result.win ? 'bg-green-950/30 border border-green-800/50' : 'bg-red-950/30 border border-red-800/50'
                        }`}
                      >
                        <div className="flex space-x-2">
                          {result.reels.map((num, i) => (
                            <div key={i} className="w-8 h-8 flex items-center justify-center bg-[#172B3A] rounded-md font-bold">
                              {num}
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <div className={result.win ? 'text-green-500' : 'text-red-500'}>
                            {result.win ? `+${result.winAmount.toFixed(2)}` : `-${betAmount.toFixed(2)}`}
                          </div>
                          {result.win && (
                            <div className="text-xs">
                              <span className="text-green-400">{result.multiplier}x</span>
                              {result.luckyNumberHit && 
                                <span className="ml-2 text-amber-400 font-bold">Lucky Number Hit!</span>
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Betting panel fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E1C27] border-t border-[#1D2F3D] p-4">
        <BettingPanel
          balance={balance}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          onSpin={handleSpin}
          isSpinning={isSpinning}
          autoSpin={autoSpin}
          setAutoSpin={setAutoSpin}
          stopAutoSpin={stopAutoSpin}
          error={error}
          clearError={clearError}
          spinResults={spinResults}
          luckyNumber={luckyNumber}
          setLuckyNumber={setLuckyNumber}
        />
      </div>
    </div>
  );
};

export default Slots;