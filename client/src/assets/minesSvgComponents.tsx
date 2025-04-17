import React from 'react';

// Use SVG components directly
export const DiamondImage = () => (
  <img 
    src="/images/games/green-diamond.png"
    alt="Diamond"
    width="48"
    height="48"
  />
);

export const BombImage = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="55" r="40" fill="#333" />
    <rect x="48" y="10" width="4" height="15" fill="#666" />
    <rect x="45" y="5" width="10" height="5" fill="#999" />
    <path d="M70,35 C80,45 80,65 70,75 C60,85 40,85 30,75 C20,65 20,45 30,35 C40,25 60,25 70,35 Z" fill="#444" />
    <circle cx="40" cy="45" r="5" fill="#fff" />
  </svg>
);

export const DarkerDiamondImage = () => (
  <img 
    src="/images/games/darker-green-diamond.png"
    alt="Darker Diamond"
    width="48"
    height="48"
  />
);