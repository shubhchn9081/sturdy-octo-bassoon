import React from "react";
import bonusImagePath from "@assets/ChatGPT Image May 10, 2025, 06_50_13 PM.png";

export const LoginBanner: React.FC = () => {
  return (
    <div className="w-full mb-6 overflow-hidden rounded-lg shadow-lg">
      <div 
        className="relative bg-gradient-to-r from-[#6D28D9] via-[#EC4899] to-[#FACC15] p-6 flex items-center justify-between"
        style={{ 
          background: "linear-gradient(90deg, #6D28D9 0%, #EC4899 50%, #FACC15 100%)"
        }}
      >
        <div className="max-w-[50%] flex-shrink-0">
          <img 
            src={bonusImagePath} 
            alt="Claim your new user bonus" 
            className="h-auto max-w-full object-contain"
          />
        </div>
        
        <div className="text-white text-right hidden md:block">
          <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-md">NEW USER PROMO</h3>
          <p className="text-sm md:text-base font-medium">Login now to claim your bonus!</p>
        </div>
      </div>
    </div>
  );
};

export default LoginBanner;