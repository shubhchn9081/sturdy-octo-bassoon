import React from 'react';

// Use SVG directly for most reliable rendering with updated size to 40px to match larger tiles
export const DiamondImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059444/ChatGPT_Image_Apr_17_2025_09_51_53_PM_jjposq.svg"
    alt="Diamond"
    width="40"
    height="40"
    className="tile-img animate-pop"
  />
);

export const BombImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059444/ChatGPT_Image_Apr_17_2025_09_51_50_PM_gfvhjp.svg"
    alt="Bomb"
    width="40"
    height="40"
    className="tile-img animate-explosion"
  />
);

export const DarkerDiamondImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059444/ChatGPT_Image_Apr_17_2025_09_51_53_PM_jjposq.svg"
    alt="Darker Diamond"
    width="40"
    height="40"
    className="tile-img animate-pop"
    style={{ opacity: 0.8, filter: 'brightness(0.9)' }}
  />
);