import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrashCarStore, GameState } from '../games/useCrashCarStore';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { gsap } from 'gsap';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Simple betting panel component
const SimpleBettingPanel = ({
  gameState,
  betAmount,
  autoCashoutValue,
  currentMultiplier,
  cashoutTriggered,
  errorMessage,
  setBetAmount,
  setAutoCashoutValue,
  placeBet,
  cashOut,
  clearError
}: {
  gameState: string;
  betAmount: number;
  autoCashoutValue: number | null;
  currentMultiplier: number;
  cashoutTriggered: number | null;
  errorMessage: string | null;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number | null) => void;
  placeBet: () => void;
  cashOut: () => void;
  clearError: () => void;
}) => {
  const { balance } = useWallet();
  const [localBetAmount, setLocalBetAmount] = useState<string>(betAmount.toString());
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  
  // Extract all needed state from the store at the top of the component
  const activeBets = useCrashCarStore(state => state.activeBets);
  const isWaiting = useCrashCarStore(state => state.isWaiting);
  const speed = useCrashCarStore(state => Math.round(state.speed * 100));
  const fuelLevel = useCrashCarStore(state => state.fuelLevel);
  const fuelLevelRounded = useCrashCarStore(state => Math.round(state.fuelLevel));
  
  // Check if player has an active bet
  const hasActiveBet = activeBets.some(bet => bet.isPlayer && bet.status === 'active');
  
  // Preset bet amounts
  const presetAmounts = [1, 100, 10000, 50000];
  
  // Update local bet amount when props change
  useEffect(() => {
    setLocalBetAmount(betAmount.toString());
  }, [betAmount]);
  
  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBetAmount(value);
    
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setBetAmount(numericValue);
    }
  };
  
  // Handle preset amount click
  const handlePresetClick = (amount: number) => {
    setBetAmount(amount);
    setLocalBetAmount(amount.toString());
  };
  
  // Handle bet amount blur
  const handleBetAmountBlur = () => {
    const numericValue = parseFloat(localBetAmount);
    if (isNaN(numericValue) || numericValue <= 0) {
      setBetAmount(1); // Default to 1 if invalid
      setLocalBetAmount('1');
    }
  };
  
  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto">
      {/* Error message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-1 py-1">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-0 right-0 h-6 w-6"
            onClick={clearError}
          >
            ✕
          </Button>
        </Alert>
      )}
      
      {/* Betting controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        {/* Bet amount & presets */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="betAmount" className="text-sm">Bet Amount</Label>
            <div className="flex items-center gap-1">
              <Label htmlFor="autoPlay" className="text-sm mr-1">Auto</Label>
              <Switch
                id="autoPlay"
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
                className="scale-75"
              />
            </div>
          </div>
          
          <Input
            id="betAmount"
            type="number"
            min="1"
            max="50000"
            step="1"
            value={localBetAmount}
            onChange={handleBetAmountChange}
            onBlur={handleBetAmountBlur}
            className="w-full h-8"
          />
          
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-1 mt-1">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="text-xs py-0 h-6"
                onClick={() => handlePresetClick(amount)}
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Auto-cashout */}
        <div className="space-y-1">
          <Label htmlFor="autoCashout" className="text-sm">Auto Cashout (Multiplier)</Label>
          <Input
            id="autoCashout"
            type="number"
            min="1.1"
            step="0.1"
            value={autoCashoutValue || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && value >= 1.1) {
                setAutoCashoutValue(value);
              } else {
                setAutoCashoutValue(null);
              }
            }}
            className="w-full h-8"
            placeholder="e.g. 2.0"
          />
          
          {/* Multiplier display during game */}
          {gameState === 'running' && (
            <div className="mt-1 space-y-2">
              <div className="p-1 bg-gradient-to-r from-blue-900 to-indigo-800 rounded text-center">
                <span className="text-white text-lg font-bold">{currentMultiplier.toFixed(2)}×</span>
              </div>
              
              {/* Speed indicator */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mr-1">
                    <path d="m12 17 3-4-3-1-1-4-1 9Z"/>
                    <path d="M14 5.5a9 9 0 1 1-4.11 17.04"/>
                    <path d="M16 9.5a5 5 0 1 0-5.98 7.9"/>
                  </svg>
                  <span className="text-blue-300">Speed:</span>
                </div>
                <span className="font-bold text-blue-400">
                  {speed} km/h
                </span>
              </div>
              
              {/* Fuel level indicator */}
              <div className="flex items-center space-x-2">
                <Gauge size={16} className="text-yellow-500" />
                <div className="w-full">
                  <Progress 
                    value={fuelLevel} 
                    max={100}
                    className={`h-2 bg-gray-700 ${
                      fuelLevel < 25 
                        ? 'data-[value]:bg-red-500' 
                        : fuelLevel < 50 
                          ? 'data-[value]:bg-yellow-500' 
                          : 'data-[value]:bg-green-500'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-300 w-8 text-right">
                  {fuelLevelRounded}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Button */}
      <div>
        {/* Cash out button - only show during running game with an active bet */}
        {gameState === 'running' && hasActiveBet ? (
          <Button
            variant="default"
            className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-black rounded-lg shadow-lg shadow-green-500/30"
            onClick={cashOut}
            disabled={cashoutTriggered !== null}
          >
            {cashoutTriggered !== null ? (
              'CASHED OUT'
            ) : (
              <>
                CASH OUT ({currentMultiplier.toFixed(2)}×)
              </>
            )}
          </Button>
        ) : (
          /* Place bet button - always show during waiting/refueling phase */
          <Button
            variant="default"
            className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-black rounded-lg shadow-lg shadow-green-500/30"
            onClick={placeBet}
            disabled={betAmount <= 0 || gameState === 'running'}
          >
            {/* Never show the waiting animation */}
            {gameState === 'running' ? 'IN PROGRESS' : 'PLACE BET'}
          </Button>
        )}
        
        {/* Only show insufficient balance warning when both values are valid numbers and there's not enough balance */}
        {typeof balance === 'number' && 
         typeof betAmount === 'number' && 
         betAmount > 0 && 
         balance > 0 && 
         betAmount > balance && (
          <p className="text-xs text-red-500 flex items-center justify-center mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Insufficient balance
          </p>
        )}
      </div>
    </div>
  );
};

// Asset paths (using Cloudinary for reliable hosting)
const CAR_IMG_PATH = 'https://res.cloudinary.com/dbbig5cq5/image/upload/v1746998237/ChatGPT_Image_May_12_2025_02_46_05_AM_azrrku.png';
const SMOKE_IMG_PATH = '/smoke.svg';

// Add a CSS keyframe animation for the wheel rotation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes wheel-blur {
      0% { filter: blur(0px); opacity: 0.7; }
      50% { filter: blur(1px); opacity: 0.9; }
      100% { filter: blur(0px); opacity: 0.7; }
    }
  `;
  document.head.appendChild(style);
}

// Video URL
const ROAD_VIDEO_URL = "https://res.cloudinary.com/dbbig5cq5/video/upload/v1746993328/Generated_File_May_12_2025_-_1_23AM_rwdmgz.mp4";

const CrashCarGame: React.FC = () => {
  const { toast } = useToast();
  const { balance, refreshBalance } = useWallet();
  
  // Access the game state from the store
  const {
    gameState,
    currentMultiplier,
    countdown,
    betAmount,
    autoCashoutValue,
    activeBets,
    gameHistory,
    cashoutTriggered,
    errorMessage,
    fuelLevel,
    speed,
    placeBet,
    cashOut,
    setBetAmount,
    setAutoCashoutValue,
    clearError
  } = useCrashCarStore();
  
  // Refs for animation and DOM elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const smokeRef = useRef<HTMLImageElement>(null);
  const carContainerRef = useRef<HTMLDivElement>(null);
  const fuelBarRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLDivElement>(null);
  const frontWheelEffectRef = useRef<HTMLDivElement>(null);
  const backWheelEffectRef = useRef<HTMLDivElement>(null);
  
  // Animation timeline refs
  const videoTimeline = useRef<gsap.core.Timeline | null>(null);
  const carTimeline = useRef<gsap.core.Timeline | null>(null);
  const wheelsTimeline = useRef<gsap.core.Timeline | null>(null);
  const fuelTimeline = useRef<gsap.core.Timeline | null>(null);
  const smokeTimeline = useRef<gsap.core.Timeline | null>(null);
  
  // State for form inputs
  const [betInput, setBetInput] = useState('10.00');
  const [autoCashoutInput, setAutoCashoutInput] = useState<string>('');
  const [showSmoke, setShowSmoke] = useState(false);
  
  // State for car positioning - moved up by 200% as requested
  const [carPositionY, setCarPositionY] = useState(80);
  
  // Fuel gauge animation
  useEffect(() => {
    if (fuelBarRef.current && gameState === 'running') {
      // Animate fuel bar based on current fuel level
      gsap.to(fuelBarRef.current, {
        width: `${Math.max(0, fuelLevel)}%`,
        duration: 0.3,
        ease: 'power1.out'
      });
    }
  }, [fuelLevel, gameState]);
  
  // Simple video playback logic without GSAP
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set up basic video behavior based on game state
    if (gameState === 'waiting' || gameState === 'crashed') {
      // Hide smoke except during crashed state
      setShowSmoke(gameState === 'crashed');
      
      // Pause the video during waiting/crashed state
      try {
        video.pause();
        video.currentTime = 0;
      } catch (err) {
        console.log('Video pause error:', err);
      }
      
    } else if (gameState === 'running') {
      // Hide smoke during running
      setShowSmoke(false);
      
      // Play road video at a fixed speed
      try {
        video.playbackRate = 0.5 + (currentMultiplier * 0.1); // Faster based on multiplier
        video.play().catch(err => console.log('Video play error:', err));
      } catch (err) {
        console.log('Video playback error:', err);
        video.play().catch(err => console.log('Video play error:', err));
      }
    }
    
    // Make wheels visible during running state
    if (frontWheelEffectRef.current && backWheelEffectRef.current) {
      if (gameState === 'running') {
        frontWheelEffectRef.current.style.opacity = '1';
        backWheelEffectRef.current.style.opacity = '1';
      } else {
        frontWheelEffectRef.current.style.opacity = '0';
        backWheelEffectRef.current.style.opacity = '0';
      }
    }
    
    // Update wheel animation speed based on multiplier
    const updateWheelSpeed = () => {
      if (gameState !== 'running') return;
      
      // Target all the spokes inside both wheels
      const spokes = document.querySelectorAll('.wheel-effects .relative div[class*="absolute"]');
      const rims = document.querySelectorAll('.wheel-effects .relative div[class*="inset-0"]');
      
      // Lower duration = faster animation
      const duration = Math.max(0.05, 0.2 - ((currentMultiplier - 1) * 0.03));
      
      // Apply the new animation duration
      spokes.forEach(spoke => {
        if (spoke instanceof HTMLElement) {
          spoke.style.animationDuration = `${duration}s`;
        }
      });
      
      // Also adjust blur animation
      rims.forEach(rim => {
        if (rim instanceof HTMLElement) {
          rim.style.animationDuration = `${duration * 2}s`;
        }
      });
    };
    
    // Initial update
    updateWheelSpeed();
    
    // Set up interval to update wheel speed
    const wheelInterval = setInterval(updateWheelSpeed, 500);
    
    // Cleanup
    return () => {
      clearInterval(wheelInterval);
      video.pause();
    };
  }, [gameState, currentMultiplier]);
  
  // Update window global with refreshBalance function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshBalance = refreshBalance;
      return () => {
        delete (window as any).refreshBalance;
      };
    }
  }, [refreshBalance]);
  
  // Handle error message display
  useEffect(() => {
    if (errorMessage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      clearError();
    }
  }, [errorMessage, toast, clearError]);
  
  // Format the multiplier for display
  const formatMultiplier = (value: number): string => {
    return `${value.toFixed(2)}×`;
  };
  
  // Update bet amount based on input
  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetInput(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setBetAmount(parsedValue);
    }
  };
  
  // Update auto cashout value based on input
  const handleAutoCashoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAutoCashoutInput(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 1) {
      setAutoCashoutValue(parsedValue);
    } else {
      setAutoCashoutValue(null);
    }
  };
  
  // Check if player has an active bet
  const hasActiveBet = activeBets.some(bet => bet.isPlayer && bet.status === 'active');
  
  // Check if player has cashed out
  const hasCashedOut = cashoutTriggered !== null;
  
  // Get CSS class for history item badge
  const getHistoryItemClass = (crashPoint: number): string => {
    if (crashPoint >= 2) return 'bg-green-600';
    if (crashPoint >= 1.5) return 'bg-blue-600';
    return 'bg-red-600';
  };
  
  // Preload all assets
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    
    preloadImage(CAR_IMG_PATH);
    preloadImage(SMOKE_IMG_PATH);
  }, []);
  
  // Car position is now fixed at a good height
  // No need for keyboard controls anymore
  
  return (
    <div className="w-full h-full">
      <Tabs defaultValue="game" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="game">Game</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="game" className="space-y-4">
          {/* Game layout with two columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Column - Game Display */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {gameState === 'waiting' && countdown !== null && (
                        <span className="text-yellow-500">Starting in {countdown}s</span>
                      )}
                      {gameState === 'running' && (
                        <div 
                          ref={multiplierRef}
                          className="text-green-500 text-2xl inline-block"
                        >
                          {formatMultiplier(currentMultiplier)}
                        </div>
                      )}
                      {gameState === 'crashed' && (
                        <span className="text-red-500">Out of fuel at {formatMultiplier(currentMultiplier)}</span>
                      )}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-yellow-500" />
                      <Label>Fuel:</Label>
                      <div className="w-24 h-4 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          ref={fuelBarRef}
                          className="h-full bg-yellow-500 transition-all duration-300"
                          style={{ width: `${fuelLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="relative w-full h-64 bg-gray-900 rounded-md overflow-hidden">
                    {/* Video background */}
                    <video
                      ref={videoRef}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      src={ROAD_VIDEO_URL}
                      muted
                      loop
                      playsInline
                    ></video>
                    
                    {/* Game scene with layered elements as per guidance:
                         1. Wheels drawn first (lower z-index)
                         2. Car drawn on top of wheels
                         3. Motion effects visible only during running state
                    */}
                    
                    {/* Position guide overlay removed */}
                    
                    <div 
                      ref={carContainerRef}
                      className="absolute left-1/2"
                      style={{ 
                        width: '240px', 
                        height: '120px', 
                        position: 'relative',
                        transform: `translateX(-50%) translateY(${carPositionY}px)`,
                      }}
                      data-game-id={useCrashCarStore.getState().gameId || ''}
                    >
                      {/* Layer 1: Wheel motion effects positioned over the tires in the image */}
                      <div className="wheel-effects" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}>
                        {/* Back wheel motion effect - including spokes and a blur effect */}
                        <div 
                          ref={backWheelEffectRef}
                          className="absolute"
                          style={{ 
                            bottom: '10px',
                            left: '47px',
                            width: '48px', 
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0)',
                            boxShadow: gameState === 'running' ? '0 0 4px rgba(255,255,255,0.3)' : 'none',
                            overflow: 'hidden',
                            opacity: gameState === 'running' ? 1 : 0
                          }}
                        >
                          {/* Wheel spokes */}
                          <div className="relative w-full h-full">
                            {[...Array(8)].map((_, i) => (
                              <div 
                                key={`back-spoke-${i}`}
                                className="absolute top-1/2 left-1/2 h-[24px] w-[2px]"
                                style={{
                                  transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                                  transformOrigin: 'center center',
                                  backgroundColor: 'rgba(255,255,255,0.5)',
                                  animation: gameState === 'running' ? 'spin 0.1s linear infinite' : 'none'
                                }}
                              />
                            ))}
                            {/* Wheel rim */}
                            <div 
                              className="absolute inset-0 rounded-full border-2 border-white opacity-60"
                              style={{
                                animation: gameState === 'running' ? 'wheel-blur 0.2s linear infinite' : 'none'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Front wheel motion effect - matching the back wheel */}
                        <div 
                          ref={frontWheelEffectRef}
                          className="absolute"
                          style={{ 
                            bottom: '10px',
                            right: '46px',
                            width: '48px', 
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0)',
                            boxShadow: gameState === 'running' ? '0 0 4px rgba(255,255,255,0.3)' : 'none',
                            overflow: 'hidden',
                            opacity: gameState === 'running' ? 1 : 0
                          }}
                        >
                          {/* Wheel spokes */}
                          <div className="relative w-full h-full">
                            {[...Array(8)].map((_, i) => (
                              <div 
                                key={`front-spoke-${i}`}
                                className="absolute top-1/2 left-1/2 h-[24px] w-[2px]"
                                style={{
                                  transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                                  transformOrigin: 'center center',
                                  backgroundColor: 'rgba(255,255,255,0.5)',
                                  animation: gameState === 'running' ? 'spin 0.1s linear infinite' : 'none'
                                }}
                              />
                            ))}
                            {/* Wheel rim */}
                            <div 
                              className="absolute inset-0 rounded-full border-2 border-white opacity-60"
                              style={{
                                animation: gameState === 'running' ? 'wheel-blur 0.2s linear infinite' : 'none'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Layer 2: Motion effects - only shows during running state */}
                      {gameState === 'running' && (
                        <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }}>
                          {/* Ground dust effects - positioned to touch the road */}
                          <div className="absolute bottom-[-5px] left-10 w-14 h-3 bg-gray-300/40 -skew-x-12 rounded-sm blur-sm animate-pulse"></div>
                          <div className="absolute bottom-[-8px] left-14 w-10 h-2 bg-gray-300/30 -skew-x-12 rounded-sm blur-sm animate-pulse"></div>
                          
                          <div className="absolute bottom-[-5px] right-10 w-14 h-3 bg-gray-300/40 -skew-x-12 rounded-sm blur-sm animate-pulse"></div>
                          <div className="absolute bottom-[-8px] right-14 w-10 h-2 bg-gray-300/30 -skew-x-12 rounded-sm blur-sm animate-pulse"></div>
                          
                          {/* Speed lines - appear when car is going faster (multiplier > 1.5) */}
                          {currentMultiplier > 1.5 && (
                            <>
                              <div className="absolute top-10 left-0 w-16 h-1 bg-white/20 -skew-y-12 rounded-sm blur-sm animate-pulse"></div>
                              <div className="absolute top-14 left-0 w-12 h-1 bg-white/20 -skew-y-12 rounded-sm blur-sm animate-pulse"></div>
                              <div className="absolute top-18 left-0 w-10 h-1 bg-white/20 -skew-y-12 rounded-sm blur-sm animate-pulse"></div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Layer 3: Car body on top */}
                      <img 
                        ref={carRef} 
                        src={CAR_IMG_PATH} 
                        alt="Racing Truck" 
                        className="absolute top-0 left-0 w-full h-auto object-contain"
                        style={{ zIndex: 3 }}
                      />
                      
                      {/* Layer 4: Smoke puffs that appear when crashed (highest z-index) */}
                      {showSmoke && (
                        <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 4 }}>
                          <img 
                            ref={smokeRef}
                            src={SMOKE_IMG_PATH} 
                            alt="Exhaust Smoke" 
                            className="absolute -top-5 left-20 w-20 h-20 opacity-80"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {gameState === 'waiting' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-black bg-opacity-70 rounded-lg p-4 z-20">
                      <div className="text-white text-xl mb-2">Car Refueling...</div>
                      <Progress value={(10 - (countdown || 0)) * 10} className="w-48" />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {gameHistory.slice(0, 10).map((item, index) => (
                      <Badge 
                        key={index} 
                        className={`${getHistoryItemClass(item.crashPoint)}`}
                      >
                        {formatMultiplier(item.crashPoint)}
                      </Badge>
                    ))}
                  </div>
                  
                  {gameState === 'running' && !hasCashedOut && hasActiveBet ? (
                    <div className="text-green-500 text-center py-2 font-bold">
                      Auto Cashout is {autoCashoutValue ? 'set to ' + formatMultiplier(autoCashoutValue) : 'disabled'}
                    </div>
                  ) : gameState === 'waiting' ? (
                    <div className="text-yellow-500 text-center py-2">
                      Waiting for next round...
                    </div>
                  ) : hasCashedOut ? (
                    <Badge variant="outline" className="bg-green-700 text-white px-4 py-2">
                      Cashed Out @ {formatMultiplier(cashoutTriggered || 0)}
                    </Badge>
                  ) : (
                    <Button disabled className="px-8 py-2">
                      {gameState === 'crashed' ? 'OUT OF FUEL' : 'WAITING...'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Betting Panel and Live Bets */}
            <div>
              {/* Betting Panel */}
              <div className="mb-4">
                <SimpleBettingPanel 
                  gameState={gameState}
                  betAmount={betAmount}
                  autoCashoutValue={autoCashoutValue}
                  currentMultiplier={currentMultiplier}
                  cashoutTriggered={cashoutTriggered}
                  errorMessage={errorMessage}
                  setBetAmount={setBetAmount}
                  setAutoCashoutValue={setAutoCashoutValue}
                  placeBet={placeBet}
                  cashOut={cashOut}
                  clearError={clearError}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Live Bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {activeBets.length > 0 ? (
                      activeBets.map((bet, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between items-center border-b pb-2 ${
                            bet.isPlayer ? 'font-bold' : ''
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm">{bet.username}</span>
                            <span className="text-xs opacity-70">₹{bet.amount.toFixed(2)}</span>
                          </div>
                          
                          {bet.status === 'won' ? (
                            <Badge className="bg-green-600">
                              {formatMultiplier(bet.cashoutMultiplier || 0)}
                            </Badge>
                          ) : bet.status === 'lost' ? (
                            <Badge className="bg-red-600">Lost</Badge>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">No active bets</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
              <CardDescription>Previous game outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {gameHistory.map((item, index) => (
                  <Badge 
                    key={index} 
                    className={`${getHistoryItemClass(item.crashPoint)} text-center py-2`}
                  >
                    <div className="flex flex-col">
                      <span>{formatMultiplier(item.crashPoint)}</span>
                      <span className="text-xs opacity-80">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
              <CardDescription>Probability and odds information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Probability Table</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-bold text-green-500">1.2×</div>
                      <div>87.5% chance</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-bold text-green-500">2.0×</div>
                      <div>50% chance</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-bold text-green-500">5.0×</div>
                      <div>20% chance</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-bold text-green-500">10.0×</div>
                      <div>10% chance</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-bold text-green-500">20.0×</div>
                      <div>5% chance</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-bold text-green-500">100.0×</div>
                      <div>1% chance</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Game Info</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>House edge: 5%</li>
                    <li>Minimum bet: ₹1.00</li>
                    <li>Maximum bet: ₹10,000.00</li>
                    <li>Maximum win: ₹100,000.00</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrashCarGame;