import React from 'react';
import { cn } from '@/lib/utils';
import ImageWithFallback from '@/components/ui/image-with-fallback';

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
  // Function to get gradient style based on game type
  const getGradientStyle = () => {
    switch (name) {
      case 'MINES':
        return { background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' };
      case 'DICE':
        return { background: 'linear-gradient(135deg, #f472b6 0%, #ef4444 100%)' };
      case 'PLINKO':
        return { background: 'linear-gradient(135deg, #a78bfa 0%, #facc15 100%)' };
      case 'LIMBO':
        return { background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' };
      case 'PUMP':
        return { background: 'linear-gradient(135deg, #f87171 0%, #ec4899 100%)' };
      case 'CRASH':
        return { background: 'linear-gradient(135deg, #60a5fa 0%, #facc15 100%)' };
      case 'KENO':
        return { background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)' };
      case 'DRAGON TOWER':
        return { background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' };
      case 'HILO':
        return { background: 'linear-gradient(135deg, #22c55e 0%, #065f46 100%)' };
      case 'VIDEO POKER':
        return { background: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)' };
      case 'BLUE SAMURAI':
        return { background: 'linear-gradient(135deg, #3b82f6 0%, #4338ca 100%)' };
      default:
        return { background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' };
    }
  };
  
  // Function to get image url for each game
  const getImageSource = () => {
    // For games with Cloudinary images
    switch (name) {
      case 'CRASH':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990211/c830595cbd07b2561ac76a365c2f01869dec9a8fe5e7be30634d78c51b2cc91e_j3olae.jpg';
      case 'PLINKO':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990620/5cbb2498c956527e6584c6af216489b85bbb7a909c7d3c4e131a3be9bd1cc6bf_wlazjb.jpg';
      case 'LIMBO':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990620/11caec5df20098884ae9071848e1951b8b34e5ec84a7241f2e7c5afd4b323dfd_iitvtz.jpg';
      case 'MINES':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990620/15a51a2ae2895872ae2b600fa6fe8d7f8d32c9814766b66ddea2b288d04ba89c_uj47yo.jpg';
      case 'DICE':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990621/30688668d7d2d48d472edd0f1e2bca0758e7ec51cbab8c04d8b7f157848640e0_ec0wxi.jpg';
      case 'KENO':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990621/102cf3d7c840018b939cd787bf013e080b996d80e604f3008f21dddf1f1aa201_phwj9c.jpg';
      default:
        break;
    }
    
    // First check if we have a custom uploaded image
    if (imageUrl) {
      return imageUrl;
    }
    
    // Next check if we have a default image for this game
    return getGameImage() || '';
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
          <div className="w-12 h-12 mb-2">
            <div className="grid grid-cols-3 grid-rows-2 gap-1 scale-75">
              <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center text-white font-bold text-xs">8</div>
              <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center text-white font-bold text-xs">9</div>
              <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center text-white font-bold text-xs">10</div>
              <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center text-white font-bold text-xs">11</div>
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center text-blue-500 font-bold text-xs">12</div>
              <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center text-white font-bold text-xs">13</div>
            </div>
          </div>
        );
      case 'LIMBO':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-sm rotate-45 flex items-center justify-center">
              <span className="text-orange-400 font-bold text-lg -rotate-45">×</span>
            </div>
          </div>
        );
      case 'MINES':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-400 rounded-sm flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
            </div>
          </div>
        );
      case 'DICE':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center rotate-12 absolute -left-2">
                <div className="grid grid-cols-3 grid-rows-3 gap-0.5 scale-75">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-red-400 rounded-sm flex items-center justify-center -rotate-12 absolute right-0 top-1 z-10">
                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 scale-75">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'VIDEO POKER':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="flex gap-0.5 scale-75">
              <div className="w-5 h-7 bg-white rounded-sm flex flex-col items-center justify-center shadow-sm">
                <div className="text-red-600 text-xs font-bold">A</div>
                <div className="text-red-600 text-[8px]">♦</div>
              </div>
              <div className="w-5 h-7 bg-white rounded-sm flex flex-col items-center justify-center shadow-sm">
                <div className="text-black text-xs font-bold">A</div>
                <div className="text-black text-[8px]">♠</div>
              </div>
              <div className="w-5 h-7 bg-white rounded-sm flex flex-col items-center justify-center shadow-sm">
                <div className="text-red-600 text-xs font-bold">A</div>
                <div className="text-red-600 text-[8px]">♥</div>
              </div>
            </div>
          </div>
        );
      case 'DRAGON TOWER':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="w-8 h-8 flex flex-col items-center justify-center">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-orange-400"></div>
              <div className="w-6 h-3 bg-yellow-500 -mt-1 rounded-b-sm"></div>
            </div>
          </div>
        );
      case 'CRASH':
        return null;
      default:
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="w-8 h-8 bg-white/30 rounded-full"></div>
          </div>
        );
    }
  };

  // Get image source and icon
  const imageSource = getImageSource();
  const gradientStyle = getGradientStyle();
  
  // Generic fallback image for all games
  const fallbackImageUrl = 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990258/game-fallback_vwu7dc.jpg';

  return (
    <div 
      className={cn(
        "game-card w-[124px] h-[160px] rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] transition-transform duration-200 ease-in-out",
        className
      )}
      onClick={() => window.location.href = `/games/${slug}`}
    >
      {/* Main card content */}
      <div className="flex-1 relative">
        {/* Background gradient or image */}
        <div 
          className="absolute inset-0 w-full h-full" 
          style={!imageSource ? gradientStyle : undefined}
        ></div>
        
        {/* Background image if available */}
        {imageSource && (
          <ImageWithFallback
            src={imageSource}
            fallbackSrc={fallbackImageUrl}
            alt={`${name} game background`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* No text labels as images already have text embedded */}
      </div>
      
      {/* Player count */}
      <div className="bg-[#0F212E] px-2 py-1 text-[11px] text-green-400 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></div>
        {activePlayers.toLocaleString()} playing
      </div>
    </div>
  );
};

export default GameCard;