import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromotionalBannerProps {
  className?: string;
}

const banners = [
  {
    id: 1,
    image: '/banners/carx-banner.png',
    alt: 'NEW ARRIVAL - CarX - RACE TO WIN!'
  },
  {
    id: 2,
    image: '/banners/mines-matrix-banner.png',
    alt: 'Mines Game - Skip the mines, win the cash!'
  },
  {
    id: 3,
    image: '/banners/crash-game-banner-new.png',
    alt: 'Crash Game - Test your nerve, play crash!'
  },
  {
    id: 4,
    image: '/banners/slots-banner.png',
    alt: 'Slots Game - Try your luck and spin slots!'
  }
];

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  className = ''
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  
  // Auto rotate banners every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className={`w-full mb-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Link banners to appropriate pages */}
          <a href={currentBanner === 0 ? "/car-crash" : "/casino"} className="block">
            <motion.div 
              className="relative rounded-lg shadow-lg overflow-hidden transition-transform duration-300"
              whileHover={{ scale: 1.01 }}
              style={{
                height: currentBanner === 0 ? '300px' : '200px', // Taller for CarX banner
                maxWidth: '1200px',
                margin: '0 auto',
              }}
            >
              {/* The banner image as background */}
              <div 
                className="w-full h-full bg-center bg-contain bg-no-repeat"
                style={{
                  backgroundImage: `url(${banners[currentBanner].image})`,
                  backgroundColor: currentBanner === 0 ? '#0a0a1a' : 'transparent', // Dark sci-fi background for CarX
                  backgroundPosition: 'center',
                  backgroundSize: currentBanner === 0 ? 'contain' : 'cover'
                }}
                role="img"
                aria-label={banners[currentBanner].alt}
              ></div>
              
              {/* Banner navigation dots */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((banner, index) => (
                  <button
                    key={banner.id}
                    className={`w-2 h-2 rounded-full ${
                      index === currentBanner ? 'bg-white' : 'bg-gray-500'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentBanner(index);
                    }}
                    aria-label={`View ${banner.alt}`}
                  />
                ))}
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
            </motion.div>
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PromotionalBanner;