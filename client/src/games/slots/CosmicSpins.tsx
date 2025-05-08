import React from 'react';
import { SlotConfiguration } from './BaseSlotGame';
import EnhancedSlotGame from './EnhancedSlotGame';

// Cosmic Spins configuration
const cosmicSpinsConfig: SlotConfiguration = {
  name: "Cosmic Spins",
  theme: "space",
  description: "Embark on an interstellar adventure with Cosmic Spins, where astronomical wins await among the stars, planets, and cosmic wonders of the universe.",
  symbols: ["🚀", "🪐", "🌎", "🌙", "☄️", "🛸", "👽", "⭐", "🌌", "🔭"],
  payouts: [
    { combination: ["🚀", "🚀", "🚀"], multiplier: 10, description: "Rocket Launch - Highest Payout" },
    { combination: ["🪐", "🪐", "🪐"], multiplier: 8, description: "Planetary Alignment" },
    { combination: ["🌎", "🌎", "🌎"], multiplier: 7, description: "Earth Orbit" },
    { combination: ["🌙", "🌙", "🌙"], multiplier: 6, description: "Lunar Landing" },
    { combination: ["☄️", "☄️", "☄️"], multiplier: 5, description: "Comet Shower" },
    { combination: ["🛸", "🛸", "🛸"], multiplier: 4, description: "UFO Sighting" },
    { combination: ["👽", "👽", "👽"], multiplier: 4, description: "Alien Contact" },
    { combination: ["⭐", "⭐", "⭐"], multiplier: 3, description: "Star Cluster" },
    { combination: ["🌌", "🌌", "🌌"], multiplier: 3, description: "Nebula Discovery" },
    { combination: ["🔭", "🔭", "🔭"], multiplier: 2, description: "Telescope Observation" }
  ],
  specialSymbols: [
    { 
      symbol: "🚀", 
      name: "Rocket", 
      description: "The highest paying symbol. Three rockets guarantee a cosmic-sized win!", 
      multiplier: 10 
    },
    { 
      symbol: "⭐", 
      name: "Star", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: "⭐",
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
    <EnhancedSlotGame 
      config={cosmicSpinsConfig} 
      gameId={101} 
      themeId="cosmic-spins" 
    />
  );
};

export default CosmicSpins;