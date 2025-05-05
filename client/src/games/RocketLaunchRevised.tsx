import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  RocketShip, 
  RocketExplosion, 
  SpaceBackground, 
  FuelGauge, 
  GalaxyBackground, 
  AtmosphereStage,
  ScrollingBackground
} from '@/assets/rocketAssets';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import { useGameBet } from '@/hooks/use-game-bet';
import { formatCrypto } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import GameLayout from '@/components/games/GameLayout';
import { Badge } from '@/components/ui/badge';
import { Circle, Rocket, CloudLightning, Clock, Flame, ShieldCheck } from 'lucide-react';

// Constants for game display
const GAME_ID = 150; // ID for Rocket Launch game
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const HEIGHT_SCALE = 80; // Scale factor for height display
const TIME_SCALE = 100; // Scale factor for time display

// Game states
type GameState = 'waiting' | 'countdown' | 'running' | 'crashed';

// Atmosphere stage types
type AtmosphereStageType = 'ground' | 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere' | 'space';

// Multiplier markers for graph display
const MULTIPLIER_MARKERS = [
  { value: 1.5, label: '1.5×' },
  { value: 2.0, label: '2.0×' },
  { value: 3.0, label: '3.0×' },
  { value: 5.0, label: '5.0×' },
  { value: 10.0, label: '10.0×' },
  { value: 20.0, label: '20.0×' },
];

// Weather condition icons and descriptions
const WEATHER_CONDITIONS = {
  clear: { icon: <Circle className="h-4 w-4 text-blue-400" />, label: 'Clear', description: 'Stable flight conditions' },
  turbulent: { icon: <CloudLightning className="h-4 w-4 text-yellow-400" />, label: 'Turbulent', description: 'More volatile flight path' },
  storm: { icon: <CloudLightning className="h-4 w-4 text-red-400" />, label: 'Storm', description: 'Highly unpredictable flight' },
};

// Atmosphere stage descriptions
const ATMOSPHERE_STAGES = {
  ground: { label: 'Launch Pad', description: 'Preparing for liftoff', color: 'bg-slate-500' },
  troposphere: { label: 'Troposphere', description: '0-10km altitude', color: 'bg-blue-500' },
  stratosphere: { label: 'Stratosphere', description: '10-50km altitude', color: 'bg-blue-400' },
  mesosphere: { label: 'Mesosphere', description: '50-85km altitude', color: 'bg-indigo-500' },
  thermosphere: { label: 'Thermosphere', description: '85-600km altitude', color: 'bg-purple-500' },
  exosphere: { label: 'Exosphere', description: '600-10,000km altitude', color: 'bg-violet-500' },
  space: { label: 'Outer Space', description: 'Beyond Earth\'s atmosphere', color: 'bg-slate-900' },
};

// AI player names for bets
const aiPlayerNames = [
  'CryptoKing', 'LuckyPlayer', 'RocketRider', 'MoonShooter', 'DegenGambler',
  'WhaleHunter', 'Satoshi', 'DiamondHands', 'ToTheMoon', 'Blockchainer',
  'CoinCollector', 'TokenTrader', 'HashMaster', 'BitLord', 'CryptoQueen',
  'StakeMaster', 'ChainBreaker', 'CoinFlip', 'MinerMike', 'ValidatorVic'
];

// Main Rocket Launch game component
const RocketLaunchRevised: React.FC = () => {
  // Game state and settings
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [atmosphereStage, setAtmosphereStage] = useState<AtmosphereStageType>('ground');
  const [rocketPosition, setRocketPosition] = useState({ x: 50, y: 80 });
  const [fuelLevel, setFuelLevel] = useState(1.0);
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'turbulent' | 'storm'>('clear');
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [dataPoints, setDataPoints] = useState<{ x: number; y: number; multiplier: number }[]>([]);
  
  // Player betting state
  const [betAmount, setBetAmount] = useState<number>(100);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number | null>(null);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [autoCashoutInputValue, setAutoCashoutInputValue] = useState('2.00');
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  
  // Game history
  const [gameHistory, setGameHistory] = useState<{ value: number; timestamp: number }[]>([]);
  
  // Active bets (player + AI)
  const [activeBets, setActiveBets] = useState<{
    id: number;
    username: string;
    amount: number;
    isPlayer: boolean;
    status: 'active' | 'won' | 'lost';
    cashoutMultiplier?: number;
    isHidden?: boolean;
  }[]>([]);
  
  // Intervals for game loop and countdown
  const gameIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  
  // UI elements
  const [gameContainerSize, setGameContainerSize] = useState({ width: 0, height: 0 });
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Services
  const { toast } = useToast();
  const { balance, formattedBalance } = useWallet();
  const { placeBet: placeGameBet, completeBet: completeGameBet } = useGameBet(GAME_ID);
  
  // Initialize
  useEffect(() => {
    resetGame();
    
    return () => {
      // Cleanup on unmount
      if (gameIntervalRef.current) {
        window.clearInterval(gameIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);
  
  // Initialize canvas context and handle resize
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        contextRef.current = context;
        
        // Set initial dimensions
        const updateCanvasSize = () => {
          if (gameContainerRef.current) {
            const { width, height } = gameContainerRef.current.getBoundingClientRect();
            setGameContainerSize({ width, height });
            
            // Set canvas dimensions to match container and account for device pixel ratio
            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            
            // Scale context to account for pixel ratio
            context.scale(pixelRatio, pixelRatio);
          }
        };
        
        // Initial size setup
        updateCanvasSize();
        
        // Update on resize
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
      }
    }
  }, [canvasRef]);
  
  // Update auto-cashout value when setting changes
  useEffect(() => {
    if (isAutoCashoutEnabled) {
      const value = parseFloat(autoCashoutInputValue);
      if (!isNaN(value) && value >= 1.01) {
        setAutoCashoutValue(value);
      }
    } else {
      setAutoCashoutValue(null);
    }
  }, [isAutoCashoutEnabled, autoCashoutInputValue]);
  
  // Render trajectory on canvas
  useEffect(() => {
    if (!canvasRef.current || !contextRef.current || dataPoints.length === 0) return;
    
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines for multipliers
    MULTIPLIER_MARKERS.forEach(marker => {
      const y = canvas.height - ((marker.value - 1.0) * HEIGHT_SCALE);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      
      // Draw multiplier label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px Arial';
      ctx.fillText(marker.label, 5, y - 5);
    });
    
    ctx.stroke();
    
    // Draw trajectory path
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.7)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    // Plot points
    dataPoints.forEach((point, index) => {
      const x = point.x * TIME_SCALE;
      const y = canvas.height - ((point.multiplier - 1.0) * HEIGHT_SCALE);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw glow effect
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    
    dataPoints.forEach((point, index) => {
      const x = point.x * TIME_SCALE;
      const y = canvas.height - ((point.multiplier - 1.0) * HEIGHT_SCALE);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }, [dataPoints]);
  
  // Format multiplier for display
  const formatMultiplier = (value: number) => {
    return value.toFixed(2) + 'x';
  };
  
  // Handle bet amount change
  const handleBetAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setBetAmount(numValue);
    }
  };
  
  // Handle auto-cashout value change
  const handleAutoCashoutChange = (value: string) => {
    setAutoCashoutInputValue(value);
    
    if (isAutoCashoutEnabled) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 1.01) {
        setAutoCashoutValue(numValue);
      }
    }
  };
  
  // Create initial bets for AI players
  const createInitialBets = () => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      username: aiPlayerNames[Math.floor(Math.random() * aiPlayerNames.length)],
      amount: parseFloat((Math.random() * 100 + 10).toFixed(2)),
      isPlayer: false,
      status: 'active' as 'active' | 'won' | 'lost',
      isHidden: Math.random() > 0.7
    }));
  };
  
  // Utility function to generate a crash point
  const generateCrashPoint = () => {
    // Base random value between 1 and 10
    const baseValue = 1 + Math.random() * 5;
    
    // Apply house edge (5%)
    const withHouseEdge = baseValue * 0.95;
    
    // Skew distribution towards lower values (more realistic)
    const skewFactor = Math.pow(Math.random(), 1.5);
    
    // Apply skew
    const finalValue = 1 + (withHouseEdge - 1) * skewFactor;
    
    // Add occasional very high values
    if (Math.random() < 0.05) { // 5% chance
      return finalValue * (1 + Math.random() * 5); // Boost 1-6x
    }
    
    return finalValue;
  };
  
  // Function to determine atmosphere stage based on multiplier
  // Adjusted for slower progression through the atmosphere stages
  const getAtmosphereStage = (multiplier: number): AtmosphereStageType => {
    if (multiplier < 1.25) return 'ground';           // First stage from 1.00x to 1.25x
    if (multiplier < 1.60) return 'troposphere';      // Second stage from 1.25x to 1.60x
    if (multiplier < 2.00) return 'stratosphere';     // Third stage from 1.60x to 2.00x  
    if (multiplier < 2.50) return 'mesosphere';       // Fourth stage from 2.00x to 2.50x
    if (multiplier < 3.50) return 'thermosphere';     // Fifth stage from 2.50x to 3.50x
    if (multiplier < 5.00) return 'exosphere';        // Sixth stage from 3.50x to 5.00x
    return 'space';                                   // Final stage above 5.00x
  };
  
  // Reset the game for a new round
  const resetGame = () => {
    // Clear any existing intervals
    if (gameIntervalRef.current) {
      window.clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Reset to initial waiting state
    setGameState('waiting');
    setMultiplier(1.0);
    setCrashPoint(null);
    setHasPlacedBet(false);
    setHasCashedOut(false);
    setDataPoints([]);
    setAtmosphereStage('ground');
    setRocketPosition({ x: 50, y: 80 });
    setFuelLevel(1.0);
    setWeatherCondition(['clear', 'turbulent', 'storm'][Math.floor(Math.random() * 3)] as 'clear' | 'turbulent' | 'storm');
    setActiveBets(createInitialBets());
    
    // Start countdown for next game
    const countdownSeconds = 5;
    setCountdown(countdownSeconds);
    
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount === null || prevCount <= 1) {
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          
          // Start the game after countdown reaches zero
          setTimeout(() => startGame(), 100);
          return null;
        }
        return prevCount - 1;
      });
    }, 1000);
  };
  
  // Start the rocket launch
  const startGame = () => {
    setGameState('running');
    setMultiplier(1.0);
    setDataPoints([{ x: 0, y: 0, multiplier: 1.0 }]);
    
    // Generate crash point with weather condition affecting volatility
    let newCrashPoint = generateCrashPoint();
    
    // Weather affects the crash point range
    if (weatherCondition === 'turbulent') {
      // More volatility - higher chance of early crash but also higher peaks
      newCrashPoint = newCrashPoint * (Math.random() < 0.5 ? 0.7 : 1.3);
    } else if (weatherCondition === 'storm') {
      // Even more volatility
      newCrashPoint = newCrashPoint * (Math.random() < 0.6 ? 0.5 : 1.5);
    }
    
    // Occasionally add random boosters that extend flight
    const hasRandomBooster = Math.random() < 0.15;
    if (hasRandomBooster) {
      newCrashPoint *= 1.2; // Boosters extend flight by 20%
    }
    
    setCrashPoint(newCrashPoint);
    
    const startTime = Date.now();
    let lastAiCashoutMultiplier = 1.2; // Starting point for AI cashouts
    
    console.log(`Game started! Crash point will be: ${newCrashPoint}x`);
    
    // Game loop
    gameIntervalRef.current = window.setInterval(() => {
      // Calculate elapsed time and new multiplier
      const elapsedMs = Date.now() - startTime;
      const elapsed = elapsedMs / 1000; // seconds
      
      // Using a similar formula to Stake Crash
      const baseMultiplier = 1.0;
      
      // Weather affects the growth rate
      let growthRate = 0.06; // Default for clear weather
      if (weatherCondition === 'turbulent') {
        growthRate = 0.08; // Faster in turbulence
      } else if (weatherCondition === 'storm') {
        growthRate = 0.1; // Even faster in storm
      }
      
      // Calculate new multiplier - using SIGNIFICANTLY SLOWER growth for better UX
      // We're reducing the growth rate significantly to make the game last longer
      let slowedGrowthRate = growthRate * 0.25; // 75% slower growth
      let newMultiplier = baseMultiplier * Math.exp(slowedGrowthRate * elapsed);
      
      // Round to 2 decimal places for display
      newMultiplier = Math.floor(newMultiplier * 100) / 100;
      newMultiplier = Math.max(1.0, newMultiplier); // Ensure minimum of 1.0
      
      // Calculate fuel level (decreases as multiplier increases)
      const newFuelLevel = Math.max(0, 1.0 - (newMultiplier - 1.0) / (newCrashPoint - 1.0));
      
      // Determine atmosphere stage - increased thresholds for slower progression
      const newAtmosphereStage = getAtmosphereStage(newMultiplier);
      
      // We no longer move the rocket - it stays fixed
      // Instead, the background elements scroll to create the illusion of movement
      const newRocketPosition = {
        x: 50, // Horizontal position is fixed
        y: 33  // Vertical position is also fixed - matches the CSS in the render function
      };
      
      // Check for auto cashout
      if (autoCashoutValue && newMultiplier >= autoCashoutValue && !hasCashedOut) {
        handleCashOut(true);
      }
      
      // Process AI cashouts
      if (newMultiplier > lastAiCashoutMultiplier) {
        setActiveBets(prevBets => 
          prevBets.map(bet => {
            // Only process active AI bets
            if (!bet.isPlayer && bet.status === 'active') {
              // Higher chance to cash out at higher multipliers
              const cashoutChance = 0.05 + (newMultiplier - lastAiCashoutMultiplier) / 20;
              
              if (Math.random() < cashoutChance) {
                return {
                  ...bet,
                  status: 'won',
                  cashoutMultiplier: newMultiplier
                };
              }
            }
            return bet;
          })
        );
        
        lastAiCashoutMultiplier = newMultiplier;
      }
      
      // Add new data point for graph
      setDataPoints(prevPoints => [
        ...prevPoints,
        { 
          x: elapsed, 
          y: newMultiplier - 1, 
          multiplier: newMultiplier 
        }
      ]);
      
      // Check if crash point reached
      if (newMultiplier >= newCrashPoint) {
        // Game over - rocket crashed
        endGame(newMultiplier);
      } else {
        // Update game state
        setMultiplier(newMultiplier);
        setAtmosphereStage(newAtmosphereStage);
        setRocketPosition(newRocketPosition);
        setFuelLevel(newFuelLevel);
      }
    }, 100); // Update 10 times per second
  };
  
  // End the game (crash)
  const endGame = (finalMultiplier: number) => {
    if (gameIntervalRef.current) {
      window.clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    
    // Update any remaining active bets as lost
    setActiveBets(prevBets => 
      prevBets.map(bet => {
        if (bet.status === 'active') {
          return { ...bet, status: 'lost' };
        }
        return bet;
      })
    );
    
    // Create history item for this round
    const historyItem = {
      value: finalMultiplier,
      timestamp: Date.now()
    };
    
    // Update game state
    setGameState('crashed');
    setCrashPoint(finalMultiplier);
    setGameHistory([historyItem, ...gameHistory.slice(0, 19)]); // Keep last 20 rounds
    
    // Play crash sound effect
    try {
      const crashSound = new Audio('/sounds/explosion.mp3');
      crashSound.play();
    } catch (error) {
      console.error('Failed to play crash sound:', error);
    }
    
    // Reset game after delay
    setTimeout(() => {
      resetGame();
    }, 3000);
  };
  
  // Handle bet submission
  const handlePlaceBet = async () => {
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "Your bet amount exceeds your available balance",
        variant: "destructive"
      });
      return;
    }
    
    // Mark player as having placed a bet
    setHasPlacedBet(true);
    
    // Add player bet to active bets
    setActiveBets(prevBets => [
      ...prevBets,
      {
        id: prevBets.length,
        username: 'You',
        amount: betAmount,
        isPlayer: true,
        status: 'active'
      }
    ]);
    
    // Send the bet to the backend
    try {
      await placeGameBet({
        amount: betAmount,
        clientSeed: Math.random().toString(36).substring(2, 15),
      });
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Failed to place bet",
        description: "There was an error processing your bet",
        variant: "destructive"
      });
      
      // Revert bet if backend fails
      setHasPlacedBet(false);
      setActiveBets(prevBets => prevBets.filter(bet => !bet.isPlayer));
    }
  };
  
  // Handle cashout
  const handleCashOut = async (auto = false) => {
    if (gameState !== 'running' || !hasPlacedBet || hasCashedOut) return;
    
    // Mark player as having cashed out
    setHasCashedOut(true);
    
    // Update player bet status
    setActiveBets(prevBets => 
      prevBets.map(bet => {
        if (bet.isPlayer && bet.status === 'active') {
          return {
            ...bet,
            status: 'won',
            cashoutMultiplier: multiplier
          };
        }
        return bet;
      })
    );
    
    // Play cashout sound effect
    try {
      const cashoutSound = new Audio('/sounds/cashout.mp3');
      cashoutSound.play();
    } catch (error) {
      console.error('Failed to play cashout sound:', error);
    }
    
    // Send the cashout to the backend
    try {
      // Find the player's active bet ID
      const playerBet = activeBets.find(bet => bet.isPlayer);
      if (playerBet && playerBet.id !== undefined) {
        await completeGameBet(playerBet.id, {
          completed: true,
          multiplier: multiplier,
          profit: betAmount * (multiplier - 1)
        });
      }
    } catch (error) {
      console.error('Error cashing out:', error);
      toast({
        title: "Failed to cash out",
        description: "There was an error processing your cashout",
        variant: "destructive"
      });
    }
  };
  
  // Render betting controls panel
  const renderBettingPanel = () => (
    <div className="flex flex-col gap-4 w-full">
      {/* Betting amount */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-white">Bet Amount</label>
          <span className="text-sm text-gray-400">Balance: {formattedBalance}</span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            className="bg-[#172B3A] text-white"
            disabled={gameState !== 'waiting' || hasPlacedBet}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBetAmount(betAmount / 2)}
            disabled={gameState !== 'waiting' || hasPlacedBet}
            className="bg-[#172B3A] text-white border-[#2A3F51] hover:bg-[#1F3A4F]"
          >
            ½
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBetAmount(betAmount * 2)}
            disabled={gameState !== 'waiting' || hasPlacedBet}
            className="bg-[#172B3A] text-white border-[#2A3F51] hover:bg-[#1F3A4F]"
          >
            2×
          </Button>
        </div>
      </div>
      
      {/* Auto cashout */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white">Auto Cashout</label>
          <Switch
            checked={isAutoCashoutEnabled}
            onCheckedChange={setIsAutoCashoutEnabled}
            disabled={gameState !== 'waiting' || hasPlacedBet}
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={autoCashoutInputValue}
            onChange={(e) => handleAutoCashoutChange(e.target.value)}
            className={`bg-[#172B3A] text-white ${!isAutoCashoutEnabled ? 'opacity-50' : ''}`}
            disabled={!isAutoCashoutEnabled || gameState !== 'waiting' || hasPlacedBet}
            step="0.01"
            min="1.01"
          />
          <span className="flex items-center text-white">×</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="space-y-2">
        {gameState === 'waiting' ? (
          <div className="relative">
            <Button
              className="w-full py-6 bg-[#172B3A] border-t-2 border-[#2DD4BF] hover:bg-[#0D1B25] hover:border-[#14B8A6] text-white font-bold"
              disabled={hasPlacedBet || countdown === null}
              onClick={handlePlaceBet}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg text-[#2DD4BF] mb-1">Launch Pad</span>
                <span className="text-sm text-gray-400">
                  {countdown === null ? 'Preparing for launch...' : `Launch in ${countdown}s`}
                </span>
              </div>
            </Button>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-5 h-5 bg-[#2DD4BF] rotate-45"></div>
            </div>
          </div>
        ) : gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
          <Button
            className="w-full py-6 bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold"
            onClick={() => handleCashOut(false)}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg animate-pulse">Cash Out</span>
              <span className="text-xl font-bold">{formatMultiplier(multiplier)}</span>
            </div>
          </Button>
        ) : (
          <Button
            className="w-full py-6 bg-[#172B3A] text-[#94A3B8] font-bold cursor-not-allowed"
            disabled={true}
          >
            <div className="flex flex-col items-center">
              {gameState === 'crashed' ? (
                <>
                  <span className="text-red-500">Crashed</span>
                  <span className="text-xl font-bold text-red-400">{formatMultiplier(crashPoint || 0)}</span>
                </>
              ) : (
                <>
                  <span>Place Bet</span>
                  <span className="text-sm text-gray-500">Waiting for next round</span>
                </>
              )}
            </div>
          </Button>
        )}
      </div>
      
      {/* Game info */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {WEATHER_CONDITIONS[weatherCondition].icon}
            <span className="text-sm text-white">{WEATHER_CONDITIONS[weatherCondition].label}</span>
          </div>
          <Badge className={`${ATMOSPHERE_STAGES[atmosphereStage].color}`}>
            {ATMOSPHERE_STAGES[atmosphereStage].label}
          </Badge>
        </div>
        
        <div className="text-xs text-gray-400">
          {WEATHER_CONDITIONS[weatherCondition].description}
        </div>
        
        <div className="text-xs text-gray-400">
          {ATMOSPHERE_STAGES[atmosphereStage].description}
        </div>
      </div>
      
      {/* Game history */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-white mb-2">Recent Crashes</h3>
        <div className="flex flex-wrap gap-1">
          {gameHistory.slice(0, 10).map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`
                ${item.value < 2 ? 'bg-red-500/20 text-red-300' : 
                  item.value < 10 ? 'bg-yellow-500/20 text-yellow-300' : 
                    'bg-green-500/20 text-green-300'}
              `}
            >
              {item.value.toFixed(2)}×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render game display panel
  const renderGamePanel = () => (
    <div className="relative w-full h-full flex flex-col" ref={gameContainerRef}>
      {/* Dynamic background based on atmosphere stage */}
      <AtmosphereStage 
        stage={atmosphereStage} 
        width={gameContainerSize.width || 800} 
        height={gameContainerSize.height || 500} 
      />
      
      {/* Add space background with stars when in higher atmospheres */}
      {(atmosphereStage === 'mesosphere' || 
        atmosphereStage === 'thermosphere' || 
        atmosphereStage === 'exosphere' || 
        atmosphereStage === 'space') && (
        <SpaceBackground 
          width={gameContainerSize.width || 800} 
          height={gameContainerSize.height || 500} 
        />
      )}
      
      {/* Game status display */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="bg-[#0F212E]/80 rounded-lg px-6 py-2 text-center">
          {gameState === 'waiting' && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
              <span className="text-xl font-bold text-white">
                {countdown === null ? 'Waiting to start...' : `Launch in ${countdown}s`}
              </span>
            </div>
          )}
          
          {gameState === 'running' && (
            <div className="flex items-center gap-2 absolute top-0 right-0 bg-[#0F172A]/80 p-2 rounded-md z-30">
              <Rocket className="h-5 w-5 text-[#2DD4BF] animate-pulse" />
              <span className="text-2xl font-bold text-[#2DD4BF]">
                {formatMultiplier(multiplier)}
              </span>
            </div>
          )}
          
          {gameState === 'crashed' && (
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-500">
                Crashed @ {formatMultiplier(crashPoint || 0)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main game visualization - rocket and trajectory */}
      <div className="flex-1 relative flex items-center justify-center" ref={gameContainerRef}>
        {/* Atmosphere background */}
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-t from-slate-900 to-blue-900">
          {/* Scrolling background that creates illusion of movement */}
          <ScrollingBackground 
            gameState={gameState} 
            multiplier={multiplier} 
            atmosphereStage={atmosphereStage} 
          />
          
          {/* Trajectory graph for debug/analysis */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute top-0 left-0 opacity-20 pointer-events-none"
          />
        </div>
        
        {/* Rocket visualization - fixed position with proper sizing */}
        <div 
          className="absolute z-20" 
          style={{
            left: `50%`, // Center horizontally
            bottom: '33%', // Fixed position for rocket
            transform: 'translateX(-50%)',
            maxHeight: '55%', // Prevent overflow
          }}
        >
          {gameState === 'crashed' ? (
            <RocketExplosion size={90} />
          ) : (
            <RocketShip size={90} flameActive={gameState === 'running'} />
          )}
        </div>
        
        {/* Fuel gauge */}
        <div className="absolute bottom-4 left-4">
          <FuelGauge level={fuelLevel} size={150} />
        </div>
      </div>
      
      {/* Game history display */}
      <div className="absolute bottom-4 right-4 bg-[#0F212E]/80 rounded-lg p-3">
        <h3 className="text-sm font-medium text-white mb-2">Recent Crashes</h3>
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {gameHistory.slice(0, 8).map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`
                ${item.value < 2 ? 'bg-red-500/20 text-red-300' : 
                  item.value < 10 ? 'bg-yellow-500/20 text-yellow-300' : 
                    'bg-green-500/20 text-green-300'}
              `}
            >
              {item.value.toFixed(2)}×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Return the complete game layout
  return (
    <GameLayout
      title="ROCKET LAUNCH"
      controlsPanel={renderBettingPanel()}
      gamePanel={renderGamePanel()}
    />
  );
};

export default RocketLaunchRevised;