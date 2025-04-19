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
  showPlayerCount?: boolean;
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
  imageUrl,
  showPlayerCount = false
}: GameCardProps) => {
  // Function to get background color based on game
  const getBackgroundColor = () => {
    switch (name) {
      case 'MINES':
        return 'bg-[#3390FF]';
      case 'DICE':
        return 'bg-[#DC3ED7]';
      case 'PLINKO':
        return 'bg-[#8C5CDD]';
      case 'LIMBO':
        return 'bg-[#FF9E00]';
      case 'PUMP':
        return 'bg-[#FF5353]';
      case 'CRASH':
        return 'bg-[#3394FF]';
      case 'WHEEL':
        return 'bg-[#FFB31A]';
      case 'KENO':
        return 'bg-[#42B1AD]';
      case 'DRAGON TOWER':
        return 'bg-[#FF6C43]';
      case 'HILO':
        return 'bg-[#53C67F]';
      case 'BLACKJACK':
        return 'bg-[#0FB4E4]';
      case 'CASES':
        return 'bg-[#8C63FF]';
      case 'ROCK PAPER SCISSORS':
        return 'bg-[#59B3CC]';
      case 'FLIP':
        return 'bg-[#4ECD65]';
      default:
        return 'bg-[#3390FF]';
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
      case 'WHEEL':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744994352/e0a4131a16c28a1c1516958c93ec90c6f0f1bb00f41de87f72f6800c535b9c6f_fl9nyv.jpg';
      case 'COIN FLIP':
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059353/1c0de2ee0ce713086ff7735697ad2b5385bc974f206b857c724a5ec84467a73b_srnwo0.png';
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
  
  // Get game label based on game type
  const getGameLabel = () => {
    return (
      <div className="uppercase text-md font-bold tracking-wider text-white text-center">
        {name}
      </div>
    );
  };

  // Get image source
  const imageSource = getImageSource();
  const bgColorClass = getBackgroundColor();
  
  // Generic fallback image for all games
  const fallbackImageUrl = 'https://res.cloudinary.com/dq8b1e8qy/image/upload/v1744990258/game-fallback_vwu7dc.jpg';

  return (
    <div 
      className={cn(
        "game-card w-full overflow-hidden flex flex-col cursor-pointer",
        className
      )}
      onClick={() => window.location.href = `/games/${slug}`}
    >
      {/* Main card content */}
      <div className={`aspect-square relative ${bgColorClass}`}>
        {/* Brand tag in top left corner for Stake Originals */}
        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-white/10 backdrop-blur-sm text-[10px] text-white font-medium rounded-sm">
          STAKE ORIGINALS
        </div>
        
        {/* Background image if available */}
        {imageSource && (
          <ImageWithFallback
            src={imageSource}
            fallbackSrc={fallbackImageUrl}
            alt={`${name} game background`}
            className="h-full w-full object-cover"
          />
        )}
        
        {/* Game name at bottom of card */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          {getGameLabel()}
        </div>
      </div>
      
      {/* Player count - optional based on prop */}
      {showPlayerCount && (
        <div className="bg-[#172B3A] px-2 py-1 text-[11px] text-[#8BFF4E] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8BFF4E] mr-1.5"></div>
          {activePlayers.toLocaleString()} playing
        </div>
      )}
    </div>
  );
};

export default GameCard;