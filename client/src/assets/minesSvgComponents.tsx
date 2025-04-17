import React from 'react';

// Use SVG directly for most reliable rendering
export const DiamondImage = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,5 95,50 50,95 5,50" fill="#7bfa4c" stroke="#38b916" strokeWidth="2" />
    <polygon points="50,15 85,50 50,85 15,50" fill="#66d139" />
    <polygon points="50,25 75,50 50,75 25,50" fill="#9dff70" />
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
    <defs>
      <radialGradient id="diamondGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#7bfa4c" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#38b916" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" fill="url(#diamondGlow)"/>
    <path d="M50,10 L85,40 L70,80 L30,80 L15,40 Z" fill="#5ac531" stroke="#38b916" strokeWidth="1"/>
    <path d="M50,15 L80,42 L65,75 L35,75 L20,42 Z" fill="#4aa828"/>
    <path d="M50,20 L75,44 L60,70 L40,70 L25,44 Z" fill="#70dd48"/>
    <path d="M50,25 L70,45 L55,65 L45,65 L30,45 Z" fill="#7bfa4c"/>
  </svg>
);