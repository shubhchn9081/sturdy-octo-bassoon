import React from 'react';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';

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
  imageUrl?: string | null;
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
  className,
  imageUrl
}: GameCardProps) => {
  
  // Function to get image url for each game
  const getBackgroundStyle = () => {
    // First check if we have a custom uploaded image
    if (imageUrl) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    // Next check if we have a default image for this game
    const defaultImage = getGameImage();
    
    if (defaultImage) {
      return {
        backgroundImage: `url(${defaultImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    // Fallback to color
    return {
      background: color
    };
  };

  // Function to get image url based on the game
  const getGameImage = () => {
    switch (name) {
      case 'KENO': 
        return '/images/games/0dec0a589e3aad3d7130fd0fbb1502d174dca0f9-1080x1080.png';
      case 'LIMBO':
        return '/images/games/14a07f57ad5198ffadd4e0d4386245f4e017d030-1080x1080.png';
      case 'MINES':
        return '/images/games/24d3cdf5c6555efee525cd6169c05262df312992-1080x1080.png';
      case 'DICE':
        return '/images/games/1b45a8e293264dab4677f8187e8d71feeb56adabc02510a59d6b4e780c1e5b4c.png';
      case 'VIDEO POKER':
        return '/images/games/1c0de2ee0ce713086ff7735697ad2b5385bc974f206b857c724a5ec84467a73b.png';
      case 'DRAGON TOWER':
        return '/images/games/2c3e16f0a3b8cd8d979265e48dd6a169937a4a4d0acb05ad532ca8345a1e6f21.jpeg';
      case 'CRASH':
        return '/images/games/30688668d7d2d48d472edd0f1e2bca0758e7ec51cbab8c04d8b7f157848640e0.jpeg';
      case 'PLINKO':
        return '/images/games/4031cec525edc307c71df6dddc71506ab06150fd5c14194a5dc9ca6fb54893a1.jpeg';
      case 'BLUE SAMURAI':
        return '/images/games/59d1df22a2931a965fc241a436a398f460e71ea9d0214f66780a52b56655d392.jpeg';
      case 'HILO':
        return '/images/games/86cd89b12ec34439c0d1a6e32b06c971efc86091e09ba466182abe173c3d3f7d.jpeg';
      case 'PUMP':
        return '/images/games/e0a4131a16c28a1c1516958c93ec90c6f0f1bb00f41de87f72f6800c535b9c6f.jpeg';
      default:
        return null;
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

  const backgroundStyle = getBackgroundStyle();
  const gameIcon = getGameIcon();

  return (
    <div 
      className={cn("game-card block cursor-pointer overflow-hidden rounded-md transition-transform hover:translate-y-[-2px]", className)} 
      onClick={() => window.location.href = `/games/${slug}`}
    >
      <div 
        className="relative h-48 flex flex-col items-center justify-end"
        style={{
          backgroundImage: `url('/images/games/c830595cbd07b2561ac76a365c2f01869dec9a8fe5e7be30634d78c51b2cc91e.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* No game icon or text displayed */}
      </div>
      <div className="bg-[#0F212E] px-3 py-1.5 text-xs text-green-400 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
        {activePlayers.toLocaleString()} playing
      </div>
    </div>
  );
};

export default GameCard;
