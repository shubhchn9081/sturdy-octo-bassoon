import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { apiRequest } from '@/lib/queryClient';
import { formatNumber } from '@/lib/utils';
import { Shuffle, RefreshCcw } from 'lucide-react';

type CrashState = {
  status: 'waiting' | 'running' | 'crashed' | 'cashed_out';
  multiplier: number;
  crashPoint: number;
  currentTime: number;
  totalTime: number;
  dataPoints: Array<{x: number, y: number}>;
  countdown: number;
  hasPlacedBet: boolean;
  hasCashedOut: boolean;
  timeStarted: number;
};

type GamePhase = 'betting' | 'running' | 'crashed';

type BetItem = {
  username: string;
  amount: number;
  cashedOut: number | null;
  multiplier: number | null;
  profit: number | null;
  isHidden: boolean;
};

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const MAX_VISIBLE_TIME = 12; // Maximum visible time in seconds
const TIME_SCALE = CANVAS_WIDTH / MAX_VISIBLE_TIME;
const HEIGHT_SCALE = CANVAS_HEIGHT / 2.3;
const MIN_WAIT_TIME = 4000; // 4 seconds
const MAX_WAIT_TIME = 7000; // 7 seconds

const MULTIPLIER_QUICKTABS = [
  { value: 1.5, label: '1.5x', color: 'bg-[#5BE12C]' },
  { value: 2.0, label: '2x', color: 'bg-[#5BE12C]' },
  { value: 3.0, label: '3x', color: 'bg-[#5BE12C]' },
  { value: 5.0, label: '5x', color: 'bg-[#5BE12C]' },
  { value: 10.0, label: '10x', color: 'bg-[#5BE12C]' }
];

const CrashGame: React.FC = () => {
  const { betAmount, setBetAmount } = useGame();
  const { user } = useUser();
  const { serverSeed, clientSeed, nonce, regenerateServerSeed } = useProvablyFair('crash');
  
  // Game Refs and States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [gameMode, setGameMode] = useState<'manual' | 'auto'>('manual');
  const [autoCashoutValue, setAutoCashoutValue] = useState<number>(2.00);
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [totalBets, setTotalBets] = useState<number>(0);
  
  const [gameState, setGameState] = useState<CrashState>({
    status: 'waiting',
    multiplier: 1.00,
    crashPoint: 0,
    currentTime: 0,
    totalTime: 0,
    dataPoints: [],
    countdown: 5,
    hasPlacedBet: false,
    hasCashedOut: false,
    timeStarted: 0
  });
  
  const [betsHistory, setBetsHistory] = useState<BetItem[]>(
    Array.from({ length: 15 }, (_, i) => ({
      username: `user${i + 1}`,
      amount: parseFloat((Math.random() * 100).toFixed(8)),
      cashedOut: Math.random() > 0.3 ? parseFloat((1 + Math.random() * 5).toFixed(2)) : null,
      multiplier: Math.random() > 0.3 ? parseFloat((1 + Math.random() * 5).toFixed(2)) : null,
      profit: Math.random() > 0.3 ? parseFloat((Math.random() * 200).toFixed(2)) : null,
      isHidden: Math.random() > 0.5
    }))
  );
  
  // Generate a crash point using provably fair algorithm
  const generateCrashPoint = useCallback(() => {
    // In the actual implementation, this would use the server seed, client seed and nonce
    // For demo purposes, we'll use a simplified random algorithm
    const h = Math.random().toString();
    const n = parseInt(h.substring(2, 15), 16);
    
    if (n % 33 === 0) return 1.00; // 1 in 33 chance of instant crash
    
    // This is a simplified version of the formula mentioned in the description
    const crashPoint = Math.floor((100 * (1e9)) / (n + 1)) / 1e7;
    return Math.min(crashPoint, 1000.00); // Cap at 1000x
  }, []);
  
  // Reset the game state for a new round
  const resetGame = useCallback(() => {
    setGameState({
      status: 'waiting',
      multiplier: 1.00,
      crashPoint: generateCrashPoint(),
      currentTime: 0,
      totalTime: 0,
      dataPoints: [],
      countdown: Math.floor(Math.random() * 5) + 5, // 5-10 seconds countdown
      hasPlacedBet: false,
      hasCashedOut: false,
      timeStarted: Date.now()
    });
    setCurrentMultiplier(1.00);
    setGamePhase('betting');
    
    // Generate new bets for the next round
    const newBets = Array.from({ length: Math.floor(Math.random() * 5) + 10 }, () => ({
      username: `user${Math.floor(Math.random() * 1000)}`,
      amount: parseFloat((Math.random() * 100).toFixed(8)),
      cashedOut: null,
      multiplier: null,
      profit: null,
      isHidden: Math.random() > 0.5
    }));
    
    setBetsHistory(prevBets => {
      // Keep some previous bets, add new ones
      return [...newBets, ...prevBets.slice(0, 10)];
    });
    
    setTotalBets(Math.floor(Math.random() * 500) + 200);
    
    // Schedule starting the game after countdown
    setTimeout(() => {
      startGame();
    }, gameState.countdown * 1000);
  }, [generateCrashPoint]);
  
  // Start the crash game
  const startGame = useCallback(() => {
    if (gameState.status !== 'waiting') return;
    
    setGameState(prev => ({
      ...prev,
      status: 'running',
      timeStarted: Date.now()
    }));
    
    setGamePhase('running');
    
    // Start the animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationLoop();
  }, [gameState.status]);
  
  // Calculate live multiplier based on elapsed time
  const getLiveMultiplier = useCallback((elapsed: number) => {
    // Using the formula from the description: 1.0024^(elapsed*1000)
    // Adjusted to match the curve in the screenshots
    return Math.pow(1.0024, elapsed * 1000);
  }, []);
  
  // Main animation loop
  const animationLoop = useCallback(() => {
    if (!canvasRef.current || gameState.status !== 'running') return;
    
    const elapsed = (Date.now() - gameState.timeStarted) / 1000;
    const currentMultiplier = getLiveMultiplier(elapsed);
    const formattedMultiplier = parseFloat(currentMultiplier.toFixed(2));
    
    // Auto cashout if in auto mode and reached target
    if (gameMode === 'auto' && 
        gameState.hasPlacedBet && 
        !gameState.hasCashedOut && 
        formattedMultiplier >= autoCashoutValue) {
      cashout();
    }
    
    // Update state
    setCurrentMultiplier(formattedMultiplier);
    setGameState(prev => {
      // Calculate new data point
      const x = elapsed * TIME_SCALE;
      const y = (Math.log(currentMultiplier) / Math.log(1.0024 * 100)) * HEIGHT_SCALE;
      
      const newDataPoints = [...prev.dataPoints, { x, y }];
      
      return {
        ...prev,
        multiplier: formattedMultiplier,
        currentTime: elapsed,
        dataPoints: newDataPoints
      };
    });
    
    // Draw the graph
    drawGraph();
    
    // Check if we've reached the crash point
    if (formattedMultiplier >= gameState.crashPoint) {
      crash();
      return;
    }
    
    // Random chance that some bets cash out
    if (Math.random() > 0.95) {
      const randomBetIndex = Math.floor(Math.random() * betsHistory.length);
      if (randomBetIndex < betsHistory.length && 
          betsHistory[randomBetIndex].cashedOut === null) {
        
        const bet = betsHistory[randomBetIndex];
        const newMultiplier = parseFloat(formattedMultiplier.toFixed(2));
        const profit = parseFloat((bet.amount * newMultiplier).toFixed(2));
        
        setBetsHistory(prevBets => {
          const newBets = [...prevBets];
          newBets[randomBetIndex] = {
            ...bet,
            cashedOut: newMultiplier,
            multiplier: newMultiplier,
            profit: profit
          };
          return newBets;
        });
      }
    }
    
    // Continue the animation loop
    animationRef.current = requestAnimationFrame(animationLoop);
  }, [gameState, getLiveMultiplier, gameMode, autoCashoutValue, gameState.crashPoint, gameState.hasPlacedBet, gameState.hasCashedOut]);
  
  // Handle crash event
  const crash = useCallback(() => {
    if (gameState.status !== 'running') return;
    
    // Cancel animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setGameState(prev => ({
      ...prev,
      status: 'crashed'
    }));
    
    setGamePhase('crashed');
    
    // Show crashed state for a moment before resetting
    setTimeout(() => {
      resetGame();
    }, 3000);
    
  }, [gameState.status, resetGame]);
  
  // Place a bet
  const placeBet = useCallback(() => {
    if (!user) return;
    
    setGameState(prev => ({
      ...prev,
      hasPlacedBet: true,
      hasCashedOut: false
    }));
    
    // Add user's bet to the bets list
    setBetsHistory(prevBets => {
      const newBet: BetItem = {
        username: user.username,
        amount: betAmount,
        cashedOut: null,
        multiplier: null,
        profit: null,
        isHidden: false
      };
      
      return [newBet, ...prevBets];
    });
    
    // In a real implementation, we would call the API to place a bet
  }, [user, betAmount]);
  
  // Cash out - claim winnings at current multiplier
  const cashout = useCallback(() => {
    if (gameState.status !== 'running' || 
        !gameState.hasPlacedBet || 
        gameState.hasCashedOut) return;
    
    const winAmount = betAmount * currentMultiplier;
    
    // Update user bet in history
    setBetsHistory(prevBets => {
      return prevBets.map(bet => {
        if (bet.username === user?.username && bet.cashedOut === null) {
          return {
            ...bet,
            cashedOut: currentMultiplier,
            multiplier: currentMultiplier,
            profit: winAmount
          };
        }
        return bet;
      });
    });
    
    setGameState(prev => ({
      ...prev,
      hasCashedOut: true
    }));
    
    // In a real implementation, we would call the API to complete the bet
  }, [gameState, betAmount, currentMultiplier, user]);
  
  // Draw the crash graph on canvas
  const drawGraph = useCallback(() => {
    if (!canvasRef.current || gameState.dataPoints.length === 0) return;
    
    const ctx = contextRef.current;
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Set up the graph style
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineJoin = 'round';
    
    // Begin drawing the line
    ctx.beginPath();
    
    // Start at the bottom-left of the chart
    ctx.moveTo(0, CANVAS_HEIGHT);
    
    // Plot each data point
    gameState.dataPoints.forEach(point => {
      ctx.lineTo(point.x, CANVAS_HEIGHT - point.y);
    });
    
    // Stroke the line
    ctx.stroke();
    
    // Fill the area under the graph
    ctx.lineTo(gameState.dataPoints[gameState.dataPoints.length - 1].x, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
    ctx.fill();
    
    // Draw graph endpoint circle
    if (gameState.status === 'running' || gameState.status === 'crashed') {
      const lastPoint = gameState.dataPoints[gameState.dataPoints.length - 1];
      
      ctx.beginPath();
      ctx.arc(lastPoint.x, CANVAS_HEIGHT - lastPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    
    // Draw time markers
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    
    // Draw time markers every 2 seconds
    for (let i = 2; i <= MAX_VISIBLE_TIME; i += 2) {
      const x = i * TIME_SCALE;
      ctx.fillText(`${i}s`, x, CANVAS_HEIGHT - 5);
    }
    
    // Draw multiplier markers on y-axis
    ctx.textAlign = 'left';
    [1.0, 1.2, 1.3, 1.5, 1.7, 1.8, 2.0, 2.3].forEach(mult => {
      const y = (Math.log(mult) / Math.log(1.0024 * 100)) * HEIGHT_SCALE;
      ctx.fillText(`${mult.toFixed(1)}x`, 5, CANVAS_HEIGHT - y);
    });
    
  }, [gameState.dataPoints, gameState.status]);
  
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      contextRef.current = ctx;
    }
  }, []);
  
  // Start the game initially
  useEffect(() => {
    resetGame();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [resetGame]);
  
  // Update profit on win display
  const calculateProfit = useCallback(() => {
    if (!gameState.hasPlacedBet) return 0;
    return betAmount * autoCashoutValue;
  }, [betAmount, autoCashoutValue, gameState.hasPlacedBet]);
  
  return (
    <div className="flex flex-col h-full w-full bg-[#0F212E] text-white">
      <div className="flex flex-row w-full">
        {/* Game Controls */}
        <div className="flex flex-col w-[260px] p-4 bg-[#11232F]">
          {/* Game Mode Toggle */}
          <div className="flex rounded-md overflow-hidden mb-4">
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'manual' ? 'bg-[#0F212E]' : 'bg-[#11232F]'}`}
              onClick={() => setGameMode('manual')}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'auto' ? 'bg-[#0F212E]' : 'bg-[#11232F]'}`}
              onClick={() => setGameMode('auto')}
            >
              Auto
            </button>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Bet Amount</label>
            <div className="flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameState.hasPlacedBet || gameState.status === 'running'}
              />
              <span className="ml-2">$0.00</span>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-1">
              <button className="bg-[#0F212E] px-2 py-1 rounded text-xs">½</button>
              <button className="bg-[#0F212E] px-2 py-1 rounded text-xs">2×</button>
            </div>
          </div>
          
          {/* Cashout At */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Cashout At</label>
            <div className="relative mb-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={autoCashoutValue}
                onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
                disabled={gameState.hasPlacedBet && !gameState.hasCashedOut && gameState.status === 'running'}
              />
              <div className="absolute right-2 top-2 flex">
                <button 
                  className="bg-transparent px-1"
                  onClick={() => setAutoCashoutValue(prev => Math.max(1.01, prev - 0.01))}
                >
                  ▼
                </button>
                <button 
                  className="bg-transparent px-1"
                  onClick={() => setAutoCashoutValue(prev => prev + 0.01)}
                >
                  ▲
                </button>
              </div>
            </div>
          </div>
          
          {/* Profit on Win */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Profit on Win</label>
            <div className="flex items-center mb-4">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={calculateProfit()}
                readOnly
              />
              <span className="ml-2">$0.00</span>
            </div>
          </div>
          
          {/* Bet Button */}
          <div className="mb-4">
            {gameState.status === 'running' && gameState.hasPlacedBet && !gameState.hasCashedOut ? (
              <Button 
                className="w-full py-4 text-lg bg-[#FF6B00] hover:bg-[#FF8F3F] rounded-md"
                onClick={cashout}
              >
                Cash Out @ {currentMultiplier.toFixed(2)}x
              </Button>
            ) : (
              <Button 
                className={`w-full py-4 text-lg ${
                  gamePhase === 'betting' 
                    ? 'bg-[#5BE12C] hover:bg-[#4CC124] text-black'
                    : 'bg-[#34505E] text-gray-300 cursor-not-allowed'
                } rounded-md`}
                onClick={placeBet}
                disabled={gamePhase !== 'betting' || gameState.hasPlacedBet}
              >
                {gamePhase === 'betting' 
                  ? (gameState.hasPlacedBet ? 'Bet Placed' : 'Bet (Next Round)') 
                  : 'Waiting...'}
              </Button>
            )}
          </div>
          
          {/* Active Bets */}
          <div className="mt-auto">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <RefreshCcw className="h-3 w-3 mr-1" />
              <span>{totalBets}</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1">
              {betsHistory.map((bet, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    {bet.isHidden ? (
                      <span className="text-gray-400">Hidden</span>
                    ) : (
                      <span className={`truncate max-w-[80px] ${bet.username === user?.username ? 'text-white' : 'text-gray-400'}`}>
                        {bet.username}
                      </span>
                    )}
                    <span>-</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {bet.cashedOut ? (
                      <span className="text-[#5BE12C]">{bet.cashedOut.toFixed(2)}x</span>
                    ) : (
                      bet.username === user?.username && gameState.status === 'running' && !gameState.hasCashedOut ? (
                        <span className="text-[#FF6B00]">LIVE</span>
                      ) : (
                        gameState.status === 'crashed' && (
                          <span className="text-[#E14C4C]">BUST</span>
                        )
                      )
                    )}
                    <span className="text-[#F7BE41]">{bet.amount.toFixed(8)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Game Display */}
        <div className="flex-1 flex flex-col px-4 py-4">
          {/* Quick Cashout Buttons */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {MULTIPLIER_QUICKTABS.map((tab, index) => (
              <button 
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${tab.color} text-black`}
                onClick={() => setAutoCashoutValue(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Game Area */}
          <div className="relative flex-1 flex items-center justify-center bg-[#11232F] rounded-md overflow-hidden">
            {/* Canvas for graph */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Central Game State Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className={`text-7xl font-bold mb-2 ${
                gameState.status === 'crashed' ? 'text-[#E14C4C]' : 'text-white'
              }`}>
                {currentMultiplier.toFixed(2)}x
              </div>
              
              {gameState.status === 'waiting' && (
                <div className="text-2xl font-medium">
                  Starting in {gameState.countdown}s
                </div>
              )}
              
              {gameState.status === 'crashed' && (
                <div className="text-2xl font-medium text-[#E14C4C]">
                  Crashed
                </div>
              )}
            </div>
            
            {/* Time display at bottom */}
            <div className="absolute bottom-2 right-4 text-sm text-gray-400">
              Total {gameState.currentTime.toFixed(0)}s
            </div>
            
            {/* Network Status */}
            <div className="absolute bottom-2 left-4 flex items-center text-sm text-gray-400">
              Network Status <span className="ml-1 h-2 w-2 rounded-full bg-green-500"></span>
            </div>
          </div>
          
          {/* Right side cashout/player info */}
          <div className="absolute right-8 top-1/3 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => {
              // Randomly generate some player cashouts
              const didCashout = Math.random() > 0.6;
              const amount = parseFloat((Math.random() * 1000).toFixed(2));
              const displayName = Math.random() > 0.5 ? 
                `user${Math.floor(Math.random() * 1000)}` : 
                `Hidden`;
              
              return (
                <div key={i} className={`bg-[#11232F] p-2 rounded-md flex items-center justify-between ${didCashout ? '' : 'opacity-0'}`}>
                  <span>{displayName}</span>
                  {didCashout && (
                    <span className={Math.random() > 0.5 ? "text-[#5BE12C]" : "text-[#F7BE41]"}>
                      {amount.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;