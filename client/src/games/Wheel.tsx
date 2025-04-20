import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBalance } from '@/hooks/use-balance';
import { Sparkle, Settings, Users } from 'lucide-react';

type RiskLevel = 'Low' | 'Medium' | 'High';

// Sound effects
const playSound = (type: 'spin' | 'win' | 'lose' | 'click') => {
  const sounds = {
    spin: new Audio('/sounds/wheel-spin.mp3'),
    win: new Audio('/sounds/win.mp3'),
    lose: new Audio('/sounds/lose.mp3'),
    click: new Audio('/sounds/click.mp3')
  };
  
  // Create sound elements if they don't exist
  try {
    sounds[type].volume = 0.3;
    sounds[type].play().catch(e => console.log('Audio play error:', e));
  } catch (err) {
    console.log('Sound error:', err);
  }
};

const WheelGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [betAmount, setBetAmount] = useState<string>('0.00010000');
  const [risk, setRisk] = useState<RiskLevel>('Medium');
  const [segments, setSegments] = useState<number>(16);
  const [activeTab, setActiveTab] = useState<'Manual' | 'Auto'>('Manual');
  const { rawBalance } = useBalance('BTC');
  const [lastWins, setLastWins] = useState<{ multiplier: number; amount: number }[]>([]);
  
  // Define colors for wheel segments
  const colors = [
    '#FF3B30', // Red
    '#4CD964', // Green
    '#FFCC00', // Yellow
    '#5856D6', // Purple
    '#5AC8FA', // Blue
    '#FF9500', // Orange
    '#4CD964', // Green
    '#FFCC00', // Yellow
  ];
  
  // Multipliers based on risk level
  const multipliers = {
    Low: [0.5, 1.1, 1.2, 1.3, 1.5, 2.0],
    Medium: [0.0, 1.5, 1.7, 2.0, 3.0, 5.0],
    High: [0.0, 0.0, 1.5, 3.0, 5.0, 10.0]
  };

  // Game state
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<boolean>(false);
  const [onlinePlayers] = useState<number>(Math.floor(Math.random() * 1000) + 500);
  
  // Refs for animation
  const animationRef = useRef<number>();
  const spinStartTimeRef = useRef<number>(0);
  const spinDurationRef = useRef<number>(7000); // 7 seconds
  const finalRotationRef = useRef<number>(0);
  const targetMultiplierRef = useRef<number>(0);

  // Draw the wheel whenever segments or rotation changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match container
    if (wheelContainerRef.current) {
      const containerSize = Math.min(
        wheelContainerRef.current.clientWidth,
        wheelContainerRef.current.clientHeight
      );
      canvas.width = containerSize * 0.9;
      canvas.height = containerSize * 0.9;
    }
    
    drawWheel(ctx, canvas.width, segments, rotation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [segments, rotation]);

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !wheelContainerRef.current) return;
      
      const containerSize = Math.min(
        wheelContainerRef.current.clientWidth,
        wheelContainerRef.current.clientHeight
      );
      canvas.width = containerSize * 0.9;
      canvas.height = containerSize * 0.9;
      
      const ctx = canvas.getContext('2d');
      if (ctx) drawWheel(ctx, canvas.width, segments, rotation);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [segments, rotation]);

  const drawWheel = (ctx: CanvasRenderingContext2D, canvasWidth: number, segmentCount: number, rotationAngle: number) => {
    const radius = canvasWidth / 2;
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    
    ctx.clearRect(0, 0, canvasWidth, canvasWidth);
    
    // Draw outer ring
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#0F1B29";
    ctx.fill();
    
    // Draw gradient outer edge
    const outerGradient = ctx.createRadialGradient(
      radius, radius, radius * 0.95,
      radius, radius, radius
    );
    outerGradient.addColorStop(0, '#172B3A');
    outerGradient.addColorStop(1, '#0A131E');
    
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = outerGradient;
    ctx.fill();
    
    // Save context before transformations
    ctx.save();
    
    // Move to center and apply rotation
    ctx.translate(radius, radius);
    ctx.rotate(rotationAngle);
    
    // Draw segments
    for (let i = 0; i < segmentCount; i++) {
      const angle = i * anglePerSegment;
      const colorIndex = i % colors.length;
      
      // Create segment path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.85, angle, angle + anglePerSegment);
      ctx.lineTo(0, 0);
      ctx.closePath();
      
      // Fill segment with slightly transparent color to blend
      ctx.fillStyle = colors[colorIndex] + 'E6'; // Add 90% opacity
      ctx.fill();
      
      // Draw thin gold separators
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
      ctx.strokeStyle = "#FFC107";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add multiplier values
      ctx.save();
      ctx.rotate(angle + anglePerSegment / 2);
      ctx.translate(radius * 0.6, 0);
      ctx.rotate(Math.PI / 2);
      
      const multiplierOptions = multipliers[risk];
      const multiplierIndex = i % multiplierOptions.length;
      const multiplier = multiplierOptions[multiplierIndex];
      
      ctx.font = "bold 18px Arial";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 4;
      
      // Different style for 0x multiplier
      if (multiplier === 0.0) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 22px Arial";
      }
      
      ctx.fillText(`${multiplier.toFixed(1)}×`, 0, 0);
      ctx.restore();
    }
    
    // Restore context after segment drawing
    ctx.restore();
    
    // Draw center circle with gradient
    const centerGradient = ctx.createRadialGradient(
      radius, radius, 0,
      radius, radius, radius * 0.25
    );
    centerGradient.addColorStop(0, '#2C4356');
    centerGradient.addColorStop(1, '#172B3A');
    
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.25, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    // Add embossed edge to center
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.25, 0, 2 * Math.PI);
    ctx.strokeStyle = "#3A5A7D";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add inner glowing circle
    const glowGradient = ctx.createRadialGradient(
      radius, radius, radius * 0.15,
      radius, radius, radius * 0.25
    );
    glowGradient.addColorStop(0, 'rgba(26, 188, 156, 0.3)');
    glowGradient.addColorStop(1, 'rgba(26, 188, 156, 0)');
    
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = glowGradient;
    ctx.fill();
    
    // Add logo in center
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("STAKE", radius, radius);
    
    // Draw pointer/indicator at the top
    const pointerHeight = radius * 0.15;
    const pointerWidth = radius * 0.1;
    
    // Draw glow behind pointer
    if (isSpinning) {
      ctx.beginPath();
      ctx.moveTo(radius, radius - radius * 0.85 - pointerHeight / 2);
      ctx.arc(radius, radius - radius * 0.85, pointerHeight, 0, Math.PI, true);
      ctx.closePath();
      
      const pointerGlow = ctx.createRadialGradient(
        radius, radius - radius * 0.85, 0,
        radius, radius - radius * 0.85, pointerHeight
      );
      pointerGlow.addColorStop(0, 'rgba(255, 59, 48, 0.8)');
      pointerGlow.addColorStop(1, 'rgba(255, 59, 48, 0)');
      ctx.fillStyle = pointerGlow;
      ctx.fill();
    }
    
    // Draw pointer triangle
    ctx.beginPath();
    ctx.moveTo(radius, radius - radius * 0.85);
    ctx.lineTo(radius - pointerWidth / 2, radius - radius * 0.85 - pointerHeight);
    ctx.lineTo(radius + pointerWidth / 2, radius - radius * 0.85 - pointerHeight);
    ctx.closePath();
    
    // Create gradient for pointer
    const pointerGradient = ctx.createLinearGradient(
      radius, radius - radius * 0.85,
      radius, radius - radius * 0.85 - pointerHeight
    );
    pointerGradient.addColorStop(0, '#FF3B30');
    pointerGradient.addColorStop(1, '#FF6B60');
    
    ctx.fillStyle = pointerGradient;
    ctx.fill();
    
    // Add highlight/shadow to make it 3D
    ctx.beginPath();
    ctx.moveTo(radius, radius - radius * 0.85);
    ctx.lineTo(radius - pointerWidth / 2, radius - radius * 0.85 - pointerHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(radius, radius - radius * 0.85);
    ctx.lineTo(radius + pointerWidth / 2, radius - radius * 0.85 - pointerHeight);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw outer ring
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.93, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFC107";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  // Create animated sparkles
  const createSparkles = () => {
    if (!wheelContainerRef.current) return;
    
    // Create sparkle elements
    const sparkleCount = 30;
    const container = wheelContainerRef.current;
    
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'absolute w-2 h-2 bg-yellow-400 rounded-full';
      
      // Random position around the wheel
      const angle = Math.random() * Math.PI * 2;
      const distance = (Math.random() * 100) + 150;
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      
      // Animation
      sparkle.style.animation = `sparkle ${0.5 + Math.random()}s ease-out forwards`;
      sparkle.style.opacity = '0';
      
      container.appendChild(sparkle);
      
      // Remove after animation
      setTimeout(() => {
        if (container.contains(sparkle)) {
          container.removeChild(sparkle);
        }
      }, 2000);
    }
  };
  
  const spinWheel = () => {
    if (isSpinning) return;
    
    // Validate bet amount
    const betValue = parseFloat(betAmount);
    if (isNaN(betValue) || betValue <= 0 || betValue > rawBalance) {
      alert('Please enter a valid bet amount');
      return;
    }
    
    // Note: Balance is now managed by the balance API, no need to manually deduct
    
    // Play spin sound
    playSound('spin');
    
    setIsSpinning(true);
    setResult(null);
    setSparkles(false);
    
    // Choose a target segment and multiplier
    const multiplierOptions = multipliers[risk];
    const randomMultiplierIndex = Math.floor(Math.random() * multiplierOptions.length);
    const resultMultiplier = multiplierOptions[randomMultiplierIndex];
    
    // Store the target multiplier for later
    targetMultiplierRef.current = resultMultiplier;
    
    // Calculate how many full rotations plus the angle to the target segment
    const segmentAngle = (2 * Math.PI) / segments;
    const targetSegmentIndex = randomMultiplierIndex % segments;
    const targetAngle = segmentAngle * targetSegmentIndex;
    
    // Add 8-10 full rotations plus the target segment angle
    const fullRotations = 8 + Math.random() * 2; // 8-10 rotations
    const finalAngle = (fullRotations * 2 * Math.PI) + targetAngle;
    
    // Set up animation
    spinStartTimeRef.current = performance.now();
    spinDurationRef.current = 7000; // 7 seconds
    finalRotationRef.current = finalAngle;
    
    // Start animation
    animateSpinning();
  };
  
  const animateSpinning = () => {
    const currentTime = performance.now();
    const elapsedTime = currentTime - spinStartTimeRef.current;
    const duration = spinDurationRef.current;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Enhanced easing for more realistic spin physics
    const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);
    const easeOutElastic = (x: number): number => {
      const c4 = (2 * Math.PI) / 3;
      return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    };
    
    // Combine easing functions for natural spin down
    // Fast at start, then gradually slows with slight elastic effect at end
    let easedProgress;
    if (progress < 0.7) {
      // First 70% - smooth cubic deceleration
      easedProgress = easeOutQuint(progress / 0.7) * 0.7;
    } else if (progress < 0.95) {
      // Next 25% - approaching final position
      const normalizedProgress = (progress - 0.7) / 0.25;
      easedProgress = 0.7 + (easeOutQuint(normalizedProgress) * 0.25);
    } else {
      // Final 5% - small elastic effect
      const normalizedProgress = (progress - 0.95) / 0.05;
      easedProgress = 0.95 + (easeOutElastic(normalizedProgress) * 0.05);
    }
    
    // Apply rotation
    const currentRotation = easedProgress * finalRotationRef.current;
    setRotation(currentRotation);
    
    if (progress < 1) {
      // Continue animation
      animationRef.current = requestAnimationFrame(animateSpinning);
    } else {
      // Animation complete - show result
      finishSpin();
    }
  };
  
  const finishSpin = () => {
    // Get result based on animation
    setIsSpinning(false);
    
    const resultMultiplier = targetMultiplierRef.current;
    setResult(resultMultiplier);
    
    // Play appropriate sound
    if (resultMultiplier === 0) {
      playSound('lose');
    } else {
      playSound('win');
      setSparkles(true);
      createSparkles();
      
      // Calculate winnings
      const betValue = parseFloat(betAmount);
      const winAmount = betValue * resultMultiplier;
      
      // Note: Balance is now managed by the balance API, no need to manually update
      
      // Record win in history
      setLastWins(prev => [
        { multiplier: resultMultiplier, amount: winAmount },
        ...prev.slice(0, 9) // Keep only last 10
      ]);
    }
    
    // Add a subtle bounce at the end
    setTimeout(() => {
      setRotation(prev => prev - 0.02);
      setTimeout(() => {
        setRotation(prev => prev + 0.02);
      }, 100);
    }, 100);
  };

  const handleBet = () => {
    if (isSpinning) {
      alert('Wheel is currently spinning!');
      return;
    }
    
    playSound('click');
    spinWheel();
  };

  const handleHalfBet = () => {
    playSound('click');
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount / 2).toFixed(8));
    }
  };

  const handleDoubleBet = () => {
    playSound('click');
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount * 2).toFixed(8));
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0f1a24] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-[#172B3A] p-0 z-10 border-r border-[#243442]">
        {/* Tab switch */}
        <div className="flex bg-[#172B3A] mb-4">
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'Manual' ? 'bg-[#172B3A] text-white border-b-2 border-[#1375e1]' : 'bg-[#11212d] text-gray-400'}`}
            onClick={() => setActiveTab('Manual')}
          >
            Manual
          </button>
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'Auto' ? 'bg-[#172B3A] text-white border-b-2 border-[#1375e1]' : 'bg-[#11212d] text-gray-400'}`}
            onClick={() => setActiveTab('Auto')}
          >
            Auto
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Balance */}
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Balance</span>
            <span className="text-white font-medium">{rawBalance.toFixed(8)} BTC</span>
          </div>
          
          {/* Bet amount */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Bet Amount</span>
              <span className="text-sm text-gray-400">${(parseFloat(betAmount) * 44000).toFixed(2)}</span>
            </div>
            <div className="flex">
              <input 
                type="text" 
                value={betAmount} 
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 bg-[#0e1822] py-2 px-3 text-white rounded-l border-0 focus:outline-none focus:ring-1 focus:ring-[#1375e1]" 
              />
              <div className="bg-[#0e1822] flex items-center px-2 rounded-r">
                <span className="text-amber-500">₿</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => setBetAmount('0.00010000')}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                Min
              </button>
              <button 
                onClick={handleHalfBet}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                ½
              </button>
              <button 
                onClick={handleDoubleBet}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                2×
              </button>
              <button 
                onClick={() => setBetAmount(rawBalance.toFixed(8))}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                Max
              </button>
            </div>
          </div>
          
          {/* Risk */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Risk</span>
            <Select value={risk} onValueChange={(value) => setRisk(value as RiskLevel)}>
              <SelectTrigger className="w-full bg-[#0e1822] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0e1822] border-[#2a3642] text-white">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Segments */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Segments</span>
            <Select 
              value={segments.toString()} 
              onValueChange={(value) => setSegments(parseInt(value))}
            >
              <SelectTrigger className="w-full bg-[#0e1822] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0e1822] border-[#2a3642] text-white">
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="32">32</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bet button */}
          <button 
            onClick={handleBet}
            disabled={isSpinning}
            className={`w-full py-3 rounded font-semibold transition-colors mt-6
              ${isSpinning 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-[#4cd964] text-black hover:bg-[#40c557]'}`}
          >
            {isSpinning ? 'Spinning...' : 'Bet'}
          </button>
          
          {/* Last wins */}
          {lastWins.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#243442]">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Last Wins</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lastWins.map((win, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-green-500">{win.multiplier.toFixed(1)}×</span>
                    <span className="text-gray-300">+{win.amount.toFixed(8)} BTC</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Game board */}
      <div className="flex-1 flex flex-col p-5 bg-[#0f1a24]">
        {/* Stats bar */}
        <div className="flex justify-between items-center mb-4 px-4 py-2 bg-[#172B3A] rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Segments: {segments}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">{onlinePlayers} Online</span>
          </div>
        </div>
        
        {/* Game container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center" ref={wheelContainerRef}>
            {/* Result display */}
            {result !== null && (
              <div className={`absolute top-4 left-0 right-0 z-10 text-center text-3xl font-bold ${result === 0 ? 'text-red-500' : 'text-green-400'}`}>
                {result === 0 ? 'BUST!' : `${result.toFixed(1)}× WIN!`}
              </div>
            )}
            
            {/* Spinning animation elements */}
            {isSpinning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
              </div>
            )}
            
            {/* Win animation */}
            {sparkles && (
              <div className="absolute inset-0 pointer-events-none">
                <Sparkle className="absolute text-yellow-400 animate-ping w-8 h-8" style={{ top: '20%', left: '30%', animationDuration: '1s' }} />
                <Sparkle className="absolute text-yellow-400 animate-ping w-6 h-6" style={{ top: '60%', left: '20%', animationDuration: '1.5s' }} />
                <Sparkle className="absolute text-yellow-400 animate-ping w-10 h-10" style={{ top: '40%', left: '70%', animationDuration: '0.8s' }} />
                <Sparkle className="absolute text-yellow-400 animate-ping w-5 h-5" style={{ top: '70%', left: '60%', animationDuration: '1.2s' }} />
              </div>
            )}
            
            {/* The wheel canvas */}
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400} 
              className={`rounded-full shadow-xl ${isSpinning ? 'wheel-spinning' : ''}`}
              style={{ 
                boxShadow: isSpinning 
                  ? '0 0 15px 5px rgba(19, 117, 225, 0.5), 0 0 30px 10px rgba(19, 117, 225, 0.3)' 
                  : '0 0 10px 2px rgba(23, 43, 58, 0.5)' 
              }}
            />
            
            {/* Hidden audio elements for preloading */}
            <audio src="/sounds/wheel-spin.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/win.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/lose.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/click.mp3" preload="auto" className="hidden" />
          </div>
        </div>
        
        {/* Multipliers display */}
        <div className="mt-6 px-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Multipliers</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {multipliers[risk].map((multiplier, index) => {
              // Determine color based on multiplier
              let bgColor = "#1c2d3a"; // Default dark blue
              let textColor = "white";
              
              if (multiplier === 0) {
                textColor = "white";
                bgColor = "#FF3B30"; // Red for 0x
              } else if (multiplier >= 5.0) {
                bgColor = "#FF9500"; // Orange for high values
              } else if (multiplier >= 3.0) {
                bgColor = "#FFCC00"; // Yellow
              } else if (multiplier >= 2.0) {
                bgColor = "#5856D6"; // Purple
              } else if (multiplier >= 1.5) {
                bgColor = "#4CD964"; // Green
              } else if (multiplier >= 1.0) {
                bgColor = "#5AC8FA"; // Blue
              }
              
              return (
                <div 
                  key={index} 
                  className="px-4 py-2 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ 
                    backgroundColor: bgColor, 
                    color: textColor,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {multiplier.toFixed(1)}×
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* CSS added in global styles */}
    </div>
  );
};

export default WheelGame;