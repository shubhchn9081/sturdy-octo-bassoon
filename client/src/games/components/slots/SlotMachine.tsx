import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Type definitions for SlotMachine props
type SlotMachineProps = {
  reelValues: number[];
  isSpinning: boolean;
  spinResults: {
    reels: number[];
    multiplier: number;
    win: boolean;
    winAmount: number;
  } | null;
};

// Main SlotMachine component
const SlotMachine: React.FC<SlotMachineProps> = ({ 
  reelValues, 
  isSpinning, 
  spinResults 
}) => {
  const slotMachineRef = useRef<HTMLDivElement>(null);
  const winAnimationRef = useRef<gsap.core.Timeline | null>(null);
  
  // Win animation effect with GSAP
  useEffect(() => {
    if (spinResults?.win && !isSpinning && slotMachineRef.current) {
      // Stop any existing animations
      if (winAnimationRef.current) {
        winAnimationRef.current.kill();
      }
      
      // Create a new timeline animation
      const tl = gsap.timeline({ repeat: 3 });
      
      // Animate the win message and slot machine
      tl.to('.win-message', { 
        scale: 1.2, 
        color: '#FFD700', 
        duration: 0.3,
        ease: 'power2.inOut'
      })
      .to('.win-message', { 
        scale: 1, 
        duration: 0.3,
        ease: 'power2.inOut'
      })
      .to('.slot-reel', { 
        boxShadow: '0 0 15px 5px rgba(255, 215, 0, 0.7)', 
        duration: 0.3,
        ease: 'power2.inOut'
      })
      .to('.slot-reel', { 
        boxShadow: '0 0 5px 2px rgba(255, 215, 0, 0.3)', 
        duration: 0.3,
        ease: 'power2.inOut'
      });
      
      // Store the timeline animation reference
      winAnimationRef.current = tl;
    }
    
    return () => {
      // Clean up the animation on component unmount
      if (winAnimationRef.current) {
        winAnimationRef.current.kill();
      }
    };
  }, [spinResults, isSpinning]);
  
  return (
    <div 
      ref={slotMachineRef} 
      className="relative flex flex-col items-center bg-[#0A1824] rounded-lg p-6 shadow-lg"
    >
      {/* Win message overlay */}
      {spinResults?.win && !isSpinning && (
        <div className="win-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-4xl font-bold text-green-500 bg-black/60 rounded-lg px-4 py-2 whitespace-nowrap">
          WIN: {spinResults.winAmount.toFixed(2)} INR
        </div>
      )}
      
      {/* Slot machine top display */}
      <div className="bg-gradient-to-b from-[#142A3A] to-[#0C1E2A] w-full rounded-t-lg p-3 mb-4 border-b border-[#1D2F3D]">
        <div className="text-center font-bold text-2xl text-white">
          SLOTS
        </div>
      </div>
      
      {/* Slot machine reels container */}
      <div className="flex justify-center space-x-3 p-2 bg-[#0D1C27] rounded-md border border-[#1E3141] shadow-inner">
        {reelValues.map((value, index) => (
          <div 
            key={index}
            className={`slot-reel w-20 h-24 md:w-24 md:h-28 flex items-center justify-center bg-gradient-to-b from-[#1A2D3C] to-[#0F1F2C] rounded-md border-2 border-[#1E3141] shadow-lg text-5xl font-bold ${
              spinResults?.win && !isSpinning ? 'text-yellow-400' : 'text-white'
            } ${isSpinning ? 'animate-pulse' : ''}`}
          >
            {value}
          </div>
        ))}
      </div>
      
      {/* Multiplier display */}
      {spinResults && !isSpinning && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-400">Multiplier</div>
          <div className={`text-2xl font-bold ${spinResults.win ? 'text-green-500' : 'text-gray-200'}`}>
            {spinResults.multiplier}x
          </div>
        </div>
      )}
      
      {/* Slot machine bottom panel */}
      <div className="flex justify-between w-full mt-4 bg-[#0C1E2A] rounded-b-lg px-4 py-3 border-t border-[#1D2F3D]">
        <div className="text-gray-400 text-sm">
          3 of a kind: 5x
        </div>
        <div className="text-gray-400 text-sm">
          Sequential: 2x
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;