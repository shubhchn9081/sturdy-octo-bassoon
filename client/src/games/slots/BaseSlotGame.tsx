import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CircleDollarSign, Play, Pause, Settings, HelpCircle, Volume2, VolumeX, Loader2, CheckCircle, XCircle, RotateCcw, Lock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

// Define slot game symbol types
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

// Interface for custom styles
interface CustomStyles {
  container?: React.CSSProperties;
  reelsContainer?: React.CSSProperties;
  reel?: React.CSSProperties;
  button?: React.CSSProperties;
}

// Props for the base slot game component
interface BaseSlotGameProps {
  config: SlotConfiguration;
  gameId: number;
  customStyles?: CustomStyles;
}

// Game states
type GameState = 'idle' | 'spinning' | 'winning' | 'losing';

// AutoPlay settings interface
interface AutoPlaySettings {
  enabled: boolean;
  spins: number;
  stopOnWin: boolean;
  stopOnLoss: boolean;
  stopOnBigWin: boolean;
  remainingSpins: number;
}

const BaseSlotGame: React.FC<BaseSlotGameProps> = ({ config, gameId, customStyles = {} }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reels, setReels] = useState<string[][]>([]);
  const [selectedLuckySymbol, setSelectedLuckySymbol] = useState<string>(config.luckySymbol);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlaySettings, setAutoPlaySettings] = useState<AutoPlaySettings>({
    enabled: false,
    spins: 10,
    stopOnWin: false,
    stopOnLoss: false,
    stopOnBigWin: false,
    remainingSpins: 0
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('play');
  const [hasSpinStarted, setHasSpinStarted] = useState<boolean>(false);
  
  // References
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const { balance, refreshBalance } = useWallet();
  
  // Initialize game
  useEffect(() => {
    // Initialize audio elements
    spinAudioRef.current = new Audio('/sounds/spin.mp3');
    winAudioRef.current = new Audio('/sounds/win.mp3');
    loseAudioRef.current = new Audio('/sounds/lose.mp3');
    
    // Create initial reels state
    initializeReels();
    
    // Clean up on unmount
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);
  
  // Initialize reels with random symbols
  const initializeReels = () => {
    const initialReels: string[][] = [];
    
    for (let i = 0; i < config.reelCount; i++) {
      const reel: string[] = [];
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * config.symbols.length);
        reel.push(config.symbols[randomIndex]);
      }
      initialReels.push(reel);
    }
    
    setReels(initialReels);
  };
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 10 && value <= 10000) {
      setBetAmount(value);
    }
  };
  
  // Increment/decrement bet amount
  const adjustBetAmount = (adjustment: number) => {
    const newAmount = Math.max(10, Math.min(10000, betAmount + adjustment));
    setBetAmount(newAmount);
  };
  
  // Play audio
  const playAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silent catch for browsers that block autoplay
      });
    }
  };
  
  // Handle spin button click
  const handleSpin = async () => {
    // Don't allow spinning if already spinning or if bet amount is greater than balance
    if (gameState === 'spinning' || betAmount > (balance || 0)) {
      if (betAmount > (balance || 0)) {
        toast({
          title: "Insufficient balance",
          description: "Please lower your bet amount or add funds to your wallet.",
          variant: "destructive"
        });
      }
      return;
    }
    
    setHasSpinStarted(true);
    setGameState('spinning');
    setWinAmount(0);
    setWinningLines([]);
    playAudio(spinAudioRef);
    
    try {
      // Call the API to make a bet
      const result = await apiRequest('/api/slots/spin', {
        method: 'POST',
        data: {
          gameId,
          amount: betAmount,
          luckySymbol: selectedLuckySymbol
        }
      });
      
      if (result && result.outcome) {
        // Schedule the spin result to show after animation
        spinTimeoutRef.current = setTimeout(() => {
          // Set the reels to show the outcome
          setReels(result.outcome.reels);
          
          // Set winning information
          const isWin = result.profit > 0;
          setWinAmount(result.profit);
          
          if (isWin) {
            setGameState('winning');
            playAudio(winAudioRef);
            setWinningLines(result.outcome.winningLines || []);
          } else {
            setGameState('losing');
            playAudio(loseAudioRef);
          }
          
          // Refresh balance
          refreshBalance();
          
          // Handle autoplay logic
          handleAutoPlayAfterSpin(isWin, result.profit);
          
        }, 2000); // Show result after 2 seconds of spinning animation
      }
    } catch (error) {
      toast({
        title: "Error spinning",
        description: "There was an error while spinning. Please try again.",
        variant: "destructive"
      });
      setGameState('idle');
    }
  };
  
  // Handle autoplay after spin
  const handleAutoPlayAfterSpin = (isWin: boolean, profit: number) => {
    if (!isAutoPlaying) return;
    
    const settings = { ...autoPlaySettings };
    settings.remainingSpins -= 1;
    
    // Check if we should stop autoplay
    const shouldStop = 
      settings.remainingSpins <= 0 ||
      (settings.stopOnWin && isWin) ||
      (settings.stopOnLoss && !isWin) ||
      (settings.stopOnBigWin && isWin && profit >= betAmount * 5);
    
    if (shouldStop) {
      setIsAutoPlaying(false);
      setAutoPlaySettings({ ...settings, remainingSpins: 0 });
      return;
    }
    
    setAutoPlaySettings(settings);
    
    // Schedule next autoplay spin
    spinTimeoutRef.current = setTimeout(() => {
      setGameState('idle');
      handleSpin();
    }, 1500);
  };
  
  // Start autoplay
  const startAutoPlay = () => {
    if (gameState === 'spinning') return;
    
    setIsAutoPlaying(true);
    setAutoPlaySettings({
      ...autoPlaySettings,
      remainingSpins: autoPlaySettings.spins
    });
    setGameState('idle');
    handleSpin();
  };
  
  // Stop autoplay
  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Get button text based on game state
  const getButtonText = () => {
    if (gameState === 'spinning') return 'Spinning...';
    if (gameState === 'winning') return `Win ${winAmount}!`;
    if (gameState === 'losing') return 'Spin Again';
    return 'Spin';
  };
  
  // Get button icon based on game state
  const getButtonIcon = () => {
    if (gameState === 'spinning') return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    if (gameState === 'winning') return <CheckCircle className="mr-2 h-4 w-4" />;
    if (gameState === 'losing') return <XCircle className="mr-2 h-4 w-4" />;
    return <Play className="mr-2 h-4 w-4" />;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Reset game
  const resetGame = () => {
    setGameState('idle');
    setWinAmount(0);
    setWinningLines([]);
    initializeReels();
  };
  
  return (
    <div 
      className="h-full flex flex-col relative overflow-hidden p-4"
      style={customStyles.container}
    >
      {/* Game header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{config.name}</h2>
          <p className="text-sm text-gray-300">{config.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMute}
            className="text-white hover:text-white hover:bg-white/10"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowPaytable(true)}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <Info size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        {/* Slot machine display */}
        <div 
          className="flex-grow flex flex-col justify-center items-center p-4 rounded-lg mb-4"
          style={customStyles.reelsContainer}
        >
          {/* Win amount display */}
          <AnimatePresence>
            {winAmount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute top-16 left-0 right-0 flex justify-center items-center z-10"
              >
                <div className="bg-green-500/90 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                  + {formatCurrency(winAmount)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Reels display */}
          <div className="flex justify-center gap-2 w-full max-w-lg">
            {reels.map((reel, reelIndex) => (
              <div 
                key={reelIndex} 
                className="flex-1 rounded-lg overflow-hidden relative"
                style={customStyles.reel}
              >
                <div className={`flex flex-col transition-transform duration-2000 ${gameState === 'spinning' ? 'animate-slot-spin' : ''}`}>
                  {reel.map((symbol, symbolIndex) => (
                    <div 
                      key={symbolIndex}
                      className={`
                        h-24 flex justify-center items-center text-4xl sm:text-5xl md:text-6xl p-3
                        ${winningLines.includes(symbolIndex) ? 'bg-yellow-400/30 animate-pulse' : ''}
                        ${symbol === selectedLuckySymbol ? 'bg-blue-500/20' : ''}
                      `}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Lucky symbol indicator */}
          <div className="mt-4 bg-slate-800/60 px-3 py-1 rounded-full text-sm text-center">
            <span className="mr-2 text-gray-400">Lucky Symbol:</span>
            <span className="text-xl">{selectedLuckySymbol}</span>
          </div>
        </div>
        
        {/* Game controls */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="mb-4 bg-slate-700/50">
              <TabsTrigger value="play">Play</TabsTrigger>
              <TabsTrigger value="autoplay">Auto Play</TabsTrigger>
              <TabsTrigger value="symbol">Lucky Symbol</TabsTrigger>
            </TabsList>
            
            <TabsContent value="play" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center mb-1">
                    <CircleDollarSign size={16} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-400">Bet Amount</span>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => adjustBetAmount(-100)}
                      disabled={betAmount <= 100}
                      className="px-2"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      min={10}
                      max={10000}
                      className="mx-2 text-center bg-slate-800/50 border-slate-700"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => adjustBetAmount(100)}
                      disabled={betAmount >= 10000}
                      className="px-2"
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSpin} 
                  disabled={gameState === 'spinning' || betAmount > (balance || 0)}
                  className="h-14 w-28"
                  style={customStyles.button}
                >
                  {getButtonIcon()}
                  {getButtonText()}
                </Button>
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-400">Balance: </span>
                  <span className="text-white font-medium">{formatCurrency(balance || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Potential Win: </span>
                  <span className="text-green-400 font-medium">Up to {formatCurrency(betAmount * config.maxMultiplier)}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="autoplay" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Number of Spins</label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[autoPlaySettings.spins]} 
                      onValueChange={(value) => setAutoPlaySettings({...autoPlaySettings, spins: value[0]})}
                      min={5}
                      max={100}
                      step={5}
                    />
                    <span className="min-w-[40px] text-center">{autoPlaySettings.spins}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 mb-1">Stop Conditions</div>
                  <div className="flex flex-wrap gap-2">
                    <Toggle 
                      pressed={autoPlaySettings.stopOnWin}
                      onPressedChange={(pressed) => setAutoPlaySettings({...autoPlaySettings, stopOnWin: pressed})}
                      className="data-[state=on]:bg-green-700 data-[state=on]:text-white"
                    >
                      On Any Win
                    </Toggle>
                    <Toggle 
                      pressed={autoPlaySettings.stopOnBigWin}
                      onPressedChange={(pressed) => setAutoPlaySettings({...autoPlaySettings, stopOnBigWin: pressed})}
                      className="data-[state=on]:bg-green-700 data-[state=on]:text-white"
                    >
                      On Big Win
                    </Toggle>
                    <Toggle 
                      pressed={autoPlaySettings.stopOnLoss}
                      onPressedChange={(pressed) => setAutoPlaySettings({...autoPlaySettings, stopOnLoss: pressed})}
                      className="data-[state=on]:bg-green-700 data-[state=on]:text-white"
                    >
                      On Loss
                    </Toggle>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  {!isAutoPlaying ? (
                    <Button 
                      onClick={startAutoPlay}
                      disabled={gameState === 'spinning' || betAmount > (balance || 0)}
                      className="w-full"
                      style={customStyles.button}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Auto Play
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopAutoPlay}
                      variant="destructive"
                      className="w-full"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Stop ({autoPlaySettings.remainingSpins} Spins Left)
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="symbol" className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm text-gray-400 mb-1">Choose Your Lucky Symbol</div>
                <div className="grid grid-cols-5 gap-2">
                  {config.symbols.map((symbol) => (
                    <Button 
                      key={symbol}
                      variant={selectedLuckySymbol === symbol ? "default" : "outline"}
                      className={`h-12 text-xl ${selectedLuckySymbol === symbol ? '' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'}`}
                      onClick={() => setSelectedLuckySymbol(symbol)}
                      disabled={gameState === 'spinning'}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
                
                <div className="p-3 rounded-lg bg-slate-800/50 text-sm">
                  {config.specialSymbols.find(s => s.symbol === selectedLuckySymbol)?.description || 
                  "Your lucky symbol provides additional win chances when it appears on the reels!"}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Paytable Dialog */}
      <Dialog open={showPaytable} onOpenChange={setShowPaytable}>
        <DialogContent className="max-w-xl bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-center text-xl mb-2">{config.name} Paytable</DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Match 3 symbols horizontally to win!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-gray-300">Symbol</TableHead>
                  <TableHead className="text-gray-300">Combination</TableHead>
                  <TableHead className="text-gray-300">Multiplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.payouts.map((payout, index) => (
                  <TableRow key={index} className="border-slate-800">
                    <TableCell className="text-3xl">{payout.combination[0]}</TableCell>
                    <TableCell>{payout.description}</TableCell>
                    <TableCell className="text-amber-400 font-medium">{payout.multiplier}x</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b border-slate-700 pb-2">Special Symbols</h3>
              {config.specialSymbols.map((symbol, index) => (
                <div key={index} className="flex items-start p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-3xl mr-3">{symbol.symbol}</div>
                  <div>
                    <div className="font-medium mb-1">{symbol.name}</div>
                    <div className="text-sm text-gray-400">{symbol.description}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Lucky Symbol Feature</h3>
              <p className="text-sm text-gray-400">
                Choose your lucky symbol before spinning. When your lucky symbol appears anywhere on the reels,
                it provides additional winning opportunities! The lucky symbol gives an extra {config.luckyMultiplier}x multiplier.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-300">Sound Effects</label>
              <Toggle 
                pressed={!isMuted}
                onPressedChange={(pressed) => setIsMuted(!pressed)}
                className="data-[state=on]:bg-green-700 data-[state=on]:text-white"
              >
                {isMuted ? 'Off' : 'On'}
              </Toggle>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-gray-300">Quick Spin</label>
              <Toggle className="data-[state=on]:bg-green-700 data-[state=on]:text-white">
                Off
              </Toggle>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <Button variant="secondary" className="w-full" onClick={resetGame}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Intro overlay for first-time players */}
      {!hasSpinStarted && (
        <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-center p-8 z-20">
          <h2 className="text-2xl font-bold mb-4">{config.name}</h2>
          <p className="text-lg mb-6">{config.description}</p>
          <div className="text-7xl mb-6">{config.symbols.slice(0, 3).join(' ')}</div>
          <p className="text-gray-300 mb-8">Match 3 symbols to win up to {config.maxMultiplier}x your bet!</p>
          <Button 
            size="lg"
            onClick={() => setHasSpinStarted(true)}
            style={customStyles.button}
          >
            <Play className="mr-2 h-5 w-5" />
            Start Playing
          </Button>
        </div>
      )}
    </div>
  );
};

export default BaseSlotGame;