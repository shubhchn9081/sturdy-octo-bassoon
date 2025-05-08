import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import EnhancedSlotGame from './EnhancedSlotGame';

// Temple Quest configuration
const templeQuestConfig: SlotConfiguration = {
  name: "Temple Quest",
  theme: "adventure",
  description: "Venture deep into an ancient temple filled with treasures and mysteries. Match the right artifacts to claim the treasures of a lost civilization.",
  symbols: ["💎", "🏺", "🗿", "🔱", "👑", "🐍", "🗡️", "🧭", "🔥", "🪙"],
  payouts: [
    { combination: ["💎", "💎", "💎"], multiplier: 10, description: "Diamond Treasure - Highest Payout" },
    { combination: ["🏺", "🏺", "🏺"], multiplier: 8, description: "Ancient Artifact" },
    { combination: ["🗿", "🗿", "🗿"], multiplier: 7, description: "Stone Guardian" },
    { combination: ["🔱", "🔱", "🔱"], multiplier: 6, description: "Trident of Power" },
    { combination: ["👑", "👑", "👑"], multiplier: 5, description: "Royal Crown" },
    { combination: ["🐍", "🐍", "🐍"], multiplier: 4, description: "Temple Serpent" },
    { combination: ["🗡️", "🗡️", "🗡️"], multiplier: 3, description: "Ancient Dagger" },
    { combination: ["🧭", "🧭", "🧭"], multiplier: 3, description: "Explorer's Compass" },
    { combination: ["🔥", "🔥", "🔥"], multiplier: 2, description: "Sacred Flame" },
    { combination: ["🪙", "🪙", "🪙"], multiplier: 2, description: "Ancient Coin" }
  ],
  specialSymbols: [
    { 
      symbol: "💎", 
      name: "Diamond", 
      description: "The highest paying symbol. Three diamonds reveal the temple's greatest treasure!", 
      multiplier: 10 
    },
    { 
      symbol: "🪙", 
      name: "Ancient Coin", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🪙",
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles
const customStyles = {
  container: {
    backgroundImage: 'linear-gradient(to bottom, rgba(64, 36, 0, 0.8) 0%, rgba(32, 18, 0, 1) 100%)',
    boxShadow: '0 0 20px rgba(255, 180, 0, 0.2)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(80, 50, 10, 0.8), rgba(40, 25, 5, 0.8))',
    border: '1px solid rgba(255, 180, 0, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(255, 180, 0, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(70, 40, 5, 0.9), rgba(35, 20, 2, 0.9))',
    border: '1px solid rgba(255, 180, 0, 0.2)'
  }
};

const TempleQuest: React.FC = () => {
  return (
    <EnhancedSlotGame
      config={templeQuestConfig}
      gameId={102}
      themeId="temple-quest"
    />
  );
};

export default TempleQuest;