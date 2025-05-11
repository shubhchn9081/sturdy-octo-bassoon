import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrashCarStore, GameState } from '../games/useCrashCarStore';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { gsap } from 'gsap';
import { MobileBettingPanel } from '@/components/MobileBettingPanel';

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
                    <Button 
                      onClick={cashOut} 
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 animate-pulse"
                    >
                      CASH OUT @ {formatMultiplier(currentMultiplier)}
                    </Button>
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
                <MobileBettingPanel 
                  gameState={gameState}
                  betAmount={betAmount}
                  autoCashoutValue={autoCashoutValue}
                  currentMultiplier={currentMultiplier}
                  cashoutTriggered={cashoutTriggered}
                  errorMessage={errorMessage}
                  isWaiting={gameState === 'waiting'}
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