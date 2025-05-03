import React from 'react';
import { cn } from '@/lib/utils';

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
  // Function to get gradient style based on game type - exact Stake.com colors
  const getGradientStyle = () => {
    switch (name) {
      case 'DICE':
        return { background: '#7b1fa2' }; // Purple
      case 'MINES':
        return { background: '#1e88e5' }; // Blue
      case 'PLINKO':
        return { background: '#7c4dff' }; // Purple-Blue
      case 'CRASH':
        return { background: '#ffb300' }; // Gold
      case 'LIMBO':
        return { background: '#ff9800' }; // Orange
      case 'PUMP':
        return { background: '#f44336' }; // Red
      case 'KENO':
        return { background: '#00bcd4' }; // Teal
      case 'CRICKET MINES':
        return { background: '#4caf50' }; // Green
      case 'WHEEL':
        return { background: '#f9a825' }; // Yellow
      case 'HILO':
        return { background: '#009688' }; // Turquoise
      case 'VIDEO POKER':
        return { background: '#d32f2f' }; // Dark Red
      case 'DRAGON TOWER':
        return { background: '#ff5722' }; // Deep Orange
      case 'BLUE SAMURAI':
        return { background: '#3949ab' }; // Indigo
      default:
        return { background: '#1e88e5' }; // Default Blue
    }
  };
  
  // Function to get image url for each game
  const getImageSource = () => {
    // For games with Cloudinary images
    switch (name) {
      case 'CRICKET MINES':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1745078272/ChatGPT_Image_Apr_19_2025_09_27_40_PM_hitkbs.png';
      case 'CRASH':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744990211/c830595cbd07b2561ac76a365c2f01869dec9a8fe5e7be30634d78c51b2cc91e_j3olae.jpg';
      case 'PLINKO':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744990620/5cbb2498c956527e6584c6af216489b85bbb7a909c7d3c4e131a3be9bd1cc6bf_wlazjb.jpg';
      case 'LIMBO':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744990620/11caec5df20098884ae9071848e1951b8b34e5ec84a7241f2e7c5afd4b323dfd_iitvtz.jpg';
      case 'MINES':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744990620/15a51a2ae2895872ae2b600fa6fe8d7f8d32c9814766b66ddea2b288d04ba89c_uj47yo.jpg';
      case 'DICE':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744990621/30688668d7d2d48d472edd0f1e2bca0758e7ec51cbab8c04d8b7f157848640e0_ec0wxi.jpg';
      case 'KENO':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744990621/102cf3d7c840018b939cd787bf013e080b996d80e604f3008f21dddf1f1aa201_phwj9c.jpg';
      case 'WHEEL':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1744994352/e0a4131a16c28a1c1516958c93ec90c6f0f1bb00f41de87f72f6800c535b9c6f_fl9nyv.jpg';
      case 'COIN FLIP':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1745059353/1c0de2ee0ce713086ff7735697ad2b5385bc974f206b857c724a5ec84467a73b_srnwo0.png';
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
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/0dec0a589e3aad3d7130fd0fbb1502d174dca0f9-1080x1080.png';
      case 'LIMBO':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/14a07f57ad5198ffadd4e0d4386245f4e017d030-1080x1080.png';
      case 'MINES':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1745173634/5da127925ac99a19da0cd888e5436049bc42f8ee4002df80cdc817f0501ab8a7_fhf3kc.png';
      case 'CRICKET MINES':
        // Crop the bottom part where "STAKE ORIGINALS" appears (crop height by 90%)
        return 'https://res.cloudinary.com/dq8b1e8qy/image/upload/c_limit,h_0.9,w_1.0/v1745173403/Cricket_Mines_Resized_xfosv9.png';
      case 'DICE':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/1b45a8e293264dab4677f8187e8d71feeb56adabc02510a59d6b4e780c1e5b4c.png';
      case 'VIDEO POKER':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/1c0de2ee0ce713086ff7735697ad2b5385bc974f206b857c724a5ec84467a73b.png';
      case 'DRAGON TOWER':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/2c3e16f0a3b8cd8d979265e48dd6a169937a4a4d0acb05ad532ca8345a1e6f21.jpeg';
      case 'PLINKO':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/4031cec525edc307c71df6dddc71506ab06150fd5c14194a5dc9ca6fb54893a1.jpeg';
      case 'BLUE SAMURAI':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/59d1df22a2931a965fc241a436a398f460e71ea9d0214f66780a52b56655d392.jpeg';
      case 'HILO':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/86cd89b12ec34439c0d1a6e32b06c971efc86091e09ba466182abe173c3d3f7d.jpeg';
      case 'PUMP':
        // Local file - should be replaced with Cloudinary cropped version if available
        return '/images/games/e0a4131a16c28a1c1516958c93ec90c6f0f1bb00f41de87f72f6800c535b9c6f.jpeg';
      default:
        return null;
    }
  };
  
  // Get game icon based on game type
  const getGameIcon = () => {
    switch (name) {
      case 'CRICKET MINES':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center">
              <div className="w-5 h-5 bg-white/80 rounded-sm flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">6</span>
              </div>
            </div>
          </div>
        );
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
      case 'WHEEL':
        return (
          <div className="w-12 h-12 mb-2 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-yellow-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500"></div>
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

  return (
    <div 
      className={cn(
        "game-card",
        "w-full max-w-[146px] mx-auto", // Exact width from Stake.com, centered on mobile
        className
      )}
      onClick={() => window.location.href = `/games/${slug}`}
    >
      {/* Main card content - matching Stake.com layout - responsive height */}
      <div className="relative w-full h-[176px]">
        {/* Background gradient or image */}
        <div 
          className="absolute inset-0 w-full h-full rounded-t-lg" 
          style={!imageSource ? gradientStyle : undefined}
        ></div>
        
        {/* Background image if available */}
        {imageSource && (
          <img
            src={imageSource}
            alt={`${name} game background`}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        
        {/* No text overlay as images already contain game names */}
        
        {/* Multiplier badge in top right if available - exact Stake.com style */}
        {multiplier && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-yellow-400 text-white text-[8px] sm:text-[10px] font-bold py-0.5 px-1 sm:px-1.5 rounded-sm flex items-center">
            <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-orange-500 mr-0.5 sm:mr-1"></div>
            {multiplier}
          </div>
        )}
      </div>
      
      {/* Player count - exactly matching Stake.com styling */}
      <div className="bg-[#172B3A] px-2 py-0.5 text-[10px] text-green-400 flex items-center justify-center rounded-b-lg">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1"></div>
        {activePlayers.toLocaleString()} playing
      </div>
    </div>
  );
};

export default GameCard;