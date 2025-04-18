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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawWheel(ctx, canvas.width, segments);
  }, [segments]);

  const drawWheel = (ctx: CanvasRenderingContext2D, canvasWidth: number, segmentCount: number) => {
    const radius = canvasWidth / 2;
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    
    ctx.clearRect(0, 0, canvasWidth, canvasWidth);
    
    // Draw wheel segments
    for (let i = 0; i < segmentCount; i++) {
      const angle = i * anglePerSegment;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, angle, angle + anglePerSegment);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#0f1a24";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(radius - 10, 0);
    ctx.lineTo(radius + 10, 0);
    ctx.lineTo(radius, 30);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
  };

  const handleBet = () => {
    if (betAmount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }
    
    // Implement actual betting logic here
    alert(`Placed bet of ${betAmount} with ${risk} risk and ${segments} segments`);
    
    // For a real implementation, we would:
    // 1. Send bet data to server
    // 2. Get result
    // 3. Animate wheel spinning to result
    // 4. Display outcome
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
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="bg-[#1c2d3a] rounded-full shadow-lg"
        />
        
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