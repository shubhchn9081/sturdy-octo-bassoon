import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Celestial Fortunes symbols
const sunFace = '/images/games/slots/celestial/sun_face.png';
const crescentMoon = '/images/games/slots/celestial/crescent_moon.png';
const moonCrater = '/images/games/slots/space/moon_crater.png';
const planetOrange = '/images/games/slots/space/planet_orange.png';
const planetPurple = '/images/games/slots/space/planet_purple.png';
const wildPlanet = '/images/games/slots/space/wild_planet.png';
const meteor = '/images/games/slots/space/meteor.png';
const crystalPurple = '/images/games/slots/space/crystal_purple.png';
const diamondBlue = '/images/games/slots/space/diamond_blue.png';
const alienGreen = '/images/games/slots/space/alien_green.png';
const letterKGreen = '/images/games/slots/space/letter_k_green.png';
const moonGray = '/images/games/slots/space/moon_gray.png';

// Celestial Fortunes configuration
const celestialFortunesConfig: SlotConfiguration = {
  name: "Celestial Fortunes",
  theme: "celestial",
  description: "Journey through the cosmos in search of celestial treasures. Align the sun, moon, and stars to unlock astronomical payouts and stellar rewards!",
  symbols: [
    sunFace,
    crescentMoon,
    moonCrater,
    planetOrange,
    planetPurple,
    wildPlanet,
    meteor,
    crystalPurple,
    diamondBlue,
    alienGreen,
    letterKGreen,
    moonGray
  ],
  payouts: [
    { combination: [wildPlanet, wildPlanet, wildPlanet], multiplier: 15, description: "Cosmic Jackpot" },
    { combination: [sunFace, sunFace, sunFace], multiplier: 12, description: "Solar Flare" },
    { combination: [crescentMoon, crescentMoon, crescentMoon], multiplier: 10, description: "Lunar Light" },
    { combination: [moonCrater, moonCrater, moonCrater], multiplier: 8, description: "Crater Crash" },
    { combination: [planetOrange, planetOrange, planetOrange], multiplier: 7, description: "Gas Giant" },
    { combination: [planetPurple, planetPurple, planetPurple], multiplier: 6, description: "Distant World" },
    { combination: [meteor, meteor, meteor], multiplier: 5, description: "Meteor Shower" },
    { combination: [alienGreen, alienGreen, alienGreen], multiplier: 4, description: "Alien Encounter" },
    { combination: [crystalPurple, crystalPurple, crystalPurple], multiplier: 3, description: "Space Crystals" },
    { combination: [diamondBlue, diamondBlue, diamondBlue], multiplier: 3, description: "Stellar Diamond" },
    { combination: [letterKGreen, letterKGreen, letterKGreen], multiplier: 2, description: "Space Letter" },
    { combination: [moonGray, moonGray, moonGray], multiplier: 2, description: "Shadow Moon" }
  ],
  specialSymbols: [
    { 
      symbol: wildPlanet, 
      name: "Wild Planet", 
      description: "Substitutes for any symbol and doubles the payout when part of a winning combination!", 
      multiplier: 2 
    },
    { 
      symbol: meteor, 
      name: "Meteor", 
      description: "The meteor brings cosmic fortune! When three appear, all wins are multiplied by 3x.", 
      multiplier: 3 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: sunFace,
  luckyMultiplier: 0.5,
  reelCount: 3
};

// Custom styles for Celestial Fortunes theme
const customStyles = {
  container: {
    backgroundImage: 'linear-gradient(to bottom, rgba(20, 30, 80, 0.8) 0%, rgba(10, 15, 40, 1) 100%)',
    boxShadow: '0 0 20px rgba(100, 150, 255, 0.3)'
  },
  reelsContainer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(30, 40, 90, 0.8), rgba(15, 25, 60, 0.8))',
    border: '1px solid rgba(100, 150, 255, 0.3)',
    boxShadow: 'inset 0 0 20px rgba(100, 150, 255, 0.2)'
  },
  reel: {
    backgroundImage: 'linear-gradient(to bottom, rgba(25, 35, 80, 0.9), rgba(12, 20, 50, 0.9))',
    border: '1px solid rgba(100, 150, 255, 0.2)'
  }
};

const CelestialFortunes: React.FC = () => {
  return (
    <BaseSlotGame config={celestialFortunesConfig} gameId={107} customStyles={customStyles} />
  );
};

export default CelestialFortunes;