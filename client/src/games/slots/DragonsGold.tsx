import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Dragon's Gold configuration
const dragonsGoldConfig: SlotConfiguration = {
  name: "Dragon's Gold",
  theme: "fantasy",
  description: "Face fierce dragons and win their treasured hoards!",
  symbols: ["🐉", "🔥", "🏰", "⚔️", "🛡️", "📜", "💰", "🧙", "🏆", "🔮"],
  payouts: [
    {
      combination: ["🐉", "🐉", "🐉"],
      multiplier: 10,
      description: "3 Dragons"
    },
    {
      combination: ["💰", "💰", "💰"],
      multiplier: 8,
      description: "3 Treasures"
    },
    {
      combination: ["🔥", "🔥", "🔥"],
      multiplier: 7,
      description: "3 Flames"
    },
    {
      combination: ["🏰", "🏰", "🏰"],
      multiplier: 6,
      description: "3 Castles"
    },
    {
      combination: ["⚔️", "⚔️", "⚔️"],
      multiplier: 5,
      description: "3 Swords"
    },
    {
      combination: ["🛡️", "🛡️", "🛡️"],
      multiplier: 5,
      description: "3 Shields"
    },
    {
      combination: ["🧙", "🧙", "🧙"],
      multiplier: 4,
      description: "3 Wizards"
    },
    {
      combination: ["📜", "📜", "📜"],
      multiplier: 3,
      description: "3 Scrolls"
    },
    {
      combination: ["🏆", "🏆", "🏆"],
      multiplier: 3,
      description: "3 Trophies"
    },
    {
      combination: ["🔮", "🔮", "🔮"],
      multiplier: 2,
      description: "3 Orbs"
    }
  ],
  specialSymbols: [
    {
      symbol: "🐉",
      name: "Dragon",
      description: "The mighty dragon symbol awards the highest payout of 10x!",
      multiplier: 10
    },
    {
      symbol: "🔥",
      name: "Dragon Fire",
      description: "The dragon's fire can spread to adjacent symbols for extra wins!",
      multiplier: 7
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🐉",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a fantasy-themed background animation component
const DragonBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating embers */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-400"
          initial={{
            x: Math.random() * 100 + '%',
            y: 100 + '%',
            opacity: Math.random() * 0.6 + 0.4,
            scale: Math.random() * 0.7 + 0.3
          }}
          animate={{
            y: [null, '-100%'],
            opacity: [null, 0],
            scale: [null, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 6,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeOut',
            delay: Math.random() * 5
          }}
        />
      ))}
      
      {/* Dragon shadow effect occasionally */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-full opacity-0"
        style={{
          backgroundImage: 'url(/assets/dragon-shadow.png)',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
        animate={{
          opacity: [0, 0.1, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'loop',
          times: [0, 0.2, 1],
          repeatDelay: 20
        }}
      />
      
      {/* Fire glow at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-orange-700/40 to-transparent"
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      
      {/* Glowing treasures */}
      <motion.div
        className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      
      <motion.div
        className="absolute bottom-5 left-10 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 2
        }}
      />
    </div>
  );
};

// Dragon's Gold game component
const DragonsGold: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundImage: 'linear-gradient(to bottom, #2a0c34 0%, #16071c 100%)'
    },
    reelsContainer: {
      background: 'rgba(30, 10, 30, 0.8)',
      boxShadow: '0 0 15px rgba(200, 0, 255, 0.1), inset 0 0 5px rgba(200, 0, 255, 0.1)',
      backdropFilter: 'blur(3px)',
      border: '1px solid rgba(130, 50, 150, 0.5)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(50, 20, 60, 0.8), rgba(30, 10, 30, 0.9))',
      boxShadow: '0 0 10px rgba(200, 0, 255, 0.1)',
      border: '1px solid rgba(150, 70, 180, 0.3)'
    },
    button: {
      background: 'linear-gradient(45deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <DragonBackground />
      <BaseSlotGame
        config={dragonsGoldConfig}
        gameId={103}
        customStyles={customStyles}
      />
    </div>
  );
};

export default DragonsGold;