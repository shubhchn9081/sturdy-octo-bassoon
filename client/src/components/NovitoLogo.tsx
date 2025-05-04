import React from 'react';

interface NovitoLogoProps {
  className?: string;
}

const NovitoLogo: React.FC<NovitoLogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`font-bold tracking-wider text-base md:text-xl lg:text-2xl ${className}`} style={{ 
      fontFamily: "'Poppins', sans-serif", 
      letterSpacing: "0.1em",
      // Stylish gradient for modern look
      background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 20%, rgba(110, 223, 245, 0.8) 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      // Green glow effect
      filter: "drop-shadow(0 0 2px rgba(87, 251, 162, 0.7))",
      textShadow: "0 0 8px rgba(87, 251, 162, 0.3)"
    }}>
      NOVITO
    </div>
  );
};

export default NovitoLogo;