import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Lucky Sevens symbols
const luckySevenSymbol = '/images/games/slots/classic/lucky_seven.png';
const cherriesRedSymbol = '/images/games/slots/classic/cherries_red.png';
const horseshoeGoldSymbol = '/images/games/slots/classic/horseshoe_gold.png';
const coinsStackSymbol = '/images/games/slots/classic/coins_stack.png';
const sevenRedSymbol = '/images/games/slots/classic/seven_red.png';
const sevenRedTripleSymbol = '/images/games/slots/classic/seven_red_triple.png';
const goldBarSymbol = '/images/games/slots/classic/gold_bar.png';

// Lucky Sevens configuration
const luckySevenConfig: SlotConfiguration = {
  name: "Lucky Sevens",
  theme: "classic",
  description: "A classic slot machine experience with a modern twist. The lucky number 7 could be your ticket to massive wins in this timeless game.",
  symbols: [
    luckySevenSymbol,
    cherriesRedSymbol,
    horseshoeGoldSymbol,
    coinsStackSymbol,
    sevenRedSymbol,
    sevenRedTripleSymbol,
    goldBarSymbol
  ],
  payouts: [
    { combination: [sevenRedTripleSymbol, sevenRedTripleSymbol, sevenRedTripleSymbol], multiplier: 10, description: "Lucky Sevens - Jackpot" },
    { combination: [cherriesRedSymbol, cherriesRedSymbol, cherriesRedSymbol], multiplier: 7, description: "Cherry Combo" },
    { combination: [goldBarSymbol, goldBarSymbol, goldBarSymbol], multiplier: 6, description: "Gold Bar Combo" },
    { combination: [coinsStackSymbol, coinsStackSymbol, coinsStackSymbol], multiplier: 5, description: "Money Bags" },
    { combination: [horseshoeGoldSymbol, horseshoeGoldSymbol, horseshoeGoldSymbol], multiplier: 4, description: "Lucky Horseshoe" },
    { combination: [sevenRedSymbol, sevenRedSymbol, sevenRedSymbol], multiplier: 3, description: "Triple Sevens" },
    { combination: [luckySevenSymbol, luckySevenSymbol, luckySevenSymbol], multiplier: 2, description: "Lucky Sevens" }
  ],
  specialSymbols: [
    { 
      symbol: sevenRedTripleSymbol, 
      name: "Lucky Seven", 
      description: "The highest paying symbol. Three 7's bring the ultimate luck!", 
      multiplier: 10 
    },
    { 
      symbol: horseshoeGoldSymbol, 
      name: "Horseshoe", 
      description: "The special bonus symbol. When appearing with any winning combination, it brings extra luck with a 0.5x multiplier boost.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: horseshoeGoldSymbol,
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