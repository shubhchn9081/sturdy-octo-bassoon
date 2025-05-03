import React from 'react';
import { motion } from 'framer-motion';

// Type definitions
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
  luckyNumber?: number;
};

const SlotMachine = ({ reelValues, isSpinning, spinResults, luckyNumber }: SlotMachineProps) => {
  // Helper function to determine if this reel value is a lucky number match
  const isLuckyNumber = (value: number) => {
    return !isSpinning && 
           luckyNumber !== undefined && 
           value === luckyNumber && 
           spinResults?.luckyNumberHit;
  };
  
  return (
    <div className="relative">
      {/* The slot machine body with glass front */}
      <div className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#1D2F3D] to-[#0A1822] p-6 rounded-lg shadow-lg border border-[#3A4F61]">
        <div className="text-center mb-4">
          <h2 className="font-bold text-2xl text-white">SLOTS</h2>
          <p className="text-sm text-blue-300">Win up to 10× your bet!</p>
        </div>
        
        {/* Slot reels container with glass effect */}
        <div className="bg-[#0A1520] p-4 rounded-md border border-[#2A3F51] mb-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ 
            background: 'linear-gradient(130deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)', 
            borderRadius: '0.375rem' 
          }}></div>
          
          {/* The three reels - improved for animation and mobile support */}
          <div className="flex justify-center items-center space-x-4 h-32 sm:h-40">
            {reelValues.map((value, index) => (
              <div 
                key={index}
                className={`slot-reel-${index} w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-3xl sm:text-4xl font-bold rounded-md transform transition-all duration-150 ${
                  isSpinning 
                    ? 'bg-[#0E1C27] animate-pulse' 
                    : isLuckyNumber(value)
                    ? 'bg-yellow-700 border-2 border-yellow-500 shadow-lg shadow-yellow-500/50'
                    : spinResults?.win
                    ? 'bg-green-900 border border-green-700'
                    : 'bg-[#162431] border border-[#2C3E4C]'
                }`}
              >
                {isLuckyNumber(value) ? (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                    className="text-yellow-300"
                  >
                    {value}
                  </motion.div>
                ) : (
                  <span className={`${
                    isSpinning 
                      ? 'text-white blur-[0.5px]' 
                      : spinResults?.win 
                      ? 'text-green-200' 
                      : 'text-white'}`}>
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Win amount display */}
        {spinResults?.win && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/40 border border-green-700 p-3 rounded-md text-center mb-4"
          >
            <p className="text-green-200 font-semibold">
              {spinResults.luckyNumberHit 
                ? 'LUCKY NUMBER WIN!' 
                : 'YOU WIN!'}
            </p>
            <p className="text-3xl font-bold text-green-300">
              +{spinResults.winAmount.toFixed(2)} INR
            </p>
            <p className="text-sm text-green-400">
              {spinResults.multiplier}× Multiplier
            </p>
          </motion.div>
        )}
        
        {/* Multiplier display */}
        <div className="grid grid-cols-3 gap-3 bg-[#0A1520] p-3 rounded-md">
          <div className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
            <div className="text-xs text-blue-300">3 of 7s</div>
            <div className="font-bold">10×</div>
          </div>
          <div className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
            <div className="text-xs text-blue-300">3 Same</div>
            <div className="font-bold">5×</div>
          </div>
          <div className="text-center border border-[#2A3F51] rounded p-1 bg-[#162431]">
            <div className="text-xs text-blue-300">Sequence</div>
            <div className="font-bold">3×</div>
          </div>
        </div>
        
        {/* Lucky number reminder */}
        {luckyNumber !== undefined && (
          <div className="mt-3 text-center text-xs">
            <span className="text-white">Your lucky number is </span>
            <span className="text-yellow-300 font-bold">{luckyNumber}</span>
            <span className="text-white"> (10× win if it appears!)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotMachine;