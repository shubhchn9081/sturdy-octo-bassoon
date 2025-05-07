import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import { motion } from 'framer-motion';

// Define the Dragons Gold configuration
const dragonsGoldConfig: SlotConfiguration = {
  name: "Dragon's Gold",
  theme: "fantasy",
  description: "Battle mythical dragons and claim their golden treasures!",
  symbols: ["🐉", "🏰", "🧙‍♂️", "⚔️", "🛡️", "🔮", "💰", "🧪", "📜", "🗝️"],
  payouts: [
    {
      combination: ["🐉", "🐉", "🐉"],
      multiplier: 10,
      description: "Three Dragons"
    },
    {
      combination: ["🏰", "🏰", "🏰"],
      multiplier: 8,
      description: "Three Castles"
    },
    {
      combination: ["🧙‍♂️", "🧙‍♂️", "🧙‍♂️"],
      multiplier: 7,
      description: "Three Wizards"
    },
    {
      combination: ["⚔️", "⚔️", "⚔️"],
      multiplier: 6,
      description: "Three Swords"
    },
    {
      combination: ["🛡️", "🛡️", "🛡️"],
      multiplier: 5,
      description: "Three Shields"
    },
    {
      combination: ["🔮", "🔮", "🔮"],
      multiplier: 5,
      description: "Three Crystal Balls"
    },
    {
      combination: ["💰", "💰", "💰"],
      multiplier: 4,
      description: "Three Treasure Bags"
    },
    {
      combination: ["🧪", "🧪", "🧪"],
      multiplier: 3,
      description: "Three Potions"
    },
    {
      combination: ["📜", "📜", "📜"],
      multiplier: 2,
      description: "Three Scrolls"
    },
    {
      combination: ["🗝️", "🗝️", "🗝️"],
      multiplier: 2,
      description: "Three Keys"
    }
  ],
  specialSymbols: [
    {
      symbol: "🐉",
      name: "Dragon",
      description: "The mighty dragon guards the biggest treasures! Land 3 for a 10x payout.",
      multiplier: 10
    },
    {
      symbol: "💰",
      name: "Dragon's Gold",
      description: "The coveted treasure of the dragon's hoard! Brings bonus coins.",
      multiplier: 4
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🐉",
  luckyMultiplier: 15,
  reelCount: 3
};

// Create a fantasy-themed background animation component
const FantasyBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Fantasy background with misty mountains */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-teal-800/40 to-slate-900/80"></div>
      
      {/* Distant mountains */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,400 L0,250 Q100,200 200,280 Q300,350 400,300 Q500,250 600,280 Q700,310 800,250 Q900,190 1000,230 Q1100,270 1200,250 L1200,400 Z"
            fill="#1a202c"
          />
          <path
            d="M0,400 L0,280 Q100,250 200,320 Q300,380 400,340 Q500,300 600,330 Q700,360 800,300 Q900,240 1000,280 Q1100,320 1200,300 L1200,400 Z"
            fill="#2d3748"
          />
        </svg>
      </div>
      
      {/* Magical mist */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i + 'mist'}
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: 200 + Math.random() * 150 + 'px',
            height: 100 + Math.random() * 100 + 'px',
            bottom: 20 + (i * 10) + '%',
            left: (i * 20) + '%',
            backgroundColor: `rgba(${Math.floor(Math.random() * 50 + 150)}, ${Math.floor(Math.random() * 50 + 150)}, ${Math.floor(Math.random() * 50 + 200)}, 0.1)`,
          }}
          animate={{
            x: [0, 20, 0],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
      
      {/* Floating magic particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i + 'particle'}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            left: Math.random() * 100 + '%',
            bottom: Math.random() * 70 + '%',
            backgroundColor: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, 0.8)`,
            boxShadow: `0 0 ${Math.random() * 5 + 2}px rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, 0.8)`
          }}
          animate={{
            y: [-20, -60],
            x: [0, Math.random() * 40 - 20],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10
          }}
        />
      ))}
      
      {/* Dragon silhouette */}
      <motion.div
        className="absolute w-32 h-24 opacity-10"
        style={{
          top: '10%',
          right: '10%',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 60\'%3E%3Cpath d=\'M10,30 C20,10 30,5 60,5 C70,0 80,10 90,15 C95,25 90,35 85,40 C75,45 65,35 60,30 C50,25 40,35 30,40 C20,45 5,40 10,30 Z\' fill=\'%23ffffff\'/%3E%3C/svg%3E")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(10deg)'
        }}
        animate={{
          y: [0, 10, 0],
          x: [0, 5, 0],
          rotate: [10, 15, 10]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      
      {/* Castle silhouette */}
      <div
        className="absolute w-48 h-32 opacity-5"
        style={{
          bottom: '20%',
          left: '10%',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 60\'%3E%3Cpath d=\'M10,60 L10,30 L20,30 L20,20 L30,20 L30,10 L40,10 L40,30 L50,10 L60,30 L60,10 L70,10 L70,20 L80,20 L80,30 L90,30 L90,60 Z\' fill=\'%23ffffff\'/%3E%3C/svg%3E")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
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
      backgroundImage: 'linear-gradient(to bottom, #0f766e 0%, #134e4a 100%)'
    },
    reelsContainer: {
      background: 'rgba(15, 118, 110, 0.7)',
      boxShadow: '0 0 15px rgba(134, 239, 172, 0.1), inset 0 0 5px rgba(134, 239, 172, 0.1)',
      border: '1px solid rgba(134, 239, 172, 0.2)',
      backdropFilter: 'blur(3px)'
    },
    reel: {
      background: 'linear-gradient(145deg, rgba(20, 83, 81, 0.8), rgba(15, 118, 110, 0.9))',
      boxShadow: '0 0 10px rgba(134, 239, 172, 0.1)',
      border: '1px solid rgba(134, 239, 172, 0.2)'
    },
    button: {
      background: 'linear-gradient(45deg, #0f766e 0%, #14b8a6 50%, #0f766e 100%)',
      color: 'white'
    }
  };

  return (
    <div className="relative h-full">
      <FantasyBackground />
      <BaseSlotGame
        config={dragonsGoldConfig}
        gameId={104}
        customStyles={customStyles}
      />
    </div>
  );
};

export default DragonsGold;