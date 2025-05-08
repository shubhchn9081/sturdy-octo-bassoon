import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Dragons Gold symbols
const dragonsGoldLogo = '/images/games/slots/fantasy/dragons_gold_logo.png';
const dragonRed = '/images/games/slots/fantasy/dragon_red.png';
const dragonGold = '/images/games/slots/fantasy/dragon_gold.png';
const dragonRedFace = '/images/games/slots/fantasy/dragon_red_face.png';
const coinDragon = '/images/games/slots/fantasy/coin_dragon.png';
const mushroomRed = '/images/games/slots/fantasy/mushroom_red.png';

// Dragons Gold configuration
const dragonsGoldConfig: SlotConfiguration = {
  name: "Dragon's Gold",
  theme: "fantasy",
  description: "Venture into the dragon's lair and spin to win the legendary treasure. Match mystical symbols and awaken the dragon for massive rewards.",
  symbols: [
    dragonsGoldLogo,
    dragonRed,
    dragonGold,
    dragonRedFace,
    coinDragon,
    mushroomRed
  ],
  payouts: [
    { combination: [dragonsGoldLogo, dragonsGoldLogo, dragonsGoldLogo], multiplier: 10, description: "Dragon's Gold - Jackpot" },
    { combination: [dragonRed, dragonRed, dragonRed], multiplier: 8, description: "Red Dragon" },
    { combination: [dragonGold, dragonGold, dragonGold], multiplier: 7, description: "Gold Dragon" },
    { combination: [dragonRedFace, dragonRedFace, dragonRedFace], multiplier: 6, description: "Dragon Face" },
    { combination: [coinDragon, coinDragon, coinDragon], multiplier: 5, description: "Dragon Coin" },
    { combination: [mushroomRed, mushroomRed, mushroomRed], multiplier: 4, description: "Magic Mushroom" }
  ],
  specialSymbols: [
    { 
      symbol: dragonRed, 
      name: "Red Dragon", 
      description: "The highest paying symbol. Three dragons unleash the ultimate power!", 
      multiplier: 10 
    },
    { 
      symbol: coinDragon, 
      name: "Dragon Coin", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: coinDragon,
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
    <BaseSlotGame config={dragonsGoldConfig} gameId={104} customStyles={customStyles} />
  );
};

export default DragonsGold;