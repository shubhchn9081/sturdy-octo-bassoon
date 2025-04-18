import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BrowseIcon, CasinoIcon, BetsIcon, SportsIcon, ChatIcon } from '../components/MobileNavigationIcons';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';

// Component for Wheel game based on the reference screenshots and logic
const Wheel: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<'Manual' | 'Auto'>('Manual');
  const [betAmount, setBetAmount] = useState<number>(0.00000001);
  const [betAmountDisplay, setBetAmountDisplay] = useState<string>("0.00000000");
  const [segments, setSegments] = useState(30); // Default number of segments
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [result, setResult] = useState<{ color: string; multiplier: number; won: boolean } | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | null>(null);
  const [betHistory, setBetHistory] = useState<Array<{color: string; multiplier: number; won: boolean}>>([]);
  
  // Canvas ref for drawing the wheel
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Hooks for actual game logic
  const { getGameResult } = useProvablyFair('wheel');
  const { balance, placeBet, completeBet } = useBalance();
  
  // Fixed game info for Wheel
  const gameInfo = {
    id: 6,
    name: "WHEEL",
    slug: "wheel",
    type: "STAKE ORIGINALS",
    description: "Spin the wheel and win big",
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97
  };
  
  // Ref for autobet interval and current bet ID
  const autoBetIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentBetIdRef = useRef<number | null>(null);
  
  // Wheel segment configuration
  const wheelConfig = {
    segments: [
      { color: "#3B82F6", multiplier: 1.5, count: 8 },  // Blue
      { color: "#10B981", multiplier: 2.0, count: 8 },  // Green
      { color: "#F59E0B", multiplier: 3.0, count: 5 },  // Yellow
      { color: "#8B5CF6", multiplier: 4.0, count: 4 },  // Purple
      { color: "#EC4899", multiplier: 10.0, count: 1 }, // Pink
    ],
    availableMultipliers: [0.00, 1.50, 1.70, 2.00, 3.00, 4.00]
  };
  
  // Array of all segments flattened (for random selection)
  const allSegments = wheelConfig.segments.flatMap(seg => 
    Array(seg.count).fill({ color: seg.color, multiplier: seg.multiplier })
  );
  
  // Format number with up to 8 decimal places
  const formatNumber = (num: number): string => {
    return num.toFixed(8).replace(/\.?0+$/, '');
  };
  
  // Update displayed bet amount when changed
  useEffect(() => {
    setBetAmountDisplay(betAmount.toFixed(8));
  }, [betAmount]);
  
  // Clean up autobet on unmount
  useEffect(() => {
    return () => {
      if (autoBetIntervalRef.current) {
        clearInterval(autoBetIntervalRef.current);
      }
    };
  }, []);
  
  // Handle bet amount changes
  const handleBetAmountChange = (value: string) => {
    const newAmount = parseFloat(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setBetAmount(newAmount);
      setBetAmountDisplay(value);
    } else if (value === '' || value === '0') {
      setBetAmount(0);
      setBetAmountDisplay(value);
    }
  };
  
  // Half bet amount
  const halfBet = () => {
    const newAmount = betAmount / 2;
    setBetAmount(newAmount);
    setBetAmountDisplay(newAmount.toFixed(8));
  };
  
  // Double bet amount
  const doubleBet = () => {
    const newAmount = betAmount * 2;
    setBetAmount(newAmount);
    setBetAmountDisplay(newAmount.toFixed(8));
  };
  
  // Generate client seed
  const generateClientSeed = () => {
    return Math.random().toString(36).substring(2, 15);
  };
  
  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const size = Math.min(600, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
    
    // Center point
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    // Function to draw a segment
    const drawSegment = (startAngle: number, endAngle: number, color: string) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#0F212E';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    // Expand the segment config to include all segments
    const expandedSegments = wheelConfig.segments.flatMap(segment => 
      Array(segment.count).fill(segment)
    );
    
    // Make sure we have exactly the number of segments we need
    const totalSegmentCount = expandedSegments.length;
    
    // Draw wheel segments
    const segmentAngle = (2 * Math.PI) / totalSegmentCount;
    
    // Apply the rotation angle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle * Math.PI / 180);
    ctx.translate(-centerX, -centerY);
    
    // Draw each segment
    for (let i = 0; i < totalSegmentCount; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      const { color } = expandedSegments[i];
      drawSegment(startAngle, endAngle, color);
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F212E';
    ctx.fill();
    
    // Restore context
    ctx.restore();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 35);
    ctx.lineTo(centerX + 15, 35);
    ctx.closePath();
    ctx.fillStyle = '#FF4C4C';
    ctx.fill();
    
  }, [rotationAngle]);
  
  // Spin the wheel with animation
  const spinWheel = useCallback((targetSegmentIndex: number) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Calculate target angle
    const segmentAngle = 360 / allSegments.length;
    
    // Target angle needs to point to the correct segment
    // Add some randomness to where the pointer lands within the segment
    const randomOffset = Math.random() * segmentAngle * 0.7 - segmentAngle * 0.35;
    const targetAngle = 360 - (segmentAngle * targetSegmentIndex + randomOffset);
    
    // Add multiple rotations for effect
    const rotations = 4; // Number of full rotations before stopping
    const targetFinalAngle = targetAngle + rotations * 360;
    
    let startAngle = rotationAngle;
    const startTime = Date.now();
    const duration = 4000; // Duration of spin in milliseconds
    
    const animateSpin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic function for natural slowing down
      // const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Custom easing function that slows down more at the end
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      // Calculate current angle
      const currentAngle = startAngle + (targetFinalAngle - startAngle) * easeOut;
      
      // Normalize angle to 0-360
      const normalizedAngle = currentAngle % 360;
      
      setRotationAngle(normalizedAngle);
      
      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Animation complete
        const resultSegment = allSegments[targetSegmentIndex];
        
        // Set result
        setResult({
          color: resultSegment.color,
          multiplier: resultSegment.multiplier,
          won: selectedMultiplier === resultSegment.multiplier
        });
        
        // Add to history
        setBetHistory(prev => [
          { 
            color: resultSegment.color,
            multiplier: resultSegment.multiplier,
            won: selectedMultiplier === resultSegment.multiplier
          }, 
          ...prev.slice(0, 9)
        ]);
        
        // Wait a bit before allowing another spin
        setTimeout(() => {
          setIsSpinning(false);
        }, 1000);
      }
    };
    
    // Start animation
    requestAnimationFrame(animateSpin);
  }, [rotationAngle, allSegments, isSpinning, selectedMultiplier]);
  
  // Place a bet and spin the wheel
  const placeBetAndSpin = async () => {
    if (isSpinning || !selectedMultiplier) return;
    
    try {
      // Generate a client seed
      const clientSeed = generateClientSeed();
      
      // Attempt to place bet with API, but don't block the demo on API errors
      try {
        await placeBet.mutateAsync({
          gameId: gameInfo.id,
          clientSeed,
          amount: betAmount,
          options: {
            multiplier: selectedMultiplier
          }
        });
      } catch (apiError) {
        console.log("API error (continuing with demo)", apiError);
      }
      
      // Set a mock response for the demo
      const response = { betId: Math.floor(Math.random() * 10000) };
      
      // Store the bet ID from the response
      if (response && typeof response === 'object' && 'betId' in response) {
        currentBetIdRef.current = response.betId as number;
      }
      
      // Generate game result (this would normally come from the server)
      const result = getGameResult() as number;
      
      // Map the random value to a segment index
      const targetSegmentIndex = Math.floor(result * allSegments.length);
      
      // Spin the wheel to the target segment
      spinWheel(targetSegmentIndex);
      
      // After wheel stops, complete the bet
      const resultSegment = allSegments[targetSegmentIndex];
      
      setTimeout(() => {
        if (currentBetIdRef.current) {
          try {
            completeBet.mutate({
              betId: currentBetIdRef.current,
              outcome: {
                multiplier: resultSegment.multiplier,
                color: resultSegment.color,
                selectedMultiplier,
                win: selectedMultiplier === resultSegment.multiplier
              }
            });
          } catch (error) {
            console.log("API error completing bet (demo continues)", error);
          }
          currentBetIdRef.current = null;
        }
      }, 5000); // Wait for wheel to stop
      
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };
  
  // Get background color for multiplier button
  const getMultiplierButtonColor = (multiplier: number) => {
    switch (multiplier) {
      case 0.00: return 'bg-[#172B3A]'; // Default gray
      case 1.50: return 'bg-[#3B82F6]'; // Blue
      case 1.70: return 'bg-[#3B82F6]'; // Blue
      case 2.00: return 'bg-[#10B981]'; // Green
      case 3.00: return 'bg-[#F59E0B]'; // Yellow
      case 4.00: return 'bg-[#8B5CF6]'; // Purple
      case 10.00: return 'bg-[#EC4899]'; // Pink
      default: return 'bg-[#172B3A]'; // Default gray
    }
  };
  
  // Get text color for result based on multiplier
  const getResultTextColor = (multiplier?: number | null) => {
    if (!multiplier) return 'text-white';
    
    switch (multiplier) {
      case 1.50: return 'text-[#3B82F6]'; // Blue
      case 1.70: return 'text-[#3B82F6]'; // Blue
      case 2.00: return 'text-[#10B981]'; // Green
      case 3.00: return 'text-[#F59E0B]'; // Yellow
      case 4.00: return 'text-[#8B5CF6]'; // Purple
      case 10.00: return 'text-[#EC4899]'; // Pink
      default: return 'text-white'; // Default white
    }
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-[#0F212E] text-white overflow-hidden">
      {/* Main Game Container */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side - Controls */}
        <div className="w-full md:w-1/4 p-4 bg-[#172B3A]">
          {/* Game Mode Tabs */}
          <div className="flex rounded-md overflow-hidden mb-4 bg-[#0F212E]">
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'Manual' ? 'bg-[#172B3A]' : ''}`}
              onClick={() => setGameMode('Manual')}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center ${gameMode === 'Auto' ? 'bg-[#172B3A]' : ''}`}
              onClick={() => setGameMode('Auto')}
            >
              Auto
            </button>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Bet Amount</div>
            <div className="bg-[#0F212E] p-2 rounded mb-2 relative">
              <div className="flex items-center">
                <span className="text-white">$0.00</span>
              </div>
              <input 
                type="text" 
                value={betAmountDisplay}
                onChange={(e) => handleBetAmountChange(e.target.value)}
                className="w-full bg-transparent border-none text-white outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex">
                <button onClick={halfBet} className="px-2 text-gray-400 hover:text-white">½</button>
                <button onClick={doubleBet} className="px-2 text-gray-400 hover:text-white">2×</button>
              </div>
            </div>
          </div>
          
          {/* Risk Level */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Risk</div>
            <div className="bg-[#0F212E] p-2 rounded flex items-center">
              <span className="text-white">Medium</span>
              <div className="ml-auto">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>
          
          {/* Segments */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Segments</div>
            <div className="bg-[#0F212E] p-2 rounded flex items-center">
              <span className="text-white">{segments}</span>
              <div className="ml-auto">
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>
          
          {/* Bet Button */}
          <div className="mb-4">
            <Button 
              className="w-full py-3 text-base font-medium bg-[#5BE12C] hover:bg-[#4CC124] text-black rounded-md"
              onClick={placeBetAndSpin}
              disabled={isSpinning || !selectedMultiplier || betAmount <= 0}
            >
              {isSpinning ? 'Spinning...' : 'Bet'}
            </Button>
          </div>
          
          {/* Results */}
          {result && (
            <div className="mb-4 p-3 rounded bg-[#0F212E]">
              <div className="text-sm text-gray-400 mb-1">Result</div>
              <div className={`text-lg font-bold ${result.won ? 'text-[#5BE12C]' : 'text-[#FF3B3B]'}`}>
                {result.won ? 'WIN!' : 'LOSS'}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">Your Choice:</span>
                <span className={`text-sm ${getResultTextColor(selectedMultiplier)}`}>
                  {selectedMultiplier !== null ? selectedMultiplier.toFixed(2) + 'x' : '0.00x'}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">Result:</span>
                <span className={`text-sm ${getResultTextColor(result.multiplier)}`}>
                  {result.multiplier.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">Payout:</span>
                <span className="text-sm">
                  {result.won ? (betAmount * result.multiplier).toFixed(8) : '0.00000000'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side - Game Area */}
        <div className="w-full md:w-3/4 p-4 flex flex-col h-full">
          {/* Multiplier Selection */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {wheelConfig.availableMultipliers.map((mult) => (
              <button
                key={mult}
                className={`
                  px-4 py-2 rounded
                  ${selectedMultiplier === mult ? 'ring-2 ring-white' : ''}
                  ${getMultiplierButtonColor(mult)}
                `}
                onClick={() => setSelectedMultiplier(mult)}
                disabled={isSpinning}
              >
                {mult.toFixed(2)}x
              </button>
            ))}
          </div>
          
          {/* Wheel Container */}
          <div className="flex-grow bg-[#0E1C27] rounded-lg flex items-center justify-center">
            <div className="relative">
              <canvas ref={canvasRef} className="mx-auto" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation (hidden on desktop) */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0E1C27] flex justify-between border-t border-gray-800 md:hidden py-2">
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

export default Wheel;