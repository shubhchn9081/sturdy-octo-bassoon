import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, Info, Dices, Wallet, RefreshCw, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import gsap from 'gsap';

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
  
  // Create virtual reel strips (longer than visible area)
  const createVirtualReelStrip = (reelIndex: number): string[] => {
    // Create a strip with 5x more symbols than visible
    const reelStrip: string[] = [];
    for (let i = 0; i < 15; i++) {
      reelStrip.push(config.symbols[Math.floor(Math.random() * config.symbols.length)]);
    }
    return reelStrip;
  };

  // Animate reels with GSAP
  const animateReels = (finalOutcome: string[][], winDelay = 500): void => {
    // Play slot machine sound
    playSoundEffect('spin');
    
    // Create light flash effect
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.4)',
        duration: 0.5,
        repeat: 2,
        yoyo: true
      });
    }
    
    // For each reel
    reelRefs.current.forEach((reelEl, reelIndex) => {
      if (!reelEl) return;
      
      // Get all symbol containers in this reel
      const symbolsContainer = reelEl.querySelector('.reel-container');
      if (!symbolsContainer) return;
      
      // Create a longer virtual reel (which will spin)
      const virtualSymbols = createVirtualReelStrip(reelIndex);
      
      // Add the final symbols at the end of the virtual reel
      finalOutcome[reelIndex].forEach((symbol: string) => {
        virtualSymbols.push(symbol);
      });
      
      // Create the HTML for the virtual reel
      symbolsContainer.innerHTML = '';
      virtualSymbols.forEach(symbol => {
        const symbolEl = document.createElement('div');
        symbolEl.className = `flex items-center justify-center p-2 my-1 h-20 transition-all transform hover:scale-110`;
        
        // Check if the symbol is a path or emoji
        if (symbol.startsWith('/')) {
          // Create an image element for path-based symbols
          const imgEl = document.createElement('img');
          imgEl.src = symbol;
          imgEl.alt = 'Slot symbol';
          imgEl.className = 'h-full w-auto object-contain';
          symbolEl.appendChild(imgEl);
        } else {
          // For text/emoji symbols
          symbolEl.textContent = symbol;
          symbolEl.style.fontSize = '2.25rem'; // text-4xl equivalent
        }
        
        symbolsContainer.appendChild(symbolEl);
      });
      
      // Calculate the final position (height of all symbols except the last visible ones)
      const finalPosition = -(virtualSymbols.length - 3) * 80; // 80px is the height of each symbol
      
      // Create blur effect during fast spinning
      gsap.to(symbolsContainer.children, {
        filter: 'blur(3px)',
        duration: 0.5
      });
      
      // Animate the reel with GSAP - more casino-like behavior
      const reelDuration = 1.5 + reelIndex * 0.5; // Each reel spins longer than the previous
      
      gsap.fromTo(
        symbolsContainer,
        { y: 0 },
        { 
          y: finalPosition, 
          duration: reelDuration,
          ease: "power1.out",
          onUpdate: function() {
            // Calculate how far through the animation we are (0-1)
            const progress = this.progress();
            
            // Remove blur as reel slows down
            if (progress > 0.7) {
              gsap.to(symbolsContainer.children, {
                filter: 'blur(0px)',
                duration: 0.3
              });
            }
          },
          onComplete: () => {
            // Play reel stop sound with slight variance for each reel
            playSoundEffect('reelStop', { pitch: 1 + (reelIndex * 0.1) });
            
            // Add a bouncing effect at the end
            gsap.fromTo(
              symbolsContainer,
              { y: finalPosition - 10 },  // Bounce up a bit
              { y: finalPosition, duration: 0.3, ease: "bounce.out" }
            );
            
            // If this is the last reel, check for win and update game state
            if (reelIndex === reelRefs.current.length - 1) {
              setTimeout(() => {
                // Game state will be updated from the handleSpin function
                // where we set the multiplier and profit values
                if (profit > 0) {
                  // Winning animation
                  setGameState('winning');
                  playWinSound(profit);
                  
                  // Flash the winning symbols
                  const winningSymbols = document.querySelectorAll('.winning-symbol');
                  winningSymbols.forEach(symbol => {
                    gsap.to(symbol, {
                      backgroundColor: 'rgba(255, 215, 0, 0.3)',
                      boxShadow: '0 0 10px gold',
                      repeat: -1,
                      yoyo: true,
                      duration: 0.5
                    });
                  });
                } else {
                  setGameState('losing');
                  playLoseSound();
                }
                
                // Check autoplay conditions if necessary
                if (isAutoPlaying) {
                  handleAutoPlayConditions(profit);
                }
              }, winDelay);
            }
          }
        }
      );
    });
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
    
    try {
      // Generate a random client seed
      const clientSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Call API to get the spin result
      const response = await fetch('/api/slots/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          amount: betAmount,
          luckySymbol,
          clientSeed
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update balance after spin
      await fetchBalance();
      
      if (data && data.outcome) {
        console.log('Slot spin response:', data);
        
        // Initialize GSAP animation for reels
        animateReels(data.outcome.reels);
        
        // Update state with outcome data
        setWinningLines(data.outcome.winningLines || []);
        setMultiplier(data.multiplier);
        setProfit(data.profit);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      // Handle error
      console.error('Error spinning:', error);
      setGameState('idle');
      toast({
        title: "Error",
        description: "Failed to spin. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Play sound effects
  const playSoundEffect = (type: 'spin' | 'reelStop' | 'win' | 'jackpot' | 'lose', options?: { volume?: number, pitch?: number }) => {
    const { volume = 1.0, pitch = 1.0 } = options || {};
    
    // In a real implementation, we would play actual sound files
    // For now we'll just log the sound effect for demonstration
    console.log(`Playing ${type} sound effect (volume: ${volume}, pitch: ${pitch})`);
    
    // Visual feedback when sounds would play
    if (containerRef.current) {
      // Flash the container briefly when sounds play
      gsap.to(containerRef.current, {
        backgroundColor: type === 'win' ? 'rgba(76, 175, 80, 0.3)' : 
                         type === 'lose' ? 'rgba(244, 67, 54, 0.3)' : 
                         'rgba(66, 165, 245, 0.3)',
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }
  };
  
  // Play win sound with different sounds for different win amounts
  const playWinSound = (profit: number) => {
    if (profit >= betAmount * 10) {
      // Jackpot win
      playSoundEffect('jackpot', { volume: 1.0 });
      console.log("Playing jackpot sound");
      
      // Extra visual effects for jackpot
      if (containerRef.current) {
        // Add particles or confetti effect
        gsap.to(containerRef.current, {
          boxShadow: '0 0 50px gold, 0 0 100px gold',
          duration: 0.5,
          repeat: 5,
          yoyo: true
        });
      }
    } else {
      // Regular win
      playSoundEffect('win', { volume: 0.8 + (profit / betAmount) * 0.2 });
      console.log("Playing win sound");
    }
  };
  
  // Play lose sound
  const playLoseSound = () => {
    playSoundEffect('lose', { volume: 0.7 });
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
  
  // References for reels
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Render a single reel
  const renderReel = (reel: string[], reelIndex: number) => (
    <div 
      key={reelIndex}
      ref={el => reelRefs.current[reelIndex] = el}
      className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden relative"
      style={{
        flex: '1',
        margin: '0 4px',
        height: '240px',
        position: 'relative',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        border: '2px solid rgba(30, 41, 59, 0.8)',
        ...customStyles.reel
      }}
    >
      {/* Reel overlay to create light reflection effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1) 100%)',
          borderRadius: '0.5rem'
        }}
      />
      
      {/* Side light effect */}
      <div className="absolute h-full w-2 left-0 top-0 z-10">
        <div 
          className="h-1/3 w-full animate-pulse" 
          style={{
            background: 'linear-gradient(to bottom, rgba(255,215,0,0.5), rgba(255,215,0,0))',
            animationDuration: `${3 + reelIndex * 0.5}s`
          }}
        />
      </div>
      
      {/* Reel container */}
      <div className="reel-container" style={{ position: 'absolute', width: '100%' }}>
        {reel.map((symbol, symbolIndex) => (
          <div 
            key={symbolIndex}
            className={`
              flex items-center justify-center p-2 my-1 h-20
              transition-all duration-200
              ${winningLines.includes(symbolIndex) && gameState === 'winning' ? 'bg-yellow-500/30 winning-symbol' : 'hover:bg-slate-700/30'}
              ${symbol === luckySymbol ? 'shadow-glow' : ''}
            `}
            style={{
              transform: gameState === 'spinning' ? 'scale(0.95)' : 'scale(1)',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(1px)',
            }}
          >
            {/* Check if symbol is a URL or emoji */}
            {typeof symbol === 'string' && symbol.startsWith('/') ? (
              <img 
                src={symbol} 
                alt="Slot symbol" 
                className="h-full w-auto object-contain max-h-[80%] mx-auto"
                style={{
                  filter: symbol === luckySymbol ? 'drop-shadow(0 0 4px gold)' : 'none',
                  padding: '6px'
                }}
              />
            ) : (
              <span className="text-4xl">
                {symbol}
              </span>
            )}
            
            {/* Shine effect on symbols */}
            <div 
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
                borderRadius: '0.5rem'
              }}
            />
            
            {/* Highlight effect for winning symbols */}
            {winningLines.includes(symbolIndex) && gameState === 'winning' && (
              <motion.div
                className="absolute inset-0 rounded-lg z-0"
                animate={{
                  boxShadow: [
                    '0 0 0 rgba(255,215,0,0)', 
                    '0 0 20px rgba(255,215,0,0.7), inset 0 0 10px rgba(255,215,0,0.5)', 
                    '0 0 0 rgba(255,215,0,0)'
                  ],
                  backgroundColor: [
                    'rgba(255,215,0,0.1)',
                    'rgba(255,215,0,0.3)',
                    'rgba(255,215,0,0.1)'
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Reel top and bottom shadows */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none z-20"></div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-20"></div>
    </div>
  );
  
  return (
    <div 
      ref={containerRef}
      className="relative rounded-lg p-6 text-white overflow-hidden"
      style={{
        minHeight: '400px',
        background: 'linear-gradient(135deg, #1a202c, #0f172a)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        ...customStyles.container
      }}
    >
      {/* Light beams effect for casino ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-4 h-full rotate-12 animate-pulse opacity-30"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,215,0,0.2), rgba(255,215,0,0))',
            filter: 'blur(8px)',
            animationDuration: '3s'
          }}
        />
        <div 
          className="absolute top-0 right-1/4 w-4 h-full -rotate-12 animate-pulse opacity-30"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,191,255,0.2), rgba(0,191,255,0))',
            filter: 'blur(8px)',
            animationDuration: '4s'
          }}
        />
      </div>
      
      {/* Game header with neon style */}
      <div className="flex justify-between items-center mb-6 relative">
        <div>
          <h2 
            className="text-2xl font-bold mb-1"
            style={{
              textShadow: '0 0 5px rgba(66, 153, 225, 0.8), 0 0 10px rgba(66, 153, 225, 0.5)'
            }}
          >
            {config.name}
          </h2>
          <p className="text-sm text-blue-200">{config.theme}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={togglePayTable}
            className="border-blue-500 hover:bg-blue-900/50 transition-all"
          >
            <Info size={16} className="mr-1 text-blue-300" />
            Pay Table
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBalance}
            className="border-blue-500 hover:bg-blue-900/50 transition-all"
          >
            <RefreshCw size={16} className="mr-1 text-blue-300" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Balance display with glow effect */}
      <div 
        className="mb-6 flex justify-between items-center rounded-lg p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to right, rgba(12, 24, 48, 0.8), rgba(30, 41, 59, 0.8))',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(30, 64, 175, 0.3)'
        }}
      >
        {/* Animated glow behind balance */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(56, 189, 248, 0.4), transparent 70%)',
            filter: 'blur(20px)'
          }}
        />
        
        <div className="flex items-center relative z-10">
          <Wallet size={20} className="mr-2 text-blue-300" />
          <span className="text-blue-200">Balance:</span>
        </div>
        <span 
          className="text-2xl font-bold relative z-10"
          style={{
            textShadow: '0 0 10px rgba(56, 189, 248, 0.5)'
          }}
        >
          {formatCurrency(balance)}
        </span>
      </div>
      
      {/* Reels container with enhanced styling */}
      <div 
        className="relative flex mb-6 rounded-xl p-4"
        style={{
          minHeight: '200px',
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(12, 24, 48, 0.9))',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          ...customStyles.reelsContainer
        }}
      >
        {/* Slot machine top light row */}
        <div className="absolute top-0 left-0 right-0 h-1 flex justify-center space-x-12 transform -translate-y-1/2 z-10">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: i % 2 === 0 ? 'radial-gradient(circle, rgba(252, 211, 77, 1), rgba(252, 211, 77, 0.3))' : 'radial-gradient(circle, rgba(239, 68, 68, 1), rgba(239, 68, 68, 0.3))',
                boxShadow: i % 2 === 0 ? '0 0 5px rgba(252, 211, 77, 0.8)' : '0 0 5px rgba(239, 68, 68, 0.8)',
                animationDuration: `${1 + i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Reels */}
        {reels.map((reel, index) => renderReel(reel, index))}
        
        {/* Win overlay with improved animation */}
        <AnimatePresence>
          {gameState === 'winning' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center z-30"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="text-center py-5 px-10 rounded-xl relative overflow-hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 30px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.3)',
                  border: '1px solid rgba(251, 191, 36, 0.5)'
                }}
              >
                {/* Animated confetti behind win message */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      initial={{ 
                        x: Math.random() * 100 - 50,
                        y: Math.random() * 100 - 50,
                        scale: 0
                      }}
                      animate={{ 
                        x: Math.random() * 200 - 100,
                        y: Math.random() * 200 - 100,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      style={{
                        background: ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF1493'][Math.floor(Math.random() * 5)]
                      }}
                    />
                  ))}
                </div>
                
                <Sparkles className="mx-auto mb-2 text-yellow-300" size={60} />
                <motion.h2
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.2, 1], y: [0, -10, 0] }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="text-4xl font-bold mb-2 text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, #FFD700, #FFA500)',
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.7)'
                  }}
                >
                  YOU WON!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                  style={{
                    color: '#FFD700',
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.7)'
                  }}
                >
                  {formatCurrency(profit)}
                </motion.p>
                <p className="text-yellow-300">({multiplier}x Multiplier)</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Game controls with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4">
        {/* Bet controls with casino-style design */}
        <div 
          className="rounded-lg p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(51, 65, 85, 0.5)'
          }}
        >
          {/* Subtle glow effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.5), transparent 70%)',
              filter: 'blur(20px)'
            }}
          />
          
          <div className="mb-3 relative z-10">
            <label className="text-sm text-blue-200 mb-2 block font-medium">
              Bet Amount
            </label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBetAmountChange(Math.max(100, betAmount - 100))}
                disabled={gameState === 'spinning' || betAmount <= 100}
                className="bg-slate-800 border-blue-500/50 hover:bg-blue-900/30 hover:border-blue-400 transition-all"
              >
                <span className="text-lg font-bold">-</span>
              </Button>
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                  className="text-center bg-slate-800 border-blue-500/30 text-lg font-semibold"
                  disabled={gameState === 'spinning'}
                  style={{
                    textShadow: '0 0 5px rgba(59, 130, 246, 0.5)'
                  }}
                />
                {/* Digital-style appearance */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent 10%, transparent 90%, rgba(255,255,255,0.05))',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBetAmountChange(Math.min(10000, betAmount + 100))}
                disabled={gameState === 'spinning' || betAmount >= 10000}
                className="bg-slate-800 border-blue-500/50 hover:bg-blue-900/30 hover:border-blue-400 transition-all"
              >
                <span className="text-lg font-bold">+</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 relative z-10">
            {[100, 500, 1000, 5000].map((amount) => (
              <Button 
                key={amount}
                variant="outline" 
                size="sm"
                onClick={() => handleBetAmountChange(amount)}
                disabled={gameState === 'spinning'}
                className={`
                  relative overflow-hidden transition-all duration-300 
                  ${betAmount === amount ? 'bg-blue-800 border-blue-400 ring-1 ring-blue-400' : 'bg-slate-800 border-slate-600 hover:bg-blue-900/30 hover:border-blue-500/50'}
                `}
              >
                {/* Shine effect */}
                <div 
                  className={`absolute inset-0 opacity-20 ${betAmount === amount ? 'opacity-40' : ''}`}
                  style={{
                    background: 'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
                    transition: 'opacity 0.3s ease'
                  }}
                />
                <span className={`${betAmount === amount ? 'text-blue-200' : 'text-slate-300'}`}>
                  ₹{amount.toLocaleString()}
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Lucky symbol selector with enhanced styling */}
        <div 
          className="rounded-lg p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(51, 65, 85, 0.5)'
          }}
        >
          <label className="text-sm text-blue-200 mb-2 block font-medium relative z-10">Lucky Symbol</label>
          <div className="grid grid-cols-4 gap-2 relative z-10">
            {config.symbols.slice(0, 8).map((symbol) => (
              <button
                key={symbol}
                className={`
                  text-2xl h-12 rounded-md relative overflow-hidden transition-all duration-300
                  ${symbol === luckySymbol 
                    ? 'bg-gradient-to-b from-blue-700 to-blue-800 ring-2 ring-blue-400 shadow-lg shadow-blue-900/50' 
                    : 'bg-slate-800 hover:bg-slate-700'}
                `}
                onClick={() => handleLuckySymbolChange(symbol)}
                disabled={gameState === 'spinning'}
                style={{
                  textShadow: symbol === luckySymbol ? '0 0 10px rgba(59, 130, 246, 0.8)' : 'none'
                }}
              >
                {/* Light reflection effect */}
                <div 
                  className={`absolute inset-0 ${symbol === luckySymbol ? 'opacity-50' : 'opacity-20'}`}
                  style={{
                    background: 'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
                    transition: 'opacity 0.3s ease'
                  }}
                />
                {symbol === luckySymbol && (
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse" style={{animationDuration: '2s'}} />
                )}
                {symbol.startsWith('/') ? (
                  <img src={symbol} alt="Slot symbol" className="h-10 w-auto object-contain" />
                ) : (
                  symbol
                )}
              </button>
            ))}
          </div>
          
          {/* Background glow effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.5), transparent 70%)',
              filter: 'blur(20px)'
            }}
          />
        </div>
      </div>
      
      {/* Enhanced spin controls with realistic buttons */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* Primary spin button with enhanced styling */}
        <div className="relative group">
          {/* Button shadow/glow effect */}
          <div 
            className={`absolute inset-0 rounded-xl blur-md transition-all duration-500 ${gameState === 'spinning' ? 'opacity-30' : 'opacity-70 group-hover:opacity-100'}`}
            style={{
              background: gameState === 'spinning' 
                ? 'rgba(37, 99, 235, 0.3)' 
                : 'linear-gradient(to bottom, rgba(37, 99, 235, 0.7), rgba(29, 78, 216, 0.7))',
              transform: 'translateY(4px)'
            }}
          />
          
          <Button
            ref={spinButtonRef}
            variant="default"
            size="lg"
            className={`
              relative w-full font-bold py-6 overflow-hidden
              ${gameState === 'spinning' 
                ? 'bg-blue-700/50 cursor-not-allowed'
                : 'bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700 active:from-blue-700 active:to-blue-800'
              }
              transition-all duration-300 border-0 shadow-none
            `}
            style={{
              boxShadow: gameState === 'spinning' 
                ? 'inset 0 1px 1px rgba(255, 255, 255, 0.1)' 
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -2px 1px rgba(0, 0, 0, 0.2)'
            }}
            onClick={handleSpin}
            disabled={gameState === 'spinning' || isAutoPlaying}
          >
            {/* Shine overlay */}
            <div 
              className={`absolute inset-0 opacity-30 transition-opacity ${gameState === 'spinning' ? 'opacity-10' : 'group-hover:opacity-40'}`}
              style={{
                background: 'linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 50%)',
              }}
            />
            
            {gameState === 'spinning' ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xl">Spinning...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Dices size={24} className="animate-pulse" style={{animationDuration: '3s'}}/>
                <span className="text-xl">SPIN</span>
              </div>
            )}
          </Button>
        </div>
        
        {/* Auto-play button with enhanced styling */}
        <div className="relative group">
          {/* Button shadow/glow effect */}
          <div 
            className={`absolute inset-0 rounded-xl blur-md transition-all duration-500 ${gameState === 'spinning' && !isAutoPlaying ? 'opacity-30' : 'opacity-70 group-hover:opacity-100'}`}
            style={{
              background: isAutoPlaying 
                ? 'rgba(220, 38, 38, 0.5)' 
                : 'rgba(30, 41, 59, 0.7)',
              transform: 'translateY(4px)'
            }}
          />
          
          <Button
            variant={isAutoPlaying ? "destructive" : "outline"}
            size="lg"
            className={`
              relative w-full font-bold py-6 overflow-hidden
              ${isAutoPlaying
                ? 'bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-700'
                : 'bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-800 text-blue-100'
              }
              ${gameState === 'spinning' && !isAutoPlaying ? 'opacity-70 cursor-not-allowed' : ''}
              transition-all duration-300 border-0 shadow-none
            `}
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -2px 1px rgba(0, 0, 0, 0.2)'
            }}
            onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
            disabled={gameState === 'spinning' && !isAutoPlaying}
          >
            {/* Shine overlay */}
            <div 
              className={`absolute inset-0 opacity-30 transition-opacity ${gameState === 'spinning' && !isAutoPlaying ? 'opacity-10' : 'group-hover:opacity-40'}`}
              style={{
                background: 'linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 50%)',
              }}
            />
            
            {isAutoPlaying ? (
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle size={24} className="animate-pulse" style={{animationDuration: '1s'}} />
                <span className="text-xl">STOP ({autoPlaySettings.remainingSpins})</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Settings size={24} />
                <span className="text-xl">AUTO PLAY</span>
              </div>
            )}
          </Button>
        </div>
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
                            <span key={i} className="text-2xl">
                              {symbol.toString().startsWith('/') ? (
                                <img src={symbol.toString()} alt="Slot symbol" className="h-10 w-auto object-contain mx-1 inline-block" style={{ padding: '2px' }} />
                              ) : (
                                symbol
                              )}
                            </span>
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
                          <span className="text-3xl">
                            {special.symbol.toString().startsWith('/') ? (
                              <img src={special.symbol.toString()} alt={special.name} className="h-12 w-auto object-contain" style={{ padding: '3px' }} />
                            ) : (
                              special.symbol
                            )}
                          </span>
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