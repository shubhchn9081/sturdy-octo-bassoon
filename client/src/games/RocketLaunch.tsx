import React, { useEffect, useRef, useState } from 'react';
import { useRocketLaunchStore } from './useRocketLaunchStore';
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
  AtmosphereStage 
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
const GAME_ID = 150; // New ID for Rocket Launch game
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const HEIGHT_SCALE = 80; // Scale factor for height display
const TIME_SCALE = 100; // Scale factor for time display

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

// Main Rocket Launch game component
const RocketLaunch: React.FC = () => {
  // Get game state from store
  const {
    gameState,
    currentMultiplier,
    countdown,
    atmosphereStage,
    rocketPosition,
    fuelLevel,
    weatherCondition,
    hasPlacedBet,
    hasCashedOut,
    betAmount,
    autoCashoutValue,
    activeBets,
    gameHistory,
    dataPoints,
    crashMultiplier,
    
    // Actions
    placeBet,
    cashOut,
    setBetAmount,
    setAutoCashoutValue,
  } = useRocketLaunchStore();
  
  // Refs for canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Local state
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [autoCashoutInputValue, setAutoCashoutInputValue] = useState('2.00');
  const [gameContainerSize, setGameContainerSize] = useState({ width: 0, height: 0 });
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Get wallet info and toast
  const { toast } = useToast();
  const { balance, formattedBalance } = useWallet();
  const { placeBet: placeGameBet, completeBet: completeGameBet } = useGameBet(GAME_ID);
  
  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        contextRef.current = context;
      }
    }
  }, [canvasRef]);
  
  // Update game container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (gameContainerRef.current) {
        const { width, height } = gameContainerRef.current.getBoundingClientRect();
        setGameContainerSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  // Handle auto-cashout toggle
  useEffect(() => {
    if (isAutoCashoutEnabled) {
      const value = parseFloat(autoCashoutInputValue);
      if (!isNaN(value) && value >= 1.01) {
        setAutoCashoutValue(value);
      }
    } else {
      setAutoCashoutValue(null);
    }
  }, [isAutoCashoutEnabled, autoCashoutInputValue, setAutoCashoutValue]);
  
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
    
    // Vertical grid lines (time markers)
    for (let t = 5; t <= 30; t += 5) {
      const x = t * TIME_SCALE;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      
      // Draw time label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px Arial';
      ctx.fillText(`${t}s`, x - 10, canvas.height - 5);
    }
    
    ctx.stroke();
    
    // Draw trajectory line
    if (dataPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2DD4BF'; // Teal color for rocket trajectory
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
    }
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
    
    // Place the bet in the game store first
    placeBet();
    
    // Here you would normally send the bet to the backend
    try {
      await placeGameBet({
        amount: betAmount,
        clientSeed: Math.random().toString(36).substring(2, 15),
        // Additional game-specific parameters could go here
      });
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Failed to place bet",
        description: "There was an error processing your bet",
        variant: "destructive"
      });
    }
  };
  
  // Handle cashout
  const handleCashOut = async () => {
    // Trigger cashout in the game store
    cashOut();
    
    // Here you would normally send the cashout to the backend
    try {
      // Find the player's active bet ID
      const playerBet = activeBets.find(bet => bet.isPlayer);
      if (playerBet && playerBet.id) {
        await completeGameBet(playerBet.id, {
          completed: true,
          multiplier: currentMultiplier,
          profit: betAmount * (currentMultiplier - 1)
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
          <Button
            className="w-full bg-[#2DD4BF] hover:bg-[#14B8A6] text-black font-bold"
            disabled={hasPlacedBet || countdown === null}
            onClick={handlePlaceBet}
          >
            {countdown === null ? 'Waiting...' : `Place Bet (${countdown}s)`}
          </Button>
        ) : gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
          <Button
            className="w-full bg-[#EC4899] hover:bg-[#DB2777] text-white font-bold animate-pulse"
            onClick={handleCashOut}
          >
            Cash Out @ {formatMultiplier(currentMultiplier)}
          </Button>
        ) : (
          <Button
            className="w-full bg-[#172B3A] text-[#94A3B8] font-bold cursor-not-allowed"
            disabled={true}
          >
            {gameState === 'crashed' ? 'Crashed @ ' + formatMultiplier(crashMultiplier || 0) : 'Place Bet'}
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
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-[#2DD4BF] animate-pulse" />
              <span className="text-2xl font-bold text-[#2DD4BF]">
                {formatMultiplier(currentMultiplier)}
              </span>
            </div>
          )}
          
          {gameState === 'crashed' && (
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-500">
                Crashed @ {formatMultiplier(crashMultiplier || 0)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main game visualization - rocket and trajectory */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Trajectory graph for debug/analysis */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute top-0 left-0 opacity-30 pointer-events-none"
        />
        
        {/* Rocket visualization */}
        <div 
          className="absolute" 
          style={{
            left: `${rocketPosition.x}%`,
            bottom: `${rocketPosition.y}%`,
            transform: 'translateX(-50%)',
            transition: 'bottom 0.1s ease-out'
          }}
        >
          {gameState === 'crashed' ? (
            <RocketExplosion size={100} />
          ) : (
            <RocketShip size={60} flameActive={gameState === 'running'} />
          )}
        </div>
        
        {/* Fuel gauge */}
        <div className="absolute bottom-4 left-4">
          <FuelGauge level={fuelLevel} size={150} />
        </div>
      </div>
      
      {/* Player bets display */}
      <div className="absolute bottom-4 right-4 w-64 bg-[#0F212E]/80 rounded-lg p-3 max-h-60 overflow-y-auto">
        <h3 className="text-sm font-medium text-white mb-2">Active Bets</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {activeBets.filter(bet => !bet.isHidden).map((bet, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center text-xs p-1 rounded
                ${bet.isPlayer ? 'bg-[#172B3A]' : 'bg-transparent'}
                ${bet.status === 'won' ? 'text-green-400' : 
                  bet.status === 'lost' ? 'text-red-400' : 'text-white'}`}
            >
              <span>{bet.isPlayer ? 'You' : bet.username}</span>
              <div className="flex items-center gap-1">
                <span>{formatCrypto(bet.amount)}</span>
                {bet.status === 'won' && bet.cashoutMultiplier && (
                  <span className="text-green-400">
                    @ {bet.cashoutMultiplier.toFixed(2)}×
                  </span>
                )}
              </div>
            </div>
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

export default RocketLaunch;