import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RISK_LEVELS = ['Low', 'Medium', 'High'];
const ROW_OPTIONS = [8, 12, 16]; // From screenshot

// Multiplier tables based on screenshot from Stake.com
const MULTIPLIER_TABLES = {
  Low: [5, 3, 1.5, 1, 0.7, 0.5, 0.3, 0.2, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 3, 5],
  Medium: [10, 5, 3, 1.5, 1, 0.7, 0.5, 0.3, 0.3, 0.5, 0.7, 1, 1.5, 3, 5, 10],
  High: [110, 41, 10, 5, 2, 1.5, 1, 0.5, 0.5, 1, 1.5, 2, 5, 10, 41, 110]
};

// Colors for multipliers based on screenshot exactly
const MULTIPLIER_COLORS: Record<string, string> = {
  '0.2': 'bg-red-600', 
  '0.3': 'bg-red-500',
  '0.5': 'bg-orange-500',
  '0.7': 'bg-amber-500',
  '1': 'bg-amber-500',
  '1.5': 'bg-yellow-500',
  '2': 'bg-green-500',
  '3': 'bg-green-500',
  '5': 'bg-emerald-500',
  '10': 'bg-sky-500',
  '41': 'bg-blue-500',
  '110': 'bg-purple-500'
};

type BallState = {
  position: number;
  row: number;
  done: boolean;
  finalMultiplier: number | null;
  path: number[];
  currentStep: number;
};

const PlinkoGame = () => {
  const { getGameResult } = useProvablyFair('plinko');
  const { balance, placeBet } = useBalance();
  const boardRef = useRef<HTMLDivElement>(null);
  
  const [gameMode, setGameMode] = useState('Manual');
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [risk, setRisk] = useState('Medium');
  const [rows, setRows] = useState(16);
  const [balls, setBalls] = useState<BallState[]>([]);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  // Calculate the multipliers based on risk level
  const multipliers = useMemo(() => {
    return MULTIPLIER_TABLES[risk as keyof typeof MULTIPLIER_TABLES] || MULTIPLIER_TABLES.Medium;
  }, [risk]);
  
  const handleBetAmountChange = (value: string) => {
    if (playing) return;
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    if (playing) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount((amount / 2).toFixed(8));
  };
  
  const handleDoubleBet = () => {
    if (playing) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount((amount * 2).toFixed(8));
  };
  
  const handleRiskChange = (value: string) => {
    if (playing) return;
    setRisk(value);
  };
  
  const handleRowsChange = (value: string) => {
    if (playing) return;
    setRows(parseInt(value));
  };
  
  // Function to generate a provably fair path - updated for 3 pins at top
  const generatePath = (rows: number): number[] => {
    const result = getGameResult();
    
    if (typeof result === 'function') {
      // Use provably fair algorithm if available
      // The provably fair function needs a total slots parameter (rows + 1)
      // because the bottom row has one more slot than pins in the last row
      const rawPath = result(rows + 1, rows);
      
      // Transform the raw path to work with our 3-pin start grid
      // We start at position 1 (middle of 3 pins) and adjust from there
      const adjustedPath = [];
      let currentPosition = 1; // Middle pin of first row (3 pins)
      
      for (let i = 0; i < rawPath.length; i++) {
        // Each position is relative to the previous position plus the direction
        const direction = rawPath[i] > currentPosition ? 1 : (rawPath[i] < currentPosition ? -1 : 0);
        currentPosition += direction;
        
        // Ensure we don't go out of bounds
        const pinsInCurrentRow = i + 3; // First row has 3 pins, then 4, 5, etc.
        currentPosition = Math.max(0, Math.min(currentPosition, pinsInCurrentRow - 1));
        
        adjustedPath.push(currentPosition);
      }
      
      return adjustedPath;
    } else {
      // Fallback to simple random algorithm for simulation
      const path = [];
      let currentPosition = 1; // Start at the middle of 3 pins
      
      for (let i = 0; i < rows; i++) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        currentPosition += direction;
        
        // Ensure we don't go out of bounds - each row has (i+3) pins
        const pinsInCurrentRow = i + 3; // First row has 3 pins, then 4, 5, etc.
        currentPosition = Math.max(0, Math.min(currentPosition, pinsInCurrentRow - 1));
        
        path.push(currentPosition);
      }
      
      return path;
    }
  };
  
  // State to track which pin was most recently hit for impact effect
  const [lastHitPin, setLastHitPin] = useState<{row: number, pin: number} | null>(null);

  // Generate grid of dots for the plinko board - with proper 3-pin start
  const renderPlinkoGrid = () => {
    const grid = [];
    
    // First row should have 3 pins (matching stake.com and real Plinko)
    // Add the first row with exactly 3 pins
    grid.push(
      <div 
        key="row-0" 
        className="flex justify-center"
        style={{ gap: '21px' }}
      >
        {[0, 1, 2].map(p => (
          <div 
            key={`pin-0-${p}`} 
            className={`w-2 h-2 bg-white rounded-full transition-all duration-150
                       ${lastHitPin && lastHitPin.row === 0 && lastHitPin.pin === p 
                         ? 'scale-[1.7] opacity-80' : ''}`}
          />
        ))}
      </div>
    );
    
    // Generate the rest of the rows (starting from the second row)
    for (let r = 1; r < 16; r++) {
      const pins = [];
      // Each row increases by 1 pin (starting from 4 in the second row)
      const pinsInRow = r + 3; 
      
      // Add pins (dots) to each row
      for (let p = 0; p < pinsInRow; p++) {
        pins.push(
          <div 
            key={`pin-${r}-${p}`} 
            className={`w-2 h-2 bg-white rounded-full transition-all duration-150
                       ${lastHitPin && lastHitPin.row === r && lastHitPin.pin === p 
                         ? 'scale-[1.7] opacity-80' : ''}`}
          />
        );
      }
      
      // Add row to grid - gap matches the screenshot spacing
      grid.push(
        <div 
          key={`row-${r}`} 
          className="flex justify-center"
          style={{ gap: '21px' }}
        >
          {pins}
        </div>
      );
    }
    
    return grid;
  };
  
  // Handle the bet action
  const handleBet = async () => {
    if (playing) return;
    
    setPlaying(true);
    setResult(null);
    
    try {
      // Generate the ball path using provably fair algorithm
      const path = generatePath(rows);
      
      // Create a new ball with its path - centered at top with the 3 pegs
      const newBall: BallState = {
        position: 1, // Position over the middle peg of the 3 initial pegs
        row: 0,
        done: false,
        finalMultiplier: null,
        path,
        currentStep: 0
      };
      
      setBalls([newBall]);
      
      // Animate the ball dropping with improved physics and realistic timing
      const animateBall = async () => {
        // Use much slower timing with realistic physics
        // The first drops are slower, then it gradually accelerates
        const baseDelay = 220; // Increased base delay for slower animation (was 120)
        
        // Start with a slight pause before dropping
        await new Promise(resolve => setTimeout(resolve, 400));
        
        for (let i = 0; i < path.length; i++) {
          // Calculate delay based on row - ball moves gradually faster as it falls
          // But keep a minimum delay to ensure it's not too fast
          const delay = Math.max(140, baseDelay - (i * 4)); 
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Show impact on the pin that the ball hits
          // Calculate which pin is being hit
          if (i > 0) {
            // Create a pin impact effect - the current row and position
            const currentRow = i;
            const currentPin = path[i];
            
            // Set the lastHitPin to create the visual impact effect
            setLastHitPin({ row: currentRow, pin: currentPin });
            
            // Clear the impact effect after a short delay
            setTimeout(() => {
              setLastHitPin(null);
            }, 100);
          }
          
          // Update the ball position with easing and bluffing
          setBalls(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              // Add some "bluffing" to the ball trajectory
              // We'll show an intermediate position where the ball appears to bounce
              // off the peg in a slightly exaggerated way before settling
              
              const bluffPosition = i > 0 ? 
                // Exaggerate the direction change for more realistic bouncing
                path[i] + (path[i] - path[i-1]) * 0.4 : 
                path[i];
              
              updated[0] = {
                ...updated[0],
                position: bluffPosition, // Slightly overshoot for bounce effect
                row: i + 1,
                currentStep: i
              };
            }
            return updated;
          });
          
          // Add a small delay and then adjust to the actual position
          // This creates the "bounce and settle" effect
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 70)); // Longer delay for more effect
            
            // Correct the position after the bluff bounce
            setBalls(prev => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[0] = {
                  ...updated[0],
                  position: path[i], // Actual final position
                };
              }
              return updated;
            });
          }
        }
        
        // Set final result
        const finalPosition = path[path.length - 1];
        const finalMultiplier = multipliers[finalPosition];
        
        // Update ball state to show it's done
        setBalls(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[0] = {
              ...updated[0],
              done: true,
              finalMultiplier
            };
          }
          return updated;
        });
        
        // Set and display the result
        setResult(finalMultiplier);
        
        // Let the ball sit for a moment after landing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fade out the ball after landing
        setBalls(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[0] = {
              ...updated[0],
              done: true,
              finalMultiplier,
              // This will trigger a transition in the ball's opacity
              position: -999 // Move it offscreen to fade out
            };
          }
          return updated;
        });
      };
      
      await animateBall();
      
    } catch (error) {
      console.error('Error playing Plinko:', error);
    } finally {
      // Longer delay before resetting to allow animations to complete
      setTimeout(() => {
        setPlaying(false);
        setBalls([]);
        // Don't clear the result after game is over
      }, 1500);
    }
  };
  
  // Renders the manual controls - exactly matching screenshot
  const renderManualControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Bet Amount</label>
        <div className="flex items-center space-x-1 mb-1">
          <div className="relative flex-1">
            <Input
              type="text"
              value={betAmount}
              onChange={(e) => handleBetAmountChange(e.target.value)}
              className="bg-[#243442] border-none text-white h-9 text-sm pr-8 w-full"
              disabled={playing}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-500">⊙</span>
          </div>
          <Button 
            onClick={handleHalfBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border border-[#243442] text-white h-9 px-2 min-w-[40px]"
            disabled={playing}
          >
            ½
          </Button>
          <Button 
            onClick={handleDoubleBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border border-[#243442] text-white h-9 px-2 min-w-[40px]"
            disabled={playing}
          >
            2×
          </Button>
        </div>
        
        <div className="text-xs text-right text-gray-400 mt-1">$0.00</div>
      </div>
      
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Risk</label>
        <Select 
          value={risk} 
          onValueChange={handleRiskChange}
          disabled={playing}
        >
          <SelectTrigger className="w-full bg-[#243442] border-none text-white h-9 text-sm">
            <SelectValue placeholder="Select risk level" />
          </SelectTrigger>
          <SelectContent>
            {RISK_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Rows</label>
        <Select 
          value={rows.toString()} 
          onValueChange={handleRowsChange}
          disabled={playing}
        >
          <SelectTrigger className="w-full bg-[#243442] border-none text-white h-9 text-sm">
            <SelectValue placeholder="Select rows" />
          </SelectTrigger>
          <SelectContent>
            {ROW_OPTIONS.map((rowOption) => (
              <SelectItem key={rowOption} value={rowOption.toString()}>
                {rowOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Bet Button - matching screenshot */}
      <Button
        className="w-full bg-[#7bfa4c] hover:bg-[#6ae43d] text-black font-semibold h-12 mt-2"
        onClick={handleBet}
        disabled={playing}
      >
        {playing ? 'Rolling...' : 'Bet'}
      </Button>

      {/* Results Display Panel */}
      {result !== null && (
        <div className={`mt-6 p-3 rounded-md ${
          result >= 1 ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Result:</span>
            <span className={`text-lg font-bold ${
              result >= 1 ? 'text-green-400' : 'text-red-400'
            }`}>
              {result}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profit:</span>
            <span className={`text-lg font-bold ${
              result >= 1 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(parseFloat(betAmount) * result).toFixed(8)} ⊙
            </span>
          </div>
        </div>
      )}
    </div>
  );
  
  // Renders the auto controls
  const renderAutoControls = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Auto mode is coming soon</div>
    </div>
  );
  
  return (
    <div className="flex flex-col lg:flex-row w-full bg-[#0F212E] text-white h-[calc(100vh-60px)]">
      {/* Side Panel - exact width from screenshot */}
      <div className="w-full lg:w-[240px] p-4 bg-[#172B3A] border-r border-[#243442]/50">
        <Tabs defaultValue="Manual" className="w-full" onValueChange={(v) => setGameMode(v)}>
          <TabsList className="w-full grid grid-cols-2 bg-[#0F212E] mb-4 h-10 overflow-hidden rounded-none p-0">
            <TabsTrigger 
              value="Manual" 
              className="h-full rounded-none text-sm data-[state=active]:bg-[#172B3A] data-[state=active]:text-white"
            >
              Manual
            </TabsTrigger>
            <TabsTrigger 
              value="Auto" 
              className="h-full rounded-none text-sm data-[state=active]:bg-[#172B3A] data-[state=active]:text-white"
            >
              Auto
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="Manual" className="mt-0">
            {renderManualControls()}
          </TabsContent>
          
          <TabsContent value="Auto" className="mt-0">
            {renderAutoControls()}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Game Area - matches screenshot layout */}
      <div className="flex-1 flex justify-center items-center overflow-auto bg-[#0F212E]">
        <div className="w-full flex justify-center items-center">
          {/* Plinko Board */}
          <div 
            ref={boardRef} 
            className="relative flex flex-col space-y-3 py-4"
          >
            {/* Pins Grid */}
            <div className="space-y-3">
              {renderPlinkoGrid()}
            </div>
            
            {/* Ball Animation - improved with transitions and fade out */}
            {balls.map((ball, index) => (
              <motion.div
                key={`ball-${index}`}
                className="absolute top-0 left-1/2 w-4 h-4 bg-white rounded-full z-10 shadow-lg"
                initial={{ translateX: "-50%", translateY: 0, opacity: 1 }}
                animate={{
                  translateX: ball.position === -999 
                    ? `-50%` // Final position offscreen
                    : `calc(-50% + ${(ball.position - 1) * 21}px)`, // Adjusted for 3-pin start (middle is 1)
                  translateY: ball.position === -999 
                    ? ball.row * 21 // Stay in same row before fading
                    : ball.row * 21, // Match the grid spacing
                  opacity: ball.position === -999 ? 0 : 1, // Fade out when position is -999
                  scale: ball.done ? 1.2 : 1 // Slight impact animation when done
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 180, // Lower stiffness for more bounce (was 300)
                  damping: 15,    // Lower damping for more oscillation (was 20)
                  mass: 1.2,      // Add more mass for heavier feeling ball
                  velocity: 10,   // Add initial velocity for more dynamic movement
                  bounce: 0.5,    // Add bounce factor for more realism
                  opacity: { duration: 0.5 }, // Slow fade out
                  scale: { duration: 0.3 } // Quick impact scaling
                }}
              />
            ))}
            
            {/* Multiplier Buckets - with animation for winning multiplier */}
            <div className="flex justify-between mt-6">
              {multipliers.map((multi, idx) => {
                // Check if this is the winning multiplier
                const isWinningMultiplier = result === multi && balls.length > 0 && balls[0].done;
                
                return (
                  <motion.div 
                    key={`multi-${idx}`} 
                    className={`${MULTIPLIER_COLORS[multi.toString()] || 'bg-blue-500'} 
                                text-white text-xs font-semibold py-1 px-1.5 rounded text-center min-w-[28px] mx-0.5
                                ${isWinningMultiplier ? 'relative z-20' : ''}`}
                    animate={isWinningMultiplier ? {
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 0 rgba(255, 255, 255, 0)',
                        '0 0 20px rgba(255, 255, 255, 0.5)',
                        '0 0 0 rgba(255, 255, 255, 0)'
                      ]
                    } : {}}
                    transition={isWinningMultiplier ? { 
                      duration: 1.5, 
                      repeat: 2,
                      repeatType: 'loop'
                    } : {}}
                  >
                    {multi}x
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
