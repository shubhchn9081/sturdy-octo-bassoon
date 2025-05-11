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

// Asset paths
const CAR_IMG_PATH = '/car.svg';
const WHEEL_IMG_PATH = '/wheel.svg';
const SMOKE_IMG_PATH = '/smoke.svg';

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
  const leftWheelRef = useRef<HTMLImageElement>(null);
  const rightWheelRef = useRef<HTMLImageElement>(null);
  const smokeRef = useRef<HTMLImageElement>(null);
  const carContainerRef = useRef<HTMLDivElement>(null);
  const fuelBarRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLDivElement>(null);
  
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
  
  // Setup video playback based on game state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Kill any existing animations
    if (videoTimeline.current) videoTimeline.current.kill();
    if (carTimeline.current) carTimeline.current.kill();
    if (wheelsTimeline.current) wheelsTimeline.current.kill();
    if (smokeTimeline.current) smokeTimeline.current.kill();
    
    // Set up new animations based on game state
    if (gameState === 'waiting') {
      // Hide smoke during waiting state
      setShowSmoke(false);
      
      // Reset video to beginning and play slowly
      video.currentTime = 0;
      video.playbackRate = 0.2;
      video.play().catch(err => console.log('Video play error:', err));
      
      // Reset car position
      if (carContainerRef.current) {
        gsap.to(carContainerRef.current, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.5
        });
      }
      
      // Idle animation for the car - gentle bobbing during refueling
      carTimeline.current = gsap.timeline({ repeat: -1, yoyo: true });
      carTimeline.current.to(carContainerRef.current, {
        y: '-5px',
        duration: 1,
        ease: 'sine.inOut'
      });
      
      // Slow wheel rotation during idle
      if (leftWheelRef.current && rightWheelRef.current) {
        wheelsTimeline.current = gsap.timeline({ repeat: -1 });
        wheelsTimeline.current.to([leftWheelRef.current, rightWheelRef.current], {
          rotation: 360,
          duration: 3,
          ease: 'none',
          transformOrigin: 'center center'
        });
      }
      
    } else if (gameState === 'running') {
      // Hide smoke during running
      setShowSmoke(false);
      
      // Play road video at speed based on multiplier
      video.playbackRate = 0.5;
      video.play().catch(err => console.log('Video play error:', err));
      
      // Dynamic video speed based on multiplier
      videoTimeline.current = gsap.timeline();
      videoTimeline.current.to(video, {
        playbackRate: 5,
        duration: 10,
        ease: 'power1.in',
        onUpdate: () => {
          // Dynamically adjust playback rate based on multiplier
          const newRate = Math.min(5, 0.5 + (currentMultiplier - 1) * 1.5);
          if (video) {
            video.playbackRate = newRate;
          }
        }
      });
      
      // Car animation - slight scaling and bobbing to simulate forward motion
      if (carContainerRef.current) {
        carTimeline.current = gsap.timeline({ repeat: -1, yoyo: true });
        carTimeline.current.to(carContainerRef.current, {
          y: '-3px',
          rotation: 0.5,
          scale: 1.02,
          duration: 0.2,
          ease: 'sine.inOut'
        }).to(carContainerRef.current, {
          y: '0px',
          rotation: -0.5,
          scale: 1,
          duration: 0.2,
          ease: 'sine.inOut'
        });
        
        // Make car animation speed match the multiplier
        gsap.to(carTimeline.current, {
          timeScale: () => Math.min(3, 1 + (currentMultiplier - 1) * 0.5),
          duration: 0.5,
          ease: 'power1.out'
        });
      }
      
      // Wheel rotation animation
      if (leftWheelRef.current && rightWheelRef.current) {
        wheelsTimeline.current = gsap.timeline({ repeat: -1 });
        wheelsTimeline.current.to([leftWheelRef.current, rightWheelRef.current], {
          rotation: 360,
          duration: 0.5,
          ease: 'none',
          transformOrigin: 'center center'
        });
        
        // Make wheel rotation speed match the multiplier
        gsap.to(wheelsTimeline.current, {
          timeScale: () => Math.min(8, 1 + (currentMultiplier - 1) * 1.8),
          duration: 0.5,
          ease: 'power1.out'
        });
      }
      
      // Animate multiplier display
      if (multiplierRef.current) {
        gsap.to(multiplierRef.current, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
      
    } else if (gameState === 'crashed') {
      // Show smoke when crashed (out of fuel)
      setShowSmoke(true);
      
      // Slow down video when crashed
      gsap.to(video, {
        playbackRate: 0,
        duration: 1,
        ease: 'power2.out'
      });
      
      // Stop car animation
      if (carTimeline.current) {
        carTimeline.current.kill();
      }
      
      // Create car stall/sputter animation
      if (carContainerRef.current) {
        gsap.to(carContainerRef.current, {
          x: '-10px',
          rotation: -1,
          duration: 0.1,
          ease: 'power2.out',
          repeat: 5,
          yoyo: true,
          onComplete: () => {
            gsap.to(carContainerRef.current, {
              rotation: 0,
              x: 0,
              duration: 0.5
            });
          }
        });
      }
      
      // Slow down and stop wheel rotation
      if (wheelsTimeline.current) {
        gsap.to(wheelsTimeline.current, {
          timeScale: 0,
          duration: 1,
          ease: 'power2.out',
          onComplete: () => {
            if (wheelsTimeline.current) {
              wheelsTimeline.current.kill();
            }
          }
        });
      }
      
      // Animate smoke puffs
      if (smokeRef.current) {
        smokeTimeline.current = gsap.timeline({ repeat: 3 });
        smokeTimeline.current
          .to(smokeRef.current, {
            opacity: 1,
            scale: 1.2,
            duration: 0.5,
            ease: 'power1.out'
          })
          .to(smokeRef.current, {
            opacity: 0.7,
            scale: 1,
            duration: 0.5,
            ease: 'power1.in'
          });
      }
    }
    
    // Cleanup on component unmount
    return () => {
      if (videoTimeline.current) videoTimeline.current.kill();
      if (carTimeline.current) carTimeline.current.kill();
      if (wheelsTimeline.current) wheelsTimeline.current.kill();
      if (smokeTimeline.current) smokeTimeline.current.kill();
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
    preloadImage(WHEEL_IMG_PATH);
    preloadImage(SMOKE_IMG_PATH);
  }, []);
  
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
                    
                    {/* Car assembly with wheels and smoke */}
                    <div 
                      ref={carContainerRef}
                      className="absolute left-1/2 bottom-16 transform -translate-x-1/2 z-10"
                      style={{ width: '200px', height: '100px' }}
                      data-game-id={useCrashCarStore.getState().gameId || ''}
                    >
                      {/* Car body */}
                      <img 
                        ref={carRef} 
                        src={CAR_IMG_PATH} 
                        alt="Racing Car" 
                        className="w-full h-full absolute top-0 left-0"
                      />
                      
                      {/* Wheels that will rotate */}
                      <img 
                        ref={leftWheelRef}
                        src={WHEEL_IMG_PATH} 
                        alt="Left Wheel" 
                        className="absolute bottom-0 left-12 w-10 h-10"
                        style={{ transformOrigin: 'center center' }}
                      />
                      <img 
                        ref={rightWheelRef}
                        src={WHEEL_IMG_PATH} 
                        alt="Right Wheel" 
                        className="absolute bottom-0 right-12 w-10 h-10"
                        style={{ transformOrigin: 'center center' }}
                      />
                      
                      {/* Smoke puffs that appear when crashed */}
                      {showSmoke && (
                        <img 
                          ref={smokeRef}
                          src={SMOKE_IMG_PATH} 
                          alt="Exhaust Smoke" 
                          className="absolute -top-8 left-10 w-16 h-16 opacity-80"
                        />
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
                    <Button 
                      onClick={placeBet} 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2"
                      disabled={parseFloat(betInput) <= 0}
                    >
                      PLACE BET
                    </Button>
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
            
            {/* Right Column - Bet Controls & History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Place Your Bet</CardTitle>
                  <CardDescription>Set your bet amount and auto cashout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bet-amount">Bet Amount (₹)</Label>
                    <Input 
                      id="bet-amount" 
                      type="number" 
                      min="1" 
                      step="1" 
                      value={betInput}
                      onChange={handleBetInputChange}
                      disabled={gameState !== 'waiting'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-cashout">Auto Cashout (optional)</Label>
                    <Input 
                      id="auto-cashout" 
                      type="number" 
                      min="1.01" 
                      step="0.01" 
                      placeholder="Auto cashout at multiplier..." 
                      value={autoCashoutInput}
                      onChange={handleAutoCashoutChange}
                      disabled={gameState !== 'waiting'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quick Bet</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setBetInput('10.00');
                          setBetAmount(10.00);
                        }}
                        disabled={gameState !== 'waiting'}
                      >
                        ₹10
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setBetInput('50.00');
                          setBetAmount(50.00);
                        }}
                        disabled={gameState !== 'waiting'}
                      >
                        ₹50
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setBetInput('100.00');
                          setBetAmount(100.00);
                        }}
                        disabled={gameState !== 'waiting'}
                      >
                        ₹100
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quick Cashout</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setAutoCashoutInput('1.5');
                          setAutoCashoutValue(1.5);
                        }}
                        disabled={gameState !== 'waiting'}
                      >
                        1.5×
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setAutoCashoutInput('2.0');
                          setAutoCashoutValue(2.0);
                        }}
                        disabled={gameState !== 'waiting'}
                      >
                        2.0×
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setAutoCashoutInput('');
                          setAutoCashoutValue(null);
                        }}
                        disabled={gameState !== 'waiting'}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
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