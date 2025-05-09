import React from 'react';

interface PromotionalBannerProps {
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  className = ''
}) => {
  // Banner data
  const banner = {
    imageUrl: '/banners/mines-new-banner.png', // Will be served from the public folder
    alt: 'Skip the Mines. Win the Cash!',
    link: '/games/mines'
  };

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="relative rounded-lg shadow-lg overflow-hidden bg-[#111]">
        <div className="flex justify-center items-center">
          <div className="w-full">
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
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;