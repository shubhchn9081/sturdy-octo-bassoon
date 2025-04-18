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
  
  // We'll always use the specified image for all games
  const backgroundStyle = {
    backgroundImage: `url('/images/games/c830595cbd07b2561ac76a365c2f01869dec9a8fe5e7be30634d78c51b2cc91e.jpeg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div 
      className={cn("game-card block cursor-pointer overflow-hidden rounded-md transition-transform hover:translate-y-[-2px]", className)} 
      onClick={() => window.location.href = `/games/${slug}`}
    >
      <div 
        className="relative h-48 flex flex-col items-center justify-end"
        style={backgroundStyle}
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