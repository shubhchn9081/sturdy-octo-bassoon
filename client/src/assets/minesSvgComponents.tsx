import React from 'react';

// Use SVG components directly
export const DiamondImage = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,5 95,50 50,95 5,50" fill="#3db9d3" stroke="#ffffff" strokeWidth="2" />
    <polygon points="50,15 85,50 50,85 15,50" fill="#25a6c4" />
    <polygon points="50,25 75,50 50,75 25,50" fill="#7fecff" />
  </svg>
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
  <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,5 95,50 50,95 5,50" fill="#2a7f91" stroke="#ffffff" strokeWidth="2" />
    <polygon points="50,15 85,50 50,85 15,50" fill="#1a6a7a" />
    <polygon points="50,25 75,50 50,75 25,50" fill="#3eaec4" />
  </svg>
);