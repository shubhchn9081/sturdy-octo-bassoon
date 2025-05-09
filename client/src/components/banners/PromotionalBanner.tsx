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
    <div className={`w-full relative overflow-hidden rounded-lg mb-4 ${className}`}>
      {/* Banner Images */}
      <div className="relative h-[170px] sm:h-[190px] md:h-[210px] lg:h-[230px]">
        {bannerItems.map((banner, index) => (
          <a 
            key={banner.id}
            href={banner.link}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentBannerIndex 
                ? isTransitioning ? 'opacity-50' : 'opacity-100' 
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.alt}
              className="w-full h-full object-cover object-center rounded-lg bg-black"
              style={{ objectPosition: '50% 50%' }}
              onError={(e) => {
                console.error('Failed to load banner image:', banner.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
  );
};

export default PromotionalBanner;