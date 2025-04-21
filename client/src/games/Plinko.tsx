import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, BarChart3, TrendingUp } from 'lucide-react';

// Constants
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
  '5': 'bg-blue-500',
  '10': 'bg-blue-600',
  '41': 'bg-purple-500',
  '110': 'bg-purple-600'
};

// Ball structure for animation
type Ball = {
  position: number; // Position index from left to right, starting at 0
  row: number; // Current row, starting at 0
  done: boolean; // If animation is complete
};

const PlinkoGame: React.FC = () => {
  // Game state
  const [risk, setRisk] = useState<string>('Medium');
  const [rows, setRows] = useState<number>(16); // Default to 16 rows
  const [betAmount, setBetAmount] = useState<string>('0.00000100'); // Default bet amount
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [multipliers, setMultipliers] = useState<number[]>(MULTIPLIER_TABLES.Medium);
  const [result, setResult] = useState<number | null>(null);
  const [isManualMode, setIsManualMode] = useState<boolean>(true);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currency, setCurrency] = useState<string>('BTC');
  
  // Refs
  const boardRef = useRef<HTMLDivElement>(null);
  const betIdRef = useRef<number | null>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Hooks
  const { placeBet, completeBet, rawBalance } = useBalance(currency);
  const { getGameResult } = useProvablyFair('plinko');
  
  // Update multipliers when risk changes
  useEffect(() => {
    setMultipliers(MULTIPLIER_TABLES[risk]);
  }, [risk]);
  
  // Calculate potential win amount
  const potentialWinAmount = useMemo(() => {
    const amount = parseFloat(betAmount) || 0;
    return amount * Math.max(...multipliers);
  }, [betAmount, multipliers]);
  
  // Main drop path generation logic
  const generatePath = async (): Promise<number[]> => {
    // Use provably fair result to generate path
    const fairResult = await getGameResult();
    
    // Map the path based on the rows
    const path: number[] = [];
    let currentPosition = 8; // Middle start position
    
    // Generate a path through the pins
    for (let i = 0; i < rows; i++) {
      // Use the random result to determine left or right
      const random = typeof fairResult === 'number' ? fairResult : Math.random();
      const direction = random < 0.5 ? 'left' : 'right';
      
      if (direction === 'left') {
        currentPosition -= 1;
      } else {
        currentPosition += 1;
      }
      path.push(currentPosition);
    }
    
    return path;
  };
  
  // Render the Plinko grid with pins based on the number of rows
  const renderPlinkoGrid = () => {
    // For a standard Plinko board, each row has row number + 1 pegs
    return Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={`row-${rowIndex}`} 
        className="flex justify-center"
        style={{ paddingLeft: rowIndex % 2 === 0 ? 0 : '10px' }} // Offset for alternating rows
      >
        {Array.from({ length: rowIndex + 3 }).map((_, pegIndex) => (
          <div 
            key={`peg-${rowIndex}-${pegIndex}`} 
            className="w-2 h-2 rounded-full bg-white mx-[18px]"
          />
        ))}
      </div>
    ));
  };
  
  // Animated ball drop
  const animateBallDrop = async (path: number[]) => {
    if (path.length === 0) return;
    
    // Create a ball at the top center
    const newBall: Ball = {
      position: 8, // Start at middle
      row: 0,
      done: false
    };
    
    setBalls([newBall]);
    
    // Animate through each row
    for (let i = 0; i < path.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      setBalls(prev => {
        const updatedBalls = [...prev];
        updatedBalls[0] = {
          ...updatedBalls[0],
          position: path[i],
          row: i + 1
        };
        return updatedBalls;
      });
    }
    
    // Mark animation as complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setBalls(prev => {
      const updatedBalls = [...prev];
      updatedBalls[0] = {
        ...updatedBalls[0],
        done: true
      };
      return updatedBalls;
    });
    
    // Clean up the ball after some time
    setTimeout(() => {
      setBalls(prev => {
        const updatedBalls = [...prev];
        updatedBalls[0] = {
          ...updatedBalls[0],
          position: -999 // Signal to fade out this ball
        };
        return updatedBalls;
      });
      
      // Reset balls after fade out animation completes
      setTimeout(() => {
        if (!isDropping) {
          setBalls([]);
        }
      }, 500);
    }, 1500);
  };
  
  // Bet function
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
    setResult(null);
    
    try {
      // Place bet through the API
      const betId = await placeBet(betAmountValue);
      betIdRef.current = betId;
      
      // Generate path for animation
      const path = await generatePath();
      
      // Begin animation
      await animateBallDrop(path);
      
      // Calculate final position to determine win multiplier
      const finalPosition = path[path.length - 1];
      
      // Map final position to a multiplier bucket
      const bucketIndex = Math.floor((finalPosition + 8) / 2.5) % multipliers.length;
      const winMultiplier = multipliers[bucketIndex];
      
      setResult(winMultiplier);
      
      // Calculate winnings
      const winAmount = betAmountValue * winMultiplier;
      
      // Complete the bet with the backend
      if (betIdRef.current !== null) {
        await completeBet(betIdRef.current, winAmount > 0, winAmount);
      }
      
      // Show toast notification for win/loss
      toast({
        title: winAmount > 0 ? "Win!" : "Better luck next time!",
        description: winAmount > 0 
          ? `You won ${formatCrypto(winAmount, currency)} ${currency}!` 
          : "No win this time.",
        variant: winAmount > 0 ? "success" : "destructive",
      });
      
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
  
  // Format the bet amount to crypto precision
  const handleAmountChange = (value: string) => {
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
  
  return (
    <div className="flex flex-col bg-[#0F212E] text-white h-full">
      {/* Main game container */}
      <div className="flex-1 flex flex-col">
        {/* Plinko Board */}
        <div className="flex-grow flex items-center justify-center bg-[#0E1C27] p-4">
          <div 
            ref={boardRef} 
            className="relative"
          >
            {/* Pins Grid */}
            <div className="space-y-2">
              {renderPlinkoGrid()}
            </div>
            
            {/* Ball Animation */}
            {balls.map((ball, index) => (
              <motion.div
                key={`ball-${index}`}
                className="absolute top-0 left-1/2 w-4 h-4 bg-[#ff6f03] rounded-full z-10 shadow-lg"
                initial={{ translateX: "-50%", translateY: 0, opacity: 1 }}
                animate={{
                  translateX: ball.position === -999 
                    ? "-50%" 
                    : `calc(-50% + ${(ball.position - 1) * 21}px)`,
                  translateY: ball.position === -999 
                    ? ball.row * 21 
                    : ball.row * 21,
                  opacity: ball.position === -999 ? 0 : 1,
                  scale: ball.done ? 1.35 : 1,
                  rotate: ball.position === -999 ? 0 : (ball.position * 15) % 30 - 15,
                  boxShadow: ball.done ? '0 0 12px 4px rgba(255, 140, 0, 0.7)' : '0 0 5px 2px rgba(255, 111, 3, 0.5)'
                }}
                transition={{ 
                  type: ball.done ? "spring" : "tween",
                  duration: 0.2,
                  ease: "easeOut",
                  opacity: { duration: 0.4 },
                  scale: { type: "spring", stiffness: 300, damping: 15 },
                  rotate: { duration: 0.3 },
                  boxShadow: { duration: 0.4 }
                }}
              />
            ))}
            
            {/* Multiplier Buckets */}
            <div className="flex justify-between mt-4">
              {multipliers.map((multi, idx) => {
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
        
        {/* Bet Controls Section - Exact match to screenshot */}
        <div className="bg-[#172B3A] p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Bet Amount</div>
            <div className="bg-[#0F212E] rounded-md flex items-center mb-2">
              <input 
                type="text" 
                value={betAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="flex-1 bg-transparent border-none px-3 py-2 text-white outline-none"
                placeholder="0.00000000"
              />
              <div className="bg-transparent px-4 py-2 border-l border-gray-700">
                <span className="text-yellow-500 flex items-center">₿</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              <button 
                onClick={halfBetAmount}
                className="bg-[#0F212E] py-1.5 rounded text-white hover:bg-[#1E2F3E] transition-colors"
              >
                ½
              </button>
              <button 
                onClick={doubleBetAmount}
                className="bg-[#0F212E] py-1.5 rounded text-white hover:bg-[#1E2F3E] transition-colors"
              >
                2×
              </button>
              <button 
                className="bg-[#0F212E] py-1.5 rounded text-white hover:bg-[#1E2F3E] transition-colors"
                onClick={() => setBetAmount(formatCrypto(rawBalance, currency))}
              >
                Max
              </button>
            </div>
          </div>
          
          {/* Bet Button */}
          <button 
            onClick={placePlinkobet}
            disabled={isDropping || parseFloat(betAmount) <= 0}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDropping ? 'Dropping...' : 'Bet'}
          </button>
          
          {/* Risk Level */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Risk</div>
            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger className="w-full bg-[#0F212E] border-0 text-white">
                <SelectValue placeholder="Select risk level">
                  {risk}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#0F212E] border-[#243442] text-white">
                {RISK_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Rows */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Rows</div>
            <Select value={rows.toString()} onValueChange={(value) => setRows(parseInt(value))}>
              <SelectTrigger className="w-full bg-[#0F212E] border-0 text-white">
                <SelectValue placeholder="Select rows">
                  {rows}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#0F212E] border-[#243442] text-white">
                {ROW_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Manual/Auto Toggle */}
          <div className="flex mb-4 border border-gray-700 rounded-full overflow-hidden">
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
          
          {/* Footer Icons */}
          <div className="flex justify-between border-t border-gray-700 pt-4">
            <button className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <BarChart3 className="h-5 w-5" />
            </button>
            <div className="text-right">
              <span className="text-gray-400">Fairness</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#172B3A] border-t border-gray-800 flex justify-around py-3 z-50">
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xs">Browse</span>
        </button>
        <button className="flex flex-col items-center text-green-500">
          <span className="text-xs">Casino</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xs">Bets</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xs">Sports</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-xs">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default PlinkoGame;