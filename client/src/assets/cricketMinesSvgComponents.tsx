import React from 'react';

// Use SVG directly for most reliable rendering with updated size to 40px to match larger tiles
export const SixImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745077770/ChatGPT_Image_Apr_19_2025_09_19_07_PM_wcektu.png"
    alt="Six"
    width="40"
    height="40"
    className="tile-img animate-pop"
  />
);

export const OutImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745077771/ChatGPT_Image_Apr_19_2025_09_19_05_PM_q8csfd.png"
    alt="Out"
    width="40"
    height="40"
    className="tile-img animate-explosion"
  />
);

export const DarkerSixImage = () => (
  <img 
    src="https://res.cloudinary.com/dq8b1e8qy/image/upload/v1745077770/ChatGPT_Image_Apr_19_2025_09_19_07_PM_wcektu.png"
    alt="Darker Six"
    width="40"
    height="40"
    className="tile-img animate-pop"
    style={{ opacity: 0.8, filter: 'brightness(0.9)' }}
  />
);