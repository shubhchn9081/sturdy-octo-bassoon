import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrashCarStore, GameState } from '../games/useCrashCarStore';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { gsap } from 'gsap';

// Animation settings
const CAR_DEFAULT_X = 120;
const CAR_DEFAULT_Y = 210;
const WHEEL_RADIUS = 8;

// Image paths
const CAR_IMG_PATH = '/car-orange.svg';
const BUILDINGS_FAR_PATH = '/buildings-far.svg';
const BUILDINGS_MID_PATH = '/buildings-mid.svg';
const BUILDINGS_NEAR_PATH = '/buildings-near.svg';
const ROAD_PATH = '/road.svg';

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
  
  // Canvas and animation references
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const buildingsFarRef = useRef<HTMLImageElement>(null);
  const buildingsMidRef = useRef<HTMLImageElement>(null);
  const buildingsNearRef = useRef<HTMLImageElement>(null);
  const roadRef = useRef<HTMLImageElement>(null);
  
  // GSAP animation references 
  const tlWheelsRef = useRef<gsap.core.Timeline | null>(null);
  const tlCarRef = useRef<gsap.core.Timeline | null>(null);
  const tlBuildingsFarRef = useRef<gsap.core.Timeline | null>(null);
  const tlBuildingsMidRef = useRef<gsap.core.Timeline | null>(null);
  const tlBuildingsNearRef = useRef<gsap.core.Timeline | null>(null);
  const tlRoadRef = useRef<gsap.core.Timeline | null>(null);
  const tlFuelRef = useRef<gsap.core.Timeline | null>(null);
  
  // Animation state
  const [wheelRotation, setWheelRotation] = useState(0);
  const [betInput, setBetInput] = useState('10.00');
  const [autoCashoutInput, setAutoCashoutInput] = useState<string>('');
  
  // Canvas layers for separate animations
  const farLayerRef = useRef<HTMLCanvasElement>(null);
  const midLayerRef = useRef<HTMLCanvasElement>(null);
  const nearLayerRef = useRef<HTMLCanvasElement>(null);
  const roadLayerRef = useRef<HTMLCanvasElement>(null);
  const carLayerRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for animation state
  const animationStateRef = useRef({
    isRunning: false,
    wheelAngle: 0,
    farOffset: 0,
    midOffset: 0,
    nearOffset: 0,
    roadOffset: 0,
    carX: CAR_DEFAULT_X,
    carY: CAR_DEFAULT_Y
  });
  
  // Load all images 
  useEffect(() => {
    // Load car image
    const carImg = new Image();
    carImg.src = CAR_IMG_PATH;
    carImg.onload = () => {
      carRef.current = carImg;
    };
    
    // Load buildings (far) image
    const buildingsFarImg = new Image();
    buildingsFarImg.src = BUILDINGS_FAR_PATH;
    buildingsFarImg.onload = () => {
      buildingsFarRef.current = buildingsFarImg;
    };
    
    // Load buildings (mid) image
    const buildingsMidImg = new Image();
    buildingsMidImg.src = BUILDINGS_MID_PATH;
    buildingsMidImg.onload = () => {
      buildingsMidRef.current = buildingsMidImg;
    };
    
    // Load buildings (near) image
    const buildingsNearImg = new Image();
    buildingsNearImg.src = BUILDINGS_NEAR_PATH;
    buildingsNearImg.onload = () => {
      buildingsNearRef.current = buildingsNearImg;
    };
    
    // Load road image
    const roadImg = new Image();
    roadImg.src = ROAD_PATH;
    roadImg.onload = () => {
      roadRef.current = roadImg;
    };
  }, []);
  
  // Initialize canvas layers
  useEffect(() => {
    const initCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas context properties
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    };
    
    initCanvas(farLayerRef.current);
    initCanvas(midLayerRef.current);
    initCanvas(nearLayerRef.current);
    initCanvas(roadLayerRef.current);
    initCanvas(carLayerRef.current);
    
    // Set up initial renders
    requestAnimationFrame(renderAllLayers);
    
    // Clean up function
    return () => {
      if (tlWheelsRef.current) tlWheelsRef.current.kill();
      if (tlCarRef.current) tlCarRef.current.kill();
      if (tlBuildingsFarRef.current) tlBuildingsFarRef.current.kill();
      if (tlBuildingsMidRef.current) tlBuildingsMidRef.current.kill();
      if (tlBuildingsNearRef.current) tlBuildingsNearRef.current.kill();
      if (tlRoadRef.current) tlRoadRef.current.kill();
      if (tlFuelRef.current) tlFuelRef.current.kill();
    };
  }, []);
  
  // Rendering functions
  const renderFarBuildings = () => {
    const canvas = farLayerRef.current;
    const ctx = canvas?.getContext('2d');
    const img = buildingsFarRef.current;
    
    if (!ctx || !img || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply slight blur for depth effect
    ctx.filter = 'blur(1px)';
    
    // Draw repeated far buildings with offset
    const offset = animationStateRef.current.farOffset;
    const imgWidth = 800;
    
    // Draw multiple times to cover the canvas
    for (let x = -offset % imgWidth; x < canvas.width + imgWidth; x += imgWidth) {
      ctx.drawImage(img, x, 0, imgWidth, 200);
    }
    
    ctx.filter = 'none';
  };
  
  const renderMidBuildings = () => {
    const canvas = midLayerRef.current;
    const ctx = canvas?.getContext('2d');
    const img = buildingsMidRef.current;
    
    if (!ctx || !img || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw repeated mid buildings with offset
    const offset = animationStateRef.current.midOffset;
    const imgWidth = 800;
    
    // Draw multiple times to cover the canvas
    for (let x = -offset % imgWidth; x < canvas.width + imgWidth; x += imgWidth) {
      ctx.drawImage(img, x, 20, imgWidth, 180);
    }
  };
  
  const renderNearBuildings = () => {
    const canvas = nearLayerRef.current;
    const ctx = canvas?.getContext('2d');
    const img = buildingsNearRef.current;
    
    if (!ctx || !img || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw repeated near buildings with offset and slight bounce effect
    const offset = animationStateRef.current.nearOffset;
    const imgWidth = 800;
    const bounceOffset = Math.sin(Date.now() / 300) * 2; // Subtle bounce
    
    // Draw multiple times to cover the canvas
    for (let x = -offset % imgWidth; x < canvas.width + imgWidth; x += imgWidth) {
      ctx.drawImage(img, x, 60 + bounceOffset, imgWidth, 140);
    }
  };
  
  const renderRoad = () => {
    const canvas = roadLayerRef.current;
    const ctx = canvas?.getContext('2d');
    const img = roadRef.current;
    
    if (!ctx || !img || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw repeated road with offset
    const offset = animationStateRef.current.roadOffset;
    const imgWidth = 800;
    
    // Draw multiple times to cover the canvas
    for (let x = -offset % imgWidth; x < canvas.width + imgWidth; x += imgWidth) {
      ctx.drawImage(img, x, canvas.height - 100, imgWidth, 100);
    }
  };
  
  const renderCar = () => {
    const canvas = carLayerRef.current;
    const ctx = canvas?.getContext('2d');
    const img = carRef.current;
    
    if (!ctx || !img || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { carX, carY, wheelAngle } = animationStateRef.current;
    
    // Draw car body
    ctx.drawImage(img, carX, carY - 60, 120, 60);
    
    // Draw rotating wheels with spokes
    const frontWheelX = carX + 85;
    const rearWheelX = carX + 35;
    const wheelY = carY - 10;
    
    // Front wheel
    ctx.save();
    ctx.translate(frontWheelX, wheelY);
    ctx.rotate(wheelAngle);
    ctx.beginPath();
    ctx.arc(0, 0, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Wheel spokes
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -WHEEL_RADIUS);
    ctx.moveTo(0, 0);
    ctx.lineTo(WHEEL_RADIUS, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, WHEEL_RADIUS);
    ctx.moveTo(0, 0);
    ctx.lineTo(-WHEEL_RADIUS, 0);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // Rear wheel
    ctx.save();
    ctx.translate(rearWheelX, wheelY);
    ctx.rotate(wheelAngle);
    ctx.beginPath();
    ctx.arc(0, 0, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Wheel spokes
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -WHEEL_RADIUS);
    ctx.moveTo(0, 0);
    ctx.lineTo(WHEEL_RADIUS, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, WHEEL_RADIUS);
    ctx.moveTo(0, 0);
    ctx.lineTo(-WHEEL_RADIUS, 0);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };
  
  const renderAllLayers = () => {
    renderFarBuildings();
    renderMidBuildings();
    renderNearBuildings();
    renderRoad();
    renderCar();
    
    if (animationStateRef.current.isRunning) {
      requestAnimationFrame(renderAllLayers);
    }
  };
  
  // Update animations based on game state
  useEffect(() => {
    // Kill any existing animations
    if (tlWheelsRef.current) tlWheelsRef.current.kill();
    if (tlCarRef.current) tlCarRef.current.kill();
    if (tlBuildingsFarRef.current) tlBuildingsFarRef.current.kill();
    if (tlBuildingsMidRef.current) tlBuildingsMidRef.current.kill();
    if (tlBuildingsNearRef.current) tlBuildingsNearRef.current.kill();
    if (tlRoadRef.current) tlRoadRef.current.kill();
    if (tlFuelRef.current) tlFuelRef.current.kill();
    
    if (gameState === 'running') {
      // Start animation
      animationStateRef.current.isRunning = true;
      
      // Create the wheel rotation animation
      tlWheelsRef.current = gsap.timeline({ repeat: -1 });
      tlWheelsRef.current.to(animationStateRef.current, {
        wheelAngle: Math.PI * 2,
        duration: 0.5,
        ease: "none",
        onUpdate: () => {
          requestAnimationFrame(renderCar);
        }
      });
      
      // Adjust wheel rotation speed based on multiplier
      const updateWheelSpeed = () => {
        if (tlWheelsRef.current) {
          const multiplierFactor = Math.pow(currentMultiplier, 1.4);
          const rotationSpeed = Math.max(0.5, 0.5 / multiplierFactor);
          tlWheelsRef.current.timeScale(multiplierFactor);
        }
      };
      
      // Create far buildings animation
      tlBuildingsFarRef.current = gsap.timeline({ repeat: -1 });
      tlBuildingsFarRef.current.to(animationStateRef.current, {
        farOffset: 800,
        duration: 30,
        ease: "none",
        onUpdate: () => {
          requestAnimationFrame(renderFarBuildings);
        }
      });
      
      // Create mid buildings animation
      tlBuildingsMidRef.current = gsap.timeline({ repeat: -1 });
      tlBuildingsMidRef.current.to(animationStateRef.current, {
        midOffset: 800,
        duration: 15,
        ease: "none",
        onUpdate: () => {
          requestAnimationFrame(renderMidBuildings);
        }
      });
      
      // Create near buildings animation
      tlBuildingsNearRef.current = gsap.timeline({ repeat: -1 });
      tlBuildingsNearRef.current.to(animationStateRef.current, {
        nearOffset: 800,
        duration: 6,
        ease: "none",
        onUpdate: () => {
          requestAnimationFrame(renderNearBuildings);
        }
      });
      
      // Create road animation
      tlRoadRef.current = gsap.timeline({ repeat: -1 });
      tlRoadRef.current.to(animationStateRef.current, {
        roadOffset: 800,
        duration: 3,
        ease: "none",
        onUpdate: () => {
          requestAnimationFrame(renderRoad);
        }
      });
      
      // Update animation speeds based on multiplier
      const updateAnimationSpeeds = () => {
        const multiplierFactor = Math.pow(currentMultiplier, 1.5);
        
        if (tlBuildingsFarRef.current) {
          tlBuildingsFarRef.current.timeScale(multiplierFactor * 0.8);
        }
        
        if (tlBuildingsMidRef.current) {
          tlBuildingsMidRef.current.timeScale(multiplierFactor);
        }
        
        if (tlBuildingsNearRef.current) {
          tlBuildingsNearRef.current.timeScale(multiplierFactor * 1.2);
        }
        
        if (tlRoadRef.current) {
          tlRoadRef.current.timeScale(multiplierFactor * 1.5);
        }
        
        updateWheelSpeed();
      };
      
      // Set up an interval to update speeds based on multiplier
      const speedUpdateInterval = setInterval(updateAnimationSpeeds, 100);
      
      // Render initial state
      renderAllLayers();
      
      return () => {
        clearInterval(speedUpdateInterval);
        animationStateRef.current.isRunning = false;
      };
    } else if (gameState === 'crashed') {
      // Stop the car
      if (tlCarRef.current) tlCarRef.current.kill();
      if (tlWheelsRef.current) tlWheelsRef.current.kill();
      if (tlBuildingsFarRef.current) tlBuildingsFarRef.current.kill();
      if (tlBuildingsMidRef.current) tlBuildingsMidRef.current.kill();
      if (tlBuildingsNearRef.current) tlBuildingsNearRef.current.kill();
      if (tlRoadRef.current) tlRoadRef.current.kill();
      
      // Car stops animation
      tlCarRef.current = gsap.timeline();
      tlCarRef.current.to(animationStateRef.current, {
        carX: CAR_DEFAULT_X - 20,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: renderCar
      }).to(animationStateRef.current, {
        carX: CAR_DEFAULT_X + 5,
        duration: 0.2,
        ease: "power1.out",
        onUpdate: renderCar
      }).to(animationStateRef.current, {
        carX: CAR_DEFAULT_X,
        duration: 0.1,
        ease: "power1.out",
        onUpdate: renderCar
      });
      
      // Render final state
      setTimeout(() => {
        renderAllLayers();
        animationStateRef.current.isRunning = false;
      }, 1000);
      
    } else {
      // Game is in waiting state
      // Reset animation state
      animationStateRef.current = {
        isRunning: false,
        wheelAngle: 0,
        farOffset: 0,
        midOffset: 0,
        nearOffset: 0,
        roadOffset: 0,
        carX: CAR_DEFAULT_X,
        carY: CAR_DEFAULT_Y
      };
      
      // Render idle state
      renderAllLayers();
      
      // Add idle animation for waiting state
      tlCarRef.current = gsap.timeline({ repeat: -1, yoyo: true });
      tlCarRef.current.to(animationStateRef.current, {
        carY: CAR_DEFAULT_Y - 2,
        duration: 1,
        ease: "sine.inOut",
        onUpdate: renderCar
      });
    }
  }, [gameState]);
  
  // Update fuel visualization based on actual fuelLevel from the store
  useEffect(() => {
    if (gameState === 'running') {
      // Create a dynamic decrease in fuel based on the multiplier
      const expectedFuel = Math.max(0, 100 - (currentMultiplier - 1) * 12); 
      
      // Only update if there's a significant change
      if (Math.abs(expectedFuel - fuelLevel) > 2) {
        if (tlFuelRef.current) tlFuelRef.current.kill();
        
        tlFuelRef.current = gsap.timeline();
        tlFuelRef.current.to({}, {
          duration: 0.3,
          onUpdate: () => {
            // This is empty because we're just using the fuel level from the store
          }
        });
      }
    }
  }, [fuelLevel, currentMultiplier, gameState]);
  
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
                        <span className="text-green-500 text-2xl animate-pulse">
                          {formatMultiplier(currentMultiplier)}
                        </span>
                      )}
                      {gameState === 'crashed' && (
                        <span className="text-red-500">Ran out of fuel at {formatMultiplier(currentMultiplier)}</span>
                      )}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-yellow-500" />
                      <Label>Fuel:</Label>
                      <Progress value={fuelLevel} className="w-24" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="relative w-full h-64 bg-gray-900 rounded-md overflow-hidden">
                    {/* Stacked canvas layers for animation */}
                    <canvas
                      ref={farLayerRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                    <canvas
                      ref={midLayerRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                    <canvas
                      ref={nearLayerRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                    <canvas
                      ref={roadLayerRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                    <canvas
                      ref={carLayerRef}
                      className="absolute top-0 left-0 w-full h-full"
                      data-game-id={useCrashCarStore.getState().gameId || ''}
                    />
                  </div>
                  
                  {gameState === 'waiting' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
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
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-2"
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