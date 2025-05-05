import React, { useEffect, useRef } from 'react';
import { SlotSymbol } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';

interface GalacticSpinsGameProps {
  reels: SlotSymbol[][];
  isSpinning: boolean;
  spinResults: any;
  onSpin: () => void;
  soundEnabled: boolean;
}

// Symbol images for the slot game
const symbolImages: Record<SlotSymbol, string> = {
  'planet': '/assets/symbols/planet.png',
  'star': '/assets/symbols/star.png',
  'rocket': '/assets/symbols/rocket.png',
  'alien': '/assets/symbols/alien.png',
  'asteroid': '/assets/symbols/asteroid.png',
  'comet': '/assets/symbols/comet.png',
  'galaxy': '/assets/symbols/galaxy.png',
  'blackhole': '/assets/symbols/blackhole.png',
  'wild': '/assets/symbols/wild.png'
};

// Enhanced implementation with Framer Motion for smooth animations
const GalacticSpinsGame: React.FC<GalacticSpinsGameProps> = ({
  reels,
  isSpinning,
  spinResults,
  onSpin,
  soundEnabled
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load and play sounds
  useEffect(() => {
    if (soundEnabled) {
      audioRef.current = new Audio('/sounds/reel-start.mp3');
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [soundEnabled]);
  
  // Play spin sound
  useEffect(() => {
    if (isSpinning && soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, [isSpinning, soundEnabled]);
  
  // Temporary symbol renderer using emojis until we create proper image assets
  const getSymbolEmoji = (symbol: SlotSymbol): string => {
    const symbolMap: Record<SlotSymbol, string> = {
      'planet': '🪐',
      'star': '⭐',
      'rocket': '🚀',
      'alien': '👽',
      'asteroid': '☄️',
      'comet': '💫',
      'galaxy': '🌌',
      'blackhole': '⚫',
      'wild': '🃏'
    };
    
    return symbolMap[symbol] || '❓';
  };
  
  // Symbol styling
  const getSymbolColor = (symbol: SlotSymbol): string => {
    const colorMap: Record<SlotSymbol, string> = {
      'planet': 'text-blue-400',
      'star': 'text-yellow-400',
      'rocket': 'text-red-500',
      'alien': 'text-green-400',
      'asteroid': 'text-amber-700',
      'comet': 'text-amber-400',
      'galaxy': 'text-purple-400',
      'blackhole': 'text-gray-800',
      'wild': 'text-purple-600'
    };
    
    return colorMap[symbol] || 'text-gray-400';
  };
  
  const getSymbolBackground = (symbol: SlotSymbol): string => {
    const bgMap: Record<SlotSymbol, string> = {
      'planet': 'bg-blue-900',
      'star': 'bg-yellow-900',
      'rocket': 'bg-red-900',
      'alien': 'bg-green-900',
      'asteroid': 'bg-amber-900',
      'comet': 'bg-amber-800',
      'galaxy': 'bg-purple-900',
      'blackhole': 'bg-gray-900',
      'wild': 'bg-purple-900'
    };
    
    return bgMap[symbol] || 'bg-gray-800';
  };
  
  // Generate a random array of symbols for the spinning animation
  const generateSpinSymbols = (): SlotSymbol[] => {
    const symbols: SlotSymbol[] = ['planet', 'star', 'rocket', 'alien', 'asteroid', 'comet', 'galaxy', 'blackhole', 'wild'];
    return Array.from({ length: 20 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
  };
  
  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center relative overflow-hidden" ref={gameRef}>
      {/* Starfield background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050A1C] to-[#0F1A3C]">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="absolute rounded-full bg-white"
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      {/* Game title */}
      <motion.h2 
        className="text-3xl font-bold text-[#44CCFF] mb-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        GALACTIC SPINS
      </motion.h2>
      
      {/* Slot machine container */}
      <motion.div 
        className="bg-[#0A0F24] p-6 rounded-lg border-2 border-[#2A3F7A] shadow-lg relative z-10 w-[340px]"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Slot machine reels */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {reels.map((reel, reelIndex) => (
            <div key={reelIndex} className="relative">
              <div className="w-[56px] h-[200px] bg-[#161B36] rounded-md overflow-hidden border border-[#2A3F7A] relative">
                {isSpinning ? (
                  // Spinning animation
                  <motion.div 
                    className="absolute inset-0"
                    animate={{ 
                      y: ["0%", "100%", "0%"],
                    }}
                    transition={{ 
                      duration: 0.5, 
                      repeat: 10, 
                      ease: "linear",
                      times: [0, 0.5, 1],
                      delay: reelIndex * 0.2 // Stagger the reels
                    }}
                  >
                    {generateSpinSymbols().map((symbol, idx) => (
                      <div 
                        key={idx}
                        className={`w-full h-[66px] flex items-center justify-center ${getSymbolBackground(symbol)}`}
                      >
                        <motion.div 
                          className={`text-4xl ${getSymbolColor(symbol)} filter blur-[0.5px]`}
                          animate={{ rotateY: 360 }}
                          transition={{ 
                            duration: 0.3, 
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          {getSymbolEmoji(symbol)}
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  // Static display of results
                  <div className="flex flex-col h-full">
                    {reel.map((symbol, symbolIndex) => (
                      <motion.div 
                        key={symbolIndex}
                        className={`flex-1 flex items-center justify-center ${getSymbolBackground(symbol)} border-b border-[#2A3F7A] last:border-b-0`}
                        initial={spinResults ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: reelIndex * 0.2 + 0.5,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        <div className={`text-4xl ${getSymbolColor(symbol)}`}>
                          {getSymbolEmoji(symbol)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Expanding wild effect */}
              <AnimatePresence>
                {!isSpinning && spinResults?.win && spinResults?.expandingWilds.includes(reelIndex) && (
                  <motion.div 
                    className="absolute inset-0 bg-purple-600 bg-opacity-50 flex items-center justify-center rounded-md z-20"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotateY: [0, 360],
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      duration: 1,
                      delay: reelIndex * 0.2 + 1
                    }}
                  >
                    <motion.div 
                      className="text-white font-bold text-lg"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [-5, 5, -5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      WILD
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Win display */}
      <AnimatePresence>
        {!isSpinning && spinResults?.win && (
          <motion.div 
            className="text-center mt-4 relative z-10"
            initial={{ opacity: 0, scale: 0, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <motion.div 
              className="text-2xl text-yellow-400 font-bold"
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 5px rgba(255,215,0,0.5)",
                  "0 0 20px rgba(255,215,0,0.8)",
                  "0 0 5px rgba(255,215,0,0.5)"
                ]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              WIN! {spinResults.winAmount.toFixed(2)} INR
            </motion.div>
            
            {spinResults.bonusTriggered && (
              <motion.div 
                className="text-lg text-purple-400 font-bold mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                BONUS ROUND TRIGGERED!
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spin button */}
      <motion.button
        onClick={onSpin}
        disabled={isSpinning}
        className={`px-8 py-3 rounded-full font-bold text-white relative z-10 mt-6 ${
          isSpinning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#44CCFF] to-[#3388FF]'
        }`}
        whileHover={!isSpinning ? { scale: 1.05 } : {}}
        whileTap={!isSpinning ? { scale: 0.95 } : {}}
        animate={isSpinning ? { 
          scale: [1, 0.97, 1], 
          transition: { 
            duration: 0.6,
            repeat: Infinity 
          }
        } : {}}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN'}
      </motion.button>
      
      {/* Sound indicator */}
      <motion.div 
        className="absolute bottom-4 right-4 text-gray-400 text-sm"
        whileHover={{ scale: 1.1 }}
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </motion.div>
    </div>
  );
};

export default GalacticSpinsGame;