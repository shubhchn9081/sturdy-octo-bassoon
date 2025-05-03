import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Types
type SpinResult = {
  reels: number[];
  multiplier: number;
  win: boolean;
  winAmount: number;
  luckyNumberHit?: boolean;
};

type SlotMachineProps = {
  reelValues: number[];
  isSpinning: boolean;
  spinResults: SpinResult | null;
};

const SlotMachine: React.FC<SlotMachineProps> = ({
  reelValues,
  isSpinning,
  spinResults
}) => {
  // References to reel containers for animations
  const slotMachineRef = useRef<HTMLDivElement>(null);
  const reelsContainerRef = useRef<HTMLDivElement>(null);
  
  // Apply win/loss effects when results are available
  useEffect(() => {
    if (!spinResults || !slotMachineRef.current) return;
    
    if (spinResults.win) {
      // Win animation
      gsap.to(slotMachineRef.current, {
        keyframes: [
          { boxShadow: '0 0 20px 5px rgba(46, 213, 115, 0.6)', duration: 0.3 },
          { boxShadow: '0 0 10px 2px rgba(46, 213, 115, 0.4)', duration: 0.3 },
          { boxShadow: '0 0 20px 5px rgba(46, 213, 115, 0.6)', duration: 0.3 },
          { boxShadow: '0 0 10px 2px rgba(46, 213, 115, 0.4)', duration: 0.3 },
          { boxShadow: '0 0 0px 0px rgba(46, 213, 115, 0)', duration: 0.3 }
        ]
      });
      
      // Celebratory effect for reels container
      gsap.to(reelsContainerRef.current, {
        keyframes: [
          { scale: 1.05, duration: 0.2 },
          { scale: 1, duration: 0.2 }
        ]
      });
    } else {
      // Loss animation (subtle red flash)
      gsap.to(slotMachineRef.current, {
        boxShadow: '0 0 10px 2px rgba(231, 76, 60, 0.4)',
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
  }, [spinResults]);
  
  // Helper function to determine reel color based on value
  const getReelColor = (value: number): string => {
    // Color scheme for different numbers
    const colors = [
      'bg-blue-500',   // 0
      'bg-green-500',  // 1
      'bg-red-500',    // 2
      'bg-yellow-500', // 3
      'bg-purple-500', // 4
      'bg-pink-500',   // 5
      'bg-indigo-500', // 6
      'bg-amber-500',  // 7 (special 7, slightly different color)
      'bg-teal-500',   // 8
      'bg-cyan-500'    // 9
    ];
    
    return colors[value] || 'bg-gray-500';
  };
  
  // Helper function to determine if a reel should be highlighted (winning combination)
  const shouldHighlightReel = (index: number): boolean => {
    if (!spinResults || !spinResults.win) return false;
    
    // Check if we have three of the same number
    if (spinResults.reels[0] === spinResults.reels[1] && spinResults.reels[1] === spinResults.reels[2]) {
      return true; // All reels should be highlighted
    }
    
    // Check for two of the same number
    const firstPair = spinResults.reels[0] === spinResults.reels[1];
    const secondPair = spinResults.reels[1] === spinResults.reels[2];
    const thirdPair = spinResults.reels[0] === spinResults.reels[2];
    
    if (firstPair) return index === 0 || index === 1;
    if (secondPair) return index === 1 || index === 2;
    if (thirdPair) return index === 0 || index === 2;
    
    // Check for sequential numbers
    const sorted = [...spinResults.reels].sort((a, b) => a - b);
    const isSequential = sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1;
    
    return isSequential; // Highlight all reels if sequential
  };
  
  return (
    <div 
      ref={slotMachineRef}
      className="relative bg-[#172B3A] border-4 border-[#1D2F3D] rounded-2xl p-6 transition-all"
    >
      {/* Header with status */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Slots Game</h2>
        <p className="text-muted-foreground text-sm">
          {isSpinning ? 'Spinning...' : spinResults?.win ? 'You won!' : 'Ready to spin'}
        </p>
      </div>
      
      {/* Slot machine reels container */}
      <div 
        ref={reelsContainerRef}
        className="flex justify-center gap-4 mb-6"
      >
        {reelValues.map((value, index) => (
          <div 
            key={index}
            className={`
              relative w-20 h-28 rounded-lg overflow-hidden
              border-4 ${isSpinning ? 'border-yellow-600' : spinResults?.win ? 'border-green-600' : 'border-[#1D2F3D]'}
              flex items-center justify-center
              ${shouldHighlightReel(index) ? 'shadow-lg shadow-green-500/50' : ''}
              transition-all duration-300
            `}
          >
            {/* Reel value display */}
            <div 
              className={`
                w-full h-full flex items-center justify-center
                ${getReelColor(value)}
                text-white text-4xl font-bold
                ${isSpinning ? 'animate-pulse' : ''}
              `}
            >
              {value}
            </div>
            
            {/* Reel slot highlight effect when winning */}
            {shouldHighlightReel(index) && (
              <div className="absolute inset-0 border-2 border-white opacity-70 rounded-md"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Result information */}
      {spinResults && !isSpinning && (
        <div className={`text-center p-3 rounded-md ${
          spinResults.win ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'
        }`}>
          {spinResults.win ? (
            <>
              <p className="font-bold text-lg">You won {spinResults.winAmount.toFixed(2)} INR!</p>
              <p className="text-sm">Multiplier: {spinResults.multiplier}x</p>
            </>
          ) : (
            <p className="font-bold">Better luck next time!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotMachine;