import React, { useState, useEffect, useRef } from 'react';

// Define banner item interface
interface BannerItem {
  id: number;
  imageUrl: string;
  alt: string;
  link: string;
}

// Banner images data
const bannerItems: BannerItem[] = [
  {
    id: 1,
    imageUrl: '/banners/crash-game-banner.png', // Will be served from the public folder
    alt: 'Dodge the Crash. Get the Cash!',
    link: '/games/rocket-launch'
  },
  {
    id: 2,
    imageUrl: '/banners/mines-game-banner.png', // Will be served from the public folder
    alt: 'Skip the Mines. Get the Cash!',
    link: '/games/mines'
  }
];

interface PromotionalBannerProps {
  autoRotateInterval?: number; // in milliseconds
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  autoRotateInterval = 3000,
  className = ''
}) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalBanners = bannerItems.length;

  // Auto rotation effect
  useEffect(() => {
    const startAutoRotation = () => {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % totalBanners);
          setIsTransitioning(false);
        }, 300); // Duration of fade transition
      }, autoRotateInterval);
    };

    startAutoRotation();

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRotateInterval, totalBanners]);

  // Manual navigation
  const goToBanner = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBannerIndex(index);
      setIsTransitioning(false);
      
      // Restart auto rotation after manual navigation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % totalBanners);
          setIsTransitioning(false);
        }, 300);
      }, autoRotateInterval);
    }, 300);
  };

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="relative rounded-lg shadow-lg overflow-hidden bg-[#111]">
        <div className="flex justify-center items-center">
          {bannerItems.map((banner, index) => (
            <div
              key={banner.id}
              className={`transition-opacity duration-300 ${
                index === currentBannerIndex 
                  ? isTransitioning ? 'opacity-50' : 'opacity-100 block' 
                  : 'opacity-0 hidden'
              }`}
            >
              <a href={banner.link} className="block">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.alt}
                  className="rounded-lg hover:opacity-95 transition-opacity"
                  style={{ 
                    height: 'auto', 
                    width: '100%', 
                    maxWidth: '800px', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    margin: '0 auto',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Failed to load banner image:', banner.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentBannerIndex ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;