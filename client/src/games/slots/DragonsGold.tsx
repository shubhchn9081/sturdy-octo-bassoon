import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import EnhancedSlotGame from './EnhancedSlotGame';

// Dragons Gold configuration
const dragonsGoldConfig: SlotConfiguration = {
  name: "Dragon's Gold",
  theme: "fantasy",
  description: "Venture into the dragon's lair and spin to win the legendary treasure. Match mystical symbols and awaken the dragon for massive rewards.",
  symbols: ["🐉", "🔥", "🗡️", "🛡️", "👑", "💎", "📜", "🧙", "🏰", "🧪"],
  payouts: [
    { combination: ["🐉", "🐉", "🐉"], multiplier: 10, description: "Dragon's Wrath - Jackpot" },
    { combination: ["🔥", "🔥", "🔥"], multiplier: 8, description: "Dragon Fire" },
    { combination: ["🗡️", "🗡️", "🗡️"], multiplier: 7, description: "Hero's Blade" },
    { combination: ["🛡️", "🛡️", "🛡️"], multiplier: 6, description: "Knight's Shield" },
    { combination: ["👑", "👑", "👑"], multiplier: 5, description: "Royal Crown" },
    { combination: ["💎", "💎", "💎"], multiplier: 4, description: "Precious Gems" },
    { combination: ["📜", "📜", "📜"], multiplier: 3, description: "Ancient Scroll" },
    { combination: ["🧙", "🧙", "🧙"], multiplier: 3, description: "Wizard's Magic" },
    { combination: ["🏰", "🏰", "🏰"], multiplier: 2, description: "Mighty Castle" },
    { combination: ["🧪", "🧪", "🧪"], multiplier: 2, description: "Magic Potion" }
  ],
  specialSymbols: [
    { 
      symbol: "🐉", 
      name: "Dragon", 
      description: "The highest paying symbol. Three dragons unleash the ultimate power!", 
      multiplier: 10 
    },
    { 
      symbol: "💎", 
      name: "Gem", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "💎",
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles
const customStyles = {
  container: {
    backgroundImage: 'linear-gradient(to bottom, rgba(30, 55, 90, 0.8) 0%, rgba(15, 25, 45, 1) 100%)',
    boxShadow: '0 0 20px rgba(100, 160, 255, 0.3)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(40, 65, 100, 0.8), rgba(20, 35, 60, 0.8))',
    border: '1px solid rgba(100, 160, 255, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(100, 160, 255, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(30, 55, 90, 0.9), rgba(15, 30, 50, 0.9))',
    border: '1px solid rgba(100, 160, 255, 0.2)'
  }
};

const DragonsGold: React.FC = () => {
  return (
    <EnhancedSlotGame
      config={dragonsGoldConfig}
      gameId={104}
      themeId="dragons-gold"
    />
  );
};

export default DragonsGold;