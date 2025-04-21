import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';
import { useBalance } from '@/hooks/use-balance';
import { useCurrency } from '@/context/CurrencyContext';

// Constants for the game - fixed size to ensure visibility
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Multiplier markers for the side scale - exactly as in the reference image
const MULTIPLIER_MARKERS = [
  { value: 1.0, label: '1.0×' },
  { value: 1.2, label: '1.2×' },
  { value: 1.3, label: '1.3×' },
  { value: 1.5, label: '1.5×' },
  { value: 1.7, label: '1.7×' },
  { value: 1.8, label: '1.8×' },
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
  // Get active currency from context
  const { activeCurrency } = useCurrency();
  
  // Use balance hook for wallet integration
  const { placeBet: placeBetMutation, completeBet: completeBetMutation, rawBalance } = useBalance(activeCurrency);
  
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
    placeBet: placeBetGame,
    cashOut: cashOutGame,
    setBetAmount,
    setAutoCashoutValue,
    initialize,
    setCurrency
  } = useCrashGame();
  
  // Keep the store's currency in sync with the app's active currency
  useEffect(() => {
    setCurrency(activeCurrency);
  }, [activeCurrency, setCurrency]);
  
  // Make the balance hooks available to the store
  useEffect(() => {
    // Create a global reference to the balance methods
    // This approach is used to avoid circular dependencies
    window.placeBetFunction = placeBetMutation;
    window.completeBetFunction = completeBetMutation;
    
    return () => {
      // Clean up on unmount
      delete window.placeBetFunction;
      delete window.completeBetFunction;
    };
  }, [placeBetMutation, completeBetMutation]);
  
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
    
    // Determine if we're in mobile mode
    const isMobile = window.innerWidth < 768;
    
    // Create the white lightning bolt curve that matches the screenshot exactly
    
    // Adjust canvas layout for right-side multiplier scale
    const leftMargin = 50; // Consistent left margin
    const rightMargin = 60; // Space for right-side multiplier scale
    const startX = leftMargin;
    const startY = CANVAS_HEIGHT;
    const usableWidth = CANVAS_WIDTH - leftMargin - rightMargin;
    
    // Draw background grid - subtle version that matches reference
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; // Very subtle grid lines
    ctx.lineWidth = 1;
    
    // Get marker positions - evenly spaced for visual consistency
    const markerPositions = MULTIPLIER_MARKERS.map((marker, index) => {
      return {
        value: marker.value,
        y: CANVAS_HEIGHT * (1 - index / (MULTIPLIER_MARKERS.length - 1))
      };
    });
    
    // Horizontal grid lines at multiplier marker positions
    markerPositions.forEach(marker => {
      ctx.moveTo(0, marker.y);
      ctx.lineTo(CANVAS_WIDTH - rightMargin, marker.y);
    });
    
    // Vertical grid lines for time markers
    const timeMarkers = isMobile ? [4, 8, 12, 17] : [5, 10, 15, 20];
    const gridMaxTime = isMobile ? 17 : 20;
    
    timeMarkers.forEach(time => {
      const x = leftMargin + (time / gridMaxTime) * usableWidth;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
    });
    
    ctx.stroke();
    
    // Apply glow effect for visibility - stronger on mobile
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = isMobile ? 15 : 20;
    ctx.shadowOffsetY = 0;
    
    // Start new path for the curve
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Generate curve points using logarithmic growth
    const points = [];
    const curveMaxTime = isMobile ? 17 : 10; // Mobile has longer time span
    const baseMultiplier = 1.0;
    const growthRate = 0.12; // Same growth rate for consistent gameplay
    
    // Calculate curve progress
    const maxMultiplier = 5.0;
    const currentProgress = (currentMultiplier - 1) / (maxMultiplier - 1);
    const simulatedTimeMax = Math.min(curveMaxTime * currentProgress, curveMaxTime);
    
    // Generate points along the curve
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * simulatedTimeMax;
      const multiplier = baseMultiplier * Math.exp(growthRate * t);
      
      // X position is based on percentage along the width
      const x = startX + (i / 100) * usableWidth * currentProgress;
      
      // Y position uses logarithmic scale to match the multiplier exactly
      const logValue = multiplier <= 1 ? 0 : Math.log(multiplier) / Math.log(maxMultiplier);
      const y = CANVAS_HEIGHT - (logValue * CANVAS_HEIGHT * 0.7);
      
      points.push({ x, y, multiplier });
    }
    
    // Draw curve with white color
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Use line segments for the curve
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    
    // Style the line - thinner on mobile for cleaner look
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isMobile ? 6 : 10; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Fill the area under the curve with orange
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, CANVAS_HEIGHT);
      ctx.lineTo(startX, startY);
      ctx.fillStyle = '#ff9d02'; // Exact orange from screenshot
      ctx.fill();
      
      // Draw the end point circle - smaller on mobile
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, isMobile ? 8 : 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Add glow to the circle
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = isMobile ? 10 : 20;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // On desktop, add highlighted multiplier on the side scale
    if (!isMobile && currentMultiplier > 1) {
      // Find the closest marker
      const highlightedMarker = MULTIPLIER_MARKERS.find(m => m.value >= currentMultiplier) || 
                               MULTIPLIER_MARKERS[MULTIPLIER_MARKERS.length - 1];
      
      if (highlightedMarker) {
        const logValue = Math.log(highlightedMarker.value) / Math.log(5);
        const y = CANVAS_HEIGHT - (logValue * CANVAS_HEIGHT * 0.7);
        
        ctx.fillStyle = '#5BE12C'; // Green highlight
        ctx.beginPath();
        ctx.arc(leftMargin - 10, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Add active user betting overlay on mobile - duplicates from live bets section
    if (isMobile && gameState === 'running') {
      const userBets = [
        { username: 'Hidden', cashoutMultiplier: 2.12, amount: 123.45, color: '#6e40c9' },
        { username: 'Venio2070', cashoutMultiplier: 1.97, amount: 59.45, color: '#1664c0' },
        { username: 'Hidden', cashoutMultiplier: 1.88, amount: 78.23, color: '#6e40c9' },
        { username: 'Indecente', cashoutMultiplier: 2.04, amount: 45.60, color: '#52a447' }
      ];
      
      // Only add these if the multiplier is high enough
      if (currentMultiplier > 1.8) {
        // Position on right side of curve - similar to screenshot
        let yOffset = CANVAS_HEIGHT * 0.4;
        
        userBets.forEach((bet, index) => {
          const betMultiplier = bet.cashoutMultiplier;
          
          // Only show bets that are relevant to current multiplier
          if (betMultiplier <= currentMultiplier) {
            // Calculate position slightly to the right of the curve
            const logValue = Math.log(betMultiplier) / Math.log(maxMultiplier);
            const y = CANVAS_HEIGHT - (logValue * CANVAS_HEIGHT * 0.7);
            
            // Draw bet indicator
            ctx.fillStyle = 'rgba(17, 35, 47, 0.9)';
            
            // Create rounded rectangle for bet display
            const rectWidth = 120;
            const rectHeight = 24;
            const rectX = CANVAS_WIDTH - rectWidth - 20;
            const rectY = yOffset;
            const rectRadius = 12;
            
            // Draw rounded rect
            ctx.beginPath();
            ctx.moveTo(rectX + rectRadius, rectY);
            ctx.lineTo(rectX + rectWidth - rectRadius, rectY);
            ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectRadius);
            ctx.lineTo(rectX + rectWidth, rectY + rectHeight - rectRadius);
            ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - rectRadius, rectY + rectHeight);
            ctx.lineTo(rectX + rectRadius, rectY + rectHeight);
            ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - rectRadius);
            ctx.lineTo(rectX, rectY + rectRadius);
            ctx.quadraticCurveTo(rectX, rectY, rectX + rectRadius, rectY);
            ctx.closePath();
            ctx.fill();
            
            // Draw circle with user color
            ctx.fillStyle = bet.color || '#5BE12C';
            ctx.beginPath();
            ctx.arc(rectX + 12, rectY + rectHeight/2, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Add text
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.fillText(bet.username, rectX + 24, rectY + 15);
            
            // Add multiplier text
            ctx.fillStyle = '#5BE12C';
            ctx.font = '10px Arial';
            ctx.fillText(`✓ ${bet.cashoutMultiplier.toFixed(2)}x`, rectX + 80, rectY + 15);
            
            yOffset += rectHeight + 5;
          }
        });
      }
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
      {/* Mobile/Desktop Responsive Layout */}
      <div className="flex flex-col md:flex-row w-full h-full">
        
        {/* Game Area - Full width on mobile, flex-1 on desktop */}
        <div className="w-full md:flex-1 px-2 md:p-4 flex flex-col">
          {/* Quick Multiplier Buttons - Top row on mobile */}
          <div className="flex overflow-x-auto gap-2 mb-2 py-2 md:hidden">
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
            {/* Multiplier scale on right - exactly as in reference image */}
            <div className="absolute right-0 inset-y-0 w-24 z-10 pointer-events-none flex flex-col items-center justify-between py-4">
              <div className="h-full w-0.5 bg-[#1d2d3a]"></div>
              
              {MULTIPLIER_MARKERS.map((marker, index) => {
                // Calculate position for evenly spaced markers
                const heightPercent = index * (100 / (MULTIPLIER_MARKERS.length - 1));
                const isFirst = index === 0;
                const isLast = index === MULTIPLIER_MARKERS.length - 1;
                
                return (
                  <div 
                    key={index} 
                    className="absolute flex items-center"
                    style={{
                      bottom: `${100 - heightPercent}%`,
                      right: 0,
                      transform: 'translateY(50%)'
                    }}
                  >
                    <div className="h-0.5 w-6 bg-[#1d2d3a]"></div>
                    <div className="bg-[#11232F] text-white px-3 py-2 rounded text-center">
                      {marker.label}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Time markers at bottom - mobile only */}
            <div className="absolute bottom-0 inset-x-0 h-6 z-10 pointer-events-none md:hidden">
              <div className="flex justify-between px-12 text-xs text-gray-400">
                <span>4s</span>
                <span>8s</span>
                <span>12s</span>
                <span>17s</span>
              </div>
            </div>
            
            {/* Canvas Container - centers the game canvas */}
            <div className="w-full h-full flex justify-center items-center">
              <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                className="border border-[#0c1923] rounded-lg bg-[#0c1923]"
              />
            </div>
            
            {/* Game Status Overlays */}
            <div className="absolute inset-0 flex items-center justify-center">
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
            
            {/* Current multiplier display */}
            {gameState === 'running' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-6xl md:text-9xl font-bold text-white">{currentMultiplier.toFixed(2)}x</div>
              </div>
            )}
            
            {/* Network Status - Mobile specific positioning */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 flex items-center gap-1 md:hidden">
              <span>Network Status:</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Desktop Only: Quick Multiplier Buttons */}
          <div className="hidden md:flex flex-wrap gap-2 mb-4 mt-4 -mx-1 px-1">
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
                    value < 1.5 ? 'bg-[#EB5757] text-white' : 'bg-[#5BE12C] text-black'
                  }`}
                >
                  {value.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Game Controls - Side panel on desktop */}
        <div className="flex flex-col w-full md:w-[260px] p-4 bg-[#11232F]">
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
          
          {/* Wallet Balance */}
          <div className="mb-4 p-2 bg-[#0F212E] rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Balance</span>
              <span className="font-mono">{formatAmount(rawBalance)} {activeCurrency}</span>
            </div>
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
              <button 
                className="bg-[#0F212E] px-2 py-1 rounded text-xs"
                onClick={() => setBetAmount(betAmount / 2)}
              >
                ½
              </button>
              <button 
                className="bg-[#0F212E] px-2 py-1 rounded text-xs"
                onClick={() => setBetAmount(betAmount * 2)}
              >
                2×
              </button>
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
              <span className="ml-2">{activeCurrency}</span>
            </div>
          </div>
          
          {/* Bet Button */}
          <div className="mb-4">
            {gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
              <Button 
                className="w-full py-4 text-lg bg-[#FF6B00] hover:bg-[#FF8F3F] rounded-md"
                onClick={cashOutGame}
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
                onClick={placeBetGame}
                disabled={gameState !== 'waiting' || hasPlacedBet || rawBalance < betAmount}
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
        
        {/* Mobile-only Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-14 bg-[#0F212E] border-t border-[#243442] flex justify-between items-center px-4 md:hidden">
          <button className="text-[#5BE12C]">
            <CasinoIcon />
          </button>
          <button className="text-white">
            <BetsIcon />
          </button>
          <button className="text-white">
            <BrowseIcon />
          </button>
          <button className="text-white">
            <SportsIcon />
          </button>
          <button className="text-white">
            <ChatIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrashFinal;