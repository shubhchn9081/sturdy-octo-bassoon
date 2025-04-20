import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBalance } from '@/hooks/use-balance';
import { Sparkle, Settings, Users, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getCurrencySymbol } from "@/lib/utils";
import gsap from 'gsap';

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
  const [segments, setSegments] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'Manual' | 'Auto'>('Manual');
  const [activeCurrency, setActiveCurrency] = useState<'BTC' | 'USD' | 'INR' | 'ETH' | 'USDT'>('BTC');
  const { rawBalance, placeBet, completeBet } = useBalance(activeCurrency);
  const [lastWins, setLastWins] = useState<{ multiplier: number; amount: number }[]>([]);
  
  // Define colors for wheel segments - matching reference image exactly
  const colors = [
    '#3EBD5C', // Green
    '#FDC23C', // Yellow
    '#3EBD5C', // Green
    '#FFFFFF', // White
    '#3EBD5C', // Green
    '#FDC23C', // Yellow
    '#9657DE', // Purple
    '#FDC23C', // Yellow
    '#3EBD5C', // Green
    '#F87C36', // Orange
    '#3EBD5C', // Green
    '#FDC23C', // Yellow
  ];
  
  // The middle spacer color between segments
  const segmentSpacerColor = '#1E3243';
  
  // Multipliers based on risk level
  const multipliers = {
    Low: [0.5, 1.1, 1.2, 1.3, 1.5, 2.0],
    Medium: [0.0, 1.5, 1.7, 2.0, 3.0, 4.0],
    High: [0.0, 0.0, 1.5, 3.0, 5.0, 10.0]
  };

  // Game state
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<boolean>(false);
  const [onlinePlayers] = useState<number>(Math.floor(Math.random() * 1000) + 500);
  const [isIdleSpinning, setIsIdleSpinning] = useState<boolean>(true);
  
  // Refs for animation
  const animationRef = useRef<number>();
  const idleAnimationRef = useRef<number>();
  const spinStartTimeRef = useRef<number>(0);
  const spinDurationRef = useRef<number>(7000); // 7 seconds
  const finalRotationRef = useRef<number>(0);
  const targetMultiplierRef = useRef<number>(0);
  const idleSpeedRef = useRef<number>(0.003); // Speed of idle rotation
  const rotationRef = useRef({ value: 0 });

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
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
    };
  }, [segments, rotation]);
  
  // Start idle spinning animation when component mounts using GSAP
  useEffect(() => {
    if (!isSpinning && isIdleSpinning) {
      // Initial value
      rotationRef.current.value = rotation;
      
      // Kill any existing animations
      gsap.killTweensOf(rotationRef.current);
      
      // Create infinite spinning animation
      const idleAnimation = gsap.to(rotationRef.current, {
        value: rotation + Math.PI * 2, // Full 360-degree rotation
        duration: 8, // 8 seconds per rotation
        ease: "none", // Linear rotation
        repeat: -1, // Infinite repeats
        onUpdate: () => {
          // Update rotation state when the GSAP animation updates
          setRotation(rotationRef.current.value % (Math.PI * 2));
        }
      });
      
      // Store reference to animation
      return () => {
        // Kill the animation on cleanup
        idleAnimation.kill();
      };
    }
  }, [isSpinning, isIdleSpinning, rotation]);

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
    
    // Draw dark background
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#0B131C";
    ctx.fill();
    
    // Draw inner wheel (the colored segments ring)
    const innerRadius = radius * 0.85;
    const outerRadius = radius * 0.7;
    
    // Draw the dark inner circle
    ctx.beginPath();
    ctx.arc(radius, radius, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#0B131C";
    ctx.fill();
    
    // Save context before transformations
    ctx.save();
    
    // Move to center and apply rotation
    ctx.translate(radius, radius);
    ctx.rotate(rotationAngle);
    
    // First draw the spacer ring (the dark blue-gray color between segments)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = segmentSpacerColor;
    ctx.fill();

    // Draw colored segments on top of the spacer ring
    for (let i = 0; i < segmentCount; i++) {
      const angle = i * anglePerSegment;
      const colorIndex = i % colors.length;
      
      // Make segments slightly smaller to show the spacer between them
      // Create a rectangular segment (not a pie slice)
      const segmentWidth = anglePerSegment * 0.7; // Make segments a bit smaller than the full angle
      const segmentStartAngle = angle + (anglePerSegment - segmentWidth) / 2;
      const segmentEndAngle = segmentStartAngle + segmentWidth;
      
      // Draw colored segment
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, segmentStartAngle, segmentEndAngle);
      ctx.arc(0, 0, radius, segmentEndAngle, segmentStartAngle, true);
      ctx.closePath();
      
      // Fill with color
      ctx.fillStyle = colors[colorIndex];
      ctx.fill();
    }
    
    // Restore context after segment drawing
    ctx.restore();
    
    // Draw inner empty space 
    ctx.beginPath();
    ctx.arc(radius, radius, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#0B131C";
    ctx.fill();
    
    // Draw faint inner circle
    ctx.beginPath();
    ctx.arc(radius, radius, outerRadius * 0.85, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw pointer/indicator at the top (pink/red teardrop shape)
    const pointerHeight = radius * 0.15;
    const pointerWidth = radius * 0.08;
    
    // Draw pointer base (rectangle with rounded bottom)
    ctx.beginPath();
    
    // Create a slightly rounded teardrop/marker shape
    ctx.moveTo(radius, radius - innerRadius - pointerHeight);
    ctx.arc(radius, radius - innerRadius - pointerHeight * 0.7, pointerHeight * 0.3, Math.PI, 0, true);
    ctx.lineTo(radius + pointerWidth / 2, radius - innerRadius);
    ctx.lineTo(radius - pointerWidth / 2, radius - innerRadius);
    ctx.closePath();
    
    // Create gradient for 3D effect
    const pointerGradient = ctx.createLinearGradient(
      radius, radius - innerRadius - pointerHeight,
      radius, radius - innerRadius
    );
    pointerGradient.addColorStop(0, '#FF4971'); // Brighter pink at top
    pointerGradient.addColorStop(1, '#E93963'); // Deeper pink at bottom
    
    // Fill pointer with gradient
    ctx.fillStyle = pointerGradient;
    ctx.fill();
    
    // Add shine/highlight for more 3D effect
    ctx.beginPath();
    ctx.moveTo(radius, radius - innerRadius - pointerHeight);
    ctx.arc(radius, radius - innerRadius - pointerHeight * 0.7, pointerHeight * 0.2, Math.PI, 0, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
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
  
  const { toast } = useToast();

  const spinWheel = () => {
    if (isSpinning) return;
    
    // Validate bet amount
    const betValue = parseFloat(betAmount);
    
    // Check for invalid bet amount
    if (isNaN(betValue) || betValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid bet amount",
        description: "Please enter a valid positive bet amount.",
      });
      return;
    }
    
    // Check for insufficient balance
    if (betValue > rawBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "Add money to your wallet to place this bet.",
        action: (
          <Button 
            variant="outline"
            size="sm"
            className="bg-green-600 text-white border-0 hover:bg-green-700"
            onClick={() => {
              // Navigate to deposit page or open deposit modal
              console.log("Navigate to deposit");
              // This would typically navigate to a deposit page
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Funds
          </Button>
        ),
      });
      return;
    }
    
    // Play spin sound
    playSound('spin');
    
    // Kill any existing GSAP animations
    gsap.killTweensOf(rotationRef.current);
    
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
    const finalAngle = rotation + (fullRotations * 2 * Math.PI) + targetAngle;
    
    // Update the rotation ref initial value
    rotationRef.current.value = rotation;
    
    // Create GSAP timeline for more control
    const timeline = gsap.timeline({
      onComplete: finishSpin
    });
    
    // Fast initial rotation
    timeline.to(rotationRef.current, {
      value: rotation + (fullRotations * 0.7 * Math.PI * 2),
      duration: 3,
      ease: "power1.out",
      onUpdate: () => {
        setRotation(rotationRef.current.value);
      }
    });
    
    // Gradual slow down
    timeline.to(rotationRef.current, {
      value: rotation + (fullRotations * 0.95 * Math.PI * 2),
      duration: 2.5,
      ease: "power3.out",
      onUpdate: () => {
        setRotation(rotationRef.current.value);
      }
    });
    
    // Final approach with slight elasticity
    timeline.to(rotationRef.current, {
      value: finalAngle,
      duration: 1.5,
      ease: "elastic.out(1, 0.3)",
      onUpdate: () => {
        setRotation(rotationRef.current.value);
      }
    });
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
      toast({
        variant: "destructive",
        title: "Wheel is spinning",
        description: "Please wait for the current spin to finish."
      });
      return;
    }
    
    playSound('click');
    spinWheel();
  };

  const handleBetAmountChange = (value: string) => {
    // Allow empty input for easier editing
    if (value === '') {
      setBetAmount('');
      return;
    }
    
    // Only allow valid numeric inputs with up to 8 decimal places
    const regex = /^[0-9]*\.?[0-9]{0,8}$/;
    if (regex.test(value)) {
      setBetAmount(value);
    }
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
    <div className="flex flex-col md:flex-row h-full bg-[#0B131C] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#0B131C] p-0 z-10 border-r border-[#172532]">
        {/* Tab switch */}
        <div className="flex rounded-md m-4 bg-[#172532] p-1">
          <button 
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${activeTab === 'Manual' ? 'bg-[#0B131C] text-white' : 'bg-transparent text-gray-400'}`}
            onClick={() => setActiveTab('Manual')}
          >
            Manual
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${activeTab === 'Auto' ? 'bg-[#0B131C] text-white' : 'bg-transparent text-gray-400'}`}
            onClick={() => setActiveTab('Auto')}
          >
            Auto
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Amount</span>
            <div className="flex">
              <div className="flex w-full">
                <input 
                  type="text" 
                  value={betAmount} 
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  className="flex-1 bg-[#172532] py-2 px-3 text-white rounded-l border-0 focus:outline-none focus:ring-1 focus:ring-[#3A4F66]" 
                  placeholder="0.00000000"
                />
                
                {/* Currency Switcher */}
                <div className="relative inline-block">
                  <Select 
                    value={activeCurrency} 
                    onValueChange={(value: string) => {
                      // Ensure the value is one of our supported currencies
                      const currencyValue = (value === 'BTC' || value === 'ETH' || value === 'USD' || 
                                             value === 'INR' || value === 'USDT') 
                                             ? value 
                                             : 'BTC';
                      
                      setActiveCurrency(currencyValue as any);
                      
                      // Set a reasonable default bet for the new currency
                      if (currencyValue === 'BTC' || currencyValue === 'ETH') {
                        setBetAmount('0.00010000');
                      } else {
                        setBetAmount('10.00');
                      }
                    }}
                  >
                    <SelectTrigger 
                      className="w-[80px] h-full bg-[#172532] border-0 text-white rounded-l-none rounded-r border-l border-[#0B131C]"
                    >
                      <div className="flex items-center">
                        <span className="mr-1">{getCurrencySymbol(activeCurrency)}</span>
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="min-w-[80px] bg-[#172532] border-[#2a3642] text-white">
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button 
                onClick={handleHalfBet}
                className="bg-[#172532] py-1 px-2 rounded text-white hover:bg-[#1F3142] text-xs"
              >
                ½
              </button>
              <button 
                onClick={() => setBetAmount('0.00000000')}
                className="bg-[#172532] py-1 px-2 rounded text-white hover:bg-[#1F3142] text-xs"
              >
                0
              </button>
              <button 
                onClick={handleDoubleBet}
                className="bg-[#172532] py-1 px-2 rounded text-white hover:bg-[#1F3142] text-xs"
              >
                2×
              </button>
            </div>
          </div>
          
          {/* Risk */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Risk</span>
            <Select value={risk} onValueChange={(value) => setRisk(value as RiskLevel)}>
              <SelectTrigger className="w-full bg-[#172532] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#172532] border-[#2a3642] text-white">
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
              <SelectTrigger className="w-full bg-[#172532] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#172532] border-[#2a3642] text-white">
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Spin button */}
        <div className="p-4">
          <button 
            onClick={handleBet}
            disabled={isSpinning}
            className={`w-full py-3 rounded-md text-center font-medium text-white ${isSpinning ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#00C74D] hover:bg-[#00B544]'}`}
          >
            {isSpinning ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Spinning...
              </div>
            ) : 'Spin'}
          </button>
        </div>
        
        {/* Fairness link at bottom */}
        <div className="absolute bottom-4 left-4">
          <button className="text-xs text-gray-400 hover:text-white flex items-center">
            <Settings className="h-3 w-3 mr-1" />
            Fairness
          </button>
        </div>
      </div>
      
      {/* Main game area */}
      <div className="flex-1 flex flex-col relative bg-[#0B131C]">
        {/* Game container */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full flex-1 flex items-center justify-center" ref={wheelContainerRef}>
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
              className="rounded-full"
            />
            
            {/* Hidden audio elements for preloading */}
            <audio src="/sounds/wheel-spin.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/win.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/lose.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/click.mp3" preload="auto" className="hidden" />
          </div>
          
          {/* Multiplier buttons */}
          <div className="flex justify-center space-x-2 mb-6 mt-4 w-full px-4">
            <button className="bg-[#1B2631] text-white rounded py-2 px-3 flex-1 max-w-[120px] text-center hover:bg-[#243747] transition-colors">
              <span className="block text-lg font-medium">0.00×</span>
            </button>
            <button className="bg-[#1B2631] text-white rounded py-2 px-3 flex-1 max-w-[120px] text-center hover:bg-[#243747] transition-colors">
              <span className="block text-lg font-medium">1.50×</span>
              <span className="block h-1 bg-green-500 mt-1"></span>
            </button>
            <button className="bg-[#1B2631] text-white rounded py-2 px-3 flex-1 max-w-[120px] text-center hover:bg-[#243747] transition-colors">
              <span className="block text-lg font-medium">1.70×</span>
              <span className="block h-1 bg-green-500 mt-1"></span>
            </button>
            <button className="bg-[#1B2631] text-white rounded py-2 px-3 flex-1 max-w-[120px] text-center hover:bg-[#243747] transition-colors">
              <span className="block text-lg font-medium">2.00×</span>
              <span className="block h-1 bg-yellow-500 mt-1"></span>
            </button>
            <button className="bg-[#1B2631] text-white rounded py-2 px-3 flex-1 max-w-[120px] text-center hover:bg-[#243747] transition-colors">
              <span className="block text-lg font-medium">3.00×</span>
              <span className="block h-1 bg-purple-500 mt-1"></span>
            </button>
            <button className="bg-[#1B2631] text-white rounded py-2 px-3 flex-1 max-w-[120px] text-center hover:bg-[#243747] transition-colors">
              <span className="block text-lg font-medium">4.00×</span>
              <span className="block h-1 bg-orange-500 mt-1"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelGame;