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
      // Enhanced client-side random generation with realistic physics-based trajectories
      
      // Physics constants for ball trajectory
      const BOUNCE_BIAS = 0.52;  // Slight bias to make paths more interesting (0.5 = equal chance left/right)
      const MOMENTUM_FACTOR = 0.3; // How much the previous direction affects the next bounce (0-1)
      const EDGE_REPULSION = 0.7; // Tendency to bounce away from edges (0-1)
      
      const path = [];
      let prevDirection = 0; // Track the previous direction for momentum
      let currentPosition = 1; // Start at the middle of 3 pins
      
      // Log trajectory information to console for debugging
      console.log("Generating path with physics-based trajectory:");
      console.log("BOUNCE_BIAS:", BOUNCE_BIAS, "(higher means more right bounces)");
      console.log("MOMENTUM_FACTOR:", MOMENTUM_FACTOR, "(higher means more tendency to continue same direction)");
      console.log("EDGE_REPULSION:", EDGE_REPULSION, "(higher means more bouncing away from edges)");
      
      for (let i = 0; i < rows; i++) {
        // Each row has (i+3) pins - first row has 3, second has 4, etc.
        const pinsInCurrentRow = i + 3;
        
        if (i === 0) {
          // First position is fixed at the middle pin (index 1 of 3 pins)
          path.push(currentPosition);
          continue;
        }
        
        // Calculate bounce probabilities based on physics factors
        let leftProbability = 1 - BOUNCE_BIAS; // Base probability
        
        // Factor 1: Previous momentum - ball tends to continue in same direction
        if (i > 1) {
          // Calculate previous direction: -1 = left, 0 = same, 1 = right
          const lastDirection = path[i-1] - path[i-2];
          if (lastDirection < 0) {
            // If we went left before, more likely to go left again
            leftProbability += MOMENTUM_FACTOR * 0.12;
          } else if (lastDirection > 0) {
            // If we went right before, less likely to go left (more likely to go right)
            leftProbability -= MOMENTUM_FACTOR * 0.12;
          }
        }
        
        // Factor 2: Edge repulsion - balls near edges tend to bounce inward
        if (currentPosition <= 1) {
          // Near left edge, reduce left probability (more likely to go right)
          leftProbability -= EDGE_REPULSION * 0.2;
        } else if (currentPosition >= pinsInCurrentRow - 2) {
          // Near right edge, increase left probability (more likely to go left)
          leftProbability += EDGE_REPULSION * 0.2;
        }
        
        // Clamp the probability between 0.1 and 0.9 to avoid deterministic paths
        leftProbability = Math.max(0.1, Math.min(0.9, leftProbability));
        
        // Determine direction based on calculated probability
        const direction = Math.random() < leftProbability ? -1 : 1;
        currentPosition += direction;
        
        // Ensure we don't go out of bounds
        currentPosition = Math.max(0, Math.min(currentPosition, pinsInCurrentRow - 1));
        
        // Store the current position in the path
        path.push(currentPosition);
        
        // Store for next iteration
        prevDirection = direction;
        
        if (i % 5 === 0) {
          console.log(`Row ${i+1}: Position=${currentPosition}, Direction=${direction > 0 ? 'Right' : 'Left'}, Probability=${leftProbability.toFixed(2)}`);
        }
      }
      
      return path;
    }
  };
  
  // Enhanced pin impact tracking - track multiple pins with intensity values
  const [hitPins, setHitPins] = useState<{row: number, pin: number, intensity: number}[]>([]);
  
  // Manage the active pin highlight effects
  const updatePinHighlights = (row: number, pin: number) => {
    // Add a new pin highlight with full intensity (1.0)
    const newHitPin = {row, pin, intensity: 1.0};
    
    // Add to the array of hit pins and keep only the 4 most recent ones
    setHitPins(prev => {
      const updated = [...prev, newHitPin];
      // Sort by most recent (higher intensity) first
      return updated.slice(-4);
    });
    
    // Gradually fade out all pin highlights - slower fade for more visible effect
    const fadeInterval = setInterval(() => {
      setHitPins(prev => {
        // Reduce intensity more gradually (only 7% each interval instead of 15%)
        // This makes the pin glow effects last longer and be more noticeable
        const updated = prev.map(pinInfo => ({
          ...pinInfo,
          intensity: pinInfo.intensity * 0.93
        }));
        
        // Remove pins that are no longer visible - lower threshold for longer effect
        const stillVisible = updated.filter(pinInfo => pinInfo.intensity >= 0.05);
        
        // If all pins have faded, clear the interval
        if (stillVisible.length === 0) {
          clearInterval(fadeInterval);
        }
        
        return stillVisible;
      });
    }, 40); // Slightly faster interval (40ms vs 50ms) for smoother animation
  };

  // Generate grid of dots for the plinko board - with proper 3-pin start
  const renderPlinkoGrid = () => {
    const grid = [];
    
    // Helper function to calculate pin highlight effect - enhanced for more visible impact
    const getPinHighlightStyle = (row: number, pin: number) => {
      // Find if this pin is being hit
      const pinInfo = hitPins.find(p => p.row === row && p.pin === pin);
      
      if (pinInfo) {
        // Calculate scale based on intensity - larger maximum scale (1.0 = max scale of 2.5)
        const scale = 1 + (pinInfo.intensity * 1.5);
        
        // Calculate glow color and intensity for more vibrant effect
        const glowIntensity = Math.floor(pinInfo.intensity * 255);
        
        // Create a more visible "shock wave" effect when pins are hit
        return {
          transform: `scale(${scale})`,
          boxShadow: `0 0 ${Math.floor(pinInfo.intensity * 12)}px ${Math.floor(pinInfo.intensity * 6)}px rgba(255, 180, 0, ${pinInfo.intensity})`,
          backgroundColor: `rgba(255, ${155 + glowIntensity}, 0, ${0.9 + pinInfo.intensity * 0.1})`,
          // Create bright orange/yellow flash effect that matches the ball
          border: pinInfo.intensity > 0.7 ? '1px solid rgba(255, 255, 200, 0.8)' : 'none',
          zIndex: 10
        };
      }
      
      return {};
    };
    
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
            className="w-2 h-2 bg-white rounded-full transition-all duration-150"
            style={getPinHighlightStyle(0, p)}
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
            className="w-2 h-2 bg-white rounded-full transition-all duration-150"
            style={getPinHighlightStyle(r, p)}
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
        // Physics constants
        // More realistic physics-focused animation with better smoothness
        const GRAVITY = 9.8;               // Gravitational constant (m/s²) - standard value
        const INITIAL_VELOCITY = 0.2;      // Starting velocity (m/s) - slight initial push
        const DISTANCE_BETWEEN_ROWS = 21;  // Pixel distance between rows
        const PIXEL_TO_METER_RATIO = 100;  // Conversion ratio (pixels per meter)
        const FRICTION_COEFFICIENT = 0.85; // More realistic friction - higher value means less slowdown
        const TIME_SCALING = 3.5;          // Moderate time scaling for natural speed
        
        // Start with a slight pause before dropping
        await new Promise(resolve => setTimeout(resolve, 350));
        
        // Calculate time for a ball to fall between rows using physics
        // Formula: t = sqrt(2 * distance / gravity)
        let currentVelocity = INITIAL_VELOCITY;
        let totalDistance = 0;
        
        // Log information about ball speed
        console.log("Starting ball drop with physics simulation:");
        console.log("Initial velocity:", INITIAL_VELOCITY, "m/s");
        console.log("Gravity constant:", GRAVITY, "m/s²");
        console.log("Time scaling factor:", TIME_SCALING, "x (higher = slower animation)");
        
        for (let i = 0; i < path.length; i++) {
          // Distance calculation (in meters)
          const distance = DISTANCE_BETWEEN_ROWS / PIXEL_TO_METER_RATIO; 
          totalDistance += distance;
          
          // Physics time calculation using gravity equation
          // t = sqrt(2*d/g) where d is distance and g is gravity
          // For realistic peg bouncing, we add the previous velocity
          currentVelocity += Math.sqrt(2 * GRAVITY * distance);
          
          // Apply friction at each peg collision
          currentVelocity *= FRICTION_COEFFICIENT;
          
          // Convert the physics time to milliseconds and scale for animation
          // Higher TIME_SCALING makes the animation slower
          const timeToFall = (distance / currentVelocity) * 1000 * TIME_SCALING;
          
          // Use realistic delay values that prioritize smoothness
          // Faster animation that feels more like real-world physics
          // Min 120ms (faster), max 300ms (much faster than before)
          const delay = Math.max(120, Math.min(300, timeToFall));
          
          if (i % 5 === 0) {
            console.log(`Row ${i+1} - Fall speed: ${currentVelocity.toFixed(2)} m/s, Delay: ${delay.toFixed(0)}ms`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Show impact on the pin that the ball hits (enhanced version)
          // Calculate which pin is being hit
          if (i > 0) {
            // Create a pin impact effect - the current row and position
            const currentRow = i;
            const currentPin = path[i];
            
            // Use the enhanced pin highlight system
            updatePinHighlights(currentRow, currentPin);
            
            // Also add a small random sideways "nudge" to the ball to create the illusion
            // that the pins are affecting its trajectory
            if (i < path.length - 1) {
              const directionChange = path[i+1] - path[i];
              
              // First move the ball slightly in the direction it's heading
              // This creates an illusion that the pin is pushing the ball in that direction
              setBalls(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                  // Add a small visual offset in the direction of movement
                  // This doesn't affect the actual path but makes the animation look more physical
                  const visualOffset = directionChange * 0.4; // 40% of the full distance
                  
                  updated[0] = {
                    ...updated[0],
                    position: path[i] + visualOffset, // Offset position creates bounce illusion
                    row: i + 0.8, // Slightly above the actual row position 
                    currentStep: i
                  };
                }
                return updated;
              });
              
              // No delay needed here - the physics-based nudge is enough
              // The short pause is removed to make animation more fluid
            }
          }
          
          // Update the ball position with a simplified animation approach
          // Removed the complex bluffing effect to improve performance
          setBalls(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[0] = {
                ...updated[0],
                position: path[i], // Direct position without bluffing
                row: i + 1,
                currentStep: i
              };
            }
            return updated;
          });
          
          // No extra delay - we're prioritizing smooth motion over additional pauses
          // This makes the animation flow naturally with physics-based timing only
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
                className="absolute top-0 left-1/2 w-4 h-4 bg-[#ff6f03] rounded-full z-10 shadow-lg"
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
                  // Simplified transition with fewer properties for better performance
                  type: "tween", // Changed from "spring" to "tween" for smoother performance
                  duration: 0.3, // Short duration for responsive movement
                  ease: "easeOut", // Simple easing function
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
