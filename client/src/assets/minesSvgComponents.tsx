import React from 'react';

// Use SVG directly for most reliable rendering with updated size to 30px as per Stake.com design
export const DiamondImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059444/ChatGPT_Image_Apr_17_2025_09_51_53_PM_jjposq.svg"
    alt="Diamond"
    width="30"
    height="30"
    className="tile-img"
  />
);

export const BombImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059444/ChatGPT_Image_Apr_17_2025_09_51_50_PM_gfvhjp.svg"
    alt="Bomb"
    width="30"
    height="30"
    className="tile-img"
  />
);

export const DarkerDiamondImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745059444/ChatGPT_Image_Apr_17_2025_09_51_53_PM_jjposq.svg"
    alt="Darker Diamond"
    width="30"
    height="30"
    className="tile-img"
    style={{ opacity: 0.8, filter: 'brightness(0.9)' }}
  />
);