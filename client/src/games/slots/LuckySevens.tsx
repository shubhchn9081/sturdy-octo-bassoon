import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Lucky Sevens configuration
const luckySevenConfig: SlotConfiguration = {
  name: "Lucky Sevens",
  theme: "classic",
  description: "A classic slot machine experience with a modern twist. The lucky number 7 could be your ticket to massive wins in this timeless game.",
  symbols: ["7️⃣", "🍒", "🔔", "💰", "⭐", "🍇", "🍊", "🍋", "🍉", "♦️"],
  payouts: [
    { combination: ["7️⃣", "7️⃣", "7️⃣"], multiplier: 10, description: "Lucky Sevens - Jackpot" },
    { combination: ["🍒", "🍒", "🍒"], multiplier: 7, description: "Cherry Combo" },
    { combination: ["🔔", "🔔", "🔔"], multiplier: 6, description: "Bell Rings" },
    { combination: ["💰", "💰", "💰"], multiplier: 5, description: "Money Bags" },
    { combination: ["⭐", "⭐", "⭐"], multiplier: 4, description: "Star Power" },
    { combination: ["🍇", "🍇", "🍇"], multiplier: 3, description: "Grape Bunch" },
    { combination: ["🍊", "🍊", "🍊"], multiplier: 3, description: "Orange Trio" },
    { combination: ["🍋", "🍋", "🍋"], multiplier: 2, description: "Lemon Zest" },
    { combination: ["🍉", "🍉", "🍉"], multiplier: 2, description: "Watermelon Slice" },
    { combination: ["♦️", "♦️", "♦️"], multiplier: 2, description: "Diamond Suit" }
  ],
  specialSymbols: [
    { 
      symbol: "7️⃣", 
      name: "Lucky Seven", 
      description: "The highest paying symbol. Three 7's bring the ultimate luck!", 
      multiplier: 10 
    },
    { 
      symbol: "🔔", 
      name: "Bell", 
      description: "The special bonus symbol. When appearing with any winning combination, it rings in extra luck with a 0.5x multiplier boost.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "🔔",
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles
const customStyles = {
  container: {
    backgroundImage: 'linear-gradient(to bottom, rgba(80, 0, 150, 0.8) 0%, rgba(30, 0, 60, 1) 100%)',
    boxShadow: '0 0 20px rgba(180, 100, 255, 0.3)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(90, 10, 160, 0.8), rgba(50, 5, 90, 0.8))',
    border: '1px solid rgba(180, 100, 255, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(180, 100, 255, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(80, 5, 140, 0.9), rgba(40, 2, 70, 0.9))',
    border: '1px solid rgba(180, 100, 255, 0.2)'
  }
};

const LuckySevens: React.FC = () => {
  return (
    <BaseSlotGame config={luckySevenConfig} gameId={103} customStyles={customStyles} />
  );
};

export default LuckySevens;