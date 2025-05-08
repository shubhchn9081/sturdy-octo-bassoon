import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Aztec Treasures symbols
const aztecTreasuresLogo = '/images/games/slots/aztec/aztec_chief.png';
const sunFace = '/images/games/slots/celestial/sun_face.png';
const crescentMoon = '/images/games/slots/celestial/crescent_moon.png';
const aztecFace = '/images/games/slots/aztec/aztec_face.png';
const stoneFace = '/images/games/slots/aztec/stone_face.png';
const pyramid = '/images/games/slots/aztec/pyramid.png';
const crystals = '/images/games/slots/fantasy/crystals_colorful.png';
const emerald = '/images/games/slots/fantasy/emerald.png';
const diamondBlue = '/images/games/slots/fantasy/diamond_blue.png';
const coinsStack = '/images/games/slots/classic/coins_stack_gold.png';
const bonusPlate = '/images/games/slots/generic/bonus_plate.png';
const wildPlanet = '/images/games/slots/space/wild_planet.png';

// Aztec Treasures configuration
const aztecTreasuresConfig: SlotConfiguration = {
  name: "Aztec Treasures",
  theme: "aztec",
  description: "Uncover the lost treasures of an ancient Aztec civilization in this mystical slot adventure. Match sacred symbols to reveal fortunes beyond imagination!",
  symbols: [
    aztecTreasuresLogo,
    sunFace,
    crescentMoon,
    aztecFace,
    stoneFace,
    pyramid,
    crystals,
    emerald,
    diamondBlue,
    coinsStack,
    bonusPlate,
    wildPlanet
  ],
  payouts: [
    { combination: [wildPlanet, wildPlanet, wildPlanet], multiplier: 15, description: "Wild Planet Jackpot" },
    { combination: [aztecTreasuresLogo, aztecTreasuresLogo, aztecTreasuresLogo], multiplier: 12, description: "Aztec Chief Triple" },
    { combination: [sunFace, sunFace, sunFace], multiplier: 10, description: "Sun God Blessing" },
    { combination: [crescentMoon, crescentMoon, crescentMoon], multiplier: 8, description: "Moon Spirit" },
    { combination: [bonusPlate, bonusPlate, bonusPlate], multiplier: 7, description: "Golden Bonus" },
    { combination: [aztecFace, aztecFace, aztecFace], multiplier: 6, description: "Ancient Guardian" },
    { combination: [stoneFace, stoneFace, stoneFace], multiplier: 5, description: "Stone Idol" },
    { combination: [pyramid, pyramid, pyramid], multiplier: 4, description: "Sacred Temple" },
    { combination: [crystals, crystals, crystals], multiplier: 3, description: "Magic Crystals" },
    { combination: [emerald, emerald, emerald], multiplier: 3, description: "Emerald Gem" },
    { combination: [diamondBlue, diamondBlue, diamondBlue], multiplier: 2, description: "Blue Diamond" },
    { combination: [coinsStack, coinsStack, coinsStack], multiplier: 2, description: "Gold Coins" }
  ],
  specialSymbols: [
    { 
      symbol: wildPlanet, 
      name: "Wild Planet", 
      description: "Substitutes for any symbol and triples the payout when part of a winning combination!", 
      multiplier: 3 
    },
    { 
      symbol: bonusPlate, 
      name: "Bonus", 
      description: "Three Bonus symbols trigger the Aztec Treasure Chamber with guaranteed big wins!", 
      multiplier: 2 
    }
  ],
  maxMultiplier: 60,
  luckySymbol: sunFace,
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles for Aztec Treasures theme
const customStyles = {
  container: {
    backgroundImage: 'linear-gradient(to bottom, rgba(120, 80, 20, 0.8) 0%, rgba(60, 40, 10, 1) 100%)',
    boxShadow: '0 0 20px rgba(200, 150, 50, 0.3)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(110, 70, 30, 0.8), rgba(70, 45, 20, 0.8))',
    border: '1px solid rgba(200, 150, 50, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(200, 150, 50, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(100, 65, 25, 0.9), rgba(60, 35, 15, 0.9))',
    border: '1px solid rgba(200, 150, 50, 0.2)'
  }
};

const AztecTreasures: React.FC = () => {
  return (
    <BaseSlotGame config={aztecTreasuresConfig} gameId={106} customStyles={customStyles} />
  );
};

export default AztecTreasures;