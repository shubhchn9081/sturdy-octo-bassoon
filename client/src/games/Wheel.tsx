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
  const [segmentCount, setSegmentCount] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'Manual' | 'Auto'>('Manual');
  const [activeCurrency, setActiveCurrency] = useState<'BTC' | 'USD' | 'INR' | 'ETH' | 'USDT'>('INR');
  const { rawBalance, placeBet, completeBet } = useBalance(activeCurrency);
  const [lastWins, setLastWins] = useState<{ multiplier: number; amount: number }[]>([]);
  const [betId, setBetId] = useState<number | null>(null);
  
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
  
  // Define canvas size for the wheel
  const CANVAS_SIZE = 600; // Default canvas size
  
  // Define multiplier ranges for selection
  const multiplierRanges = ['Low', 'Medium', 'High', 'Custom'];
  const [selectedMultiplierRange, setSelectedMultiplierRange] = useState<string>('Medium');
  
  // Data for the selected segment
  const [selectedSegment, setSelectedSegment] = useState<{multiplier: number} | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [winningSegment, setWinningSegment] = useState<{multiplier: number} | null>(null);

  // Define wheel segments
  interface WheelSegment {
    multiplier: number;
    color: string;
  }
  
  // Create actual segment data
  const [wheelSegments, setWheelSegments] = useState<WheelSegment[]>(
    Array.from({ length: 30 }, (_, i) => ({
      multiplier: (i % 5 === 0) ? 0 : (1 + (i % 5) * 0.5),
      color: colors[i % colors.length],
    }))
  );
  
  // Game state
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<boolean>(false);
  const [onlinePlayers] = useState<number>(Math.floor(Math.random() * 1000) + 500);
  const [isIdleSpinning, setIsIdleSpinning] = useState<boolean>(true);
  const [betError, setBetError] = useState<string | null>(null);
  
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
    
    drawWheel(ctx, canvas.width, segmentCount, rotation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
    };
  }, [segmentCount, rotation]);
  
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
      if (ctx) drawWheel(ctx, canvas.width, segmentCount, rotation);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [segmentCount, rotation]);

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
    
    // No pointer drawing code here anymore - using image pin instead
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
  
  // Helper method to clear error messages
  const clearBetError = () => {
    setBetError(null);
  };

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
    const segmentAngle = (2 * Math.PI) / segmentCount;
    const targetSegmentIndex = randomMultiplierIndex % segmentCount;
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
    
    // Complete the bet and update balance if we have a bet ID
    if (betId !== null) {
      // Call the API to complete the bet
      completeBet.mutate({
        betId: betId,
        outcome: {
          multiplier: resultMultiplier,
          win: resultMultiplier > 0
        }
      }, {
        onSuccess: () => {
          console.log(`Completed bet ${betId} with result ${resultMultiplier}x`);
          // Reset bet ID
          setBetId(null);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to complete bet",
            description: "There was an error processing your bet result."
          });
          console.error("Error completing bet:", error);
        }
      });
    }
    
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
    // Clear any existing error messages
    clearBetError();
    
    if (isSpinning) {
      toast({
        variant: "destructive",
        title: "Wheel is spinning",
        description: "Please wait for the current spin to finish."
      });
      return;
    }
    
    // Validate bet amount
    const betValue = parseFloat(betAmount);
    
    if (isNaN(betValue) || betValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid bet amount",
        description: "Please enter a valid positive bet amount.",
      });
      return;
    }
    
    // Place the bet through the API
    placeBet.mutateAsync({
      gameId: 4, // Wheel game ID
      amount: betValue,
      clientSeed: Math.random().toString(36).substring(2, 15),
      options: { risk, segmentCount, currency: activeCurrency }
    }).then(response => {
      if (!response || !response.betId) {
        throw new Error("Invalid response from server");
      }
      // Store the bet ID for later use when completing the bet
      setBetId(response.betId);
      
      // Start spinning the wheel
      playSound('click');
      spinWheel();
      
      // Complete the bet after animation using promises
      setTimeout(() => {
        if (response.betId) {
          // Get the current result multiplier
          const resultMultiplier = targetMultiplierRef.current;
          
          completeBet.mutateAsync({
            betId: response.betId,
            outcome: {
              segment: selectedSegment,
              multiplier: resultMultiplier, 
              win: selectedSegment === winningSegment
            }
          });
        }
      }, 3000);
    }).catch(error => {
        // Set the error message
        setBetError(error.message || "Something went wrong");
        
        // Display toast notification
        toast({
          variant: "destructive",
          title: "Failed to place bet",
          description: error.message || "Something went wrong",
        });
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setBetError(null);
        }, 5000);
    });
  };

  const handleBetAmountChange = (value: string) => {
    // Allow empty input for easier editing
    if (value === '') {
      setBetAmount('');
      return;
    }
    
    // Only allow valid numeric inputs with up to 2 decimal places for INR
    // First, replace any commas with periods for internationalization
    const sanitizedValue = value.replace(',', '.');
    
    // Only allow valid numeric inputs with up to 2 decimal places
    const regex = /^[0-9]*\.?[0-9]{0,2}$/;
    if (regex.test(sanitizedValue)) {
      setBetAmount(sanitizedValue);
    }
  };

  const handleHalfBet = () => {
    playSound('click');
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount / 2).toFixed(2));
    }
  };

  const handleDoubleBet = () => {
    playSound('click');
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount * 2).toFixed(2));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B131C] text-white">
      {/* Main game area - MOBILE FIRST! */}
      <div className="flex-1 flex flex-col relative bg-[#0B131C] order-1 md:order-2">
        {/* Error message when bet placement fails */}
        {betError && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-500 text-white p-3 rounded-md z-20">
            Failed to place bet: {betError}
          </div>
        )}
      
        {/* Game container - make sure it's properly sized and centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative flex items-center justify-center w-full" ref={wheelContainerRef}>
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
            
            {/* The wheel canvas with fixed sizing and pin indicator */}
            <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] relative">
              {/* Triangle indicator on top of wheel */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L22 22H2L12 2Z" fill="#FF9900" />
                </svg>
              </div>
              
              <canvas 
                ref={canvasRef} 
                width={CANVAS_SIZE} 
                height={CANVAS_SIZE} 
                className="absolute inset-0 w-full h-full rounded-full"
              />
            </div>
            
            {/* Spin result overlay - appears after spin stops */}
            {showResult && selectedSegment && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  text-2xl sm:text-3xl md:text-5xl p-4 sm:p-6 font-bold rounded-lg 
                  ${selectedSegment.multiplier > 1 ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'}
                  flex flex-col items-center shadow-lg border-2 border-white/20
                `}>
                  <div>{selectedSegment.multiplier}x</div>
                  <div className="text-xs sm:text-sm mt-2 font-normal">
                    {winAmount > 0 
                      ? `Won ${winAmount.toFixed(8)} BTC!` 
                      : 'Better luck next time!'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Hidden audio elements for preloading */}
            <audio src="/sounds/wheel-spin.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/win.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/lose.mp3" preload="auto" className="hidden" />
            <audio src="/sounds/click.mp3" preload="auto" className="hidden" />
          </div>
          
          {/* Multiplier range buttons */}
          <div className="grid grid-cols-4 gap-1 mt-6 w-full max-w-md">
            {multiplierRanges.map((range, index) => (
              <button 
                key={`range-${index}`}
                className={`
                  py-2 text-sm rounded 
                  ${selectedMultiplierRange === range 
                    ? 'bg-gradient-to-b from-purple-600 to-purple-800 text-white' 
                    : 'bg-[#172532] text-gray-300 hover:bg-[#1E2F3E]'}
                `}
                onClick={() => setSelectedMultiplierRange(range)}
                disabled={isSpinning}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* Multiplier row - simplified to just one line */}
          <div className="flex gap-x-1.5 mt-4 mb-6 w-full max-w-md mx-auto px-2 justify-center">
            {[0, 1.5, 2, 2.5, 3, 0, 1.5].map((value, i) => (
              <div 
                key={`mult-${i}`} 
                className={`
                  h-8 w-12 flex items-center justify-center rounded-sm
                  ${value === 0 ? 'bg-red-800/90' : 
                    value <= 1.5 ? 'bg-purple-800/90' : 
                    value <= 2 ? 'bg-blue-700/90' : 
                    value <= 2.5 ? 'bg-green-700/90' : 
                    'bg-orange-700/90'} 
                  text-white text-sm font-medium tracking-wider
                `}
              >
                {value}x
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Controls area */}
      <div className="w-full bg-[#0B131C] p-0 z-10 border-t md:border-t-0 md:border-r border-[#172532] order-2 md:order-1 md:w-72 md:h-full shrink-0">
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
                
                {/* Simple Currency Display */}
                <div className="w-[80px] h-full bg-[#172532] flex items-center justify-center text-white rounded-l-none rounded-r border-l border-[#0B131C]">
                  <span className="mr-1">{getCurrencySymbol(activeCurrency)}</span>
                  <span>{activeCurrency}</span>
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
                onClick={() => setBetAmount('0.00')}
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
              value={segmentCount.toString()} 
              onValueChange={(value) => setSegmentCount(parseInt(value))}
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
        
        {/* Fairness link */}
        <div className="p-4 flex justify-center md:justify-start md:absolute md:bottom-0 md:left-0">
          <button className="text-xs text-gray-400 hover:text-white flex items-center">
            <Settings className="h-3 w-3 mr-1" />
            Fairness
          </button>
        </div>
      </div>
    </div>
  );
};

export default WheelGame;