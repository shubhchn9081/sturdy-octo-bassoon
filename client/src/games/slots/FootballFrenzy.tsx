import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';
import EnhancedSlotGame from './EnhancedSlotGame';

// Football Frenzy configuration
const footballFrenzyConfig: SlotConfiguration = {
  name: "Football Frenzy",
  theme: "sports",
  description: "Experience the thrill of the beautiful game with Football Frenzy slots. Match football symbols to score big wins and championship rewards!",
  symbols: ["⚽", "🏆", "👟", "🥅", "🏟️", "🧤", "🥇", "🎽", "🚩", "📣"],
  payouts: [
    { combination: ["⚽", "⚽", "⚽"], multiplier: 10, description: "Hat-Trick - Jackpot" },
    { combination: ["🏆", "🏆", "🏆"], multiplier: 8, description: "Championship Trophy" },
    { combination: ["👟", "👟", "👟"], multiplier: 7, description: "Golden Boots" },
    { combination: ["🥅", "🥅", "🥅"], multiplier: 6, description: "Goal Post" },
    { combination: ["🏟️", "🏟️", "🏟️"], multiplier: 5, description: "Stadium Roar" },
    { combination: ["🧤", "🧤", "🧤"], multiplier: 4, description: "Goalkeeper Gloves" },
    { combination: ["🥇", "🥇", "🥇"], multiplier: 3, description: "Gold Medal" },
    { combination: ["🎽", "🎽", "🎽"], multiplier: 3, description: "Team Jersey" },
    { combination: ["🚩", "🚩", "🚩"], multiplier: 2, description: "Corner Flag" },
    { combination: ["📣", "📣", "📣"], multiplier: 2, description: "Fan Cheer" }
  ],
  specialSymbols: [
    { 
      symbol: "⚽", 
      name: "Football", 
      description: "The highest paying symbol. Three footballs score the ultimate goal!", 
      multiplier: 10 
    },
    { 
      symbol: "🏆", 
      name: "Trophy", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🏆",
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles
const customStyles = {
  container: {
    backgroundImage: 'linear-gradient(to bottom, rgba(0, 80, 30, 0.8) 0%, rgba(0, 40, 15, 1) 100%)',
    boxShadow: '0 0 20px rgba(0, 200, 80, 0.3)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(10, 90, 40, 0.8), rgba(5, 45, 20, 0.8))',
    border: '1px solid rgba(0, 200, 80, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(0, 200, 80, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(5, 80, 35, 0.9), rgba(2, 40, 17, 0.9))',
    border: '1px solid rgba(0, 200, 80, 0.2)'
  }
};

const FootballFrenzy: React.FC = () => {
  return (
    <EnhancedSlotGame
      config={footballFrenzyConfig}
      gameId={105}
      themeId="football-frenzy"
    />
  );
};

export default FootballFrenzy;