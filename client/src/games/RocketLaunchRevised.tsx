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
const GAME_ID = 6; // ID for Rocket Launch game - Using correct ID from database
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
  const [rocketPosition, setRocketPosition] = useState({ x: 35, y: 80 });
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
  
  // Define the type for an individual bet
  type Bet = {
    id: number;
    username: string;
    amount: number;
    isPlayer: boolean;
    status: 'active' | 'won' | 'lost';
    cashoutMultiplier?: number;
    isHidden?: boolean;
  };
  
  // Active bets (player + AI)
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  
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
    setRocketPosition({ x: 35, y: 80 });
    setFuelLevel(1.0);
    setWeatherCondition(['clear', 'turbulent', 'storm'][Math.floor(Math.random() * 3)] as 'clear' | 'turbulent' | 'storm');
    setActiveBets(createInitialBets());
    
    // Start countdown for next game - increased to 10 seconds as requested
    const countdownSeconds = 10;
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
        x: 35, // Horizontal position moved to the left to avoid collision with multiplier display
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
  // Handle bet placement with improved error handling
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
    
    // Create bet data with correct game ID
    const betData = {
      amount: betAmount,
      clientSeed: Math.random().toString(36).substring(2, 15),
      gameId: GAME_ID // Ensure we're using the correct game ID
    };
    
    // Mark player as having placed a bet - but only visually until API confirms
    // Create a temporary numeric ID for frontend tracking
    const temporaryBetId = Math.floor(Date.now()); // Convert to integer for compatibility with Bet type
    
    // Create a new player bet object that matches our Bet type
    const playerBet: Bet = {
      id: temporaryBetId,
      username: 'You',
      amount: betAmount,
      isPlayer: true,
      status: 'active'
    };
    
    // Add player bet to active bets
    setActiveBets(prevBets => [...prevBets, playerBet]);
    
    // Send the bet to the backend - wrapped in try/catch with explicit Promise handling
    let betSuccess = false;
    let actualBetId: number | null = null;
    
    try {
      setHasPlacedBet(true); // Optimistically update UI
      
      // Log the bet attempt for debugging
      console.log(`Attempting to place bet: Game ID ${GAME_ID}, Amount ${betAmount}`);
      
      // Define the expected return type for better type checking
      type PlaceBetResult = {
        betId?: number;
        serverSeedHash?: string;
        amount?: number;
        success?: boolean;
      };
      
      const result = await Promise.resolve(placeGameBet(betData))
        .catch(error => {
          // This catch specifically handles Promise rejections
          console.error('Promise rejected during bet placement:', error);
          throw new Error(error?.message || 'Bet placement failed with unhandled promise rejection');
        }) as PlaceBetResult; // Cast to the expected type
        
      // If we get here, the API call was successful
      console.log('Bet placed successfully:', result);
      
      // Check if we have a valid bet ID in response
      if (result && typeof result.betId === 'number') {
        betSuccess = true;
        actualBetId = result.betId;
        
        // Update the bet in our active bets with the real ID from backend
        setActiveBets(prevBets => 
          prevBets.map(bet => {
            if (bet.isPlayer && bet.id === temporaryBetId) {
              return { ...bet, id: actualBetId as number }; // Assert the type to avoid TS error
            }
            return bet;
          })
        );
      } else {
        throw new Error('Server returned success but with no bet ID');
      }
      
    } catch (error: any) {
      console.error('Error placing bet:', error);
      
      // Show a friendly error to the user with specific details if available
      const errorMessage = error?.message || "There was an error processing your bet";
      toast({
        title: "Failed to place bet",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Revert bet if backend fails
      setHasPlacedBet(false);
      setActiveBets(prevBets => prevBets.filter(bet => !bet.isPlayer));
      
      // Log detailed error for debugging
      console.error('Detailed bet error:', { 
        error, 
        betData, 
        gameId: GAME_ID, 
        temporaryBetId 
      });
      
      return; // Exit early
    }
    
    // Only if bet was successful, show confirmation
    if (betSuccess) {
      toast({
        title: "Bet Placed",
        description: `Bet of ₹${betAmount.toFixed(2)} placed successfully! Good luck!`,
        variant: "default"
      });
    }
  };
  
  // Handle cashout with improved error handling
  const handleCashOut = async (auto = false) => {
    if (gameState !== 'running' || !hasPlacedBet || hasCashedOut) return;
    
    // Don't update UI until we've confirmed with the server
    let cashoutSuccess = false;
    
    // Find the player's active bet
    const playerBet = activeBets.find(bet => bet.isPlayer && bet.status === 'active');
    if (!playerBet || playerBet.id === undefined) {
      console.error('Could not find player bet for cashout');
      toast({
        title: "Cashout Failed",
        description: "Could not find your active bet",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare cashout data
    const cashoutData = {
      completed: true,
      multiplier: multiplier,
      profit: betAmount * (multiplier - 1)
    };
    
    try {
      // Optimistically update UI
      setHasCashedOut(true);
      
      // Update player bet status in the UI
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
      
      // Log the cashout attempt for debugging
      console.log(`Attempting to cash out bet ID ${playerBet.id} at ${multiplier}x`);
      
      // Send the cashout to the backend with explicit promise handling
      const result = await Promise.resolve(completeGameBet(playerBet.id, cashoutData))
        .catch(error => {
          // This catch specifically handles Promise rejections
          console.error('Promise rejected during cashout:', error);
          throw new Error(error?.message || 'Cashout failed with unhandled promise rejection');
        });
      
      // If we reach here, the cashout was successful
      console.log('Cashout successful:', result);
      cashoutSuccess = true;
      
      // Play cashout sound effect
      try {
        const cashoutSound = new Audio('/sounds/cashout.mp3');
        cashoutSound.play().catch(soundError => {
          console.warn('Sound effect failed, but cashout was successful:', soundError);
        });
      } catch (soundError) {
        console.warn('Failed to play cashout sound:', soundError);
        // Don't treat sound failure as a cashout failure
      }
      
    } catch (error: any) {
      console.error('Error cashing out:', error);
      
      // Show a friendly error to the user with specific details if available
      const errorMessage = error?.message || "There was an error processing your cashout";
      toast({
        title: "Failed to cash out",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Since we updated the UI optimistically, revert if the backend fails
      setHasCashedOut(false);
      
      // Revert the player bet status in the UI
      setActiveBets(prevBets => 
        prevBets.map(bet => {
          if (bet.isPlayer && bet.id === playerBet.id) {
            return {
              ...bet,
              status: 'active',
              cashoutMultiplier: undefined
            };
          }
          return bet;
        })
      );
      
      // Log detailed error for debugging
      console.error('Detailed cashout error:', { 
        error, 
        playerBet, 
        multiplier, 
        cashoutData 
      });
      
      return; // Exit early
    }
    
    // Only if cashout was successful, show confirmation
    if (cashoutSuccess) {
      const winAmount = betAmount * (multiplier - 1);
      const totalAmount = betAmount * multiplier;
      toast({
        title: `${auto ? 'Auto-Cashout' : 'Cashout'} Successful!`,
        description: `You won ₹${winAmount.toFixed(2)} at ${multiplier.toFixed(2)}x! (Total: ₹${totalAmount.toFixed(2)})`,
        variant: "default"
      });
    }
  };
  
  // Render betting controls panel
  const renderBettingPanel = () => (
    <div className="flex flex-col gap-2 w-full">
      {/* Action buttons - Always at top for easy thumb access */}
      <div className="mb-2">
        {gameState === 'waiting' ? (
          <Button
            className="w-full h-16 bg-[#5DDCBD] hover:bg-[#4CCEAF] text-black font-bold rounded-lg shadow-md"
            disabled={hasPlacedBet || countdown === null}
            onClick={handlePlaceBet}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="text-lg tracking-wide">PLACE BET</div>
              <div className="text-sm font-medium">
                {countdown === null ? 'Preparing...' : `Launch in ${countdown}s`}
              </div>
            </div>
          </Button>
        ) : gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
          <Button
            className="w-full h-16 bg-[#F13D5C] hover:bg-[#E32D4C] text-white font-bold rounded-lg shadow-md animate-pulse"
            onClick={() => handleCashOut(false)}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="text-lg tracking-wide">CASH OUT</div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{formatMultiplier(multiplier)}</span>
                <span className="text-sm font-medium">
                  (₹{(betAmount * multiplier).toFixed(2)})
                </span>
              </div>
            </div>
          </Button>
        ) : (
          <Button
            className="w-full h-16 bg-[#1A2C3F] text-gray-300 font-bold rounded-lg shadow-md cursor-not-allowed"
            disabled={true}
          >
            <div className="flex flex-col items-center justify-center">
              {gameState === 'crashed' ? (
                <>
                  <div className="text-[#F13D5C] text-lg tracking-wide">CRASHED</div>
                  <div className="text-[#F13D5C] font-bold">{formatMultiplier(crashPoint || 0)}</div>
                </>
              ) : (
                <>
                  <div className="text-lg tracking-wide">{hasCashedOut ? 'CASHED OUT' : 'PLACE BET'}</div>
                  <div className="text-sm text-gray-400 font-medium">Waiting for next round</div>
                </>
              )}
            </div>
          </Button>
        )}
      </div>
      
      {/* Quick Bet Amounts - Premium styled buttons for thumb use */}
      <div className="grid grid-cols-4 gap-2">
        {[50, 100, 200, 500].map(amount => (
          <button 
            key={amount}
            className="py-2 bg-[#1A2C3F] hover:bg-[#243442] text-white font-medium rounded-lg shadow-sm border border-[#2A3F51] transition-colors"
            onClick={() => setBetAmount(amount)}
            disabled={gameState !== 'waiting' || hasPlacedBet}
          >
            {amount}
          </button>
        ))}
      </div>
      
      {/* Bet Amount - Large touchable controls */}
      <div className="mt-2">
        <div className="flex justify-between mb-1">
          <label className="text-sm font-medium text-white">Bet Amount</label>
          <span className="text-sm text-gray-400">Balance: {formattedBalance}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setBetAmount(Math.max(10, betAmount / 2))}
            disabled={gameState !== 'waiting' || hasPlacedBet}
            className="h-10 w-12 flex items-center justify-center text-white bg-[#1A2C3F] hover:bg-[#243442] rounded-lg text-xl shadow-sm border border-[#2A3F51] font-bold"
          >
            -
          </button>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            className="flex-1 bg-[#172B3A] text-white text-center h-10 text-lg border-[#2A3F51] shadow-inner"
            placeholder="0.00"
            disabled={gameState !== 'waiting' || hasPlacedBet}
          />
          <button 
            onClick={() => setBetAmount(betAmount * 2)}
            disabled={gameState !== 'waiting' || hasPlacedBet}
            className="h-10 w-12 flex items-center justify-center text-white bg-[#1A2C3F] hover:bg-[#243442] rounded-lg text-xl shadow-sm border border-[#2A3F51] font-bold"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Auto Cashout - Large toggle and input */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-white">Auto Cashout</label>
          <Switch
            checked={isAutoCashoutEnabled}
            onCheckedChange={setIsAutoCashoutEnabled}
            disabled={gameState !== 'waiting' || hasPlacedBet}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={autoCashoutInputValue}
            onChange={(e) => handleAutoCashoutChange(e.target.value)}
            className={`flex-1 bg-[#172B3A] text-white text-center h-10 text-base ${!isAutoCashoutEnabled ? 'opacity-50' : ''} border-[#2A3F51]`}
            disabled={!isAutoCashoutEnabled || gameState !== 'waiting' || hasPlacedBet}
            step="0.01"
            min="1.01"
            placeholder="2.00"
          />
          <span className="text-white text-lg font-medium">×</span>
        </div>
      </div>
      
      {/* Game Info - Condensed for Mobile */}
      <div className="flex justify-between items-center mt-2 bg-[#172B3A] p-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          {WEATHER_CONDITIONS[weatherCondition].icon}
          <span className="text-sm text-white">{WEATHER_CONDITIONS[weatherCondition].label}</span>
        </div>
        <Badge className={`${ATMOSPHERE_STAGES[atmosphereStage].color}`}>
          {ATMOSPHERE_STAGES[atmosphereStage].label}
        </Badge>
      </div>
      
      {/* Recent Crashes - Horizontal scrollable row for mobile */}
      <div className="mt-2">
        <h3 className="text-sm font-medium text-white mb-1">Recent Crashes</h3>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {gameHistory.slice(0, 10).map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`
                text-xs px-2 py-1 font-semibold whitespace-nowrap
                ${item.value < 2 ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                  item.value < 10 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 
                    'bg-green-500/20 text-green-300 border-green-500/50'}
              `}
            >
              {item.value.toFixed(2)}×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Render game display panel optimized for mobile
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
      
      {/* Game status display - Moved to the top-left for better mobile visibility */}
      <div className="absolute top-2 left-2 z-30">
        <div className="bg-[#0A1725]/90 border border-blue-500/30 shadow-lg shadow-blue-500/20 rounded-lg px-3 py-2 text-center">
          {gameState === 'waiting' && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-bold text-white">
                {countdown === null ? 'Waiting...' : `Launch: ${countdown}s`}
              </span>
            </div>
          )}
          
          {gameState === 'running' && (
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-[#2DD4BF] animate-pulse" />
              <span className="text-base font-bold text-[#2DD4BF]">
                {formatMultiplier(multiplier)}
              </span>
            </div>
          )}
          
          {gameState === 'crashed' && (
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="text-base font-bold text-red-500">
                Crashed @ {formatMultiplier(crashPoint || 0)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main game visualization - rocket and trajectory */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Atmosphere background - improved visibility for mobile */}
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-t from-indigo-950 to-blue-800">
          {/* Scrolling background that creates illusion of movement */}
          <ScrollingBackground 
            gameState={gameState} 
            multiplier={multiplier} 
            atmosphereStage={atmosphereStage} 
          />
          
          {/* Trajectory graph hidden on mobile for better performance */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute top-0 left-0 opacity-10 md:opacity-20 pointer-events-none hidden md:block"
          />
        </div>
        
        {/* Rocket visualization - larger and more central for mobile */}
        <div 
          className="absolute z-20" 
          style={{
            left: `50%`, 
            bottom: '35%', // Higher position for mobile
            transform: 'translateX(-50%)',
            maxHeight: '70%', // Larger for better visibility
          }}
        >
          {gameState === 'crashed' ? (
            <RocketExplosion size={gameContainerSize.width ? Math.min(150, gameContainerSize.width / 4) : 120} />
          ) : (
            <RocketShip 
              size={gameContainerSize.width ? Math.min(150, gameContainerSize.width / 4) : 120} 
              flameActive={gameState === 'running'} 
            />
          )}
        </div>
        
        {/* Simplified UI for mobile - Fuel gauge more compact */}
        <div className="absolute bottom-2 left-2 bg-[#0A1725]/70 border border-blue-500/30 shadow-lg shadow-blue-500/20 rounded-lg p-1 z-20">
          <FuelGauge 
            level={fuelLevel} 
            size={gameContainerSize.width ? Math.min(120, gameContainerSize.width / 5) : 100} 
          />
        </div>
      </div>
      
      {/* Game history display - more compact for mobile */}
      <div className="absolute bottom-2 right-2 bg-[#0A1725]/90 border border-blue-500/30 shadow-lg shadow-blue-500/20 rounded-lg p-1 z-20">
        <h3 className="text-xs font-medium text-white mb-1">Recent</h3>
        <div className="flex flex-wrap gap-1 max-w-[100px] md:max-w-[180px]">
          {gameHistory.slice(0, 5).map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`
                text-xs px-1 py-0.5 font-semibold
                ${item.value < 2 ? 'bg-red-500/40 text-red-200 border-red-500/50' : 
                  item.value < 10 ? 'bg-yellow-500/40 text-yellow-200 border-yellow-500/50' : 
                    'bg-green-500/40 text-green-200 border-green-500/50'}
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
      isMobileFriendly={true}
      mobileFirst={true}
    />
  );
};

export default RocketLaunchRevised;