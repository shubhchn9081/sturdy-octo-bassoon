import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Lucky Sevens configuration
const luckySevenConfig: SlotConfiguration = {
  name: "Lucky Sevens",
  theme: "classic",
  description: "A classic fruit machine with lucky sevens!",
  symbols: ["7️⃣", "🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎", "🍀", "🎰"],
  payouts: [
    {
      combination: ["7️⃣", "7️⃣", "7️⃣"],
      multiplier: 10,
      description: "Three Sevens"
    },
    {
      combination: ["🍒", "🍒", "🍒"],
      multiplier: 5,
      description: "Three Cherries"
    },
    {
      combination: ["🍋", "🍋", "🍋"],
      multiplier: 4,
      description: "Three Lemons"
    },
    {
      combination: ["🍊", "🍊", "🍊"],
      multiplier: 4,
      description: "Three Oranges"
    },
    {
      combination: ["🍇", "🍇", "🍇"],
      multiplier: 3,
      description: "Three Grapes"
    },
    {
      combination: ["🔔", "🔔", "🔔"],
      multiplier: 5,
      description: "Three Bells"
    },
    {
      combination: ["⭐", "⭐", "⭐"],
      multiplier: 5,
      description: "Three Stars"
    },
    {
      combination: ["💎", "💎", "💎"],
      multiplier: 8,
      description: "Three Diamonds"
    },
    {
      combination: ["🍀", "🍀", "🍀"],
      multiplier: 7,
      description: "Three Clovers"
    },
    {
      combination: ["🎰", "🎰", "🎰"],
      multiplier: 6,
      description: "Three Slots"
    }
  ],
  specialSymbols: [
    {
      symbol: "7️⃣",
      name: "Lucky Seven",
      description: "The highest paying symbol! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "🍀",
      name: "Lucky Clover",
      description: "Brings luck to your spins!",
      multiplier: 7
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "7️⃣",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a classic slot machine background component
const ClassicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Classic slot machine background */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/80 via-red-800/80 to-red-950/90"></div>
      
      {/* Decorative patterns for the slot machine */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,215,0,0.5) 2px, transparent 2px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Machine edge design */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 opacity-60"></div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 opacity-60"></div>
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-600 opacity-60"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-600 opacity-60"></div>
      
      {/* Corner decorations */}
      {[
        { top: '0', left: '0' },
        { top: '0', right: '0' },
        { bottom: '0', left: '0' },
        { bottom: '0', right: '0' }
      ].map((pos, i) => (
        <div 
          key={i} 
          className="absolute w-16 h-16 bg-yellow-600 opacity-60"
          style={pos as React.CSSProperties}
        ></div>
      ))}
      
      {/* Animated light bulbs around the machine */}
      {Array.from({ length: 20 }).map((_, i) => {
        const isTop = i < 5;
        const isBottom = i >= 15;
        const isLeft = i >= 5 && i < 10;
        const isRight = i >= 10 && i < 15;
        
        let positionStyle: React.CSSProperties = {};
        
        if (isTop) {
          positionStyle = {
            top: '12px',
            left: `${(i + 1) * 20 - 10}%`
          };
        } else if (isBottom) {
          positionStyle = {
            bottom: '12px',
            left: `${(i - 14) * 20 - 10}%`
          };
        } else if (isLeft) {
          positionStyle = {
            left: '12px',
            top: `${(i - 4) * 20 - 5}%`
          };
        } else if (isRight) {
          positionStyle = {
            right: '12px',
            top: `${(i - 9) * 20 - 5}%`
          };
        }
        
        return (
          <motion.div
            key={i + 'light'}
            className="absolute w-6 h-6 rounded-full bg-yellow-300 opacity-50"
            style={positionStyle}
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: Math.random() * 0.5
            }}
          />
        );
      })}
      
      {/* Machine texture overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)',
          backgroundSize: '10px 10px'
        }}
      />
    </div>
  );
};

// Lucky Sevens game component
const LuckySevens: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundColor: '#7f1d1d',
    },
    reelsContainer: {
      background: 'rgba(127, 29, 29, 0.8)',
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.2), inset 0 0 5px rgba(255, 215, 0, 0.2)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '8px'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(140, 30, 30, 0.9), rgba(120, 25, 25, 1))',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '6px'
    },
    button: {
      background: 'linear-gradient(45deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)',
      color: 'white',
      border: '1px solid rgba(255, 215, 0, 0.5)',
      fontWeight: 'bold'
    }
  };

  return (
    <div className="relative h-full">
      <ClassicBackground />
      <BaseSlotGame
        config={luckySevenConfig}
        gameId={103}
        customStyles={customStyles}
      />
    </div>
  );
};

export default LuckySevens;