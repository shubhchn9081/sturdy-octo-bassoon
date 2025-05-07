import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Football Frenzy configuration
const footballFrenzyConfig: SlotConfiguration = {
  name: "Football Frenzy",
  theme: "sports",
  description: "Score big wins with this football-themed slot game!",
  symbols: ["⚽", "🏆", "👟", "🥅", "🧤", "🏟️", "🎽", "🚩", "🎖️", "🎯"],
  payouts: [
    {
      combination: ["⚽", "⚽", "⚽"],
      multiplier: 10,
      description: "Three Footballs"
    },
    {
      combination: ["🏆", "🏆", "🏆"],
      multiplier: 8,
      description: "Three Trophies"
    },
    {
      combination: ["👟", "👟", "👟"],
      multiplier: 6,
      description: "Three Boots"
    },
    {
      combination: ["🥅", "🥅", "🥅"],
      multiplier: 5,
      description: "Three Goals"
    },
    {
      combination: ["🧤", "🧤", "🧤"],
      multiplier: 5,
      description: "Three Gloves"
    },
    {
      combination: ["🏟️", "🏟️", "🏟️"],
      multiplier: 4,
      description: "Three Stadiums"
    },
    {
      combination: ["🎽", "🎽", "🎽"],
      multiplier: 3,
      description: "Three Jerseys"
    },
    {
      combination: ["🚩", "🚩", "🚩"],
      multiplier: 3,
      description: "Three Flags"
    },
    {
      combination: ["🎖️", "🎖️", "🎖️"],
      multiplier: 2,
      description: "Three Medals"
    },
    {
      combination: ["🎯", "🎯", "🎯"],
      multiplier: 2,
      description: "Three Targets"
    }
  ],
  specialSymbols: [
    {
      symbol: "⚽",
      name: "Football",
      description: "Score a goal with this top-paying symbol! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "🏆",
      name: "Trophy",
      description: "The champion's prize! Brings bonus winnings to your bet.",
      multiplier: 8
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "⚽",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a sports-themed background animation component
const SportsBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Football pitch background */}
      <div className="absolute inset-0 bg-green-800/90"></div>
      
      {/* Field lines */}
      <div className="absolute inset-0">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-48 h-48 border-4 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/20 -translate-x-1/2"></div>
        
        {/* Center spot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Penalty boxes */}
        <div className="absolute top-1/2 left-0 w-32 h-80 border-r-4 border-white/20 -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-32 h-80 border-l-4 border-white/20 -translate-y-1/2"></div>
        
        {/* Goal boxes */}
        <div className="absolute top-1/2 left-0 w-12 h-40 border-r-4 border-white/20 -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-12 h-40 border-l-4 border-white/20 -translate-y-1/2"></div>
        
        {/* Penalty spots */}
        <div className="absolute top-1/2 left-24 w-3 h-3 bg-white/20 rounded-full -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-24 w-3 h-3 bg-white/20 rounded-full -translate-y-1/2"></div>
        
        {/* Corner arcs */}
        <div className="absolute top-0 left-0 w-8 h-8 border-r-4 border-white/20 rounded-br-full"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-l-4 border-white/20 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-r-4 border-white/20 rounded-tr-full"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-l-4 border-white/20 rounded-tl-full"></div>
      </div>
      
      {/* Field texture */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%), linear-gradient(transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%)',
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Moving crowd shadow */}
      <div className="absolute -top-16 left-0 right-0 h-20 opacity-10">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center'
          }}
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      </div>
      
      {/* Animated football */}
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-white/30"
        style={{
          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
        }}
        initial={{ x: -50, y: 100 }}
        animate={{
          x: [0, 100, 250, 350, 450, 550, 650],
          y: [0, -100, -50, -150, -50, -100, 0],
          scale: [0.7, 1, 1, 1, 1, 1, 0.7],
          opacity: [0, 0.7, 0.7, 0.7, 0.7, 0.7, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatDelay: 5
        }}
      />
      
      {/* Animated crowd cheering effect */}
      <div className="absolute -top-5 inset-x-0 h-10 flex justify-center overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-4 mx-1 bg-white/10 rounded-full"
            animate={{
              height: [4, 12, 4]
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: Math.random() * 0.5
            }}
          />
        ))}
      </div>
      
      {/* Stadium lights effect */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i + 'light'}
          className="absolute w-20 h-20 rounded-full blur-2xl"
          style={{
            top: '-10%',
            left: (i * 25 + 10) + '%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)'
          }}
          animate={{
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
    </div>
  );
};

// Football Frenzy game component
const FootballFrenzy: React.FC = () => {
  const customStyles = {
    container: {
      position: 'relative' as const,
      backgroundColor: '#166534'
    },
    reelsContainer: {
      background: 'rgba(22, 101, 52, 0.8)',
      boxShadow: '0 0 15px rgba(134, 239, 172, 0.1), inset 0 0 5px rgba(134, 239, 172, 0.1)',
      border: '1px solid rgba(134, 239, 172, 0.2)',
      backdropFilter: 'blur(3px)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(30, 130, 76, 0.8), rgba(22, 101, 52, 0.9))',
      boxShadow: '0 0 10px rgba(134, 239, 172, 0.1)',
      border: '1px solid rgba(134, 239, 172, 0.2)'
    },
    button: {
      background: 'linear-gradient(45deg, #166534 0%, #22c55e 50%, #166534 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <SportsBackground />
      <BaseSlotGame
        config={footballFrenzyConfig}
        gameId={105}
        customStyles={customStyles}
      />
    </div>
  );
};

export default FootballFrenzy;