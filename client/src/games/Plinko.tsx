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
  
  // Function to generate a provably fair path
  const generatePath = (rows: number): number[] => {
    const result = getGameResult();
    
    if (typeof result === 'function') {
      // Use provably fair algorithm if available
      // The provably fair function needs a total slots parameter (rows + 1)
      // because the bottom row has one more slot than pins in the last row
      return result(rows + 1, rows);
    } else {
      // Fallback to simple random algorithm for simulation
      const path = [];
      let currentPosition = Math.floor((rows + 1) / 2); // Start at center
      
      for (let i = 0; i < rows; i++) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        currentPosition += direction;
        currentPosition = Math.max(0, Math.min(rows, currentPosition));
        path.push(currentPosition);
      }
      
      return path;
    }
  };
  
  // Generate grid of dots for the plinko board - exactly matching screenshot
  const renderPlinkoGrid = () => {
    const grid = [];
    
    // Generate rows of pins (dots) - fixed at 16 rows to match screenshot
    for (let r = 0; r < 16; r++) {
      const pins = [];
      const pinsInRow = r + 1;
      
      // Add pins (dots) to each row
      for (let p = 0; p < pinsInRow; p++) {
        pins.push(
          <div 
            key={`pin-${r}-${p}`} 
            className="w-2 h-2 bg-white rounded-full"
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
      
      // Create a new ball with its path
      const newBall: BallState = {
        position: 0,
        row: 0,
        done: false,
        finalMultiplier: null,
        path,
        currentStep: 0
      };
      
      setBalls([newBall]);
      
      // Animate the ball dropping
      const animateBall = async () => {
        for (let i = 0; i < path.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setBalls(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[0] = {
                ...updated[0],
                position: path[i],
                row: i + 1,
                currentStep: i
              };
            }
            return updated;
          });
        }
        
        // Set final result
        const finalPosition = path[path.length - 1];
        const finalMultiplier = multipliers[finalPosition];
        
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
        
        setResult(finalMultiplier);
      };
      
      await animateBall();
      
    } catch (error) {
      console.error('Error playing Plinko:', error);
    } finally {
      setTimeout(() => {
        setPlaying(false);
        setBalls([]);
      }, 3000);
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
            
            {/* Ball Animation */}
            {balls.map((ball, index) => (
              <motion.div
                key={`ball-${index}`}
                className="absolute top-0 left-1/2 w-4 h-4 bg-white rounded-full z-10"
                initial={{ translateX: "-50%", translateY: 0 }}
                animate={{
                  translateX: `calc(-50% + ${(ball.position - rows/2) * 21}px)`, // Match the gap spacing from grid
                  translateY: ball.row * 21 // Match the row spacing from grid
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300,
                  damping: 20
                }}
              />
            ))}
            
            {/* Multiplier Buckets - matches screenshot exactly */}
            <div className="flex justify-between mt-6">
              {multipliers.map((multi, idx) => (
                <div 
                  key={`multi-${idx}`} 
                  className={`${MULTIPLIER_COLORS[multi.toString()] || 'bg-blue-500'} 
                              text-white text-xs font-semibold py-1 px-1.5 rounded text-center min-w-[28px] mx-0.5`}
                >
                  {multi}x
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
