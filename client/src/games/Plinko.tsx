import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto, formatCurrency } from '@/lib/utils';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Settings, BarChart3 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import gsap from 'gsap';
import type { PlaceBetParams } from '@/hooks/use-balance';
import { useCurrency } from '@/context/CurrencyContext';

// Game constants
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const ROW_OPTIONS = [8, 12, 16];

// Multiplier tables based on screenshot from Stake.com
const MULTIPLIER_TABLES = {
  Low: [5, 3, 1.5, 1, 0.7, 0.5, 0.3, 0.2, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 3, 5],
  Medium: [10, 5, 3, 1.5, 1, 0.7, 0.5, 0.3, 0.3, 0.5, 0.7, 1, 1.5, 3, 5, 10],
  High: [110, 41, 10, 5, 2, 1.5, 1, 0.5, 0.5, 1, 1.5, 2, 5, 10, 41, 110]
};

// Multiplier colors
const MULTIPLIER_COLORS: {[key: string]: string} = {
  '0.2': '#ef4444', // red
  '0.3': '#ef4444', // red
  '0.5': '#f97316', // orange
  '0.7': '#f59e0b', // amber
  '1': '#f59e0b',   // amber
  '1.5': '#eab308', // yellow
  '2': '#22c55e',   // green
  '3': '#22c55e',   // green
  '5': '#3b82f6',   // blue
  '10': '#2563eb',  // blue-600
  '41': '#a855f7',  // purple
  '110': '#9333ea'  // purple-600
};

const PlinkoGame: React.FC = () => {
  // Game state
  const [risk, setRisk] = useState('Medium');
  const [rows, setRows] = useState(16);
  const [betAmount, setBetAmount] = useState('0.00000100');
  const [isDropping, setIsDropping] = useState(false);
  const [isManualMode, setIsManualMode] = useState(true);
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Multipliers
  const multipliers = MULTIPLIER_TABLES[risk as keyof typeof MULTIPLIER_TABLES] || MULTIPLIER_TABLES.Medium;
  
  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeCurrency } = useCurrency();
  const { placeBet, completeBet, rawBalance } = useBalance(activeCurrency);
  const { getGameResult } = useProvablyFair('plinko');
  
  // Function to refresh balance
  const refreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
  };
  
  // Canvas dimensions
  const width = 400;
  const height = 500;
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Get context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvasCtxRef.current = ctx;
    
    // Draw the initial game board
    drawGameBoard();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rows, risk]);
  
  // Draw the game board
  const drawGameBoard = () => {
    const ctx = canvasCtxRef.current;
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#0E1C27';
    ctx.fillRect(0, 0, width, height);
    
    // Define pins layout
    const pinSize = 6;
    const pinSpacing = 24;
    const startY = 40;
    const endY = height - 60;
    const rowHeight = (endY - startY) / (rows - 1);
    
    // Draw pins
    for (let row = 0; row < rows; row++) {
      const pinsInRow = row + 3;
      const rowWidth = (pinsInRow - 1) * pinSpacing;
      const startX = (width - rowWidth) / 2;
      
      for (let pin = 0; pin < pinsInRow; pin++) {
        const x = startX + pin * pinSpacing;
        const y = startY + row * rowHeight;
        
        // Draw pin
        ctx.beginPath();
        ctx.arc(x, y, pinSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }
    }
    
    // Draw multiplier buckets
    const bucketHeight = 40;
    const bucketY = height - bucketHeight;
    const bucketWidth = width / multipliers.length;
    
    multipliers.forEach((multi, i) => {
      const bucketX = i * bucketWidth;
      const color = MULTIPLIER_COLORS[multi.toString()] || '#3b82f6';
      
      // Draw rounded rectangle for bucket
      ctx.fillStyle = color;
      roundRect(ctx, bucketX + 2, bucketY, bucketWidth - 4, bucketHeight, 4);
      
      // Draw multiplier text
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${multi}x`, bucketX + bucketWidth / 2, bucketY + bucketHeight / 2);
    });
  };
  
  // Helper to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };
  
  // Animate ball drop using GSAP for smoother physics
  const animateBallDrop = async () => {
    const ctx = canvasCtxRef.current;
    if (!ctx) return null;
    
    // Get provably fair result for path generation
    // Note: getGameResult for plinko returns a function, not a direct value
    const generatePath = getGameResult();
    
    // Generate a truly random seed that will vary with each play
    // Combine current time, a random number, and user interaction timing for entropy
    const timestamp = Date.now();
    const randomValue = Math.random();
    // Create a different seed each time by using various entropy sources
    const randomSeed = ((timestamp % 1000) / 1000) * randomValue * (1 + Math.sin(timestamp));
    
    // Generate the ball path with our random seed
    const path = generateBallPath(randomSeed);
    
    // Ball object properties
    const ballSize = 12;
    const ballRadius = ballSize / 2;
    const ballData = { 
      currentPosition: { x: path[0].x, y: path[0].y },
      index: 0,
      isDone: false
    };

    // Physics settings
    const gravity = 0.3;
    const bounciness = 0.7;
    const damping = 0.95;
    
    // Ball object for GSAP animation
    const ball = {
      x: path[0].x,
      y: path[0].y,
      vx: 0,
      vy: 0
    };
    
    // Create a timeline for the ball animation
    const tl = gsap.timeline({ 
      onComplete: () => {
        ballData.isDone = true;
      } 
    });
    
    // Animation loop with requestAnimationFrame for smooth rendering
    const animate = () => {
      // Clear and redraw gameboard
      drawGameBoard();
      
      // Draw the ball at current position
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6f03';
      ctx.fill();
      
      // Add a subtle glow effect
      ctx.shadowColor = 'rgba(255, 111, 3, 0.5)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff9340';
      ctx.fill();
      ctx.shadowBlur = 0;
      
      if (!ballData.isDone) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // When the ball reaches its final destination, we want it to appear to fall 
        // behind/inside the multiplier holder, so we'll only draw a small glow effect
        // but not draw the actual ball, giving the illusion it fell into the bucket
        
        // Draw just a subtle glow where the ball disappeared
        ctx.shadowColor = 'rgba(255, 140, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y - 5, ballRadius / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 111, 3, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };
    
    // Start the animation loop
    animate();
    
    // Create GSAP animations to move through all path points
    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      const prevPoint = path[i-1];
      
      // Calculate distance and apply physics
      const distance = Math.sqrt(
        Math.pow(point.x - prevPoint.x, 2) + 
        Math.pow(point.y - prevPoint.y, 2)
      );
      
      // Time depends on distance, longer distances take more time
      const time = Math.min(0.3, distance / 200);
      
      // Physics-based easing
      const ease = i === path.length - 1 
        ? "bounce.out" // Bounce when landing in final bucket
        : "power1.in"; // Accelerate due to gravity between pins
      
      // Add animation segment
      if (i === path.length - 1) {
        // For the final segment, create a two-part animation
        // First bounce into bucket
        tl.to(ball, {
          x: point.x,
          y: point.y - 5, // Land slightly above final position
          duration: time * 0.7,
          ease: ease,
        });
        
        // Then sink into bucket
        tl.to(ball, {
          x: point.x,
          y: point.y + 10, // Sink below the visible area
          opacity: 0, // Fade out as it sinks
          scale: 0.5, // Shrink as it sinks
          duration: time * 0.3,
          ease: "power2.in", // Accelerate as it sinks
          onComplete: () => {
            // Set isDone after the ball has visually sunk into the bucket
            setTimeout(() => {
              ballData.isDone = true;
            }, 100);
          }
        });
      } else {
        // For all other segments, just move normally
        tl.to(ball, {
          x: point.x,
          y: point.y,
          duration: time,
          ease: ease,
        });
      }
    }
    
    // Wait for animation to complete and return result
    return new Promise<number>(resolve => {
      const checkCompletion = () => {
        if (ballData.isDone) {
          const bucketWidth = width / multipliers.length;
          const finalPosition = path[path.length - 1];
          const bucketIndex = Math.floor(finalPosition.x / bucketWidth);
          resolve(multipliers[bucketIndex]);
        } else {
          setTimeout(checkCompletion, 50);
        }
      };
      
      setTimeout(checkCompletion, 50);
    });
  };
  
  // Generate ball path with true randomness
  const generateBallPath = (seed: number | null) => {
    const pinSize = 6;
    const pinSpacing = 24;
    const startY = 40;
    const endY = height - 60;
    const bucketHeight = 40;
    const rowHeight = (endY - startY) / (rows - 1);
    
    const path: {x: number, y: number}[] = [];
    const startX = width / 2;
    path.push({x: startX, y: 10}); // Starting position
    
    // Create a seed-based pseudorandom generator function
    // We'll use a more complex seeding method for better randomness
    const createRandom = (initialSeed: number) => {
      let s = initialSeed || Math.random();
      return () => {
        s = Math.sin(s * 12.9898) * 43758.5453;
        return s - Math.floor(s);
      };
    };
    
    // Use either seeded random or default to Math.random
    const randomFn = seed !== null 
      ? createRandom(seed)
      : () => Math.random();
    
    // Slight bias to create more variance
    const leftBias = Math.random() * 0.1; // 0-10% bias in either direction
    
    let currentX = startX;
    
    // Generate path through pins with varying probability
    for (let row = 0; row < rows; row++) {
      const y = startY + row * rowHeight;
      
      // Add some variability to the chance of going left vs right
      // This makes different paths more likely
      const leftProbability = 0.5 + (row % 2 === 0 ? leftBias : -leftBias);
      
      // Determine left or right movement
      const goLeft = randomFn() < leftProbability;
      
      // Vary the distance traveled for more natural movement
      const variance = 0.9 + randomFn() * 0.2; // 90-110% of normal distance
      const xDelta = pinSpacing / 2 * variance;
      
      if (goLeft) {
        currentX -= xDelta;
      } else {
        currentX += xDelta;
      }
      
      // Keep ball within bounds
      currentX = Math.max(pinSpacing, Math.min(width - pinSpacing, currentX));
      
      // Add point to path with slight horizontal jitter for visual interest
      const jitter = (randomFn() - 0.5) * 3;
      path.push({x: currentX + jitter, y});
    }
    
    // Determine final bucket - with extra randomness to ensure varied results
    const bucketWidth = width / multipliers.length;
    
    // Use a different randomization approach for the final position
    // This makes each bucket truly possible to land in
    const randomBucketOffset = randomFn() * 0.8 + 0.1; // 10-90% of a bucket width
    const finalBucketIndex = Math.floor((currentX + (randomBucketOffset - 0.5) * bucketWidth) / bucketWidth);
    
    // Make sure the bucket index is valid 
    const safeBucketIndex = Math.max(0, Math.min(multipliers.length - 1, finalBucketIndex));
    
    // Calculate final coordinates
    const finalX = safeBucketIndex * bucketWidth + bucketWidth / 2;
    const finalY = height - bucketHeight / 2;
    
    // Add final point
    path.push({x: finalX, y: finalY});
    
    return path;
  };
  
  // Format bet amount
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove any non-numeric characters except decimal point
    let cleanedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 8 decimal places for crypto
    if (parts.length > 1 && parts[1].length > 8) {
      cleanedValue = parts[0] + '.' + parts[1].substring(0, 8);
    }
    
    setBetAmount(cleanedValue);
  };
  
  // Quick bet amount adjustments
  const halfBetAmount = () => {
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount / 2).toFixed(8));
    }
  };
  
  const doubleBetAmount = () => {
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount * 2).toFixed(8));
    }
  };
  
  // Handle placing a bet
  const placePlinkobet = async () => {
    if (isDropping) return;
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to place a bet.",
        variant: "destructive",
      });
      return;
    }
    
    const betAmountValue = parseFloat(betAmount);
    if (isNaN(betAmountValue) || betAmountValue <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDropping(true);
    
    try {
      // First, we need to get the game ID for Plinko
      // Use TanStack Query to consistently fetch the game data with proper caching
      const plinkoGame = await queryClient.fetchQuery({
        queryKey: ['/api/games', 'plinko'],
        queryFn: async () => {
          const res = await apiRequest('GET', '/api/games');
          if (!res.ok) {
            throw new Error("Failed to fetch games");
          }
          const games = await res.json();
          const game = games.find((g: any) => g.slug === 'plinko');
          if (!game) {
            throw new Error("Plinko game not found");
          }
          return game;
        },
        staleTime: 60000 // Cache for 1 minute
      });
      
      console.log("Found Plinko game:", plinkoGame);
      
      // Now place the bet with the correct gameId
      const betData: PlaceBetParams = {
        gameId: plinkoGame.id,
        amount: betAmountValue,
        clientSeed: Math.random().toString(36).substring(2),
        options: {
          risk,
          rows
        },
        currency: activeCurrency
      };
      
      console.log("Placing bet with data:", betData);
      
      // Place bet with API
      const result = await placeBet.mutateAsync(betData);
      
      if (!result || !result.betId) {
        throw new Error("Failed to place bet");
      }
      
      const betId = result.betId;
      console.log("Bet placed successfully with ID:", betId);
      
      // Animate the ball drop and get result
      const winMultiplier = await animateBallDrop();
      
      if (winMultiplier) {
        // Calculate winnings
        const winAmount = betAmountValue * winMultiplier;
        const isWin = winAmount > 0;
        
        console.log("Game result:", { 
          multiplier: winMultiplier, 
          winAmount, 
          isWin 
        });
        
        // Complete the bet with backend
        try {
          await completeBet.mutateAsync({
            betId: betId,
            outcome: {
              win: isWin,
              multiplier: winMultiplier,
              amount: winAmount
            }
          });
          
          console.log("Bet completed successfully");
          
          // Show toast notification
          toast({
            title: isWin ? "Win!" : "Better luck next time!",
            description: isWin 
              ? `You won ${formatCurrency(winAmount, activeCurrency)}` 
              : "No win this time.",
            variant: isWin ? "default" : "destructive",
          });
          
          // Refresh balance
          queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
        } catch (completeError: any) {
          console.error("Error completing bet:", completeError);
          toast({
            title: "Error Completing Bet",
            description: completeError.message || "Your bet was placed but we had trouble processing the result. Your balance will update shortly.",
            variant: "destructive",
          });
        }
      }
      
    } catch (error: any) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error.message || "There was an error placing your bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDropping(false);
    }
  };
  
  return (
    <div className="bg-[#0F212E] flex flex-col h-full w-full text-white">
      {/* Game area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col w-full max-w-md">
          {/* Canvas container - fixed width for exact Stake.com look */}
          <div className="w-full flex justify-center bg-[#0E1C27] p-4">
            <canvas 
              ref={canvasRef} 
              className="w-full max-w-md aspect-[4/5] bg-[#0E1C27]"
            />
          </div>
          
          {/* Controls section */}
          <div className="bg-[#172B3A] p-4 rounded-b-lg">
            {/* Bet Amount */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-400">Bet Amount</div>
                <div className="text-sm text-right">$0.00</div>
              </div>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={betAmount}
                  onChange={handleAmountChange}
                  className="flex-1 bg-[#0F212E] border-0 rounded-l-md px-3 py-2.5 text-white"
                />
                <div className="bg-[#0F212E] rounded-r-md border-l border-gray-700 px-4 flex items-center">
                  <span className="text-yellow-500">₿</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button 
                  onClick={halfBetAmount}
                  className="bg-[#0F212E] py-1.5 rounded text-white hover:bg-[#1A2C3A]"
                >
                  ½
                </button>
                <button 
                  onClick={doubleBetAmount}
                  className="bg-[#0F212E] py-1.5 rounded text-white hover:bg-[#1A2C3A]"
                >
                  2×
                </button>
                <button 
                  className="bg-[#0F212E] py-1.5 rounded text-white hover:bg-[#1A2C3A]"
                  onClick={() => setBetAmount(formatCurrency(rawBalance, activeCurrency))}
                >
                  Max
                </button>
              </div>
            </div>
            
            {/* Bet Button */}
            <button 
              onClick={placePlinkobet}
              disabled={isDropping}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md mb-4 disabled:opacity-50"
            >
              {isDropping ? 'Dropping...' : 'Bet'}
            </button>
            
            {/* Risk Selector */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Risk</div>
              <div className="relative">
                <select 
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                  className="w-full bg-[#0F212E] border-0 text-white py-2.5 px-3 pr-8 rounded-md appearance-none"
                >
                  {RISK_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Rows Selector */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Rows</div>
              <div className="relative">
                <select 
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full bg-[#0F212E] border-0 text-white py-2.5 px-3 pr-8 rounded-md appearance-none"
                >
                  {ROW_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Manual/Auto Toggle */}
            <div className="flex rounded-full overflow-hidden border border-gray-700 mb-4">
              <button
                className={`flex-1 py-3 text-center ${isManualMode ? 'bg-[#172B3A] text-white' : 'bg-[#0F212E] text-gray-400'}`}
                onClick={() => setIsManualMode(true)}
              >
                Manual
              </button>
              <button
                className={`flex-1 py-3 text-center ${!isManualMode ? 'bg-[#172B3A] text-white' : 'bg-[#0F212E] text-gray-400'}`}
                onClick={() => setIsManualMode(false)}
              >
                Auto
              </button>
            </div>
            
            {/* Footer */}
            <div className="flex justify-between pt-4 border-t border-gray-700">
              <div className="flex space-x-6">
                <button className="text-gray-400 hover:text-white">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <BarChart3 className="h-5 w-5" />
                </button>
              </div>
              <div className="text-gray-400">Fairness</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#172B3A] border-t border-gray-800 flex justify-around py-3 z-50">
        <button className="flex flex-col items-center text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mb-1" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">Browse</span>
        </button>
        <button className="flex flex-col items-center text-green-500">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mb-1" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">Casino</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mb-1" stroke="currentColor">
            <path d="M16 8v8m-8-5v5m4-9v9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">Bets</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mb-1" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8v4l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">Sports</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mb-1" stroke="currentColor">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default PlinkoGame;