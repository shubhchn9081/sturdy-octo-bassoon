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

  return (
    <div 
      className={cn("game-card block cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-[1.02]", className)} 
      onClick={() => window.location.href = `/games/${slug}`}
    >
      <div className={cn("p-4 flex flex-col items-center justify-center h-44 relative", color)}>
        {multiplier && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-xs px-2 py-1 rounded-sm text-black font-bold">
            {multiplier}
          </div>
        )}
        
        {hasImage ? (
          <div className="w-28 h-28 flex items-center justify-center">
            <img src={gameImage} alt={name} className="max-w-full max-h-full" />
          </div>
        ) : (
          <Dices className="h-20 w-20 text-white" />
        )}
        
        <h3 className="text-xl font-bold text-white mt-3">{name}</h3>
      </div>
      <div className="bg-[#172B3A] px-3 py-2 text-xs text-[#546d7a] uppercase font-semibold tracking-wide">
        {type}
      </div>
      <div className="bg-[#0F212E] px-3 py-1.5 text-xs text-green-400 flex items-center">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
        {activePlayers.toLocaleString()} playing
      </div>
    </div>
  );
};

export default GameCard;
