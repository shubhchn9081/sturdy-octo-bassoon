import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Cosmic Spins symbols
const rocketSymbol = '/images/games/slots/space/cosmic_spins_logo.png';
const planetSymbol = '/images/games/slots/space/planet_purple.png';
const diamondSymbol = '/images/games/slots/space/diamond_blue.png';
const letterKSymbol = '/images/games/slots/space/letter_k_green.png';
const moonSymbol = '/images/games/slots/space/moon_gray.png';
const alienSymbol = '/images/games/slots/space/alien_green.png';
const crystalSymbol = '/images/games/slots/space/crystal_purple.png';

// Cosmic Spins configuration
const cosmicSpinsConfig: SlotConfiguration = {
  name: "Cosmic Spins",
  theme: "space",
  description: "Embark on an interstellar adventure with Cosmic Spins, where astronomical wins await among the stars, planets, and cosmic wonders of the universe.",
  symbols: [
    rocketSymbol, 
    planetSymbol, 
    diamondSymbol, 
    moonSymbol, 
    letterKSymbol, 
    alienSymbol, 
    crystalSymbol
  ],
  payouts: [
    { combination: [rocketSymbol, rocketSymbol, rocketSymbol], multiplier: 10, description: "Cosmic Spins - Highest Payout" },
    { combination: [planetSymbol, planetSymbol, planetSymbol], multiplier: 8, description: "Planetary Alignment" },
    { combination: [diamondSymbol, diamondSymbol, diamondSymbol], multiplier: 7, description: "Diamond Collection" },
    { combination: [moonSymbol, moonSymbol, moonSymbol], multiplier: 6, description: "Lunar Landing" },
    { combination: [letterKSymbol, letterKSymbol, letterKSymbol], multiplier: 5, description: "Triple K" },
    { combination: [alienSymbol, alienSymbol, alienSymbol], multiplier: 4, description: "Alien Contact" },
    { combination: [crystalSymbol, crystalSymbol, crystalSymbol], multiplier: 3, description: "Crystal Power" }
  ],
  specialSymbols: [
    { 
      symbol: rocketSymbol, 
      name: "Rocket", 
      description: "The highest paying symbol. Three rockets guarantee a cosmic-sized win!", 
      multiplier: 10 
    },
    { 
      symbol: diamondSymbol, 
      name: "Diamond", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: diamondSymbol,
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles
const customStyles = {
  container: {
    backgroundImage: 'radial-gradient(circle at center, rgba(25, 33, 60, 0.8) 0%, rgba(8, 11, 22, 1) 100%)',
    boxShadow: '0 0 20px rgba(65, 120, 255, 0.2)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(30, 40, 70, 0.8), rgba(15, 20, 40, 0.8))',
    border: '1px solid rgba(65, 120, 255, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(65, 120, 255, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(20, 30, 60, 0.9), rgba(10, 15, 30, 0.9))',
    border: '1px solid rgba(65, 120, 255, 0.2)'
  }
};

const CosmicSpins: React.FC = () => {
  return (
    <BaseSlotGame config={cosmicSpinsConfig} gameId={101} customStyles={customStyles} />
  );
};

export default CosmicSpins;