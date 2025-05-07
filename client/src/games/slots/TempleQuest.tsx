import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Temple Quest configuration
const templeQuestConfig: SlotConfiguration = {
  name: "Temple Quest",
  theme: "adventure",
  description: "Embark on an ancient temple adventure for treasures!",
  symbols: ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"],
  payouts: [
    {
      combination: ["💎", "💎", "💎"],
      multiplier: 10,
      description: "Three Diamonds"
    },
    {
      combination: ["🏺", "🏺", "🏺"],
      multiplier: 8,
      description: "Three Artifacts"
    },
    {
      combination: ["🗿", "🗿", "🗿"],
      multiplier: 7,
      description: "Three Statues"
    },
    {
      combination: ["🔱", "🔱", "🔱"],
      multiplier: 6,
      description: "Three Tridents"
    },
    {
      combination: ["👑", "👑", "👑"],
      multiplier: 5,
      description: "Three Crowns"
    },
    {
      combination: ["🐍", "🐍", "🐍"],
      multiplier: 4,
      description: "Three Snakes"
    },
    {
      combination: ["🗡️", "🗡️", "🗡️"],
      multiplier: 3,
      description: "Three Daggers"
    },
    {
      combination: ["🧭", "🧭", "🧭"],
      multiplier: 3,
      description: "Three Compasses"
    },
    {
      combination: ["🔥", "🔥", "🔥"],
      multiplier: 2,
      description: "Three Fires"
    },
    {
      combination: ["🪙", "🪙", "🪙"],
      multiplier: 2,
      description: "Three Coins"
    }
  ],
  specialSymbols: [
    {
      symbol: "💎",
      name: "Diamond",
      description: "The highest paying symbol! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "🏺",
      name: "Ancient Artifact",
      description: "This ancient artifact holds mysterious powers!",
      multiplier: 8
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "💎",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create an adventure-themed background animation component
const TempleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Temple background with ancient walls */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-orange-800/40 to-amber-950/80"></div>
      
      {/* Animated torch light effects */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl opacity-20"
          style={{
            width: '120px',
            height: '120px',
            left: (25 * (i + 1)) + '%',
            bottom: '30%',
            backgroundColor: 'rgba(255, 150, 50, 0.3)',
            transform: 'translateX(-50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
      
      {/* Temple wall pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(to right, transparent 47%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.3) 52%, transparent 53%), linear-gradient(to bottom, transparent 47%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.3) 52%, transparent 53%)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Temple hieroglyphics */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 2px, transparent 2px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Dust particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i + 'dust'}
          className="absolute rounded-full bg-amber-100/30"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, 50],
            x: [0, Math.random() * 20 - 10],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 10
          }}
        />
      ))}
      
      {/* Temple cracks */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" />
          <feDisplacementMap in="SourceGraphic" scale="10" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

// Temple Quest game component
const TempleQuest: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundImage: 'linear-gradient(to bottom, #693c16 0%, #4d2e10 100%)'
    },
    reelsContainer: {
      background: 'rgba(65, 40, 15, 0.8)',
      boxShadow: '0 0 15px rgba(255, 180, 0, 0.1), inset 0 0 5px rgba(255, 180, 0, 0.1)',
      border: '1px solid rgba(200, 150, 50, 0.3)',
      backdropFilter: 'blur(3px)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(85, 50, 20, 0.8), rgba(65, 40, 15, 0.9))',
      boxShadow: '0 0 10px rgba(255, 180, 0, 0.1)',
      border: '1px solid rgba(200, 150, 50, 0.3)'
    },
    button: {
      background: 'linear-gradient(45deg, #b45309 0%, #d97706 50%, #b45309 100%)',
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