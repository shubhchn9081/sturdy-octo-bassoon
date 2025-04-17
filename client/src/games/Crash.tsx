import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';

// Constants
const CANVAS_WIDTH = 1200; // Dramatically increased width for fullscreen
const CANVAS_HEIGHT = 800; // Dramatically increased height for fullscreen
const MAX_VISIBLE_TIME = 12; // Maximum visible time in seconds
const TIME_SCALE = CANVAS_WIDTH / MAX_VISIBLE_TIME;
const HEIGHT_SCALE = CANVAS_HEIGHT / 4; // Lower value to make line less steep

// Y-axis multiplier markers (must match the reference)
const MULTIPLIER_MARKERS = [
  { value: 1.0, label: '1.0×' },
  { value: 1.3, label: '1.3×' },
  { value: 1.5, label: '1.5×' },
  { value: 1.8, label: '1.8×' },
  { value: 2.0, label: '2.0×' },
  { value: 2.3, label: '2.3×' },
];

// Multiplier quicktabs (matching the Stake.com values exactly)
const MULTIPLIER_QUICKTABS = [
  { value: 1.71, label: '1.71x', color: 'bg-[#5BE12C]' },
  { value: 1.97, label: '1.97x', color: 'bg-[#5BE12C]' },
  { value: 5.25, label: '5.25x', color: 'bg-[#5BE12C]' },
  { value: 1.37, label: '1.37x', color: 'bg-[#5BE12C]' },
  { value: 8.34, label: '8.34x', color: 'bg-[#5BE12C]' },
  { value: 1.03, label: '1.03x', color: 'bg-[#5BE12C]' },
  { value: 3.26, label: '3.26x', color: 'bg-[#5BE12C]' }, 
  { value: 20.24, label: '20.24x', color: 'bg-[#5BE12C]' },
  { value: 12.03, label: '12.03x', color: 'bg-[#5BE12C]' },
  { value: 1.14, label: '1.14x', color: 'bg-[#5BE12C]' },
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
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ff9800'; // Orange line like in the screenshots
    ctx.lineJoin = 'round';
    
    // Draw horizontal and vertical grid lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines for multipliers
    MULTIPLIER_MARKERS.forEach(marker => {
      // Calculate y position based on multiplier - using same formula as in the store
      const y = (marker.value - 1.0) * HEIGHT_SCALE * 0.85;
      ctx.moveTo(0, CANVAS_HEIGHT - y);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - y);
    });
    
    // Vertical grid lines (time markers) - showing 3s, 6s, 9s, 12s
    for (let i = 3; i <= MAX_VISIBLE_TIME; i += 3) {
      const x = i * TIME_SCALE;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
    }
    ctx.stroke();
    
    // Draw multiplier indicators on the right side (as seen in the reference)
    ctx.textAlign = 'right';
    ctx.font = '11px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    MULTIPLIER_MARKERS.forEach(marker => {
      const y = (marker.value - 1.0) * HEIGHT_SCALE * 0.85;
      // Draw label on right side
      ctx.fillText(marker.label, CANVAS_WIDTH - 5, CANVAS_HEIGHT - y - 2);
    });
    
    // Add extreme glow effect for maximum visibility
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 0; // No offset for a pure glow effect
    
    // Begin drawing the main crash line
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff'; // White line as shown in the new screenshot
    ctx.lineWidth = 15; // Much bolder line for visibility
    ctx.lineCap = 'round'; // Rounded ends on the line
    ctx.lineJoin = 'round'; // Rounded corners
    
    // Start at the bottom-left of the chart
    ctx.moveTo(0, CANVAS_HEIGHT);
    
    // Plot each data point
    dataPoints.forEach(point => {
      ctx.lineTo(point.x, CANVAS_HEIGHT - point.y);
    });
    
    // Stroke the line
    ctx.stroke();
    
    // Reset shadow properties
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Fill the area under the graph
    if (dataPoints.length > 0) {
      ctx.lineTo(dataPoints[dataPoints.length - 1].x, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.fillStyle = '#ff9d02'; // Exact color code as requested, solid without transparency
      ctx.fill();
      
      // Draw graph endpoint circle
      const lastPoint = dataPoints[dataPoints.length - 1];
      
      // Add extreme glow effect for circle as well
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 0; // No offset for a pure glow effect
      
      ctx.beginPath();
      ctx.arc(lastPoint.x, CANVAS_HEIGHT - lastPoint.y, 15, 0, Math.PI * 2); // Larger circle (15px radius)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff'; // White circle with white border to match screenshot
      ctx.lineWidth = 3; // Thicker border
      ctx.fill();
      ctx.stroke(); // Add stroke to make the circle more visible
      
      // Reset shadow properties again
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Draw time markers
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    
    // Draw time markers every 2 seconds
    for (let i = 2; i <= MAX_VISIBLE_TIME; i += 2) {
      const x = i * TIME_SCALE;
      ctx.fillText(`${i}s`, x, CANVAS_HEIGHT - 5);
    }
    
    // Draw vertical time markers at the bottom
    ctx.font = '13px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ['2s', '4s', '6s', '8s'].forEach((time, index) => {
      const x = (index + 1) * 2 * TIME_SCALE;
      ctx.fillText(time, x, CANVAS_HEIGHT - 10);
    });
    
    // Draw multiplier markers on y-axis (left side)
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    MULTIPLIER_MARKERS.forEach(marker => {
      const y = (marker.value - 1.0) * HEIGHT_SCALE * 0.85;
      ctx.fillText(marker.label, 5, CANVAS_HEIGHT - y);
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
    <div className="flex flex-col h-full w-full bg-[#0F212E] text-white overflow-hidden">
      <div className="flex flex-row w-full h-screen">
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
          <div className="relative mb-4 bg-[#0E1C27] rounded-lg overflow-hidden w-full h-full min-h-[720px]">
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
              className="w-full h-[800px]"
            />
            
            {/* Current multiplier display */}
            {gameState === 'running' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-9xl font-bold text-white">{currentMultiplier.toFixed(2)}x</div>
              </div>
            )}
            
            {/* Starting in display */}
            {gameState === 'waiting' && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#11232F] bg-opacity-80 px-16 py-3 rounded-md text-center text-xl">
                  Starting in
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Multiplier Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 -mx-1 px-1">
            {MULTIPLIER_QUICKTABS.map((level, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-md ${level.color} text-black text-xs font-semibold`}
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
            
            <div className="flex justify-end text-xs text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Network Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;