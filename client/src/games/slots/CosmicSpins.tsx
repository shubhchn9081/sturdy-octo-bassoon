import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Cosmic Spins configuration
const cosmicSpinsConfig: SlotConfiguration = {
  name: "Cosmic Spins",
  theme: "space",
  description: "Explore the cosmos and match planets to win stellar prizes!",
  symbols: ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"],
  payouts: [
    {
      combination: ["🚀", "🚀", "🚀"],
      multiplier: 10,
      description: "3 Rockets"
    },
    {
      combination: ["🪐", "🪐", "🪐"],
      multiplier: 8,
      description: "3 Saturns"
    },
    {
      combination: ["🌎", "🌎", "🌎"],
      multiplier: 7,
      description: "3 Earths"
    },
    {
      combination: ["🌙", "🌙", "🌙"],
      multiplier: 6,
      description: "3 Moons"
    },
    {
      combination: ["☄️", "☄️", "☄️"],
      multiplier: 5,
      description: "3 Comets"
    },
    {
      combination: ["🛸", "🛸", "🛸"],
      multiplier: 5,
      description: "3 UFOs"
    },
    {
      combination: ["👽", "👽", "👽"],
      multiplier: 4,
      description: "3 Aliens"
    },
    {
      combination: ["⭐", "⭐", "⭐"],
      multiplier: 3,
      description: "3 Stars"
    },
    {
      combination: ["🌌", "🌌", "🌌"],
      multiplier: 3,
      description: "3 Galaxies"
    },
    {
      combination: ["🔭", "🔭", "🔭"],
      multiplier: 2,
      description: "3 Telescopes"
    }
  ],
  specialSymbols: [
    {
      symbol: "🚀",
      name: "Rocket",
      description: "The highest paying symbol in the game. Land 3 to win 10x!",
      multiplier: 10
    },
    {
      symbol: "👽",
      name: "Alien",
      description: "Alien symbols expand to adjacent positions for more wins!",
      multiplier: 4
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🚀",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a space-themed background animation component
const SpaceBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: Math.random() * 0.7 + 0.3,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
      
      {/* Nebula effects */}
      <motion.div
        className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      
      <motion.div
        className="absolute -left-10 -top-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
    </div>
  );
};

// Cosmic Spins game component
const CosmicSpins: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundImage: 'radial-gradient(circle at center, #0f2447 0%, #0A1520 100%)'
    },
    reelsContainer: {
      background: 'rgba(13, 25, 42, 0.8)',
      boxShadow: '0 0 15px rgba(0, 100, 255, 0.2), inset 0 0 5px rgba(0, 150, 255, 0.1)',
      backdropFilter: 'blur(5px)',
      border: '1px solid rgba(30, 64, 175, 0.4)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(20, 30, 50, 0.8), rgba(10, 20, 35, 0.9))',
      boxShadow: '0 0 10px rgba(0, 100, 255, 0.15)',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    button: {
      background: 'linear-gradient(45deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <SpaceBackground />
      <BaseSlotGame
        config={cosmicSpinsConfig}
        gameId={101}
        customStyles={customStyles}
      />
    </div>
  );
};

export default CosmicSpins;