import React from 'react';

interface NovitoLogoProps {
  className?: string;
}

const NovitoLogo: React.FC<NovitoLogoProps> = ({ className = "h-12" }) => {
  return (
    <div className={`text-sm md:text-3xl font-semibold tracking-wider uppercase md:normal-case ${className}`} style={{ 
      fontFamily: "'Poppins', sans-serif", 
      color: "#FFFFFF",
      textShadow: "0 0 1px #57FBA2, 0 0 2px #57FBA2"
    }}>
      Novito
    </div>
  );
};

export default NovitoLogo;