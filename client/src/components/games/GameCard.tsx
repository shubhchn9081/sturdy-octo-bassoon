import React from 'react';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';

// Import game images
import pumpImg from '@assets/1b45a8e293264dab4677f8187e8d71feeb56adabc02510a59d6b4e780c1e5b4c.png';
import hiloImg from '@assets/1c0de2ee0ce713086ff7735697ad2b5385bc974f206b857c724a5ec84467a73b.png';
import diceImg from '@assets/102cf3d7c840018b939cd787bf013e080b996d80e604f3008f21dddf1f1aa201.jpeg';
import minesImg from '@assets/11caec5df20098884ae9071848e1951b8b34e5ec84a7241f2e7c5afd4b323dfd.jpeg';
import plinkoImg from '@assets/15a51a2ae2895872ae2b600fa6fe8d7f8d32c9814766b66ddea2b288d04ba89c.jpeg';
import dragonTowerImg from '@assets/2c3e16f0a3b8cd8d979265e48dd6a169937a4a4d0acb05ad532ca8345a1e6f21.jpeg';
import crashImg from '@assets/30688668d7d2d48d472edd0f1e2bca0758e7ec51cbab8c04d8b7f157848640e0.jpeg';
import limboImg from '@assets/3b0d5a4dbc8395fc39ebce15a0eaf21373004f428fb266abebe934428f598256.jpeg';
import blueSamuraiImg from '@assets/4031cec525edc307c71df6dddc71506ab06150fd5c14194a5dc9ca6fb54893a1.jpeg';

type GameCardProps = {
  id: number;
  name: string;
  slug: string;
  type: string;
  activePlayers: number;
  color: string;
  iconType: string;
  multiplier?: string;
  className?: string;
};

// Use game images for specific games
const gameImages: Record<string, string> = {
  dice: diceImg,
  mines: minesImg,
  plinko: plinkoImg,
  crash: crashImg,
  limbo: limboImg,
  dragonTower: dragonTowerImg,
  blueSamurai: blueSamuraiImg,
  pump: pumpImg,
  hilo: hiloImg
};

const GameCard = ({ 
  id, 
  name, 
  slug, 
  type, 
  activePlayers, 
  color = 'bg-blue-600',
  iconType = 'default',
  multiplier,
  className 
}: GameCardProps) => {
  // Get image based on game slug
  const getGameImage = () => {
    // First try to match by iconType
    if (gameImages[iconType]) {
      return gameImages[iconType];
    }
    
    // Then try to match by slug
    const slugMatch = Object.keys(gameImages).find(key => 
      slug.toLowerCase().includes(key.toLowerCase())
    );
    
    if (slugMatch) {
      return gameImages[slugMatch];
    }
    
    return null;
  };
  
  const gameImage = getGameImage();
  const hasImage = gameImage !== null;

  // Function to get background gradient by game name
  const getGameBackground = () => {
    switch (name) {
      case 'KENO': 
        return 'bg-gradient-to-b from-blue-500 to-blue-300';
      case 'LIMBO':
        return 'bg-gradient-to-b from-orange-400 to-yellow-300';
      case 'PLINKO':
        return 'bg-gradient-to-b from-blue-600 to-blue-400';
      case 'MINES':
        return 'bg-gradient-to-b from-blue-600 to-green-400';
      case 'DICE':
        return 'bg-gradient-to-b from-purple-600 to-red-400';
      case 'VIDEO POKER':
        return 'bg-gradient-to-b from-red-600 to-red-400';
      case 'DRAGON TOWER':
        return 'bg-gradient-to-b from-yellow-500 to-red-500';
      case 'CRASH':
        return 'bg-gradient-to-b from-purple-600 to-indigo-400';
      case 'BLUE SAMURAI':
        return 'bg-gradient-to-b from-blue-700 to-blue-500';
      case 'HILO':
        return 'bg-gradient-to-b from-green-600 to-green-400';
      case 'PUMP':
        return 'bg-gradient-to-b from-red-500 to-orange-400';
      default:
        return color;
    }
  };

  // Get game icon based on game type
  const getGameIcon = () => {
    switch (name) {
      case 'KENO':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <div className="grid grid-cols-3 grid-rows-2 gap-1">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-bold">8</div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-bold">9</div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-bold">10</div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-bold">11</div>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-blue-500 font-bold">12</div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-bold">13</div>
              </div>
            </div>
          </div>
        );
      case 'LIMBO':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-lg rotate-45 flex items-center justify-center">
                <span className="text-orange-400 font-bold text-lg -rotate-45">×</span>
              </div>
            </div>
          </div>
        );
      case 'MINES':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <div className="w-16 h-16 bg-green-400 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg"></div>
              </div>
            </div>
          </div>
        );
      case 'DICE':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center gap-2">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center rotate-12">
                <div className="grid grid-cols-3 grid-rows-3 gap-1">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center -rotate-12 -ml-4 -mt-3">
                <div className="grid grid-cols-2 grid-rows-2 gap-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'VIDEO POKER':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-10 h-14 bg-white rounded-md flex items-center justify-center shadow-md">
                <div className="text-red-600 text-lg font-bold">A</div>
                <div className="text-red-600 text-xs">♦</div>
              </div>
              <div className="w-10 h-14 bg-white rounded-md flex items-center justify-center shadow-md">
                <div className="text-black text-lg font-bold">A</div>
                <div className="text-black text-xs">♠</div>
              </div>
              <div className="w-10 h-14 bg-white rounded-md flex items-center justify-center shadow-md">
                <div className="text-red-600 text-lg font-bold">A</div>
                <div className="text-red-600 text-xs">♥</div>
              </div>
            </div>
          </div>
        );
      case 'DRAGON TOWER':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <div className="w-16 h-16 flex flex-col items-center justify-center">
                <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-b-[40px] border-l-transparent border-r-transparent border-b-orange-400"></div>
                <div className="w-12 h-6 bg-yellow-500 -mt-3 rounded-b-md"></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const background = getGameBackground();
  const gameIcon = getGameIcon();

  return (
    <div 
      className={cn("game-card block cursor-pointer overflow-hidden rounded-md transition-transform hover:translate-y-[-2px]", className)} 
      onClick={() => window.location.href = `/games/${slug}`}
    >
      <div 
        className={cn("relative h-48 flex flex-col items-center justify-end", background)}
      >
        {gameIcon}
        
        <h3 className="text-3xl font-bold text-white uppercase tracking-wide drop-shadow-md mb-3 z-10">{name}</h3>
      </div>
      <div className="bg-[#0F212E] px-3 py-1.5 text-xs text-green-400 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
        {activePlayers.toLocaleString()} playing
      </div>
    </div>
  );
};

export default GameCard;
