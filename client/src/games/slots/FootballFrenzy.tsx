import React from 'react';
import BaseSlotGame, { SlotConfiguration } from './BaseSlotGame';

// Image paths for Football Frenzy symbols
const footballFrenzyLogo = '/images/games/slots/sports/football_frenzy_logo.png';
const footballBall = '/images/games/slots/sports/football_ball.png';
const trophyGold = '/images/games/slots/sports/trophy_gold.png';
const trophyCup = '/images/games/slots/sports/trophy_cup.png';
const bootOrange = '/images/games/slots/sports/boot_orange.png';
const jerseyGreen = '/images/games/slots/sports/jersey_green.png';
const glovesGoalkeeper = '/images/games/slots/sports/gloves_goalkeeper.png';
const wildFootball = '/images/games/slots/sports/wild_football.png';
const letterARed = '/images/games/slots/sports/letter_a_red.png';
const letterKBlueBoot = '/images/games/slots/sports/letter_k_blue_boot.png';

// Football Frenzy configuration
const footballFrenzyConfig: SlotConfiguration = {
  name: "Football Frenzy",
  theme: "sports",
  description: "Experience the thrill of the beautiful game with Football Frenzy slots. Match football symbols to score big wins and championship rewards!",
  symbols: [
    footballFrenzyLogo,
    footballBall,
    trophyGold,
    trophyCup,
    bootOrange,
    jerseyGreen,
    glovesGoalkeeper,
    wildFootball,
    letterARed,
    letterKBlueBoot
  ],
  payouts: [
    { combination: [footballBall, footballBall, footballBall], multiplier: 10, description: "Hat-Trick - Jackpot" },
    { combination: [trophyGold, trophyGold, trophyGold], multiplier: 8, description: "Championship Trophy" },
    { combination: [bootOrange, bootOrange, bootOrange], multiplier: 7, description: "Football Boots" },
    { combination: [jerseyGreen, jerseyGreen, jerseyGreen], multiplier: 6, description: "Team Jersey" },
    { combination: [glovesGoalkeeper, glovesGoalkeeper, glovesGoalkeeper], multiplier: 5, description: "Goalkeeper Gloves" },
    { combination: [trophyCup, trophyCup, trophyCup], multiplier: 4, description: "Trophy Cup" },
    { combination: [wildFootball, wildFootball, wildFootball], multiplier: 4, description: "Wild Football" },
    { combination: [letterARed, letterARed, letterARed], multiplier: 3, description: "Red Letter A" },
    { combination: [letterKBlueBoot, letterKBlueBoot, letterKBlueBoot], multiplier: 2, description: "Blue Letter K Boot" }
  ],
  specialSymbols: [
    { 
      symbol: footballBall, 
      name: "Football", 
      description: "The highest paying symbol. Three footballs score the ultimate goal!", 
      multiplier: 10 
    },
    { 
      symbol: trophyGold, 
      name: "Trophy", 
      description: "The special bonus symbol. When appearing with any winning combination, it adds an extra 0.5x to your multiplier.", 
      multiplier: 0.5 
    }
  ],
  maxMultiplier: 50,
  luckySymbol: trophyGold,
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
    <BaseSlotGame config={footballFrenzyConfig} gameId={105} customStyles={customStyles} />
  );
};

export default FootballFrenzy;