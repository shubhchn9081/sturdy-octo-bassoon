import React from 'react';
import { motion } from 'framer-motion';

interface PromotionalBannerProps {
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  className = ''
}) => {
  return (
    <div className={`w-full mb-6 ${className}`}>
      <a href="/games/mines" className="block">
        <motion.div 
          className="relative rounded-lg shadow-lg overflow-hidden transition-transform duration-300"
          whileHover={{ scale: 1.01 }}
          style={{
            height: '200px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* The banner image as background */}
          <div 
            className="w-full h-full bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: 'url(/banners/mines-matrix-banner.png)'
            }}
          ></div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
        </motion.div>
      </a>
    </div>
  );
};

export default PromotionalBanner;