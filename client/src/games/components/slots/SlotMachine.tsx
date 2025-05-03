import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Define component props
interface SlotMachineProps {
  reelValues: number[];
  isSpinning: boolean;
  spinResults: any | null;
}

const SlotMachine: React.FC<SlotMachineProps> = ({
  reelValues,
  isSpinning,
  spinResults
}) => {
  // Refs for animations
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const slotMachineRef = useRef<HTMLDivElement>(null);
  
  // Animation for spinning reels
  useEffect(() => {
    if (isSpinning) {
      // Animate each reel with staggered timing
      reelRefs.forEach((reelRef, index) => {
        if (reelRef.current) {
          // Clear any existing animations
          gsap.killTweensOf(reelRef.current);
          
          // Create spinning animation
          gsap.to(reelRef.current, {
            y: `-${Math.random() * 1000}%`, // Random position for variety
            duration: 0.5,
            ease: "power1.in",
            repeat: 5 + index, // Staggered stopping (first reel stops first)
            onComplete: () => {
              // When spinning stops, set to the final value
              if (reelRef.current) {
                gsap.to(reelRef.current, {
                  y: "0%",
                  duration: 0.5,
                  ease: "bounce.out"
                });
              }
            }
          });
        }
      });
      
      // Shake the machine slightly for effect
      if (slotMachineRef.current) {
        gsap.to(slotMachineRef.current, {
          x: "+=5",
          duration: 0.1,
          repeat: 20,
          yoyo: true,
          ease: "none"
        });
      }
    }
  }, [isSpinning]);
  
  // Create visual effects for win
  useEffect(() => {
    if (spinResults?.win && !isSpinning) {
      // Animation for winning combination
      reelRefs.forEach((reelRef) => {
        if (reelRef.current) {
          gsap.fromTo(
            reelRef.current,
            { scale: 1 },
            { 
              scale: 1.1, 
              duration: 0.3, 
              repeat: 3, 
              yoyo: true,
              ease: "power1.inOut"
            }
          );
        }
      });
      
      // Glow effect on the machine
      if (slotMachineRef.current) {
        gsap.fromTo(
          slotMachineRef.current,
          { boxShadow: "0 0 10px 0px rgba(46, 213, 115, 0)" },
          { 
            boxShadow: "0 0 30px 5px rgba(46, 213, 115, 0.7)", 
            duration: 0.5,
            repeat: 5,
            yoyo: true
          }
        );
      }
    }
  }, [spinResults, isSpinning]);
  
  // Render a single slot reel
  const renderReel = (value: number, index: number) => {
    // Generate the 10 numbers (0-9) for each reel
    const digits = Array.from({ length: 10 }, (_, i) => i);
    
    // Style for highlighting winning numbers
    const isWinning = spinResults?.win && !isSpinning;
    
    return (
      <div 
        key={index} 
        className="relative overflow-hidden w-20 h-24 md:w-32 md:h-36 bg-[#172B3A] rounded-lg border-2 border-[#243442] shadow-inner"
      >
        <div 
          ref={reelRefs[index]} 
          className="absolute top-0 left-0 w-full transition-all"
        >
          {/* Show the current value */}
          <div 
            className={`flex items-center justify-center w-full h-24 md:h-36 text-4xl md:text-6xl font-bold
              ${isWinning ? 'text-green-400' : 'text-white'}`}
          >
            {value}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      ref={slotMachineRef}
      className="bg-[#172B3A] p-6 rounded-xl border-2 border-[#243442] shadow-lg max-w-lg mx-auto transition-all"
    >
      {/* Slot machine display */}
      <div className="flex justify-around items-center space-x-2 md:space-x-4 py-4">
        {reelValues.map((value, index) => renderReel(value, index))}
      </div>
      
      {/* Machine decoration */}
      <div className="mt-4 flex justify-center">
        <div className="w-12 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-md">
          <div className="w-8 h-4 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Win/Lose message */}
      {spinResults && !isSpinning && (
        <div className={`mt-4 text-center font-bold text-xl
          ${spinResults.win ? 'text-green-400' : 'text-red-400'}`}>
          {spinResults.win ? 'YOU WON!' : 'TRY AGAIN!'}
        </div>
      )}
    </div>
  );
};

export default SlotMachine;