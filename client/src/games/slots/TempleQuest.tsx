import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Temple Quest configuration
const templeQuestConfig: SlotConfiguration = {
  name: "Temple Quest",
  theme: "adventure",
  description: "Navigate ancient ruins and discover hidden treasures!",
  symbols: ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"],
  payouts: [
    {
      combination: ["💎", "💎", "💎"],
      multiplier: 10,
      description: "3 Diamonds"
    },
    {
      combination: ["🏺", "🏺", "🏺"],
      multiplier: 8,
      description: "3 Artifacts"
    },
    {
      combination: ["🗿", "🗿", "🗿"],
      multiplier: 7,
      description: "3 Statues"
    },
    {
      combination: ["🔱", "🔱", "🔱"],
      multiplier: 6,
      description: "3 Tridents"
    },
    {
      combination: ["👑", "👑", "👑"],
      multiplier: 5,
      description: "3 Crowns"
    },
    {
      combination: ["🐍", "🐍", "🐍"],
      multiplier: 5,
      description: "3 Snakes"
    },
    {
      combination: ["🗡️", "🗡️", "🗡️"],
      multiplier: 4,
      description: "3 Swords"
    },
    {
      combination: ["🧭", "🧭", "🧭"],
      multiplier: 3,
      description: "3 Compasses"
    },
    {
      combination: ["🔥", "🔥", "🔥"],
      multiplier: 3,
      description: "3 Fires"
    },
    {
      combination: ["🪙", "🪙", "🪙"],
      multiplier: 2,
      description: "3 Coins"
    }
  ],
  specialSymbols: [
    {
      symbol: "💎",
      name: "Diamond",
      description: "The highest paying symbol. Land 3 to win 10x!",
      multiplier: 10
    },
    {
      symbol: "🐍",
      name: "Snake",
      description: "Beware the snake! It can multiply your winnings or steal them.",
      multiplier: 5
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "💎",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a temple-themed background animation component
const TempleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Fireflies/dust particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-300"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
            scale: Math.random() * 0.5 + 0.2
          }}
          animate={{
            y: [null, '-15%'],
            opacity: [null, 0],
            scale: [null, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeOut',
            delay: Math.random() * 10
          }}
        />
      ))}
      
      {/* Light rays */}
      <div className="absolute top-0 left-1/4 right-1/4 h-64 bg-gradient-to-b from-amber-500/10 to-transparent transform -skew-x-12 opacity-30" />
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-900/30 to-transparent opacity-30" />
      
      {/* Torch light effects */}
      <motion.div
        className="absolute right-10 top-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      
      <motion.div
        className="absolute left-10 top-40 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 1
        }}
      />
    </div>
  );
};

// Temple Quest game component
const TempleQuest: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundImage: 'linear-gradient(to bottom, #2c1b0f 0%, #1a130d 100%)'
    },
    reelsContainer: {
      background: 'rgba(30, 20, 10, 0.8)',
      boxShadow: '0 0 15px rgba(255, 180, 0, 0.1), inset 0 0 5px rgba(255, 200, 0, 0.1)',
      backdropFilter: 'blur(3px)',
      border: '1px solid rgba(150, 100, 50, 0.5)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(50, 30, 20, 0.8), rgba(30, 20, 10, 0.9))',
      boxShadow: '0 0 10px rgba(255, 200, 0, 0.1)',
      border: '1px solid rgba(180, 120, 40, 0.3)'
    },
    button: {
      background: 'linear-gradient(45deg, #b45309 0%, #f59e0b 50%, #b45309 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <TempleBackground />
      <BaseSlotGame
        config={templeQuestConfig}
        gameId={102}
        customStyles={customStyles}
      />
    </div>
  );
};

export default TempleQuest;