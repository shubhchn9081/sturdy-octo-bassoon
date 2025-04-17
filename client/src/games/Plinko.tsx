import React, { useState, useEffect, useMemo } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';

const RISK_LEVELS = ['Low', 'Medium', 'High'];
const ROW_OPTIONS = [8, 12, 16];

// Different multiplier tables based on risk level
const MULTIPLIER_TABLES = {
  Low: [1, 1.1, 1.3, 1.5, 2, 3, 5, 9, 5, 3, 2, 1.5, 1.3, 1.1, 1],
  Medium: [0.5, 0.8, 1, 1.5, 2, 5, 15, 45, 15, 5, 2, 1.5, 1, 0.8, 0.5],
  High: [0.2, 0.3, 0.5, 1, 2, 5, 10, 100, 10, 5, 2, 1, 0.5, 0.3, 0.2]
};

const MULTIPLIER_COLORS = [
  'bg-red-600', 'bg-red-500', 'bg-red-400',  // Left side reds
  'bg-orange-500', 'bg-yellow-500', 'bg-yellow-400',  // Left-center yellows
  'bg-green-400', 'bg-green-500', 'bg-green-600',  // Center greens
  'bg-green-400', 'bg-yellow-400', 'bg-yellow-500',  // Right-center yellows
  'bg-red-400', 'bg-red-500', 'bg-red-600'  // Right side reds
];

type BallState = {
  position: number;
  row: number;
  done: boolean;
  finalMultiplier: number | null;
};

const PlinkoGame = () => {
  const { getGameResult } = useProvablyFair('plinko');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [risk, setRisk] = useState('Medium');
  const [rows, setRows] = useState(16);
  const [balls, setBalls] = useState<BallState[]>([]);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  const multipliers = useMemo(() => {
    return MULTIPLIER_TABLES[risk as keyof typeof MULTIPLIER_TABLES] || MULTIPLIER_TABLES.Medium;
  }, [risk]);
  
  const handleBetAmountChange = (value: string) => {
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount / 2));
  };
  
  const handleDoubleBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount * 2));
  };
  
  const handleRiskChange = (value: string) => {
    setRisk(value);
  };
  
  const handleRowsChange = (value: string) => {
    setRows(parseInt(value));
  };
  
  // Generate grid of dots for the plinko board
  const renderPlinkoGrid = () => {
    const dots = [];
    
    for (let row = 0; row < rows; row++) {
      const dotsInRow = row + 1;
      const rowDots = [];
      
      for (let i = 0; i < dotsInRow; i++) {
        rowDots.push(
          <div 
            key={`dot-${row}-${i}`} 
            className="w-2 h-2 bg-white rounded-full"
          />
        );
      }
      
      dots.push(
        <div 
          key={`row-${row}`} 
          className="flex justify-center" 
          style={{ gap: `${Math.max(2, 20 - row)}px` }}
        >
          {rowDots}
        </div>
      );
    }
    
    return dots;
  };
  
  const handleBet = async () => {
    if (playing) return;
    
    setPlaying(true);
    setResult(null);
    
    try {
      // Generate path using provably fair algorithm
      const path = getGameResult()(rows) as number[];
      
      // Create a new ball
      const newBall: BallState = {
        position: 0,
        row: 0,
        done: false,
        finalMultiplier: null
      };
      
      setBalls([newBall]);
      
      // Animate the ball dropping
      for (let i = 0; i < path.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setBalls(prev => {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            position: path[i],
            row: i + 1
          };
          return updated;
        });
      }
      
      // Calculate the final multiplier
      const finalPosition = path[path.length - 1];
      const adjustedPosition = Math.min(finalPosition, multipliers.length - 1);
      const finalMultiplier = multipliers[adjustedPosition];
      
      setBalls(prev => {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          done: true,
          finalMultiplier
        };
        return updated;
      });
      
      setResult(finalMultiplier);
      
      // In a real app, this would call the API
      // placeBet.mutate({
      //   amount: parseFloat(betAmount),
      //   gameId: 3, // Plinko game id
      //   clientSeed: 'seed',
      //   options: { risk, rows }
      // });
      
    } catch (error) {
      console.error('Error playing Plinko:', error);
    } finally {
      setTimeout(() => {
        setPlaying(false);
        setBalls([]);
      }, 2000);
    }
  };
  
  // Game visualization panel
  const gamePanel = (
    <div className="flex justify-center">
      <div className="relative w-full max-w-md">
        {/* Plinko Board */}
        <div className="space-y-2 mb-4">
          {renderPlinkoGrid()}
        </div>
        
        {/* Active balls */}
        {balls.map((ball, index) => (
          <motion.div
            key={`ball-${index}`}
            className="absolute top-0 left-1/2 w-4 h-4 bg-white rounded-full shadow-lg z-10"
            initial={{ translateX: "-50%", translateY: 0 }}
            animate={{
              translateX: `calc(-50% + ${ball.position * 12}px)`,
              translateY: ball.row * 24
            }}
            transition={{ type: "tween", duration: 0.3 }}
          />
        ))}
        
        {/* Result display */}
        {result !== null && (
          <div className="text-center mb-6 p-3 rounded-lg bg-green-500/20 text-green-400">
            <div className="text-2xl font-bold">
              {result.toFixed(2)}x - {(parseFloat(betAmount) * result).toFixed(8)}
            </div>
          </div>
        )}
        
        {/* Plinko Multipliers */}
        <div className="flex justify-between">
          {multipliers.map((multi, idx) => (
            <div 
              key={`multi-${idx}`} 
              className={`${MULTIPLIER_COLORS[idx]} text-white text-xs font-bold px-2 py-1 rounded`}
            >
              {multi}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <GameControls
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      onHalfBet={handleHalfBet}
      onDoubleBet={handleDoubleBet}
      onBet={handleBet}
      betButtonText={playing ? 'Rolling...' : 'Bet'}
      betButtonDisabled={playing}
    >
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Risk</label>
        <Select 
          value={risk} 
          onValueChange={handleRiskChange}
          disabled={playing}
        >
          <SelectTrigger className="w-full bg-panel-bg">
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
      
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Rows</label>
        <Select 
          value={rows.toString()} 
          onValueChange={handleRowsChange}
          disabled={playing}
        >
          <SelectTrigger className="w-full bg-panel-bg">
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
    </GameControls>
  );
  
  return (
    <GameLayout
      title="Plinko"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default PlinkoGame;
