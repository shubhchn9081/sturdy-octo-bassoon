import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Football Frenzy configuration
const footballFrenzyConfig: SlotConfiguration = {
  name: "Football Frenzy",
  theme: "sports",
  description: "Score big wins with this soccer-themed slot!",
  symbols: ["⚽", "🥅", "👟", "🏆", "🏟️", "🧤", "🥇", "🎯", "🎪", "🎲"],
  payouts: [
    {
      combination: ["⚽", "⚽", "⚽"],
      multiplier: 10,
      description: "Three Balls"
    },
    {
      combination: ["🏆", "🏆", "🏆"],
      multiplier: 8,
      description: "Three Cups"
    },
    {
      combination: ["🥅", "🥅", "🥅"],
      multiplier: 7,
      description: "Three Goals"
    },
    {
      combination: ["👟", "👟", "👟"],
      multiplier: 6,
      description: "Three Boots"
    },
    {
      combination: ["🏟️", "🏟️", "🏟️"],
      multiplier: 5,
      description: "Three Stadiums"
    },
    {
      combination: ["🧤", "🧤", "🧤"],
      multiplier: 5,
      description: "Three Gloves"
    },
    {
      combination: ["🥇", "🥇", "🥇"],
      multiplier: 4,
      description: "Three Medals"
    },
    {
      combination: ["🎯", "🎯", "🎯"],
      multiplier: 3,
      description: "Three Targets"
    },
    {
      combination: ["🎪", "🎪", "🎪"],
      multiplier: 3,
      description: "Three Tents"
    },
    {
      combination: ["🎲", "🎲", "🎲"],
      multiplier: 2,
      description: "Three Dice"
    }
  ],
  specialSymbols: [
    {
      symbol: "⚽",
      name: "Football",
      description: "The highest paying symbol! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "🏆",
      name: "Trophy",
      description: "The trophy symbol can trigger bonus free spins!",
      multiplier: 8
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "⚽",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a sports-themed background animation component
const FootballBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stadium light effects */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-900/30 to-transparent"></div>
      
      {/* Animated crowd cheering effect */}
      <div className="absolute inset-x-0 top-0 h-16 overflow-hidden">
        <motion.div 
          className="w-full h-32 opacity-10"
          style={{
            backgroundImage: 'url(/assets/crowd-pattern.png)',
            backgroundSize: '100px',
          }}
          animate={{
            y: [-10, 0, -10]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      </div>
      
      {/* Stadium light flashes */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: '120px',
            height: '120px',
            left: (25 * (i + 1)) + '%',
            top: '5%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateX(-50%)'
          }}
          animate={{
            opacity: [0.05, 0.2, 0.05]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: Math.random() * 2
          }}
        />
      ))}
      
      {/* Football field lines */}
      <div className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: 'linear-gradient(to right, transparent, transparent 48%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.3) 52%, transparent 52%, transparent 100%), linear-gradient(to bottom, transparent, transparent 48%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.3) 52%, transparent 52%, transparent 100%)',
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Center circle */}
      <div className="absolute left-1/2 top-1/2 w-32 h-32 rounded-full border-2 border-white/10 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Goal box shadows */}
      <div className="absolute bottom-0 left-1/2 w-64 h-32 border-2 border-white/5 transform -translate-x-1/2"></div>
    </div>
  );
};

// Football Frenzy game component
const FootballFrenzy: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundImage: 'linear-gradient(to bottom, #1e392a 0%, #0d1a13 100%)'
    },
    reelsContainer: {
      background: 'rgba(20, 40, 20, 0.8)',
      boxShadow: '0 0 15px rgba(0, 255, 0, 0.05), inset 0 0 5px rgba(0, 255, 0, 0.05)',
      backdropFilter: 'blur(3px)',
      border: '1px solid rgba(50, 130, 50, 0.3)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(20, 40, 20, 0.8), rgba(10, 30, 10, 0.9))',
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.05)',
      border: '1px solid rgba(70, 130, 70, 0.2)'
    },
    button: {
      background: 'linear-gradient(45deg, #15803d 0%, #22c55e 50%, #15803d 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <FootballBackground />
      <BaseSlotGame
        config={footballFrenzyConfig}
        gameId={105}
        customStyles={customStyles}
      />
    </div>
  );
};

export default FootballFrenzy;