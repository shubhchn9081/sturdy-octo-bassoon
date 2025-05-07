import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Cosmic Spins configuration
const cosmicSpinsConfig: SlotConfiguration = {
  name: "Cosmic Spins",
  theme: "space",
  description: "Spin through the cosmos and win stellar prizes!",
  symbols: ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"],
  payouts: [
    {
      combination: ["🚀", "🚀", "🚀"],
      multiplier: 10,
      description: "Three Rockets"
    },
    {
      combination: ["🪐", "🪐", "🪐"],
      multiplier: 8,
      description: "Three Planets"
    },
    {
      combination: ["🌎", "🌎", "🌎"],
      multiplier: 7,
      description: "Three Earths"
    },
    {
      combination: ["🌙", "🌙", "🌙"],
      multiplier: 6,
      description: "Three Moons"
    },
    {
      combination: ["☄️", "☄️", "☄️"],
      multiplier: 5,
      description: "Three Comets"
    },
    {
      combination: ["🛸", "🛸", "🛸"],
      multiplier: 4,
      description: "Three UFOs"
    },
    {
      combination: ["👽", "👽", "👽"],
      multiplier: 4,
      description: "Three Aliens"
    },
    {
      combination: ["⭐", "⭐", "⭐"],
      multiplier: 3,
      description: "Three Stars"
    },
    {
      combination: ["🌌", "🌌", "🌌"],
      multiplier: 3,
      description: "Three Galaxies"
    },
    {
      combination: ["🔭", "🔭", "🔭"],
      multiplier: 2,
      description: "Three Telescopes"
    }
  ],
  specialSymbols: [
    {
      symbol: "🚀",
      name: "Rocket",
      description: "The highest paying symbol! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "🛸",
      name: "UFO",
      description: "The UFO may abduct your symbols for special prizes!",
      multiplier: 4
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🚀",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a space-themed background animation component
const CosmicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Space background with stars */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/40 to-black/80"></div>
      
      {/* Animated stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.7 + 0.3
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: Math.random() * 2
          }}
        />
      ))}
      
      {/* Animated nebulas */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i + 'nebula'}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 150 + Math.random() * 100 + 'px',
            height: 150 + Math.random() * 100 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            backgroundColor: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 200 + 50)}, 0.1)`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
      
      {/* Shooting stars */}
      <motion.div
        className="absolute w-0.5 h-0.5 bg-white shadow-[0_0_2px_1px_rgba(255,255,255,0.5)]"
        style={{ top: '10%', left: '80%' }}
        animate={{
          x: [-10, -200],
          y: [0, 170],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 5
        }}
      />
      
      <motion.div
        className="absolute w-0.5 h-0.5 bg-white shadow-[0_0_2px_1px_rgba(255,255,255,0.5)]"
        style={{ top: '40%', left: '20%' }}
        animate={{
          x: [0, 200],
          y: [0, 120],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 7
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
      backgroundImage: 'linear-gradient(to bottom, #0e0a2a 0%, #090218 100%)'
    },
    reelsContainer: {
      background: 'rgba(13, 10, 38, 0.8)',
      boxShadow: '0 0 15px rgba(138, 43, 226, 0.1), inset 0 0 5px rgba(138, 43, 226, 0.1)',
      border: '1px solid rgba(138, 43, 226, 0.2)',
      backdropFilter: 'blur(3px)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(20, 15, 50, 0.8), rgba(13, 10, 38, 0.9))',
      boxShadow: '0 0 10px rgba(138, 43, 226, 0.1)',
      border: '1px solid rgba(138, 43, 226, 0.2)'
    },
    button: {
      background: 'linear-gradient(45deg, #6d28d9 0%, #8b5cf6 50%, #6d28d9 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <CosmicBackground />
      <BaseSlotGame
        config={cosmicSpinsConfig}
        gameId={101}
        customStyles={customStyles}
      />
    </div>
  );
};

export default CosmicSpins;