import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { useToast } from '@/hooks/use-toast';
import { Settings, BarChart3 } from 'lucide-react';

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
  const [currency, setCurrency] = useState('BTC');
  const [isManualMode, setIsManualMode] = useState(true);
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Multipliers
  const multipliers = MULTIPLIER_TABLES[risk as keyof typeof MULTIPLIER_TABLES] || MULTIPLIER_TABLES.Medium;
  
  // Hooks
  const { toast } = useToast();
  const { placeBet, completeBet, rawBalance } = useBalance(currency);
  const { getGameResult } = useProvablyFair('plinko');
  
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
  
  // Animate ball drop
  const animateBallDrop = async () => {
    const ctx = canvasCtxRef.current;
    if (!ctx) return null;
    
    // Get provably fair result for path generation
    const randomSeed = await getGameResult();
    const path = generateBallPath(randomSeed);
    
    // Ball object
    const ballSize = 12;
    let currentIndex = 0;
    let isDone = false;
    
    // Animation loop
    const animate = () => {
      // Clear previous render
      drawGameBoard();
      
      // If we've reached the end, find bucket
      if (currentIndex >= path.length - 1) {
        isDone = true;
        
        // Calculate winning multiplier bucket
        const finalPosition = path[path.length - 1];
        const bucketWidth = width / multipliers.length;
        const bucketIndex = Math.floor(finalPosition.x / bucketWidth);
        const bucketMultiplier = multipliers[bucketIndex];
        
        // Draw ball in final position with glow
        ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(
          finalPosition.x, 
          finalPosition.y, 
          ballSize / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fillStyle = '#ff6f03';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        return bucketMultiplier;
      }
      
      // Get current position
      const pos = path[currentIndex];
      
      // Draw ball
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, ballSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6f03';
      ctx.fill();
      
      // Move to next point
      currentIndex++;
      
      // Continue animation if not done
      if (!isDone) {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(animate);
        }, 100);
      }
    };
    
    // Start animation
    animate();
    
    // Wait for animation to complete and get result
    return new Promise<number>(resolve => {
      const checkCompletion = () => {
        if (isDone) {
          const bucketWidth = width / multipliers.length;
          const finalPosition = path[path.length - 1];
          const bucketIndex = Math.floor(finalPosition.x / bucketWidth);
          resolve(multipliers[bucketIndex]);
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      
      setTimeout(checkCompletion, 100);
    });
  };
  
  // Generate ball path
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
    
    let currentX = startX;
    const random = seed !== null ? () => (seed * 9301 + 49297) % 233280 / 233280 : Math.random;
    
    // Generate path through pins
    for (let row = 0; row < rows; row++) {
      const y = startY + row * rowHeight;
      
      // Determine left or right movement
      const goLeft = random() < 0.5;
      const xDelta = pinSpacing / 2;
      
      if (goLeft) {
        currentX -= xDelta;
      } else {
        currentX += xDelta;
      }
      
      // Keep ball within bounds
      currentX = Math.max(pinSpacing, Math.min(width - pinSpacing, currentX));
      
      // Add point to path
      path.push({x: currentX, y});
    }
    
    // Final position in bucket
    const bucketWidth = width / multipliers.length;
    const bucketIndex = Math.floor(currentX / bucketWidth);
    const finalX = bucketIndex * bucketWidth + bucketWidth / 2;
    const finalY = height - bucketHeight / 2;
    
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
      // Place bet with API
      const betId = await placeBet(betAmountValue);
      
      // Animate the ball drop and get result
      const winMultiplier = await animateBallDrop();
      
      if (winMultiplier) {
        // Calculate winnings
        const winAmount = betAmountValue * winMultiplier;
        
        // Complete the bet with backend
        await completeBet(betId, winAmount > 0, winAmount);
        
        // Show toast notification
        toast({
          title: winAmount > 0 ? "Win!" : "Better luck next time!",
          description: winAmount > 0 
            ? `You won ${formatCrypto(winAmount, currency)}` 
            : "No win this time.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: "There was an error placing your bet. Please try again.",
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
                  onClick={() => setBetAmount(formatCrypto(rawBalance, currency))}
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