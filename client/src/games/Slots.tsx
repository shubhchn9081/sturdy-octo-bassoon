import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBalance } from '@/hooks/use-balance';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { gsap } from 'gsap';
import SlotMachine from './components/slots/SlotMachine';

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
  const { balance, rawBalance, refetch: refreshBalance } = useBalance("INR");
  const { toast } = useToast();
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(100); // Default bet amount to match our presets
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
    
    if (betAmount > rawBalance) {
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
  
  // Animate slot machine reels with staggered stopping and improved visual effects
  const animateReels = async (finalValues: number[]) => {
    return new Promise<void>((resolve) => {
      // Create temporary values array for animation
      let tempValues = [...reelValues];
      
      // Define animation durations for each reel - longer for more dramatic effect
      const spinDurations = [1500, 2200, 2800]; // First reel stops first, last reel stops last
      
      // Create audio context for slot sound (if enabled in the browser)
      let slotSound: HTMLAudioElement | null = null;
      try {
        slotSound = new Audio();
        slotSound.volume = 0.3;
        slotSound.loop = true;
      } catch (e) {
        console.warn("Audio not supported in this browser");
      }
      
      // Start the slot machine sound
      if (slotSound) {
        slotSound.play().catch(err => console.warn("Could not play audio", err));
      }
      
      // Animation speed varies during the animation for more realistic effect
      const animationIntervals = [
        { duration: 60, count: 10 },  // Fast at start
        { duration: 80, count: 15 },  // Slightly slower
        { duration: 120, count: 10 }, // Even slower near the end
      ];
      
      // Spin animation for each reel with staggered stopping and varying speeds
      for (let i = 0; i < 3; i++) {
        let intervalIndex = 0;
        let currentInterval: NodeJS.Timeout | null = null;
        let count = 0;
        
        // Function to create the next interval with different timing
        const createNextInterval = () => {
          const config = animationIntervals[intervalIndex];
          
          // Clear any existing interval
          if (currentInterval) clearInterval(currentInterval);
          
          // Create a new interval with the current speed
          currentInterval = setInterval(() => {
            // Update the values with a random number
            tempValues = [...tempValues];
            tempValues[i] = Math.floor(Math.random() * 10);
            setReelValues(tempValues);
            
            count++;
            
            // Move to next interval configuration after enough iterations
            if (count >= config.count && intervalIndex < animationIntervals.length - 1) {
              intervalIndex++;
              count = 0;
              createNextInterval();
            }
          }, animationIntervals[intervalIndex].duration);
        };
        
        // Start the first interval for this reel
        createNextInterval();
        
        // After the main spin duration, add a "slowing down" effect before stopping
        setTimeout(() => {
          // Clear the current interval
          if (currentInterval) clearInterval(currentInterval);
          
          // Create a final slowing down effect
          let slowDownInterval = 150;
          let slowDownCount = 0;
          const finalSlowDown = setInterval(() => {
            tempValues = [...tempValues];
            tempValues[i] = Math.floor(Math.random() * 10);
            setReelValues(tempValues);
            
            slowDownCount++;
            // Gradually increase the interval to simulate slowing down
            if (slowDownCount >= 3) {
              clearInterval(finalSlowDown);
              
              // Set the final value with a visible "snap" effect using GSAP
              tempValues = [...tempValues];
              tempValues[i] = finalValues[i];
              setReelValues(tempValues);
              
              // Apply a small bounce effect to the final value for a more satisfying stop
              const reelElements = document.querySelectorAll(`.slot-reel-${i}`);
              if (reelElements.length > 0) {
                gsap.fromTo(
                  reelElements[0], 
                  { y: -10, opacity: 0.7 }, 
                  { y: 0, opacity: 1, duration: 0.3, ease: "bounce.out" }
                );
              }
              
              // When the last reel stops, resolve the promise and stop the sound
              if (i === 2) {
                if (slotSound) {
                  // Fade out the sound
                  const fadeOutInterval = setInterval(() => {
                    if (slotSound && slotSound.volume > 0.05) {
                      slotSound.volume -= 0.05;
                    } else {
                      clearInterval(fadeOutInterval);
                      if (slotSound) slotSound.pause();
                    }
                  }, 50);
                }
                
                // Delay the resolve to allow for the bounce effect to complete
                setTimeout(resolve, 600);
              }
            }
          }, slowDownInterval);
          
        }, spinDurations[i] - 400); // Start slowing down a bit before the duration ends
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
      {/* Game Content Area */}
      <div className="mx-auto w-full max-w-md flex flex-col h-full overflow-auto pb-0">
        {/* Slots title and description */}
        <div className="text-center pt-6 pb-2">
          <h2 className="text-3xl font-bold">SLOTS</h2>
          <p className="text-sm text-blue-300">Win up to 10× your bet!</p>
        </div>
        
        {/* Slot reels display */}
        <div className="p-2 mb-2">
          <div className="bg-[#0A1520] p-4 rounded-md border border-[#2A3F51] mb-4 relative overflow-hidden">
            <div className="flex justify-center items-center space-x-4">
              {reelValues.map((value, index) => (
                <div 
                  key={index}
                  className={`w-24 h-24 flex items-center justify-center text-5xl font-bold rounded-md ${
                    isSpinning ? 'bg-[#0E1C27]' : 'bg-[#162431] border border-[#2C3E4C]'
                  }`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
          
          {/* Multiplier display */}
          <div className="grid grid-cols-3 gap-3 bg-transparent">
            <div className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
              <div className="text-xs text-blue-300">3 of 7s</div>
              <div className="font-bold">10×</div>
            </div>
            <div className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
              <div className="text-xs text-blue-300">3 Same</div>
              <div className="font-bold">5×</div>
            </div>
            <div className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
              <div className="text-xs text-blue-300">Sequence</div>
              <div className="font-bold">3×</div>
            </div>
          </div>
          
          {/* Lucky number reminder */}
          <div className="text-center text-sm mt-4 mb-8">
            Your lucky number is {luckyNumber} (10× win if it appears!)
          </div>
        </div>
        
        {/* Copyright notice */}
        <div className="text-center text-xs text-gray-500 mt-auto mb-2">
          © 2025 Novito.in | All Rights Reserved.
        </div>
      </div>
      
      {/* Controls Section - matching reference image */}
      <div className="bg-[#0E1C27] border-t border-[#1D2F3D] mt-auto">
        <div className="max-w-md mx-auto">
          {/* Bet Amount Section */}
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <span>Bet Amount</span>
              <div className="flex items-center">
                <span className="mr-2">Auto</span>
                <Switch
                  id="autoSpin"
                  checked={autoSpin}
                  onCheckedChange={(checked) => setAutoSpin(checked)}
                  disabled={isSpinning}
                />
              </div>
            </div>
            
            <Input
              id="betAmount"
              type="number"
              min="100"
              step="100"
              value={betAmount.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBetAmount(parseFloat(e.target.value) || 100)}
              className="w-full mb-2"
              disabled={isSpinning}
            />
            
            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[100, 500, 1000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => setBetAmount(amount)}
                  disabled={isSpinning}
                >
                  {amount}
                </Button>
              ))}
            </div>
            
            {/* Lucky Number Selection */}
            <div className="mb-2">
              <div className="mb-2">Lucky Number (10× Win!)</div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <Button
                    key={i}
                    variant={luckyNumber === i ? "secondary" : "outline"}
                    className={`${
                      luckyNumber === i 
                        ? 'bg-amber-700 text-amber-200 hover:bg-amber-600' 
                        : 'bg-[#162431]'
                    }`}
                    onClick={() => setLuckyNumber(i)}
                    disabled={isSpinning}
                  >
                    {i}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Spin Button */}
            <Button
              variant="default"
              className="w-full h-14 text-xl font-bold bg-purple-700 hover:bg-purple-600 rounded-lg shadow-lg mt-2"
              onClick={autoSpin ? stopAutoSpin : handleSpin}
              disabled={isSpinning || parseFloat(balance) < betAmount}
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                  Spinning...
                </>
              ) : autoSpin ? (
                'STOP AUTO SPIN'
              ) : (
                'SPIN'
              )}
            </Button>
            
            {parseFloat(balance) < betAmount && (
              <p className="text-xs text-red-500 flex items-center justify-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Insufficient balance
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slots;