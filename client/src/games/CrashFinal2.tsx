import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Multiplier markers - exactly as in reference
const MULTIPLIER_MARKERS = [
  { value: 1.0, label: '1.0×' },
  { value: 1.2, label: '1.2×' },
  { value: 1.3, label: '1.3×' },
  { value: 1.5, label: '1.5×' },
  { value: 1.7, label: '1.7×' },
  { value: 1.8, label: '1.8×' },
];

// Quick bet multiplier options
const MULTIPLIER_QUICKTABS = [
  { value: 1.83, label: '1.83x', color: 'bg-green-400' },
  { value: 2.22, label: '2.22x', color: 'bg-green-400' },
  { value: 1.64, label: '1.64x', color: 'bg-green-400' },
  { value: 3.25, label: '3.25x', color: 'bg-green-400' },
  { value: 1.99, label: '1.99x', color: 'bg-green-400' },
  { value: 2.12, label: '2.12x', color: 'bg-green-400' },
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
    
    // Actions
    placeBet,
    cashOut,
    setBetAmount,
    setAutoCashoutValue,
    initialize
  } = useCrashGame();
  
  // Canvas ref
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  
  // Draw function for the crash game graph
  const drawGraph = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Only draw if we're in running or crashed state
    if (gameState !== 'running' && gameState !== 'crashed') return;
    
    // Determine if we're in mobile mode
    const isMobile = window.innerWidth < 768;
    
    // Canvas layout
    const leftMargin = 50;
    const rightMargin = 80; // Space for right-side multiplier scale
    const startX = leftMargin;
    const startY = CANVAS_HEIGHT - 50; // Bottom margin
    const usableWidth = CANVAS_WIDTH - leftMargin - rightMargin;
    const usableHeight = CANVAS_HEIGHT - 100; // Top and bottom margins
    
    // Draw background
    ctx.fillStyle = '#0E1C27';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw time markers along bottom axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    
    // Time markers at bottom
    const maxSeconds = 8;
    for (let i = 0; i <= maxSeconds; i += 2) {
      const x = startX + (i / maxSeconds) * usableWidth;
      
      // Vertical grid line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, startY);
      ctx.stroke();
      
      // Time label
      ctx.fillText(`${i}s`, x, startY + 20);
    }
    
    // Draw side scale (right side exactly like reference)
    // Draw vertical line for multiplier scale
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.moveTo(CANVAS_WIDTH - rightMargin + 20, 50);
    ctx.lineTo(CANVAS_WIDTH - rightMargin + 20, CANVAS_HEIGHT - 50);
    ctx.stroke();
    
    // Get current multiplier value to highlight correct position
    const maxLogMultiplier = Math.log(2.0);
    
    // Draw multiplier markers with boxes
    MULTIPLIER_MARKERS.forEach((marker, index) => {
      const normalizedPosition = (marker.value - 1.0) / 1.0; // Normalize to 0-1 range
      const yPos = CANVAS_HEIGHT - 50 - normalizedPosition * usableHeight;
      
      // Horizontal tick line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.moveTo(CANVAS_WIDTH - rightMargin + 10, yPos);
      ctx.lineTo(CANVAS_WIDTH - rightMargin + 30, yPos);
      ctx.stroke();
      
      // Multiplier box
      ctx.fillStyle = '#11232F';
      ctx.fillRect(CANVAS_WIDTH - rightMargin + 35, yPos - 15, 40, 30);
      
      // Multiplier label
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(marker.label, CANVAS_WIDTH - rightMargin + 55, yPos + 5);
    });
    
    // Draw the crash curve
    const maxPointMultiplier = 2.0;
    const points = [];
    
    // Generate curve points using exponential function
    const growthRate = 0.13; // Controls curve steepness
    const baseMultiplier = 1.0;
    const numPoints = 100;
    
    // Calculate how far along the curve we are
    const progress = Math.min((currentMultiplier - 1.0) / 1.0, 1.0);
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * progress;
      const pointMultiplier = baseMultiplier * Math.exp(growthRate * (i / numPoints) * maxSeconds * 10);
      const x = startX + t * usableWidth;
      const y = startY - ((Math.min(pointMultiplier, maxPointMultiplier) - 1.0) / 1.0) * usableHeight;
      points.push({ x, y });
    }
    
    // Fill area under curve
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, startY);
      ctx.closePath();
      
      // Orange gradient fill as in reference
      const gradient = ctx.createLinearGradient(0, 0, 0, startY);
      gradient.addColorStop(0, 'rgba(255, 107, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw curve line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    
    // White glowing line
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();
    
    // Draw current position dot
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      
      // White circle at end of line
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.stroke();
    }
    
    // Turn off shadow
    ctx.shadowBlur = 0;
    
    // Draw current multiplier
    ctx.font = '48px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentMultiplier.toFixed(2)}×`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
  }, [gameState, currentMultiplier]);
  
  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Draw the graph
    drawGraph();
    
    // Animation frame loop
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
    if (!betAmount || !autoCashoutValue) return 0;
    return betAmount * (autoCashoutValue - 1);
  };
  
  // Format for display
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };
  
  return (
    <div className="flex flex-col h-full w-full bg-[#0F212E] text-white overflow-hidden">
      {/* Mobile/Desktop Responsive Layout */}
      <div className="flex flex-col md:flex-row w-full h-full">
        
        {/* Game Area - Left Side */}
        <div className="w-full md:w-3/4 px-2 md:p-4 flex flex-col">
          {/* Quick Multiplier Buttons - Top row on mobile and desktop */}
          <div className="flex gap-2 mb-2 py-2 overflow-x-auto">
            {MULTIPLIER_QUICKTABS.map((level, i) => (
              <button
                key={i}
                className={`shrink-0 px-3 py-1 rounded-full ${level.color} text-black text-xs font-semibold`}
                onClick={() => setAutoCashoutValue(level.value)}
              >
                {level.label}
              </button>
            ))}
          </div>
          
          {/* Game Canvas - Main game display */}
          <div className="relative bg-[#0E1C27] rounded-lg overflow-hidden w-full h-[400px] md:h-[600px]">
            {/* Canvas Container - centers the game canvas */}
            <div className="w-full h-full flex justify-center items-center">
              <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                className="rounded-lg bg-[#0c1923]"
              />
            </div>
            
            {/* Game Status Overlays */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {gameState === 'waiting' && (
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold mb-2">{countdown}s</div>
                  <div className="text-xl">Next Round Starting...</div>
                </div>
              )}
              
              {gameState === 'crashed' && (
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold text-red-500 mb-2">CRASHED</div>
                  <div className="text-xl">@ {currentMultiplier.toFixed(2)}x</div>
                </div>
              )}
            </div>
            
            {/* Network Status - Bottom right */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 flex items-center gap-1">
              <span>Network Status:</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Recent Games */}
          <div className="bg-[#11232F] p-3 rounded mt-4">
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
          </div>
          
          {/* Active Bets Table */}
          <div className="bg-[#11232F] p-3 rounded mt-4 flex-grow">
            <h3 className="text-sm font-semibold mb-2">Active Bets</h3>
            <div className="h-[200px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left pb-2">User</th>
                    <th className="text-right pb-2">Bet</th>
                    <th className="text-right pb-2">Mult</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBets
                    .filter(bet => !bet.isHidden)
                    .map((bet, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-2">{bet.username}</td>
                      <td className="text-right py-2">{formatAmount(bet.amount)}</td>
                      <td className="text-right py-2">
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
        
        {/* Right Sidebar - Betting Controls */}
        <div className="w-full md:w-1/4 p-4 bg-[#11232F]">
          {/* Game Mode Toggle */}
          <div className="flex rounded-md overflow-hidden mb-4">
            <button 
              className="flex-1 py-2 text-center bg-[#0F212E]"
            >
              Manual
            </button>
            <button 
              className="flex-1 py-2 text-center bg-[#11232F]"
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
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0e1c27] flex justify-between border-t border-gray-800 md:hidden py-2">
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <BrowseIcon />
          <span className="text-xs text-gray-400">Browse</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <CasinoIcon />
          <span className="text-xs text-white">Casino</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <BetsIcon />
          <span className="text-xs text-gray-400">Bets</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <SportsIcon />
          <span className="text-xs text-gray-400">Sports</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1">
          <ChatIcon />
          <span className="text-xs text-gray-400">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default CrashGame;