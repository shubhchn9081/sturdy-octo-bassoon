import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBalance } from '@/hooks/use-balance';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { gsap } from 'gsap';

// Type definitions
export type SpinResult = {
  reels: (number | string)[];
  multiplier: number;
  win: boolean;
  winAmount: number;
  luckyNumberHit?: boolean;
};

export type SlotSymbol = string | number;

export type SlotConfiguration = {
  name: string;
  theme: string;
  description: string;
  symbols: SlotSymbol[];
  payouts: {
    combination: SlotSymbol[];
    multiplier: number;
    description: string;
  }[];
  specialSymbols?: {
    symbol: SlotSymbol;
    name: string;
    description: string;
    multiplier?: number;
  }[];
  maxMultiplier: number;
  luckySymbol?: SlotSymbol;
  luckyMultiplier?: number;
  reelCount: number;
};

export type BaseSlotGameProps = {
  config: SlotConfiguration;
  gameId: number;
  customStyles?: {
    container?: React.CSSProperties;
    reelsContainer?: React.CSSProperties;
    reel?: React.CSSProperties;
    symbol?: React.CSSProperties;
    controls?: React.CSSProperties;
    button?: React.CSSProperties;
  };
};

// Base Slot Game component that specific slot implementations will extend
const BaseSlotGame: React.FC<BaseSlotGameProps> = ({ config, gameId, customStyles = {} }) => {
  const provablyFair = useProvablyFair(`slots-${config.name.toLowerCase().replace(/\\s+/g, '-')}`);
  const { balance, rawBalance, refetch: refreshBalance } = useBalance("INR");
  const { toast } = useToast();
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(1); // Default bet amount to match our presets
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [spinResults, setSpinResults] = useState<SpinResult | null>(null);
  const [reelValues, setReelValues] = useState<SlotSymbol[]>(Array(config.reelCount).fill(0));
  const [error, setError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<SpinResult[]>([]);
  const [luckySymbol, setLuckySymbol] = useState<SlotSymbol>(config.luckySymbol || 7); // Default lucky symbol
  
  // Handle spin button click
  const handleSpin = async () => {
    if (isSpinning) return;
    
    // Validate bet amount
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    // Use rawBalance for the comparison since it's a number
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
          gameId: gameId, // Slot game ID
          amount: betAmount,
          clientSeed,
          luckySymbol, // Include the player's lucky number
          theme: config.theme
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bet');
      }
      
      const result = await response.json();
      
      // Extract reel values from the result
      const newReels: SlotSymbol[] = result.outcome.reels || Array(config.reelCount).fill(0);
      
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
            title: `Jackpot! Lucky Symbol Hit!`,
            description: `Your lucky symbol ${luckySymbol} appeared! You won ${spinResult.winAmount.toFixed(2)} INR with a ${spinResult.multiplier}x multiplier!`,
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
  const animateReels = async (finalValues: SlotSymbol[]) => {
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
      for (let i = 0; i < config.reelCount; i++) {
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
            // Update the values with a random symbol
            tempValues = [...tempValues];
            const randomSymbolIndex = Math.floor(Math.random() * config.symbols.length);
            tempValues[i] = config.symbols[randomSymbolIndex];
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
            const randomSymbolIndex = Math.floor(Math.random() * config.symbols.length);
            tempValues[i] = config.symbols[randomSymbolIndex];
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
              if (i === config.reelCount - 1) {
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
          
        }, spinDurations[Math.min(i, spinDurations.length - 1)] - 400); // Start slowing down a bit before the duration ends
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

  // Render themed slot symbols
  const renderSymbol = (symbol: SlotSymbol) => {
    const isSpecial = config.specialSymbols?.some(spec => spec.symbol === symbol);
    const isLucky = symbol === luckySymbol;
    
    return (
      <div 
        className={`
          flex items-center justify-center text-4xl font-bold
          ${isSpecial ? 'text-yellow-300' : ''}
          ${isLucky ? 'text-amber-500' : ''}
        `}
        style={customStyles.symbol}
      >
        {symbol}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0F212E] text-white" style={customStyles.container}>
      {/* Game Content Area */}
      <div className="mx-auto w-full max-w-md flex flex-col h-full overflow-auto pb-0">
        {/* Slots title and description */}
        <div className="text-center pt-6 pb-2">
          <h2 className="text-3xl font-bold">{config.name}</h2>
          <p className="text-sm text-blue-300">{config.description}</p>
        </div>
        
        {/* Slot reels display */}
        <div className="p-2 mb-2">
          <div 
            className="bg-[#0A1520] p-4 rounded-md border border-[#2A3F51] mb-4 relative overflow-hidden"
            style={customStyles.reelsContainer}
          >
            <div className="flex justify-center items-center space-x-4">
              {reelValues.map((value, index) => (
                <div 
                  key={index}
                  className={`slot-reel-${index} w-24 h-24 flex items-center justify-center text-5xl font-bold rounded-md ${
                    isSpinning ? 'bg-[#0E1C27]' : 'bg-[#162431] border border-[#2C3E4C]'
                  }`}
                  style={customStyles.reel}
                >
                  {renderSymbol(value)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Multiplier display */}
          <div className="grid grid-cols-3 gap-3 bg-transparent">
            {config.payouts.slice(0, 3).map((payout, index) => (
              <div key={index} className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
                <div className="text-xs text-blue-300">{payout.description}</div>
                <div className="font-bold">{payout.multiplier}×</div>
              </div>
            ))}
          </div>
          
          {/* Lucky symbol reminder */}
          <div className="text-center text-sm mt-4 mb-8">
            Your lucky symbol is {luckySymbol} ({config.luckyMultiplier || 10}× win if it appears!)
          </div>
        </div>
      </div>
      
      {/* Controls Section */}
      <div className="bg-[#0E1C27] border-t border-[#1D2F3D] mt-auto" style={customStyles.controls}>
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
            
            {/* Lucky Symbol Selection */}
            <div className="mb-2">
              <div className="mb-2">Lucky Symbol ({config.luckyMultiplier || 10}× Win!)</div>
              <div className="grid grid-cols-5 gap-1">
                {config.symbols.slice(0, 10).map((symbol, i) => (
                  <Button
                    key={i}
                    variant={luckySymbol === symbol ? "secondary" : "outline"}
                    className={`${
                      luckySymbol === symbol 
                        ? 'bg-amber-700 text-amber-200 hover:bg-amber-600' 
                        : 'bg-[#162431]'
                    }`}
                    onClick={() => setLuckySymbol(symbol)}
                    disabled={isSpinning}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Spin Button */}
            <Button
              variant="default"
              className={`
                w-full h-14 text-xl font-bold 
                bg-[#57fba2] text-black hover:bg-[#4ae090] 
                rounded-lg mt-4
                transition-all duration-200 ease-in-out
                relative overflow-hidden
                ${isSpinning ? 'shadow-[0_0_15px_rgba(87,251,162,0.7)]' : 'hover:shadow-[0_0_15px_rgba(87,251,162,0.8)]'}
              `}
              onClick={autoSpin ? stopAutoSpin : handleSpin}
              disabled={isSpinning}
              style={{
                ...customStyles.button,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                boxShadow: isSpinning ? 
                  '0 0 20px rgba(87,251,162,0.6), inset 0 0 10px rgba(255,255,255,0.3)' : 
                  '0 6px 0 #3dd985, 0 8px 10px rgba(0,0,0,0.3)',
                transform: isSpinning ? 'translateY(3px)' : 'none',
                backgroundImage: !isSpinning && !autoSpin ? 
                  'linear-gradient(45deg, #57fba2 0%, #6dffb8 40%, #57fba2 60%, #57fba2 100%)' : 
                  'none',
                backgroundSize: !isSpinning && !autoSpin ? '200% auto' : '100%'
              }}
            >
              {isSpinning ? 
                <div className="flex items-center justify-center">
                  <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                  <span>Spinning...</span>
                </div> : 
                autoSpin ? 'Stop Auto' : 'Spin'
              }
            </Button>
            
            {/* Error display */}
            {error && (
              <div className="mt-4 bg-red-900/30 border border-red-800 rounded-md p-3 flex items-start">
                <AlertTriangle className="text-red-500 mr-2 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-500 font-medium">Error</p>
                  <p className="text-sm text-red-400">{error}</p>
                  <Button 
                    variant="link" 
                    className="text-red-400 hover:text-red-300 p-0 h-auto text-xs mt-1"
                    onClick={clearError}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseSlotGame;