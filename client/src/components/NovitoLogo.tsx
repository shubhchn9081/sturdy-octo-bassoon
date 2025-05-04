import React from 'react';

interface NovitoLogoProps {
  className?: string;
  isMobile?: boolean;
}

const NovitoLogo: React.FC<NovitoLogoProps> = ({ className = "h-12", isMobile = false }) => {
  // More compact styling for mobile
  const fontSize = isMobile ? "text-sm md:text-xl lg:text-2xl" : "text-base md:text-xl lg:text-2xl";
  const textStyles = {
    fontFamily: "'Poppins', sans-serif", 
    letterSpacing: isMobile ? "0.05em" : "0.1em",
    // Stylish gradient for modern look
    background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 20%, rgba(110, 223, 245, 0.8) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    // Subtle green glow - reduced for mobile
    filter: isMobile ? "drop-shadow(0 0 1px rgba(87, 251, 162, 0.6))" : "drop-shadow(0 0 2px rgba(87, 251, 162, 0.7))",
    textShadow: isMobile ? "0 0 5px rgba(87, 251, 162, 0.2)" : "0 0 8px rgba(87, 251, 162, 0.3)"
  };

  return (
    <div 
      className={`font-bold tracking-wider ${fontSize} ${className}`} 
      style={textStyles}
    >
      NOVITO
    </div>
  );
};

export default NovitoLogo;