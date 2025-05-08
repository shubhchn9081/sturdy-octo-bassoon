import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Temple Quest symbols
const templeQuestLogo = '/images/games/slots/adventure/temple_quest_logo.png';
const maskGold = '/images/games/slots/adventure/mask_gold.png';
const letterQRed = '/images/games/slots/adventure/letter_q_red.png';
const letterJBlue = '/images/games/slots/adventure/letter_j_blue.png';
const pyramidGold = '/images/games/slots/adventure/pyramid_gold.png';
const moaiHead = '/images/games/slots/adventure/moai_head.png';
const gemGreen = '/images/games/slots/adventure/gem_green.png';
const snakeRed = '/images/games/slots/adventure/snake_red.png';
const scatterMask = '/images/games/slots/adventure/scatter_mask.png';
const ringTurquoise = '/images/games/slots/adventure/ring_turquoise.png';

// Temple Quest configuration
const templeQuestConfig: SlotConfiguration = {
  name: "Temple Quest",
  theme: "adventure",
  description: "Venture deep into an ancient temple filled with treasures and mysteries. Match the right artifacts to claim the treasures of a lost civilization.",
  symbols: [
    templeQuestLogo,
    maskGold,
    moaiHead,
    gemGreen,
    scatterMask,
    snakeRed,
    pyramidGold,
    letterQRed,
    letterJBlue,
    ringTurquoise
  ],
  payouts: [
    { combination: [templeQuestLogo, templeQuestLogo, templeQuestLogo], multiplier: 10, description: "Temple Quest - Highest Payout" },
    { combination: [maskGold, maskGold, maskGold], multiplier: 8, description: "Gold Mask" },
    { combination: [moaiHead, moaiHead, moaiHead], multiplier: 7, description: "Stone Guardian" },
    { combination: [gemGreen, gemGreen, gemGreen], multiplier: 6, description: "Green Gem" },
    { combination: [scatterMask, scatterMask, scatterMask], multiplier: 5, description: "Scatter Mask" },
    { combination: [snakeRed, snakeRed, snakeRed], multiplier: 4, description: "Temple Serpent" },
    { combination: [pyramidGold, pyramidGold, pyramidGold], multiplier: 3, description: "Gold Pyramid" },
    { combination: [letterQRed, letterQRed, letterQRed], multiplier: 3, description: "Red Q" },
    { combination: [letterJBlue, letterJBlue, letterJBlue], multiplier: 2, description: "Blue J" },
    { combination: [ringTurquoise, ringTurquoise, ringTurquoise], multiplier: 2, description: "Turquoise Ring" }
  ],
  specialSymbols: [
    { 
      symbol: maskGold, 
      name: "Gold Mask", 
      description: "The highest paying symbol. Three masks reveal the temple's greatest treasure!", 
      multiplier: 10 
    },
    { 
      symbol: scatterMask, 
      name: "Scatter Mask", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: scatterMask,
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
    <BaseSlotGame config={templeQuestConfig} gameId={102} customStyles={customStyles} />
  );
};

export default TempleQuest;