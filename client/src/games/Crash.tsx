import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';

// Constants
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;
const MAX_VISIBLE_TIME = 12; // Maximum visible time in seconds
const TIME_SCALE = CANVAS_WIDTH / MAX_VISIBLE_TIME;
const HEIGHT_SCALE = CANVAS_HEIGHT / 2.3;

// Multiplier quicktabs
const MULTIPLIER_QUICKTABS = [
  { value: 1.5, label: '1.5x', color: 'bg-[#5BE12C]' },
  { value: 2.0, label: '2x', color: 'bg-[#5BE12C]' },
  { value: 3.0, label: '3x', color: 'bg-[#5BE12C]' },
  { value: 5.0, label: '5x', color: 'bg-[#5BE12C]' },
  { value: 10.0, label: '10x', color: 'bg-[#5BE12C]' }
];

const CrashGame: React.FC = () => {
  // Use our Zustand store
  const { 
    gameState,
    currentMultiplier,
    countdown,
    hasPlacedBet,
    hasCashedOut,
    betAmount,
    autoCashoutValue,
    activeBets,
    dataPoints,
    
    // Actions
    placeBet,
    cashOut,
    setBetAmount,
    setAutoCashoutValue,
    initialize
  } = useCrashGame();
  
  // Refs for canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Draw the crash graph on canvas
  const drawGraph = useCallback(() => {
    if (!canvasRef.current || dataPoints.length === 0) return;
    
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
    dataPoints.forEach(point => {
      ctx.lineTo(point.x, CANVAS_HEIGHT - point.y);
    });
    
    // Stroke the line
    ctx.stroke();
    
    // Fill the area under the graph
    if (dataPoints.length > 0) {
      ctx.lineTo(dataPoints[dataPoints.length - 1].x, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
      ctx.fill();
      
      // Draw graph endpoint circle
      const lastPoint = dataPoints[dataPoints.length - 1];
      
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
    
  }, [dataPoints]);
  
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
  
  // Draw graph when data points change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);
  
  // Initialize game only once when component mounts
  useEffect(() => {
    // Only initialize if not already running
    if (gameState === 'waiting' && dataPoints.length === 0) {
      initialize();
    }
  }, []);
  
  // Calculate profit on win
  const calculateProfit = () => {
    if (!hasPlacedBet || !autoCashoutValue) return 0;
    return betAmount * (autoCashoutValue || 0);
  };
  
  // Format for display
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };
  
  return (
    <div className="flex flex-col h-full w-full bg-[#0F212E] text-white">
      <div className="flex flex-row w-full">
        {/* Game Controls */}
        <div className="flex flex-col w-[260px] p-4 bg-[#11232F]">
          {/* Game Mode Toggle */}
          <div className="flex rounded-md overflow-hidden mb-4">
            <button 
              className={`flex-1 py-2 text-center bg-[#0F212E]`}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center bg-[#11232F]`}
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
                disabled={hasPlacedBet || gameState === 'running'}
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
                value={autoCashoutValue || 2.00}
                onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
                disabled={hasPlacedBet && !hasCashedOut && gameState === 'running'}
              />
              <div className="absolute right-2 top-2 flex">
                <button 
                  className="bg-transparent px-1"
                  onClick={() => setAutoCashoutValue(Math.max(1.01, (autoCashoutValue || 2.00) - 0.01))}
                >
                  ▼
                </button>
                <button 
                  className="bg-transparent px-1"
                  onClick={() => setAutoCashoutValue((autoCashoutValue || 2.00) + 0.01)}
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
            {gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
              <Button 
                className="w-full py-4 text-lg bg-[#FF6B00] hover:bg-[#FF8F3F] rounded-md"
                onClick={cashOut}
              >
                Cash Out @ {currentMultiplier.toFixed(2)}x
              </Button>
            ) : (
              <Button 
                className={`w-full py-4 text-lg ${
                  gameState === 'waiting' 
                    ? 'bg-[#5BE12C] hover:bg-[#4CC124] text-black'
                    : 'bg-[#34505E] text-gray-300 cursor-not-allowed'
                } rounded-md`}
                onClick={placeBet}
                disabled={gameState !== 'waiting' || hasPlacedBet}
              >
                {gameState === 'waiting' 
                  ? (hasPlacedBet ? 'Bet Placed' : 'Bet (Next Round)') 
                  : 'Waiting...'}
              </Button>
            )}
          </div>
          
          {/* Active Bets */}
          <div className="bg-[#0F212E] p-3 rounded">
            <h3 className="text-sm font-semibold mb-2">Active Bets</h3>
            <div className="h-[150px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left pb-1">User</th>
                    <th className="text-right pb-1">Bet</th>
                    <th className="text-right pb-1">Mult</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBets
                    .filter(bet => !bet.isHidden)
                    .map((bet, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-1">{bet.username}</td>
                      <td className="text-right py-1">{formatAmount(bet.amount)}</td>
                      <td className="text-right py-1">
                        {bet.status === 'won' ? (
                          <span className="text-green-500">{bet.cashoutMultiplier?.toFixed(2)}x</span>
                        ) : bet.status === 'lost' ? (
                          <span className="text-red-500">BUST</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Game Area */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Game Canvas */}
          <div className="relative mb-4 bg-[#0E1C27] rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {gameState === 'waiting' && (
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{countdown}s</div>
                  <div className="text-xl">Next Round Starting...</div>
                </div>
              )}
              
              {gameState === 'crashed' && (
                <div className="text-center">
                  <div className="text-6xl font-bold text-red-500 mb-2">CRASHED</div>
                  <div className="text-xl">@ {currentMultiplier.toFixed(2)}x</div>
                </div>
              )}
            </div>
            
            <canvas 
              ref={canvasRef} 
              className="w-full h-[400px]"
            />
            
            {/* Current multiplier display */}
            {gameState === 'running' && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                <div className="text-4xl font-bold text-white">{currentMultiplier.toFixed(2)}x</div>
              </div>
            )}
          </div>
          
          {/* Quick Multiplier Buttons */}
          <div className="flex gap-2 mb-4">
            {MULTIPLIER_QUICKTABS.map((level, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${level.color} text-black font-medium`}
                onClick={() => setAutoCashoutValue(level.value)}
              >
                {level.label}
              </button>
            ))}
          </div>
          
          {/* Recent Games */}
          <div className="bg-[#11232F] p-3 rounded">
            <h3 className="text-sm font-semibold mb-2">Recent Games</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* We'll use some dummy data for recent games */}
              {[2.31, 1.02, 4.56, 1.68, 10.21, 1.08, 3.45, 7.89, 1.54, 2.01].map((value, i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold ${
                    value < 1.2 ? 'bg-[#FF3B3B]' : 
                    value < 2 ? 'bg-[#FF6B00]' :
                    value < 5 ? 'bg-[#FFC107]' : 'bg-[#5BE12C]'
                  } ${value < 2 ? 'text-white' : 'text-black'}`}
                >
                  {value.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;