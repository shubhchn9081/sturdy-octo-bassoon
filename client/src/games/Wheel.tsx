import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type RiskLevel = 'Low' | 'Medium' | 'High';

const WheelGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [betAmount, setBetAmount] = useState<string>('0.00000000');
  const [risk, setRisk] = useState<RiskLevel>('Medium');
  const [segments, setSegments] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'Manual' | 'Auto'>('Manual');
  
  // Define colors for wheel segments - match the exact colors in the screenshot
  const colors = ['#4cd964', '#ffcc00', '#5856d6', '#5ac8fa', '#ff9500', '#ffffff', '#4cd964', '#ffcc00'];
  
  // Multipliers based on risk level
  const multipliers = {
    Low: [0.5, 1.1, 1.2, 1.3, 1.5, 2.0],
    Medium: [0.0, 1.5, 1.7, 2.0, 3.0, 4.0],
    High: [0.0, 0.0, 1.5, 3.0, 5.0, 10.0]
  };

  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const spinStartTimeRef = useRef<number>(0);
  const spinDurationRef = useRef<number>(5000); // 5 seconds
  const finalRotationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawWheel(ctx, canvas.width, segments, rotation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [segments, rotation]);

  const drawWheel = (ctx: CanvasRenderingContext2D, canvasWidth: number, segmentCount: number, rotationAngle: number) => {
    const radius = canvasWidth / 2;
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    
    ctx.clearRect(0, 0, canvasWidth, canvasWidth);
    
    // Draw dark circle background first
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#1c2d3a";
    ctx.fill();
    
    // Save context to restore later
    ctx.save();
    
    // Move to center of canvas
    ctx.translate(radius, radius);
    
    // Rotate the entire wheel
    ctx.rotate(rotationAngle);
    
    // Draw inner dark circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = "#172B3A";
    ctx.fill();
    
    // Draw wheel segments (only the outer ring)
    for (let i = 0; i < segmentCount; i++) {
      const angle = i * anglePerSegment;
      const colorIndex = i % colors.length;
      
      ctx.beginPath();
      ctx.moveTo(radius * 0.65, 0);
      ctx.arc(0, 0, radius * 0.95, angle, angle + anglePerSegment);
      ctx.arc(0, 0, radius * 0.65, angle + anglePerSegment, angle, true);
      ctx.closePath();
      
      ctx.fillStyle = colors[colorIndex];
      ctx.fill();
      
      // Add thin gray separators
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
      ctx.strokeStyle = "#2A3B4C";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Restore context
    ctx.restore();
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.65, 0, 2 * Math.PI);
    ctx.fillStyle = "#172B3A";
    ctx.fill();
    
    // Draw pointer
    const pointerHeight = 30;
    ctx.beginPath();
    ctx.moveTo(radius, radius - radius * 0.95);
    ctx.lineTo(radius - 15, radius - radius * 0.95 - pointerHeight);
    ctx.lineTo(radius + 15, radius - radius * 0.95 - pointerHeight);
    ctx.closePath();
    ctx.fillStyle = "#FF3B30";
    ctx.fill();
  };
  
  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Determine final rotation based on a random result
    const randomSegment = Math.floor(Math.random() * segments);
    const anglePerSegment = (2 * Math.PI) / segments;
    const segmentAngle = randomSegment * anglePerSegment;
    
    // Make the wheel spin at least 5 full rotations plus the segment angle
    const minRotations = 5;
    const finalRotation = (Math.PI * 2 * minRotations) + segmentAngle;
    
    // Store start time and final rotation
    spinStartTimeRef.current = performance.now();
    finalRotationRef.current = finalRotation;
    
    // Start animation
    animateSpinning();
  };
  
  const animateSpinning = () => {
    const currentTime = performance.now();
    const elapsedTime = currentTime - spinStartTimeRef.current;
    const progress = Math.min(elapsedTime / spinDurationRef.current, 1);
    
    // Easing function for slowing down
    const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);
    const easedProgress = easeOutQuint(progress);
    
    // Calculate current rotation
    const currentRotation = easedProgress * finalRotationRef.current;
    setRotation(currentRotation);
    
    if (progress < 1) {
      // Continue animation
      animationRef.current = requestAnimationFrame(animateSpinning);
    } else {
      // Animation complete
      setIsSpinning(false);
      
      // Determine which segment landed on
      const anglePerSegment = (2 * Math.PI) / segments;
      const normalizedRotation = finalRotationRef.current % (Math.PI * 2);
      const resultSegment = Math.floor(normalizedRotation / anglePerSegment) % segments;
      const multiplierIndex = resultSegment % 6;
      
      // Set result
      setResult(multipliers[risk][multiplierIndex]);
    }
  };

  const handleBet = () => {
    if (parseFloat(betAmount) <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }
    
    if (isSpinning) {
      alert('Wheel is currently spinning!');
      return;
    }
    
    // Start wheel spinning animation
    spinWheel();
  };

  const handleHalfBet = () => {
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount / 2).toString());
    }
  };

  const handleDoubleBet = () => {
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount * 2).toString());
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0f1a24] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-[#172B3A] p-0">
        {/* Tab switch */}
        <div className="flex bg-[#172B3A] mb-4">
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'Manual' ? 'bg-[#172B3A] text-white' : 'bg-[#11212d] text-gray-400'}`}
            onClick={() => setActiveTab('Manual')}
          >
            Manual
          </button>
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'Auto' ? 'bg-[#172B3A] text-white' : 'bg-[#11212d] text-gray-400'}`}
            onClick={() => setActiveTab('Auto')}
          >
            Auto
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Bet amount */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Bet Amount</span>
              <span className="text-sm text-gray-400">$0.00</span>
            </div>
            <div className="flex">
              <input 
                type="text" 
                value={betAmount} 
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 bg-[#0e1822] py-2 px-3 text-white rounded-l border-0 focus:outline-none" 
              />
              <div className="bg-[#0e1822] flex items-center px-2 rounded-r">
                <span className="text-amber-500">⌀</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleHalfBet}
                className="flex-1 bg-[#0e1822] py-1 px-4 rounded text-white hover:bg-[#1a2c3d]"
              >
                ½
              </button>
              <button 
                onClick={handleDoubleBet}
                className="flex-1 bg-[#0e1822] py-1 px-4 rounded text-white hover:bg-[#1a2c3d]"
              >
                2×
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
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bet button */}
          <button 
            onClick={handleBet}
            className="w-full bg-[#4cd964] text-black py-3 rounded font-semibold hover:bg-[#40c557] transition-colors mt-6"
          >
            Bet
          </button>
        </div>
      </div>
      
      {/* Game board */}
      <div className="flex-1 flex flex-col items-center justify-center p-5">
        {/* Result display */}
        {result !== null && (
          <div className={`mb-4 text-2xl font-bold ${result === 0 ? 'text-red-500' : 'text-green-400'}`}>
            {result === 0 ? 'BUST!' : `${result.toFixed(2)}x WIN!`}
          </div>
        )}
      
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="rounded-full"
        />
        
        {/* Spinning indicator */}
        {isSpinning && (
          <div className="mt-4 text-lg text-yellow-400 animate-pulse">
            Wheel spinning...
          </div>
        )}
        
        {/* Multipliers */}
        <div className="flex gap-1 mt-5">
          {multipliers[risk].map((multiplier, index) => {
            // Determine color based on multiplier
            let bgColor = "#1c2d3a"; // Default dark blue
            let textColor = "white";
            
            if (multiplier === 0) {
              textColor = "white";
              bgColor = "#FF3B30"; // Red for 0x
            } else if (multiplier === 1.5) {
              bgColor = "#4cd964"; // Green
            } else if (multiplier === 1.7) {
              bgColor = "#5ac8fa"; // Light blue
            } else if (multiplier === 2.0) {
              bgColor = "#5856d6"; // Purple
            } else if (multiplier === 3.0) {
              bgColor = "#ffcc00"; // Yellow
            } else if (multiplier === 4.0) {
              bgColor = "#ff9500"; // Orange
            }
            
            return (
              <div 
                key={index} 
                className="px-4 py-2 rounded flex items-center justify-center"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {multiplier.toFixed(2)}x
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WheelGame;