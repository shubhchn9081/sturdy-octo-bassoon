import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrashCarStore } from '../games/useCrashCarStore';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';

// Animation constants
const CAR_WIDTH = 120;
const CAR_HEIGHT = 60;
const ROAD_HEIGHT = 70;

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
  
  // Canvas references for animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carImageRef = useRef<HTMLImageElement | null>(null);
  const roadImageRef = useRef<HTMLImageElement | null>(null);
  const crashImageRef = useRef<HTMLImageElement | null>(null);
  
  // State for animation
  const [roadOffset, setRoadOffset] = useState(0);
  const [animationId, setAnimationId] = useState<number | null>(null);
  const [carPosition, setCarPosition] = useState({ x: 100, y: 180 });
  const [betInput, setBetInput] = useState('10.00');
  const [autoCashoutInput, setAutoCashoutInput] = useState<string>('');
  const [showCrash, setShowCrash] = useState(false);
  
  // Load images when the component mounts
  useEffect(() => {
    // Create and load car image
    const carImg = new Image();
    carImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnPgogICAgPCEtLSBDYXIgYm9keSAtLT4KICAgIDxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjIwIiBmaWxsPSJyZWQiIHJ4PSI1IiByeT0iNSIvPgogICAgPHJlY3QgeD0iNDAiIHk9IjEwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9InJlZCIgcng9IjUiIHJ5PSI1Ii8+CiAgICA8IS0tIENhciB3aW5kb3dzIC0tPgogICAgPHJlY3QgeD0iNDUiIHk9IjEzIiB3aWR0aD0iMzAiIGhlaWdodD0iMTQiIGZpbGw9IiM4OGYiIHJ4PSIyIiByeT0iMiIvPgogICAgPCEtLSBXaGVlbHMgLS0+CiAgICA8Y2lyY2xlIGN4PSIzNSIgY3k9IjUwIiByPSI4IiBmaWxsPSIjMzMzIi8+CiAgICA8Y2lyY2xlIGN4PSI4NSIgY3k9IjUwIiByPSI4IiBmaWxsPSIjMzMzIi8+CiAgICA8Y2lyY2xlIGN4PSIzNSIgY3k9IjUwIiByPSI0IiBmaWxsPSIjNzc3Ii8+CiAgICA8Y2lyY2xlIGN4PSI4NSIgY3k9IjUwIiByPSI0IiBmaWxsPSIjNzc3Ii8+CiAgICA8IS0tIEhlYWRsaWdodHMgLS0+CiAgICA8cmVjdCB4PSI5NSIgeT0iMzIiIHdpZHRoPSI1IiBoZWlnaHQ9IjYiIGZpbGw9IiNmZmYiIHJ4PSIyIiByeT0iMiIvPgogICAgPCEtLSBUYWlsbGlnaHRzIC0tPgogICAgPHJlY3QgeD0iMjAiIHk9IjMyIiB3aWR0aD0iNCIgaGVpZ2h0PSI2IiBmaWxsPSIjZmMwIiByeD0iMiIgcnk9IjIiLz4KICA8L2c+Cjwvc3ZnPg==';
    carImageRef.current = carImg;
    
    // Create and load road image
    const roadImg = new Image();
    roadImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjcwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnPgogICAgPCEtLSBSb2FkIGJhY2tncm91bmQgLS0+CiAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNTU1Ii8+CiAgICA8IS0tIFJvYWQgbWFya2luZ3MgLS0+CiAgICA8cmVjdCB4PSIwIiB5PSIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+CiAgICA8cmVjdCB4PSI0MCIgeT0iMzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPgogICAgPHJlY3QgeD0iODAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPg==';
    roadImageRef.current = roadImg;
    
    // Create and load crash image
    const crashImg = new Image();
    crashImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iZXhwbG9zaW9uR3JhZGllbnQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSIgZng9IjUwJSIgZnk9IjUwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmYiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIyMCUiIHN0b3AtY29sb3I9IiNmZjAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI0MCUiIHN0b3AtY29sb3I9IiNmNzAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI2MCUiIHN0b3AtY29sb3I9IiNmMzAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI4MCUiIHN0b3AtY29sb3I9IiNmMDAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJyZ2JhKDI1NSwwLDAsMCkiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxnPgogICAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNTAiIGZpbGw9InVybCgjZXhwbG9zaW9uR3JhZGllbnQpIi8+CiAgICA8IS0tIEV4cGxvc2lvbiBTcGlrZXMgLS0+CiAgICA8cGF0aCBkPSJNNjAgMTAgTDcwIDUwIEw1MCA1MCBaIiBmaWxsPSIjZjcwIi8+CiAgICA8cGF0aCBkPSJNMTEwIDYwIEw3MCA3MCBMNzAgNTAgWiIgZmlsbD0iI2Y3MCIvPgogICAgPHBhdGggZD0iTTYwIDExMCBMNTAgNzAgTDcwIDcwIFoiIGZpbGw9IiNmNzAiLz4KICAgIDxwYXRoIGQ9Ik0xMCA2MCBMNTAgNTAgTDUwIDcwIFoiIGZpbGw9IiNmNzAiLz4KICAgIDxwYXRoIGQ9Ik05MCAzMCBMNjUgNTUgTDc1IDQ1IFoiIGZpbGw9IiNmZjAiLz4KICAgIDxwYXRoIGQ9Ik05MCA5MCBMNDV2NjUgTDU1IDc1IFoiIGZpbGw9IiNmZjAiLz4KICAgIDxwYXRoIGQ9Ik0zMCA5MCBMODU1IDY1IEw0NSA1NSBaIiBmaWxsPSIjZmYwIi8+CiAgICA8cGF0aCBkPSJNMzAgMzAgTDQ1IDU1IEw1NSA0NSBaIiBmaWxsPSIjZmYwIi8+CiAgPC9nPgo8L3N2Zz4=';
    crashImageRef.current = crashImg;
    
    return () => {
      // Clean up animation on unmount
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  // Handle animation based on game state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Initialize canvas
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Animation function for running the car
    const animate = () => {
      if (!ctx || !roadImageRef.current || !carImageRef.current) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate road speed based on multiplier
      const speed = Math.max(1, Math.log2(currentMultiplier) * 5);
      
      // Move the road
      setRoadOffset(prev => (prev + speed) % 100);
      
      // Draw repeated road pattern
      for (let x = -roadOffset; x < canvas.width; x += 100) {
        ctx.drawImage(roadImageRef.current, x, canvas.height - ROAD_HEIGHT, 100, ROAD_HEIGHT);
      }
      
      // Draw the car
      if (!showCrash) {
        ctx.drawImage(carImageRef.current, carPosition.x, carPosition.y - CAR_HEIGHT, CAR_WIDTH, CAR_HEIGHT);
      } else if (crashImageRef.current) {
        // Draw the crash explosion
        ctx.drawImage(crashImageRef.current, carPosition.x - 30, carPosition.y - 90, 180, 180);
      }
      
      // Continue animation
      const id = requestAnimationFrame(animate);
      setAnimationId(id);
    };
    
    // Start or stop animation based on game state
    if (gameState === 'running') {
      setShowCrash(false);
      animate();
    } else if (gameState === 'crashed') {
      setShowCrash(true);
      animate();
      
      // Stop animation after 2 seconds of showing crash
      setTimeout(() => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          setAnimationId(null);
        }
      }, 2000);
    } else {
      // Game is in waiting state
      setShowCrash(false);
      
      // Just draw the car in idle position
      if (ctx && roadImageRef.current && carImageRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw road
        for (let x = 0; x < canvas.width; x += 100) {
          ctx.drawImage(roadImageRef.current, x, canvas.height - ROAD_HEIGHT, 100, ROAD_HEIGHT);
        }
        
        // Draw the car
        ctx.drawImage(carImageRef.current, carPosition.x, carPosition.y - CAR_HEIGHT, CAR_WIDTH, CAR_HEIGHT);
      }
    }
    
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, currentMultiplier, carPosition, showCrash]);
  
  // Update window global with refreshBalance function
  useEffect(() => {
    (window as any).refreshBalance = refreshBalance;
    return () => {
      delete (window as any).refreshBalance;
    };
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
  
  // Handle bet amount input change
  const handleBetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setBetInput(value);
    
    // Update the store with the numeric value
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setBetAmount(numericValue);
    }
  };
  
  // Handle auto-cashout input change
  const handleAutoCashoutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAutoCashoutInput(value);
    
    // Update the store with the numeric value or null if empty
    if (value === '') {
      setAutoCashoutValue(null);
    } else {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setAutoCashoutValue(numericValue);
      }
    }
  };
  
  // Format the multiplier with 2 decimal places
  const formatMultiplier = (multiplier: number) => {
    return multiplier.toFixed(2) + 'x';
  };
  
  // Format currency with INR symbol
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get CSS class for a history item based on its value
  const getHistoryItemClass = (value: number) => {
    if (value >= 2) return 'bg-green-500';
    if (value >= 1.5) return 'bg-blue-500';
    return 'bg-red-500';
  };
  
  // Check if the current user has an active bet
  const hasActiveBet = activeBets.some(bet => bet.isPlayer && bet.status === 'active');
  
  // Check if the current user has already cashed out
  const hasCashedOut = activeBets.some(bet => bet.isPlayer && bet.status === 'won');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Crash Car</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Game Canvas */}
        <div className="lg:col-span-2">
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
                    <span className="text-red-500">Crashed at {formatMultiplier(currentMultiplier)}</span>
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
              <canvas 
                ref={canvasRef} 
                className="w-full h-64 bg-gray-800 rounded-md"
              ></canvas>
              
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
                  {gameState === 'crashed' ? 'CRASHED' : 'WAITING...'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column - Bet Controls & History */}
        <div>
          <Tabs defaultValue="bet">
            <TabsList className="w-full">
              <TabsTrigger value="bet" className="flex-1">Place Bet</TabsTrigger>
              <TabsTrigger value="bets" className="flex-1">Active Bets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bet">
              <Card>
                <CardHeader>
                  <CardTitle>Your Bet</CardTitle>
                  <CardDescription>
                    Current Balance: {formatCurrency((balance as any)?.INR || 0)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bet-amount">Bet Amount (INR)</Label>
                    <Input
                      id="bet-amount"
                      type="text"
                      value={betInput}
                      onChange={handleBetInputChange}
                      disabled={gameState !== 'waiting'}
                    />
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setBetInput('10.00');
                        setBetAmount(10);
                      }}
                      disabled={gameState !== 'waiting'}
                      className="flex-1"
                    >
                      ₹10
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setBetInput('50.00');
                        setBetAmount(50);
                      }}
                      disabled={gameState !== 'waiting'}
                      className="flex-1"
                    >
                      ₹50
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setBetInput('100.00');
                        setBetAmount(100);
                      }}
                      disabled={gameState !== 'waiting'}
                      className="flex-1"
                    >
                      ₹100
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-cashout">Auto Cashout (optional)</Label>
                    <Input
                      id="auto-cashout"
                      type="text"
                      placeholder="e.g. 2.00"
                      value={autoCashoutInput}
                      onChange={handleAutoCashoutInputChange}
                      disabled={gameState !== 'waiting'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Auto Cashout Presets</Label>
                      <span className="text-sm text-muted-foreground">
                        {autoCashoutValue ? `${autoCashoutValue.toFixed(2)}x` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setAutoCashoutInput('1.5');
                          setAutoCashoutValue(1.5);
                        }}
                        disabled={gameState !== 'waiting'}
                        className="flex-1"
                      >
                        1.5x
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setAutoCashoutInput('2.0');
                          setAutoCashoutValue(2.0);
                        }}
                        disabled={gameState !== 'waiting'}
                        className="flex-1"
                      >
                        2x
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setAutoCashoutInput('5.0');
                          setAutoCashoutValue(5.0);
                        }}
                        disabled={gameState !== 'waiting'}
                        className="flex-1"
                      >
                        5x
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={placeBet} 
                    className="w-full"
                    disabled={gameState !== 'waiting' || parseFloat(betInput) <= 0}
                  >
                    PLACE BET
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="bets">
              <Card>
                <CardHeader>
                  <CardTitle>Active Bets</CardTitle>
                  <CardDescription>
                    {activeBets.length} players betting
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {activeBets.map((bet, index) => (
                      <div 
                        key={index}
                        className={`flex justify-between p-2 rounded ${
                          bet.isPlayer ? 'bg-muted' : ''
                        } ${
                          bet.status === 'won' 
                            ? 'border-l-4 border-green-500' 
                            : bet.status === 'lost'
                            ? 'border-l-4 border-red-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {bet.username}
                            {bet.isPlayer && <span className="text-blue-500 ml-1">(You)</span>}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(bet.amount)}
                          </span>
                        </div>
                        <div>
                          {bet.status === 'won' && (
                            <Badge className="bg-green-500">
                              {formatMultiplier(bet.cashoutMultiplier || 0)}
                            </Badge>
                          )}
                          {bet.status === 'lost' && (
                            <Badge variant="outline" className="text-red-500">
                              Lost
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {activeBets.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No active bets yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CrashCarGame;