import React from 'react';

interface NovitoLogoProps {
  className?: string;
}

const NovitoLogo: React.FC<NovitoLogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`font-semibold tracking-wider text-sm md:text-xl lg:text-2xl ${className}`} style={{ 
      fontFamily: "'Sarina', cursive", 
      color: "#FFFFFF",
      background: "linear-gradient(to bottom, #FFFFFF 0%, #CCCCCC 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "0 0 10px rgba(87, 251, 162, 0.5)",
      letterSpacing: "0.05em"
    }}>
      NOVITO
    </div>
  );
};

export default NovitoLogo;