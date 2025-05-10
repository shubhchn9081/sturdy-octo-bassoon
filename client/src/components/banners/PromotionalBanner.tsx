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

  // Calculate aspect ratio based on original image dimensions (1536px × 1024px)
  // 1024 / 1536 = 0.6667 or 2:3 aspect ratio
  const aspectRatio = 1024 / 1536;

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="relative rounded-lg shadow-lg overflow-hidden bg-[#111]">
        <div className="flex justify-center items-center">
          <div className="w-full" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div 
              style={{ 
                position: 'relative',
                paddingBottom: `${aspectRatio * 50}%`, // Adjust padding to control display height
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <a 
                href={banner.link} 
                className="block" 
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={banner.imageUrl} 
                  alt={banner.alt}
                  className="rounded-lg hover:opacity-95 transition-opacity"
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    maxHeight: '100%',
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
    </div>
  );
};

export default PromotionalBanner;