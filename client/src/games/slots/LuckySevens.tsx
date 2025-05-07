import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Lucky Sevens configuration
const luckySevenConfig: SlotConfiguration = {
  name: "Lucky Sevens",
  theme: "classic",
  description: "A classic slot experience with a modern twist!",
  symbols: ["7", "BAR", "🍒", "🍋", "🍊", "🍇", "🔔", "💎", "⭐", "WILD"],
  payouts: [
    {
      combination: ["7", "7", "7"],
      multiplier: 10,
      description: "Three 7s"
    },
    {
      combination: ["WILD", "WILD", "WILD"],
      multiplier: 8,
      description: "Three WILDs"
    },
    {
      combination: ["BAR", "BAR", "BAR"],
      multiplier: 7,
      description: "Three BARs"
    },
    {
      combination: ["💎", "💎", "💎"],
      multiplier: 6,
      description: "Three Diamonds"
    },
    {
      combination: ["🔔", "🔔", "🔔"],
      multiplier: 5,
      description: "Three Bells"
    },
    {
      combination: ["⭐", "⭐", "⭐"],
      multiplier: 4,
      description: "Three Stars"
    },
    {
      combination: ["🍇", "🍇", "🍇"],
      multiplier: 3,
      description: "Three Grapes"
    },
    {
      combination: ["🍊", "🍊", "🍊"],
      multiplier: 3,
      description: "Three Oranges"
    },
    {
      combination: ["🍋", "🍋", "🍋"],
      multiplier: 2,
      description: "Three Lemons"
    },
    {
      combination: ["🍒", "🍒", "🍒"],
      multiplier: 2,
      description: "Three Cherries"
    }
  ],
  specialSymbols: [
    {
      symbol: "7",
      name: "Lucky Seven",
      description: "The most valuable symbol! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "WILD",
      name: "Wild Symbol",
      description: "Substitutes for any other symbol to create winning combinations.",
      multiplier: 8
    }
  ],
  maxMultiplier: 77,
  luckySymbol: "7",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a classic Vegas-themed background animation component
const ClassicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background lighting effects */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: 100 + Math.random() * 150 + 'px',
            height: 100 + Math.random() * 150 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            backgroundColor: ['#ff0000', '#ffff00', '#ff00ff', '#00ffff', '#0000ff'][i],
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: Math.random() * 2
          }}
        />
      ))}
      
      {/* Vegas-style light border effect */}
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 opacity-60"></div>
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 opacity-60"></div>
      <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 opacity-60"></div>
      <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 opacity-60"></div>
      
      {/* Spotlight effect */}
      <motion.div
        className="absolute inset-0 bg-radial-gradient opacity-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
        }}
        animate={{
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
    </div>
  );
};

// Custom component to render classic symbols
const renderClassicSymbol = (symbol: string | number) => {
  // Special styles for the classic symbols
  if (symbol === "7") {
    return (
      <div className="text-red-500 font-bold text-3xl">7</div>
    );
  }
  
  if (symbol === "BAR") {
    return (
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent font-extrabold text-xl">BAR</div>
    );
  }
  
  if (symbol === "WILD") {
    return (
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-extrabold text-lg">WILD</div>
    );
  }
  
  // Default for other symbols
  return symbol;
};

// Lucky Sevens game component
const LuckySevens: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundImage: 'linear-gradient(to bottom, #1a1a2e 0%, #0f0f1a 100%)'
    },
    reelsContainer: {
      background: 'rgba(15, 15, 30, 0.9)',
      boxShadow: '0 0 15px rgba(255, 0, 0, 0.1), inset 0 0 5px rgba(255, 255, 0, 0.1)',
      border: '2px solid #333'
    },
    reel: {
      background: 'linear-gradient(145deg, #222, #111)',
      boxShadow: '0 0 10px rgba(255, 0, 0, 0.1)',
      border: '1px solid #444'
    },
    button: {
      background: 'linear-gradient(45deg, #cc0000 0%, #ff0000 50%, #cc0000 100%)',
      color: 'white'
    },
    symbol: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%'
    }
  };

  // Override the renderSymbol function to use our custom one
  const extendedConfig = {
    ...luckySevenConfig,
    renderSymbol: renderClassicSymbol
  };

  return (
    <div className="relative h-full">
      <ClassicBackground />
      <BaseSlotGame
        config={luckySevenConfig}
        gameId={104}
        customStyles={customStyles}
      />
    </div>
  );
};

export default LuckySevens;