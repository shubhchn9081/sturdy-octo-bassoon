import Dice from './Dice';
import Mines from './Mines';
import Plinko from './Plinko';
import Crash from './Crash';
import Limbo from './Limbo';
import DragonTower from './DragonTower';
import BlueSamurai from './BlueSamurai';
import Pump from './Pump';
import Hilo from './Hilo';

export const GAMES = [
  {
    id: 1,
    name: 'PLINKO',
    slug: 'plinko',
    type: 'STAKE ORIGINALS',
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
    id: 2,
    name: 'LIMBO',
    slug: 'limbo',
    type: 'STAKE ORIGINALS',
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
    id: 3,
    name: 'MINES',
    slug: 'mines',
    type: 'STAKE ORIGINALS',
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
    id: 4,
    name: 'DICE',
    slug: 'dice',
    type: 'STAKE ORIGINALS',
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
    id: 5,
    name: 'VIDEO POKER',
    slug: 'video-poker',
    type: 'STAKE ORIGINALS',
    description: 'Five card draw poker',
    color: 'bg-red-600',
    iconType: 'videoPoker',
    component: Dice, // Temporarily using Dice component
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 800,
    activePlayers: 6399
  },
  {
    id: 6,
    name: 'DRAGON TOWER',
    slug: 'dragon-tower',
    type: 'STAKE ORIGINALS',
    description: 'Climb the tower for big rewards',
    color: 'bg-red-600',
    iconType: 'dragonTower',
    component: DragonTower,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97,
    maxMultiplier: 5000,
    activePlayers: 2532
  },
  {
    id: 7,
    name: 'BLUE SAMURAI',
    slug: 'blue-samurai',
    type: 'STAKE EXCLUSIVES',
    description: '5-reel slot with 49 paylines',
    color: 'bg-blue-700',
    iconType: 'blueSamurai',
    component: BlueSamurai,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 96.7,
    maxMultiplier: 10000,
    activePlayers: 1843
  },
  {
    id: 8,
    name: 'PUMP',
    slug: 'pump',
    type: 'STAKE ORIGINALS',
    description: 'Inflate the balloon for increasing rewards',
    color: 'bg-red-500',
    iconType: 'pump',
    component: Pump,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 98,
    maxMultiplier: 3203384.80,
    activePlayers: 1705
  },
  {
    id: 9,
    name: 'HILO',
    slug: 'hilo',
    type: 'STAKE ORIGINALS',
    description: 'Predict higher or lower cards',
    color: 'bg-green-600',
    iconType: 'hilo',
    component: Hilo,
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 99,
    maxMultiplier: 1000,
    activePlayers: 3021
  },
  {
    id: 10,
    name: 'KENO',
    slug: 'keno',
    type: 'STAKE ORIGINALS',
    description: 'Select numbers and win',
    color: 'bg-blue-500',
    iconType: 'keno',
    component: Dice, // Temporarily using Dice component
    minBet: 0.00000001,
    maxBet: 100,
    rtp: 97,
    maxMultiplier: 100.00,
    activePlayers: 6253
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
  Plinko,
  Crash,
  Limbo,
  DragonTower,
  BlueSamurai,
  Pump,
  Hilo
};
