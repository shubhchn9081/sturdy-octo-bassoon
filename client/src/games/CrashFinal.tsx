import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';

// Constants for the game - fixed size to ensure visibility
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

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
    
    // Determine if we're in mobile mode
    const isMobile = window.innerWidth < 768;
    
    // Create the white lightning bolt curve that matches the screenshot exactly
    
    // Set up canvas with offset for multiplier scale
    const leftMargin = isMobile ? 50 : 120; // Less margin on mobile
    const startX = leftMargin;
    const startY = CANVAS_HEIGHT;
    const usableWidth = CANVAS_WIDTH - leftMargin - 50; // Width minus margins
    
    // Draw background grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Different marker sets for mobile vs desktop
    const markers = isMobile ? 
      [1.0, 1.4, 1.9, 2.3, 2.8, 3.2] : 
      [1.0, 20.1, 39.2, 58.3, 77.4, 96.5]; // Exact multipliers from screenshot
      
    // Horizontal grid lines (multiplier levels)
    markers.forEach(value => {
      // Calculate y position based on multiplier values
      // Different calculation logic for desktop vs mobile
      let y;
      if (isMobile) {
        const logValue = Math.log(value) / Math.log(5);
        y = CANVAS_HEIGHT - (logValue * CANVAS_HEIGHT * 0.7);
      } else {
        // For desktop, we want to match the screenshot exactly
        // The values in the screenshot are spread evenly
        const index = markers.indexOf(value);
        const totalMarkers = markers.length;
        y = CANVAS_HEIGHT - ((index / (totalMarkers - 1)) * CANVAS_HEIGHT * 0.8);
      }
      
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    });
    
    // Vertical grid lines (time markers)
    if (isMobile) {
      // Mobile has time markers at 4s, 8s, 12s, 17s
      const timeMarkers = [4, 8, 12, 17];
      const maxTime = 17; // Max time on mobile display
      
      timeMarkers.forEach(time => {
        const x = leftMargin + (time / maxTime) * usableWidth;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
      });
    } else {
      // Desktop time markers from screenshot - 16s, 31s, 47s, 63s
      const timeMarkers = [16, 31, 47, 63];
      const maxTime = 76; // Max time of 76s from screenshot
      
      timeMarkers.forEach(time => {
        const x = leftMargin + (time / maxTime) * usableWidth;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
      });
    }
    
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
    const maxTime = isMobile ? 17 : 76; // Match the desktop time as shown in screenshot
    const baseMultiplier = 1.0;
    const growthRate = isMobile ? 0.12 : 0.06; // Slower growth rate for desktop to reach 96.21x
    
    // Calculate curve progress and max multiplier
    const maxMultiplier = isMobile ? 5.0 : 96.21; // Match the desktop multiplier in screenshot
    const currentProgress = isMobile
      ? (currentMultiplier - 1) / (5.0 - 1) // Mobile scale
      : (currentMultiplier - 1) / (96.21 - 1); // Desktop scale
    const simulatedTimeMax = Math.min(maxTime * currentProgress, maxTime);
    
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
    <div className="flex flex-col h-full w-full bg-[#111d29] text-white overflow-hidden">
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
          
          {/* Desktop Preset Multiplier Buttons - Exact match to screenshot */}
          <div className="hidden md:flex flex-wrap gap-1 mb-4">
            <button className="px-3 py-1 rounded bg-[#1e2835] text-white text-xs whitespace-nowrap">1.10x</button>
            <button className="px-3 py-1 rounded bg-[#69de36] text-black text-xs whitespace-nowrap">3.41x</button>
            <button className="px-3 py-1 rounded bg-[#1e2835] text-white text-xs whitespace-nowrap">1.01x</button>
            <button className="px-3 py-1 rounded bg-[#1e2835] text-white text-xs whitespace-nowrap">1.97x</button>
            <button className="px-3 py-1 rounded bg-[#1e2835] text-white text-xs whitespace-nowrap">1.78x</button>
            <button className="px-3 py-1 rounded bg-[#69de36] text-black text-xs whitespace-nowrap">2.06x</button>
            <button className="px-3 py-1 rounded bg-[#69de36] text-black text-xs whitespace-nowrap">5.11x</button>
            <button className="px-3 py-1 rounded bg-[#1e2835] text-white text-xs whitespace-nowrap">1.50x</button>
            <button className="px-3 py-1 rounded bg-[#1e2835] text-white text-xs whitespace-nowrap">1.48x</button>
            <button className="px-3 py-1 rounded bg-[#69de36] text-black text-xs whitespace-nowrap">2.57x</button>
            <span className="text-gray-400 text-xs flex items-center ml-1">← You</span>
          </div>
          
          {/* Game Canvas - Main game display */}
          <div className="relative bg-[#0E1C27] rounded-lg overflow-hidden w-full h-[400px] md:h-[400px]">
            {/* Mobile Multiplier scale on left - exactly as in screenshot */}
            <div className="absolute left-0 inset-y-0 w-12 z-10 pointer-events-none">
              {/* Only show specific markers on mobile that match the screenshot */}
              {[
                { value: 1.0, label: '1.0×' },
                { value: 1.4, label: '1.4×' },
                { value: 1.9, label: '1.9×' },
                { value: 2.3, label: '2.3×' },
                { value: 2.8, label: '2.8×' },
                { value: 3.2, label: '3.2×' }
              ].map((marker, index) => {
                // Calculate logarithmic position 
                const markerValue = marker.value;
                const maxMarker = 5.0;
                
                // Calculate logarithmic position for exact match to screenshot
                const logValue = Math.log(markerValue) / Math.log(maxMarker);
                const heightPercent = logValue * 70;
                
                return (
                  <div 
                    key={index} 
                    className="absolute flex items-center md:hidden"
                    style={{
                      bottom: `${heightPercent}%`,
                      left: 0,
                      transform: 'translateY(50%)'
                    }}
                  >
                    <div className="bg-transparent text-white px-1 py-1 text-xs">
                      {marker.label}
                    </div>
                    <div className="h-0.5 w-2 bg-gray-600"></div>
                  </div>
                );
              })}
              
              {/* Desktop vertical markers - match exactly to screenshot */}
              {[
                { value: 96.5, label: '96.5x', bottom: '95%' },
                { value: 77.4, label: '77.4x', bottom: '80%' },
                { value: 58.3, label: '58.3x', bottom: '65%' },
                { value: 39.2, label: '39.2x', bottom: '50%' },
                { value: 20.1, label: '20.1x', bottom: '35%' },
                { value: 1.0, label: '1.0x', bottom: '20%' }
              ].map((marker, index) => {
                return (
                  <div 
                    key={`desktop-${index}`} 
                    className="absolute items-center hidden md:flex"
                    style={{
                      bottom: marker.bottom,
                      left: 0
                    }}
                  >
                    <div className="text-white px-1 py-1 text-xs whitespace-nowrap">
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
            
            {/* Desktop Time markers at bottom - exact match to screenshot */}
            <div className="absolute bottom-2 inset-x-0 h-6 z-10 pointer-events-none hidden md:block">
              <div className="flex justify-between px-24 text-xs text-gray-400">
                <span>16s</span>
                <span>31s</span>
                <span>47s</span>
                <span>63s</span>
                <div className="whitespace-nowrap">Total 76s</div>
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
                <div className="text-6xl md:text-7xl font-bold text-white">{currentMultiplier.toFixed(2)}x</div>
              </div>
            )}
            
            {/* Network Status - Mobile specific positioning */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 flex items-center gap-1 md:hidden">
              <span>Network Status:</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            
            {/* Desktop Network Status - Bottom right position */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 hidden md:flex items-center gap-1">
              <span>Network Status</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Mobile Active Bets - Shown on mobile only */}
          <div className="mt-4 md:hidden">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Active Bets</h3>
            <div className="h-[200px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left pb-2">User</th>
                    <th className="text-right pb-2">Mult</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBets
                    .filter(bet => !bet.isHidden)
                    .map((bet, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-2">{bet.username}</td>
                      <td className="text-right py-2">
                        {bet.status === 'won' ? (
                          <span className="text-green-500">{bet.cashoutMultiplier?.toFixed(2)}x</span>
                        ) : bet.status === 'lost' ? (
                          <span className="text-red-500">BUST</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-right py-2">{formatAmount(bet.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Mobile Controls - Bottom section */}
        <div className="w-full md:hidden p-4 bg-[#11232F]">
          {/* Bet Button - Full width on mobile */}
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
          
          {/* Mobile Betting Controls */}
          <div className="space-y-4">
            {/* Bet Amount */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Bet Amount</label>
              <div className="flex rounded-md overflow-hidden">
                <input 
                  type="number" 
                  className="flex-1 bg-[#0F212E] border-none rounded-l p-3 text-white"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={hasPlacedBet || gameState === 'running'}
                />
                <div className="flex bg-[#0F212E] rounded-r">
                  <button className="px-3 border-l border-gray-700">½</button>
                  <button className="px-3 border-l border-gray-700">2×</button>
                </div>
              </div>
            </div>
            
            {/* Cashout At */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Cashout At</label>
              <div className="flex rounded-md overflow-hidden">
                <input 
                  type="number" 
                  step="0.01"
                  className="flex-1 bg-[#0F212E] border-none rounded-l p-3 text-white"
                  value={autoCashoutValue || 2.00}
                  onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
                  disabled={hasPlacedBet && !hasCashedOut && gameState === 'running'}
                />
                <div className="flex flex-col bg-[#0F212E] rounded-r">
                  <button 
                    className="px-3 border-l border-gray-700 pb-0"
                    onClick={() => setAutoCashoutValue((autoCashoutValue || 2.00) + 0.01)}
                  >▲</button>
                  <button 
                    className="px-3 border-l border-gray-700 pt-0"
                    onClick={() => setAutoCashoutValue(Math.max(1.01, (autoCashoutValue || 2.00) - 0.01))}
                  >▼</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation - exact match to screenshot */}
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
        
        {/* Desktop Controls - Right sidebar - Exact match to screenshot */}
        <div className="hidden md:flex md:flex-col md:w-[260px] p-4 bg-[#11232F]">
          {/* Game Mode Toggle */}
          <div className="flex rounded-md overflow-hidden mb-4">
            <button 
              className={`flex-1 py-2 text-center bg-[#1e2835]`}
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
            <label className="block text-sm mb-1 text-gray-400">Bet Amount</label>
            <div className="text-gray-400 text-xs absolute right-6 mt-1">$0.00</div>
            <div className="flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#1e2835] border-none rounded p-2 text-white"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={hasPlacedBet || gameState === 'running'}
              />
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex mt-2">
              <button className="bg-[#1e2835] px-2 py-1 rounded text-xs">½</button>
              <button className="bg-[#1e2835] px-2 py-1 rounded text-xs ml-auto">2×</button>
            </div>
          </div>
          
          {/* Cashout At */}
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-400">Cashout At</label>
            <div className="relative mb-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-[#1e2835] border-none rounded p-2 text-white"
                value={autoCashoutValue || 2.00}
                onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
                disabled={hasPlacedBet && !hasCashedOut && gameState === 'running'}
              />
              <div className="absolute right-0 top-0 h-full flex flex-col">
                <button 
                  className="bg-[#1e2835] h-1/2 px-2 flex items-center justify-center"
                  onClick={() => setAutoCashoutValue((autoCashoutValue || 2.00) + 0.01)}
                >
                  ▲
                </button>
                <button 
                  className="bg-[#1e2835] h-1/2 px-2 flex items-center justify-center"
                  onClick={() => setAutoCashoutValue(Math.max(1.01, (autoCashoutValue || 2.00) - 0.01))}
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
          
          {/* Profit on Win */}
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-400">Profit on Win</label>
            <div className="text-gray-400 text-xs absolute right-6 mt-1">$0.00</div>
            <div className="flex items-center mb-4">
              <input 
                type="number" 
                className="w-full bg-[#1e2835] border-none rounded p-2 text-white"
                value={calculateProfit()}
                readOnly
              />
            </div>
          </div>
          
          {/* Bet Button */}
          <div className="mb-4">
            {gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
              <Button 
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#FF8F3F] rounded-md"
                onClick={cashOut}
              >
                Cash Out @ {currentMultiplier.toFixed(2)}x
              </Button>
            ) : (
              <Button 
                className={`w-full py-3 ${
                  gameState === 'waiting' 
                    ? 'bg-[#5BE12C] hover:bg-[#4CC124] text-black'
                    : 'bg-[#1e2835] text-gray-400 cursor-not-allowed'
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
          
          {/* Total players count - from screenshot */}
          <div className="flex items-center mb-2 text-xs text-gray-400">
            <span className="mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            882
            <span className="ml-auto flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f5b03a" stroke="none">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span className="ml-1">0.08183262</span>
            </span>
          </div>
          
          {/* Active Bets - Exact match to screenshot */}
          <div className="bg-[#1e2835] p-3 rounded mb-2">
            <div className="h-[300px] overflow-y-auto">
              <table className="w-full text-xs">
                <tbody>
                  {[
                    { username: 'Hidden', mult: '-', crypto: 'btc', amount: '₿150,000.00' },
                    { username: 'Hidden', mult: '-', crypto: 'eth', amount: '189.000000' },
                    { username: 'Hidden', mult: '-', crypto: 'usdt', amount: '766.66398...' },
                    { username: 'Chicsa115', mult: '-', crypto: 'doge', amount: '80.000000...' },
                    { username: 'Hidden', mult: '-', crypto: 'trx', amount: '163.39791...' },
                    { username: 'Hidden', mult: '-', crypto: 'trx', amount: '150.00000...' },
                    { username: 'Rohan9981', mult: '-', crypto: 'ltc', amount: '₹10,000.00' },
                    { username: 'Dayananda9', mult: '-', crypto: 'ltc', amount: '₹8,750.00' },
                    { username: 'Hidden', mult: '-', crypto: 'trx', amount: '100.00000...' },
                    { username: 'jasw4040', mult: '-', crypto: 'ltc', amount: '₹8,000.00' }
                  ].map((bet, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {bet.username}
                      </td>
                      <td className="text-right py-1">
                        {bet.mult === '-' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className="text-green-500">{bet.mult}x</span>
                        )}
                      </td>
                      <td className="text-right py-1">
                        <span className={`
                          ${bet.crypto === 'btc' ? 'text-yellow-400' : ''}
                          ${bet.crypto === 'eth' ? 'text-blue-400' : ''}
                          ${bet.crypto === 'usdt' ? 'text-green-400' : ''}
                          ${bet.crypto === 'trx' ? 'text-green-400' : ''}
                          ${bet.crypto === 'doge' ? 'text-yellow-400' : ''}
                          ${bet.crypto === 'ltc' ? 'text-yellow-400' : ''}
                        `}>
                          {bet.amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Bottom navigation icons - Exact match to screenshot */}
          <div className="flex items-center justify-between mt-auto text-gray-500">
            <button className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
            <button className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </button>
            <button className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashFinal;