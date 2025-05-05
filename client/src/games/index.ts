import Dice from './Dice';
import Mines from './Mines';
import CricketMines from './CricketMines';
import Plinko from './Plinko';
import Crash from './CrashFinal';
import Limbo from './LimboFinal';
import DragonTower from './DragonTower';
import BlueSamurai from './BlueSamurai';
import Pump from './Pump';
import Hilo from './Hilo';
import Keno from './Keno';
import Wheel from './Wheel';
import CoinFlip from './CoinFlip';
import Slots from './Slots';
import CupAndBall from './CupAndBall';
import TowerClimb from './TowerClimb';

export const GAMES = [
  // Cup and Ball game temporarily hidden from menu
  /* {
    id: 15,
    name: 'CUP AND BALL',
    slug: 'cup-and-ball',
    type: 'NOVITO ORIGINALS',
    description: 'Find which cup hides the ball',
    color: 'bg-orange-600',
    iconType: 'shuffle',
    component: CupAndBall,
    minBet: 1,
    maxBet: 100,
    rtp: 98,
    maxMultiplier: 3.0,
    activePlayers: 4215
  }, */
  {
    id: 101,
    name: 'TOWER CLIMB',
    slug: 'tower-climb',
    type: 'NOVITO ORIGINALS',
    description: 'Climb the tower, avoid traps, collect rewards',
    color: 'bg-indigo-600',
    iconType: 'ladder',
    component: TowerClimb,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97,
    maxMultiplier: 15.0,
    activePlayers: 5124
  },
  {
    id: 4,
    name: 'MINES',
    slug: 'mines',
    type: 'NOVITO ORIGINALS',
    description: 'Find the gems, avoid the mines',
    color: 'bg-blue-600',
    iconType: 'mines',
    component: Mines,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 1000,
    activePlayers: 3569
  },
  {
    id: 5,
    name: 'DICE',
    slug: 'dice',
    type: 'NOVITO ORIGINALS',
    description: 'Classic Dice game with 99% RTP',
    color: 'bg-purple-600',
    iconType: 'dice',
    component: Dice,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 99.00,
    activePlayers: 3705
  },
  {
    id: 2,
    name: 'PLINKO',
    slug: 'plinko',
    type: 'NOVITO ORIGINALS',
    description: 'Drop balls and win multipliers',
    color: 'bg-green-500',
    iconType: 'plinko',
    component: Plinko,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 1000.00,
    activePlayers: 7253
  },
  {
    id: 11,
    name: 'KENO',
    slug: 'keno',
    type: 'NOVITO ORIGINALS',
    description: 'Select numbers and win',
    color: 'bg-blue-500',
    iconType: 'keno',
    component: Keno,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97,
    maxMultiplier: 390.00,
    activePlayers: 6253
  },
  {
    id: 12,
    name: 'WHEEL',
    slug: 'wheel',
    type: 'NOVITO ORIGINALS',
    description: 'Spin the wheel and win multipliers',
    color: 'bg-yellow-500',
    iconType: 'wheel',
    component: Wheel,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97,
    maxMultiplier: 10.00,
    activePlayers: 3298
  },
  {
    id: 14,
    name: 'CRICKET MINES',
    slug: 'cricket-mines',
    type: 'NOVITO ORIGINALS',
    description: 'Hit sixes and avoid getting out',
    color: 'bg-green-600',
    iconType: 'mines', 
    component: CricketMines,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 1000,
    activePlayers: 2891,
    imageUrl: 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745078272/ChatGPT_Image_Apr_19_2025_09_27_40_PM_hitkbs.png'
  },
  {
    id: 1,
    name: 'CRASH',
    slug: 'crash',
    type: 'NOVITO ORIGINALS',
    description: 'Bet and cash out before it crashes',
    color: 'bg-orange-500',
    iconType: 'crash',
    component: Crash,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 1000.00,
    activePlayers: 9876
  },
  {
    id: 3,
    name: 'LIMBO',
    slug: 'limbo',
    type: 'NOVITO ORIGINALS',
    description: 'Target a multiplier and win big',
    color: 'bg-orange-400',
    iconType: 'limbo',
    component: Limbo,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: Infinity,
    activePlayers: 10890
  },
  {
    id: 13,
    name: 'SLOTS',
    slug: 'slots',
    type: 'NOVITO ORIGINALS',
    description: 'Classic 3-reel slots game',
    color: 'bg-red-500',
    iconType: 'slots',
    component: Slots,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97,
    maxMultiplier: 10.00,
    activePlayers: 5423
  }
];

export const getGameBySlug = (slug: string) => {
  return GAMES.find(game => game.slug === slug);
};

export const getGameById = (id: number) => {
  return GAMES.find(game => game.id === id);
};

export default {
  Dice,
  Mines,
  CricketMines,
  Plinko,
  Crash,
  Limbo,
  Keno,
  Wheel,
  Slots,
  CupAndBall,
  TowerClimb
};
