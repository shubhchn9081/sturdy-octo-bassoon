import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RiskLevel = 'Low' | 'Medium' | 'High';
type BetMode = 'manual' | 'auto';

const WheelGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [risk, setRisk] = useState<RiskLevel>('Medium');
  const [segments, setSegments] = useState<number>(30);
  const [betMode, setBetMode] = useState<BetMode>('manual');
  
  // Define colors for wheel segments
  const colors = ['#28c76f', '#f1c40f', '#9b59b6', '#3498db', '#e67e22', '#ecf0f1'];
  
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
    
    // Save context to restore later
    ctx.save();
    
    // Move to center of canvas
    ctx.translate(radius, radius);
    
    // Rotate the entire wheel
    ctx.rotate(rotationAngle);
    
    // Draw wheel segments
    for (let i = 0; i < segmentCount; i++) {
      const angle = i * anglePerSegment;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + anglePerSegment);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#0f1a24";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add segment value
      ctx.save();
      ctx.rotate(angle + anglePerSegment / 2);
      ctx.translate(radius * 0.7, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${(i % 6) + 1}`, 0, 0);
      ctx.restore();
    }
    
    // Restore context
    ctx.restore();
    
    // Draw center hub
    ctx.beginPath();
    ctx.arc(radius, radius, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(radius, radius - 150);
    ctx.lineTo(radius - 10, radius - 130);
    ctx.lineTo(radius + 10, radius - 130);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
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
    if (betAmount <= 0) {
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
    setBetAmount(prevAmount => prevAmount / 2);
  };

  const handleDoubleBet = () => {
    setBetAmount(prevAmount => prevAmount * 2);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0f1a24] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-[#1e2a38] p-5 flex flex-col gap-5">
        {/* Tab switch */}
        <Tabs value={betMode} onValueChange={(value) => setBetMode(value as BetMode)} className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-[#2f3e51]">
            <TabsTrigger value="manual" className="data-[state=active]:bg-[#101d2b]">Manual</TabsTrigger>
            <TabsTrigger value="auto" className="data-[state=active]:bg-[#101d2b]">Auto</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Bet amount */}
        <div className="space-y-2">
          <Label>Bet Amount</Label>
          <Input 
            type="number" 
            placeholder="0.00000000" 
            value={betAmount || ''} 
            onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
            className="bg-[#101d2b] border-none" 
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleHalfBet} className="flex-1 bg-[#2f3e51] hover:bg-[#3a4a5e] border-none">½</Button>
            <Button variant="outline" onClick={handleDoubleBet} className="flex-1 bg-[#2f3e51] hover:bg-[#3a4a5e] border-none">2×</Button>
          </div>
        </div>
        
        {/* Risk */}
        <div className="space-y-2">
          <Label>Risk</Label>
          <Select value={risk} onValueChange={(value) => setRisk(value as RiskLevel)}>
            <SelectTrigger className="bg-[#101d2b] border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2a38] border-[#2f3e51]">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Segments */}
        <div className="space-y-2">
          <Label>Segments</Label>
          <Select 
            value={segments.toString()} 
            onValueChange={(value) => setSegments(parseInt(value))}
          >
            <SelectTrigger className="bg-[#101d2b] border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2a38] border-[#2f3e51]">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="40">40</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bet button */}
        <Button 
          onClick={handleBet} 
          className="bg-[#2ce02c] text-black hover:bg-[#25c425] mt-auto font-bold"
        >
          Bet
        </Button>
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
          className="bg-[#1c2d3a] rounded-full shadow-lg"
        />
        
        {/* Spinning indicator */}
        {isSpinning && (
          <div className="mt-4 text-lg text-yellow-400 animate-pulse">
            Wheel spinning...
          </div>
        )}
        
        {/* Multipliers */}
        <div className="flex gap-4 mt-5 bg-[#101d2b] p-3 rounded-lg">
          {multipliers[risk].map((multiplier, index) => (
            <span key={index} className={`text-sm ${multiplier === 0 ? 'text-red-500' : 'text-white'}`}>
              {multiplier.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WheelGame;