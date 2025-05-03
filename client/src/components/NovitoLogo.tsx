import React from 'react';

interface NovitoLogoProps {
  className?: string;
}

const NovitoLogo: React.FC<NovitoLogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`text-3xl ${className}`} style={{ 
      fontFamily: "'Sarina', cursive", 
      color: "#FFFFFF",
      textShadow: "0 0 1px #57FBA2, 0 0 2px #57FBA2"
    }}>
      Novito
    </div>
  );
};

export default NovitoLogo;