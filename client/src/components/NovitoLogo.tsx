import React from 'react';

interface NovitoLogoProps {
  className?: string;
}

const NovitoLogo: React.FC<NovitoLogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`text-xl md:text-3xl tracking-wider ${className}`} style={{ 
      fontFamily: "'Sarina', cursive", 
      color: "#FFFFFF",
      textShadow: "0 0 1px #57FBA2, 0 0 2px #57FBA2"
    }}>
      Novito
    </div>
  );
};

export default NovitoLogo;