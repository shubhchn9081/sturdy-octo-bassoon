import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';

// Symbol definitions
const SYMBOLS = [
  { id: 0, name: 'Wild', value: 10, color: 'bg-yellow-500' },
  { id: 1, name: 'Samurai', value: 5, color: 'bg-blue-600' },
  { id: 2, name: 'Katana', value: 4, color: 'bg-red-500' },
  { id: 3, name: 'Dragon', value: 3, color: 'bg-green-500' },
  { id: 4, name: 'Coin', value: 2, color: 'bg-purple-500' },
  { id: 5, name: 'Cherry', value: 1, color: 'bg-pink-500' },
  { id: 6, name: 'Lotus', value: 1, color: 'bg-indigo-500' },
  { id: 7, name: 'Lantern', value: 1, color: 'bg-orange-500' },
  { id: 8, name: 'Fan', value: 0.5, color: 'bg-teal-500' },
  { id: 9, name: 'Scroll', value: 0.5, color: 'bg-cyan-500' },
];

const BlueSamuraiGame = () => {
  const { getGameResult } = useProvablyFair('blueSamurai');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [reels, setReels] = useState<number[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [paylines, setPaylines] = useState<number[][]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [profit, setProfit] = useState('0.00000000');
  
  // Initialize empty reels on mount
  useEffect(() => {
    // 5 reels with 3 rows each
    const initialReels = Array(5).fill(0).map(() => Array(3).fill(0));
    setReels(initialReels);
  }, []);
  
  const handleBetAmountChange = (value: string) => {
    if (spinning) return;
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    if (spinning) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount / 2));
  };
  
  const handleDoubleBet = () => {
    if (spinning) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount * 2));
  };
  
  // Generate random paylines based on reels
  const calculatePaylines = (currentReels: number[][]) => {
    const calculatedPaylines: number[][] = [];
    
    // Horizontal lines (first 3 paylines)
    for (let row = 0; row < 3; row++) {
      const symbols = currentReels.map(reel => reel[row]);
      
      // Check for at least 3 matching symbols from left
      const firstSymbol = symbols[0];
      let matchingCount = 1;
      
      for (let i = 1; i < symbols.length; i++) {
        if (symbols[i] === firstSymbol || symbols[i] === 0) { // 0 is wild
          matchingCount++;
        } else {
          break;
        }
      }
      
      if (matchingCount >= 3) {
        calculatedPaylines.push([row, row, row, row, row]);
      }
    }
    
    // Diagonal (top-left to bottom-right)
    const diagonal1 = [currentReels[0][0], currentReels[1][1], currentReels[2][2], currentReels[3][2], currentReels[4][2]];
    if (diagonal1[0] === diagonal1[1] && diagonal1[1] === diagonal1[2]) {
      calculatedPaylines.push([0, 1, 2, 2, 2]);
    }
    
    // Diagonal (bottom-left to top-right)
    const diagonal2 = [currentReels[0][2], currentReels[1][1], currentReels[2][0], currentReels[3][0], currentReels[4][0]];
    if (diagonal2[0] === diagonal2[1] && diagonal2[1] === diagonal2[2]) {
      calculatedPaylines.push([2, 1, 0, 0, 0]);
    }
    
    return calculatedPaylines;
  };
  
  // Calculate win amount based on paylines
  const calculateWinAmount = (calculatedPaylines: number[][], currentReels: number[][]) => {
    let winAmount = 0;
    
    calculatedPaylines.forEach(payline => {
      // Get the symbols in this payline
      const symbols = payline.map((row, i) => row === -1 ? -1 : currentReels[i][row]);
      
      // Filter out the -1 positions
      const validSymbols = symbols.filter(s => s !== -1);
      if (validSymbols.length < 3) return;
      
      // Get the symbol to check (first non-wild symbol)
      let symbolToCheck = validSymbols[0];
      if (symbolToCheck === 0 && validSymbols.length > 1) {
        symbolToCheck = validSymbols.find(s => s !== 0) || 0;
      }
      
      // Count how many symbols match in sequence from left
      let matchCount = 0;
      for (let i = 0; i < validSymbols.length; i++) {
        if (validSymbols[i] === symbolToCheck || validSymbols[i] === 0) {
          matchCount++;
        } else {
          break;
        }
      }
      
      // Calculate payout based on match count and symbol value
      if (matchCount >= 3) {
        const symbol = SYMBOLS.find(s => s.id === symbolToCheck);
        if (symbol) {
          const symbolValue = symbol.value;
          const payoutMultiplier = matchCount === 3 ? 1 : matchCount === 4 ? 2.5 : 5;
          winAmount += symbolValue * payoutMultiplier;
        }
      }
    });
    
    return winAmount;
  };
  
  const handleSpin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    setPaylines([]);
    setTotalWin(0);
    setProfit('0.00000000');
    
    try {
      // Generate random reels for initial animation
      const randomReels = Array(5).fill(0).map(() => 
        Array(3).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length))
      );
      setReels(randomReels);
      
      // Wait for spinning animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate final reels using provably fair algorithm
      // In a real implementation, this would come from the server
      const finalReels = Array(5).fill(0).map(() => 
        Array(3).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length))
      );
      setReels(finalReels);
      
      // Calculate paylines and win amount
      const newPaylines = calculatePaylines(finalReels);
      setPaylines(newPaylines);
      
      const winMultiplier = calculateWinAmount(newPaylines, finalReels);
      const betAmountValue = parseFloat(betAmount) || 0;
      const winAmount = betAmountValue * winMultiplier;
      
      setTotalWin(winAmount);
      setProfit(formatCrypto(winAmount));
      
      // In a real app, this would call the API
      // placeBet.mutate({
      //   amount: parseFloat(betAmount),
      //   gameId: 7, // Blue Samurai game id
      //   clientSeed: 'seed',
      //   options: {}
      // });
      
    } catch (error) {
      console.error('Error spinning reels:', error);
    } finally {
      setSpinning(false);
    }
  };
  
  // Render a symbol
  const renderSymbol = (symbolId: number, highlight: boolean = false) => {
    const symbol = SYMBOLS.find(s => s.id === symbolId) || SYMBOLS[0];
    
    return (
      <div 
        className={`
          w-full h-16 flex items-center justify-center rounded-md
          ${symbol.color} 
          ${highlight ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
        `}
      >
        <span className="font-bold text-white">{symbol.name}</span>
      </div>
    );
  };
  
  // Game visualization panel
  const gamePanel = (
    <div>
      {/* Slot machine */}
      <div className="bg-panel-bg rounded-lg p-4 mb-4">
        {/* Reels */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {reels.map((reel, reelIndex) => (
            <div key={`reel-${reelIndex}`} className="flex flex-col space-y-2">
              {reel.map((symbolId, rowIndex) => {
                // Check if this position is part of a payline
                const isHighlighted = paylines.some(payline => 
                  payline[reelIndex] === rowIndex
                );
                
                return (
                  <motion.div 
                    key={`symbol-${reelIndex}-${rowIndex}`}
                    animate={spinning ? { y: [0, 100, 0], opacity: [1, 0.5, 1] } : {}}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  >
                    {renderSymbol(symbolId, isHighlighted)}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Win display */}
        {totalWin > 0 && (
          <div className="text-center p-3 bg-green-500/20 text-green-400 rounded-lg">
            <div className="text-2xl font-bold">You Won!</div>
            <div>{formatCrypto(totalWin)}</div>
          </div>
        )}
      </div>
      
      {/* Paylines and symbols legend */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-2 text-sm">Active Paylines</div>
          <div className="text-foreground">{paylines.length}</div>
        </div>
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-2 text-sm">RTP</div>
          <div className="text-foreground">96.7%</div>
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
      onBet={handleSpin}
      betButtonText={spinning ? 'Spinning...' : 'Spin'}
      betButtonDisabled={spinning}
    >
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Lines</label>
        <Input
          type="text"
          value="49"
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Win</label>
        <Input
          type="text"
          value={profit}
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
    </GameControls>
  );
  
  return (
    <GameLayout
      title="Blue Samurai"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default BlueSamuraiGame;
