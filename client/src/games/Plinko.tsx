import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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

// Node structure for implementing the path logic
type PathNode = {
  leftProb: number;
  rightProb: number;
  col: number;
  row: number;
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
  const [gameMode, setGameMode] = useState<string>('Manual');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currency, setCurrency] = useState<string>('BTC');
  const [autoSettings, setAutoSettings] = useState({
    numberOfBets: 1,
    stopOnProfit: 0,
    stopOnLoss: 0,
  });
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const betIdRef = useRef<number | null>(null);
  
  // Animation timer ref
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
    return parseFloat(betAmount) * Math.max(...multipliers);
  }, [betAmount, multipliers]);
  
  // Main drop path generation logic
  const generatePath = async (): Promise<number[]> => {
    // Use provably fair result to generate path
    const fairResult = await getGameResult();
    
    if (!fairResult) return []; // Fallback for demo mode
    
    // Map the path based on the rows
    const path: number[] = [];
    let currentPosition = 8; // Middle start position
    
    // Generate a path through the pins
    for (let i = 0; i < rows; i++) {
      // Use the next character from the hash to determine left or right
      // This is a simplified example
      const direction = fairResult % 2 === 0 ? 'left' : 'right';
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
    // Calculate total rows and grid display
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
            className="w-3 h-3 rounded-full bg-[#172B3A] mx-[18px]"
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
        // Update the ball position to a special value indicating removal
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
  
  // Placeholder for bet logic connected to backend
  const placePlinkobet = async () => {
    if (isDropping) return;
    
    setIsDropping(true);
    setResult(null);
    
    try {
      // Place bet through the API
      const betId = await placeBet(parseFloat(betAmount));
      betIdRef.current = betId;
      
      // Generate path for animation
      const path = await generatePath();
      
      // Begin animation
      await animateBallDrop(path);
      
      // Calculate final position to determine win multiplier
      const finalPosition = path[path.length - 1];
      
      // Map final position to a multiplier bucket
      // This is a simplified mapping - in reality would be more precise
      const bucketIndex = Math.floor((finalPosition + 8) / 2.5) % multipliers.length;
      const winMultiplier = multipliers[bucketIndex];
      
      setResult(winMultiplier);
      
      // Calculate winnings
      const winAmount = parseFloat(betAmount) * winMultiplier;
      
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
  
  // Render the manual betting controls
  const renderManualControls = () => {
    return (
      <div className="space-y-4">
        {/* Bet Amount Input */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Bet Amount</div>
          <div className="relative rounded-md shadow-sm">
            <Input 
              type="text" 
              value={betAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="block w-full rounded-md border-0 py-2.5 bg-[#0F212E] text-white shadow-sm placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <div className="h-full flex items-center border-l border-[#243442] px-4 text-white">
                {currency}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Button onClick={halfBetAmount} variant="outline" className="bg-[#0F212E] border-[#243442] text-sm hover:bg-[#172B3A]">½</Button>
            <Button onClick={doubleBetAmount} variant="outline" className="bg-[#0F212E] border-[#243442] text-sm hover:bg-[#172B3A]">2×</Button>
            <Button 
              onClick={() => setBetAmount(formatCrypto(rawBalance, currency))} 
              variant="outline" 
              className="bg-[#0F212E] border-[#243442] text-sm hover:bg-[#172B3A]"
            >
              Max
            </Button>
          </div>
        </div>
        
        {/* Currency Selector */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Currency</div>
          <Select value={currency} onValueChange={(value) => setCurrency(value)}>
            <SelectTrigger className="w-full bg-[#0F212E] border-[#243442] text-white">
              <SelectValue>{currency}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#0F212E] border-[#243442] text-white">
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Risk Level */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Risk</div>
          <Select value={risk} onValueChange={setRisk}>
            <SelectTrigger className="w-full bg-[#0F212E] border-[#243442] text-white">
              <SelectValue>{risk}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#0F212E] border-[#243442] text-white">
              {RISK_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Rows */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Rows</div>
          <Select value={rows.toString()} onValueChange={(value) => setRows(parseInt(value))}>
            <SelectTrigger className="w-full bg-[#0F212E] border-[#243442] text-white">
              <SelectValue>{rows}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#0F212E] border-[#243442] text-white">
              {ROW_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Win Amount */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Potential Win</div>
          <div className="bg-[#0F212E] rounded-md p-3 text-white">
            {potentialWinAmount > 0 
              ? `${formatCrypto(potentialWinAmount, currency)} ${currency}` 
              : '0.00000000'}
          </div>
        </div>
        
        {/* Bet Button */}
        <div className="pt-2">
          <Button 
            onClick={placePlinkobet}
            disabled={isDropping || parseFloat(betAmount) <= 0}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium"
          >
            {isDropping ? 'Dropping...' : 'BET'}
          </Button>
        </div>
      </div>
    );
  };
  
  // Auto bet controls placeholder
  const renderAutoControls = () => {
    return (
      <div className="text-sm text-muted-foreground">Auto mode is coming soon</div>
    );
  };
  
  return (
    <div className="flex flex-col lg:flex-row w-full bg-[#0F212E] text-white h-[calc(100vh-60px)]">
      {/* Side Panel - On mobile, appears below the game */}
      <div className="w-full p-3 bg-[#172B3A] border-t lg:border-t-0 lg:border-r border-[#243442]/50 order-last lg:order-first lg:w-[240px]">
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
      
      {/* Game Area - On mobile, this appears first */}
      <div className="flex-1 flex justify-center items-center overflow-auto bg-[#0F212E] order-first">
        <div className="w-full flex justify-center items-center pt-4 pb-2">
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
                    ? "-50%" // Final position offscreen
                    : `calc(-50% + ${(ball.position - 1) * 21}px)`, // Adjusted for 3-pin start (middle is 1)
                  translateY: ball.position === -999 
                    ? ball.row * 21 // Stay in same row before fading
                    : ball.row * 21, // Match the grid spacing
                  opacity: ball.position === -999 ? 0 : 1, // Fade out when position is -999
                  scale: ball.done ? 1.35 : 1, // Enhanced impact animation when done
                  // Add subtle rotation for more dynamic movement
                  rotate: ball.position === -999 ? 0 : (ball.position * 15) % 30 - 15,
                  // Add glow effect when ball hits final position
                  boxShadow: ball.done ? '0 0 12px 4px rgba(255, 140, 0, 0.7)' : '0 0 5px 2px rgba(255, 111, 3, 0.5)'
                }}
                transition={{ 
                  // Enhanced transitions for smoother, more natural movement
                  type: ball.done ? "spring" : "tween", // Spring physics for final impact
                  duration: 0.2, // Shorter duration for more responsive feel
                  ease: "easeOut", // Smooth easing
                  opacity: { duration: 0.4 }, // Gentle fade out
                  scale: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15 
                  }, // Bouncy impact effect
                  rotate: { duration: 0.3 }, // Smooth rotation
                  boxShadow: { duration: 0.4 } // Smooth glow transition
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