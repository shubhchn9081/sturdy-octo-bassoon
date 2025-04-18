import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';

// Constants for the game
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// Multiplier markers for the side scale
const MULTIPLIER_MARKERS = [
  { value: 1.0, label: '1.0×' },
  { value: 1.4, label: '1.4×' },
  { value: 1.9, label: '1.9×' },
  { value: 2.3, label: '2.3×' },
  { value: 2.7, label: '2.7×' },
  { value: 3.1, label: '3.1×' },
  { value: 4.0, label: '4.0×' },
  { value: 5.0, label: '5.0×' },
];

// Multiplier quick-select levels
const MULTIPLIER_QUICKTABS = [
  { value: 1.71, label: '1.71x', color: 'bg-[#5BE12C]' },
  { value: 1.97, label: '1.97x', color: 'bg-[#5BE12C]' },
  { value: 5.25, label: '5.25x', color: 'bg-[#5BE12C]' },
  { value: 1.37, label: '1.37x', color: 'bg-[#5BE12C]' },
  { value: 8.34, label: '8.34x', color: 'bg-[#5BE12C]' },
  { value: 1.03, label: '1.03x', color: 'bg-[#5BE12C]' }
];

const CrashFinal: React.FC = () => {
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
  
  // Canvas ref
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  
  // Draw function
  const drawGraph = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Only draw if we're in running or crashed state
    if (gameState !== 'running' && gameState !== 'crashed') return;
    
    // Create the white lightning bolt curve that matches the screenshot exactly
    
    // Set up canvas with offset for multiplier scale
    const leftMargin = 100; // Space for the multiplier scale
    const startX = leftMargin;
    const startY = CANVAS_HEIGHT;
    const usableWidth = CANVAS_WIDTH - leftMargin - 50; // Width minus margins
    
    // Draw background grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (multiplier levels)
    MULTIPLIER_MARKERS.forEach(marker => {
      // Calculate y position based on multiplier
      const yPercentage = (marker.value - 1) / 5; // Scale to 0-1 range based on max multiplier of ~6
      const y = CANVAS_HEIGHT - (yPercentage * CANVAS_HEIGHT * 0.8);
      
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    });
    
    // Vertical grid lines (time markers)
    for (let x = leftMargin + 100; x < CANVAS_WIDTH; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
    }
    ctx.stroke();
    
    // Apply extreme glow effect for visibility
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 0;
    
    // Start new path for the curve
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Calculate curve length based on current multiplier
    const progress = Math.min(currentMultiplier, 15) / 15; // Scale to 0-1, max at multiplier 15
    const curveLength = progress * usableWidth;
    
    // Generate curve points - specifically to match Aviator curve
    // Uses a flat power curve (x^0.3) that rises extremely gradually
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const xPercent = i / 100;
      const x = startX + (xPercent * curveLength);
      
      // Extremely flat curve function to match exactly what's in the screenshot
      // The key is to use a very flat power curve with an exponent < 1
      const yOffset = Math.pow(xPercent, 0.3) * 0.8; // Power curve with very small exponent for flatness
      const y = CANVAS_HEIGHT - (yOffset * CANVAS_HEIGHT);
      
      points.push({ x, y });
    }
    
    // Draw curve with extreme thickness and white color for visibility
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Use bezier curves for smoother line
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      ctx.lineTo(curr.x, curr.y);
    }
    
    // Style the line with extreme thickness and white color
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20; // Extra thick line for visibility
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Fill the area under the curve
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, CANVAS_HEIGHT);
      ctx.lineTo(startX, startY);
      ctx.fillStyle = '#ff9d02';
      ctx.fill();
      
      // Draw the end point circle with glow
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 20, 0, Math.PI * 2); // Larger circle (20px radius)
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Add highlighted multiplier value based on current position
    const highlightedMarker = MULTIPLIER_MARKERS.find(m => m.value >= currentMultiplier) || 
                              MULTIPLIER_MARKERS[MULTIPLIER_MARKERS.length - 1];
    
    if (highlightedMarker) {
      const yPercentage = (highlightedMarker.value - 1) / 5;
      const y = CANVAS_HEIGHT - (yPercentage * CANVAS_HEIGHT * 0.8);
      
      ctx.fillStyle = '#5BE12C'; // Green highlight
      ctx.beginPath();
      ctx.arc(leftMargin - 10, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
  }, [gameState, currentMultiplier]);
  
  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Draw the graph
    drawGraph();
    
    // Draw on each animation frame
    let frame: number;
    const animate = () => {
      drawGraph();
      frame = requestAnimationFrame(animate);
    };
    
    frame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [drawGraph]);
  
  // Initialize game on mount
  useEffect(() => {
    if (gameState === 'waiting') {
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
            {/* Multiplier scale on the left side */}
            <div className="absolute left-4 inset-y-0 w-16 flex flex-col justify-between py-8 z-10">
              <div className="flex flex-col-reverse h-full justify-between">
                {MULTIPLIER_MARKERS.map((marker, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="bg-[#11232F] text-white px-4 py-2 rounded text-center">
                      {marker.label}
                    </div>
                    {index !== 0 && (
                      <div className="h-12 w-0.5 bg-gray-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
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

export default CrashFinal;