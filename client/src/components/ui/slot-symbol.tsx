import React, { useState, useEffect } from 'react';
import { getSymbolImageUrl, getSymbolEmoji } from '@/lib/slotAssets';

interface SlotSymbolProps {
  themeId: string;
  symbolId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isWinning?: boolean;
  isLucky?: boolean;
}

/**
 * SlotSymbol component displays a slot machine symbol with image and fallback emoji
 */
const SlotSymbol: React.FC<SlotSymbolProps> = ({
  themeId,
  symbolId,
  size = 'md',
  className = '',
  isWinning = false,
  isLucky = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [fallbackEmoji, setFallbackEmoji] = useState('❓');
  
  // Determine size in pixels
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
  };
  const pixelSize = sizeMap[size];
  
  // Load image and fallback emoji
  useEffect(() => {
    // Get emoji fallback
    const emoji = getSymbolEmoji(themeId, symbolId);
    setFallbackEmoji(emoji);
    
    // Get image URL
    const url = getSymbolImageUrl(themeId, symbolId);
    setImageUrl(url);
    
    // Preload image
    if (url) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
      img.src = url;
    }
  }, [themeId, symbolId]);
  
  // Apply special effects for winning or lucky symbols
  const effectClasses = [
    isWinning ? 'winning-symbol' : '',
    isLucky ? 'lucky-symbol' : '',
  ].join(' ');
  
  return (
    <div 
      className={`slot-symbol ${size} ${effectClasses} ${className} flex items-center justify-center relative`}
      style={{ 
        width: `${pixelSize}px`, 
        height: `${pixelSize}px`,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Glow effect for winning symbols */}
      {isWinning && (
        <div 
          className="absolute inset-0 animate-pulse rounded-md z-0" 
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.2)',
            boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)',
            animationDuration: '1.5s'
          }}
        />
      )}
      
      {/* Special effect for lucky symbols */}
      {isLucky && (
        <div 
          className="absolute inset-0 rounded-md z-0" 
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)'
          }}
        />
      )}
      
      {/* Image if loaded, otherwise emoji fallback */}
      {imageLoaded && imageUrl ? (
        <img 
          src={imageUrl} 
          alt={symbolId}
          className="z-10 transition-all"
          style={{ 
            width: `${pixelSize * 0.8}px`, 
            height: `${pixelSize * 0.8}px`,
            filter: isLucky ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : undefined,
            transform: isWinning ? 'scale(1.1)' : undefined
          }}
        />
      ) : (
        <span 
          className="text-center z-10"
          style={{ fontSize: `${pixelSize * 0.5}px` }}
        >
          {fallbackEmoji}
        </span>
      )}
    </div>
  );
};

export default SlotSymbol;