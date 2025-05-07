import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, Info, Dices, Wallet, RefreshCw, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export interface Payout {
  combination: string[];
  multiplier: number;
  description: string;
}

export interface SpecialSymbol {
  symbol: string;
  name: string;
  description: string;
  multiplier: number;
}

export interface SlotConfiguration {
  name: string;
  theme: string;
  description: string;
  symbols: string[];
  payouts: Payout[];
  specialSymbols: SpecialSymbol[];
  maxMultiplier: number;
  luckySymbol: string;
  luckyMultiplier: number;
  reelCount: number;
}

interface CustomStyles {
  container?: React.CSSProperties;
  reelsContainer?: React.CSSProperties;
  reel?: React.CSSProperties;
  button?: React.CSSProperties;
}

interface BaseSlotGameProps {
  config: SlotConfiguration;
  gameId: number;
  customStyles?: CustomStyles;
}

type GameState = 'idle' | 'spinning' | 'winning' | 'losing';

interface AutoPlaySettings {
  enabled: boolean;
  spins: number;
  stopOnWin: boolean;
  stopOnLoss: boolean;
  stopOnBigWin: boolean;
  remainingSpins: number;
}

const BaseSlotGame: React.FC<BaseSlotGameProps> = ({ config, gameId, customStyles = {} }) => {
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reels, setReels] = useState<string[][]>([]);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [balance, setBalance] = useState<number>(10000);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showPayTable, setShowPayTable] = useState<boolean>(false);
  const [autoPlaySettings, setAutoPlaySettings] = useState<AutoPlaySettings>({
    enabled: false,
    spins: 5,
    stopOnWin: false,
    stopOnLoss: false,
    stopOnBigWin: false,
    remainingSpins: 0
  });
  const [luckySymbol, setLuckySymbol] = useState<string>(config.luckySymbol);
  
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize reels
  useEffect(() => {
    // Generate initial random reels
    const initialReels = Array(config.reelCount || 3).fill(0).map(() => 
      Array(3).fill(0).map(() => config.symbols[Math.floor(Math.random() * config.symbols.length)])
    );
    setReels(initialReels);
    
    // Fetch initial balance
    fetchBalance();
  }, [config]);
  
  // Fetch user balance
  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/user/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };
  
  // Handle spin
  const handleSpin = async () => {
    if (gameState === 'spinning') return;
    
    // Validate bet amount
    if (betAmount < 100) {
      toast({
        title: "Invalid bet amount",
        description: "Minimum bet amount is ₹100",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive"
      });
      return;
    }
    
    // Start spinning animation
    setGameState('spinning');
    setWinningLines([]);
    setMultiplier(0);
    setProfit(0);
    
    // Animate reels with random symbols during spinning
    const spinInterval = setInterval(() => {
      setReels(prevReels => 
        prevReels.map(reel => 
          reel.map(() => config.symbols[Math.floor(Math.random() * config.symbols.length)])
        )
      );
    }, 100);
    
    try {
      // Call API to get the spin result
      const response = await apiRequest<{
        outcome: {
          reels: string[][];
          multiplier: number;
          winningLines: number[];
          hasLuckySymbol: boolean;
        };
        profit: number;
        multiplier: number;
      }>({
        method: 'POST',
        url: '/api/slots/spin',
        data: {
          gameId,
          amount: betAmount,
          luckySymbol
        }
      });
      
      // Stop spinning animation
      clearInterval(spinInterval);
      
      // Update balance after spin
      await fetchBalance();
      
      if (response.outcome) {
        // Set final reels and results after a delay for animation
        setTimeout(() => {
          setReels(response.outcome.reels);
          setWinningLines(response.outcome.winningLines || []);
          setMultiplier(response.multiplier);
          setProfit(response.profit);
          
          // Update game state
          if (response.profit > 0) {
            setGameState('winning');
            playWinSound(response.profit);
          } else {
            setGameState('losing');
            playLoseSound();
          }
          
          // Check autoplay conditions
          handleAutoPlayConditions(response.profit);
        }, 500);
      }
    } catch (error) {
      // Handle error
      clearInterval(spinInterval);
      console.error('Error spinning:', error);
      setGameState('idle');
      toast({
        title: "Error",
        description: "Failed to spin. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Play win sound with different sounds for different win amounts
  const playWinSound = (profit: number) => {
    // This would be implemented with actual sound files
    console.log(`Playing win sound for profit: ${profit}`);
  };
  
  // Play lose sound
  const playLoseSound = () => {
    // This would be implemented with actual sound files
    console.log('Playing lose sound');
  };
  
  // Handle auto play conditions
  const handleAutoPlayConditions = (latestProfit: number) => {
    if (!autoPlaySettings.enabled || autoPlaySettings.remainingSpins <= 0) {
      setIsAutoPlaying(false);
      return;
    }
    
    let shouldStop = false;
    
    // Check stop conditions
    if (autoPlaySettings.stopOnWin && latestProfit > 0) {
      shouldStop = true;
    }
    
    if (autoPlaySettings.stopOnLoss && latestProfit < 0) {
      shouldStop = true;
    }
    
    if (autoPlaySettings.stopOnBigWin && latestProfit > betAmount * 5) {
      shouldStop = true;
    }
    
    if (shouldStop) {
      setIsAutoPlaying(false);
      setAutoPlaySettings(prev => ({
        ...prev,
        remainingSpins: 0
      }));
      return;
    }
    
    // Continue auto play
    setAutoPlaySettings(prev => ({
      ...prev,
      remainingSpins: prev.remainingSpins - 1
    }));
    
    // Schedule next spin
    setTimeout(() => {
      setGameState('idle');
      if (spinButtonRef.current) {
        spinButtonRef.current.click();
      }
    }, 2000);
  };
  
  // Start auto play
  const startAutoPlay = () => {
    if (gameState === 'spinning') return;
    
    setIsAutoPlaying(true);
    setAutoPlaySettings(prev => ({
      ...prev,
      enabled: true,
      remainingSpins: prev.spins
    }));
    
    // Trigger first spin
    if (spinButtonRef.current) {
      spinButtonRef.current.click();
    }
  };
  
  // Stop auto play
  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    setAutoPlaySettings(prev => ({
      ...prev,
      enabled: false,
      remainingSpins: 0
    }));
  };
  
  // Handle bet amount change
  const handleBetAmountChange = (value: number) => {
    // Ensure bet is within range (min 100, max 10000)
    const newBet = Math.max(100, Math.min(10000, value));
    setBetAmount(newBet);
  };
  
  // Toggle pay table
  const togglePayTable = () => {
    setShowPayTable(prev => !prev);
  };
  
  // Choose lucky symbol
  const handleLuckySymbolChange = (symbol: string) => {
    setLuckySymbol(symbol);
    toast({
      title: "Lucky Symbol Selected",
      description: `Your lucky symbol is now ${symbol}`,
    });
  };
  
  // Format currency display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Render a single reel
  const renderReel = (reel: string[], reelIndex: number) => (
    <div 
      key={reelIndex}
      className="bg-slate-800 rounded-lg overflow-hidden"
      style={{
        flex: '1',
        margin: '0 4px',
        ...customStyles.reel
      }}
    >
      {reel.map((symbol, symbolIndex) => (
        <div 
          key={symbolIndex}
          className={`flex items-center justify-center text-4xl p-2 my-1 
            ${winningLines.includes(symbolIndex) && gameState === 'winning' ? 'bg-yellow-500/20' : ''}
            ${symbol === luckySymbol ? 'text-yellow-400' : ''}
          `}
        >
          {symbol}
          
          {/* Highlight effect for winning symbols */}
          {winningLines.includes(symbolIndex) && gameState === 'winning' && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: ['0 0 0 rgba(255,255,0,0)', '0 0 20px rgba(255,255,0,0.7)', '0 0 0 rgba(255,255,0,0)'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-slate-900 rounded-lg p-4 text-white overflow-hidden"
      style={{
        minHeight: '400px',
        ...customStyles.container
      }}
    >
      {/* Game header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{config.name}</h2>
          <p className="text-sm text-slate-400">{config.theme}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={togglePayTable}>
            <Info size={16} className="mr-1" />
            Pay Table
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchBalance}>
            <RefreshCw size={16} className="mr-1" />
            Refresh Balance
          </Button>
        </div>
      </div>
      
      {/* Balance display */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <Wallet size={18} className="mr-2 text-slate-400" />
          <span className="text-slate-400">Balance:</span>
        </div>
        <span className="text-xl font-bold">{formatCurrency(balance)}</span>
      </div>
      
      {/* Reels container */}
      <div 
        className="relative flex mb-4 bg-slate-800/50 rounded-xl p-3"
        style={{
          minHeight: '200px',
          ...customStyles.reelsContainer
        }}
      >
        {/* Reels */}
        {reels.map((reel, index) => renderReel(reel, index))}
        
        {/* Spinning overlay */}
        {gameState === 'spinning' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-xl font-bold">Spinning...</p>
            </div>
          </div>
        )}
        
        {/* Win overlay */}
        <AnimatePresence>
          {gameState === 'winning' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center text-yellow-400 bg-black/60 py-3 px-8 rounded-xl backdrop-blur-sm">
                <Sparkles size={48} className="mx-auto mb-2" />
                <motion.h2
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold mb-1"
                >
                  YOU WON!
                </motion.h2>
                <p className="text-xl">{formatCurrency(profit)}</p>
                <p className="text-sm">({multiplier}x)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Game controls */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4">
        {/* Bet controls */}
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="mb-3">
            <label className="text-sm text-slate-400 mb-1 block">Bet Amount</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBetAmountChange(Math.max(100, betAmount - 100))}
                disabled={gameState === 'spinning' || betAmount <= 100}
              >
                -
              </Button>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                className="text-center"
                disabled={gameState === 'spinning'}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBetAmountChange(Math.min(10000, betAmount + 100))}
                disabled={gameState === 'spinning' || betAmount >= 10000}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBetAmountChange(100)}
              disabled={gameState === 'spinning'}
            >
              ₹100
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBetAmountChange(500)}
              disabled={gameState === 'spinning'}
            >
              ₹500
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBetAmountChange(1000)}
              disabled={gameState === 'spinning'}
            >
              ₹1,000
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBetAmountChange(5000)}
              disabled={gameState === 'spinning'}
            >
              ₹5,000
            </Button>
          </div>
        </div>
        
        {/* Lucky symbol selector */}
        <div className="bg-slate-800 rounded-lg p-3">
          <label className="text-sm text-slate-400 mb-2 block">Lucky Symbol</label>
          <div className="grid grid-cols-4 gap-2">
            {config.symbols.slice(0, 8).map((symbol) => (
              <button
                key={symbol}
                className={`text-2xl h-10 rounded-md ${symbol === luckySymbol ? 'bg-blue-700 ring-2 ring-blue-400' : 'bg-slate-700 hover:bg-slate-600'}`}
                onClick={() => handleLuckySymbolChange(symbol)}
                disabled={gameState === 'spinning'}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Spin controls */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button
          ref={spinButtonRef}
          variant="default"
          size="lg"
          className={`font-bold h-14 bg-blue-600 hover:bg-blue-700 ${gameState === 'spinning' ? 'opacity-50' : ''}`}
          onClick={handleSpin}
          disabled={gameState === 'spinning' || isAutoPlaying}
        >
          {gameState === 'spinning' ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              Spinning...
            </>
          ) : (
            <>
              <Dices size={20} className="mr-2" />
              Spin
            </>
          )}
        </Button>
        
        <Button
          variant={isAutoPlaying ? "destructive" : "outline"}
          size="lg"
          className="font-bold h-14"
          onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
          disabled={gameState === 'spinning' && !isAutoPlaying}
        >
          {isAutoPlaying ? (
            <>
              <AlertCircle size={20} className="mr-2" />
              Stop Auto ({autoPlaySettings.remainingSpins})
            </>
          ) : (
            <>
              <Settings size={20} className="mr-2" />
              Auto Play
            </>
          )}
        </Button>
      </div>
      
      {/* Pay table modal */}
      <AnimatePresence>
        {showPayTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={togglePayTable}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">{config.name} - Pay Table</h2>
              
              <div className="grid gap-6">
                {/* Payouts */}
                <div>
                  <h3 className="text-xl font-medium mb-3 border-b border-slate-700 pb-2">Winning Combinations</h3>
                  <div className="grid gap-3">
                    {config.payouts.map((payout, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                        <div className="flex gap-1">
                          {payout.combination.map((symbol, i) => (
                            <span key={i} className="text-2xl">{symbol}</span>
                          ))}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-medium text-yellow-400">{payout.multiplier}x</span>
                          <span className="text-sm text-slate-400">{payout.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Special symbols */}
                <div>
                  <h3 className="text-xl font-medium mb-3 border-b border-slate-700 pb-2">Special Symbols</h3>
                  <div className="grid gap-3">
                    {config.specialSymbols.map((special, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{special.symbol}</span>
                          <div>
                            <h4 className="font-medium">{special.name}</h4>
                            <p className="text-sm text-slate-400">{special.description}</p>
                          </div>
                        </div>
                        <span className="text-lg font-medium text-yellow-400">{special.multiplier}x</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Game rules */}
                <div>
                  <h3 className="text-xl font-medium mb-3 border-b border-slate-700 pb-2">Game Rules</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>Match 3 symbols in the middle row to win the corresponding multiplier.</li>
                    <li>Your Lucky Symbol gives you a bonus of {config.luckyMultiplier}x if it appears in a winning combination.</li>
                    <li>Minimum bet is ₹100, maximum bet is ₹10,000.</li>
                    <li>The maximum win is {config.maxMultiplier}x your bet amount.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="default" onClick={togglePayTable}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BaseSlotGame;