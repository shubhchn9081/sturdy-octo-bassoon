import React from 'react';
import { DollarSign, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromotionalBannerProps {
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  className = ''
}) => {
  // Bitcoin animation variants
  const floatAnimation = {
    initial: { y: 0 },
    animate: { 
      y: [0, -10, 0],
      transition: { 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" 
      }
    }
  };

  // Cash blocks animation variants
  const pulseAnimation = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Subtle glow animation for text
  const glowAnimation = {
    initial: { textShadow: "0 0 5px rgba(255, 187, 51, 0.3)" },
    animate: { 
      textShadow: ["0 0 5px rgba(255, 187, 51, 0.3)", "0 0 15px rgba(255, 187, 51, 0.7)", "0 0 5px rgba(255, 187, 51, 0.3)"],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" 
      }
    }
  };

  return (
    <div className={`w-full mb-6 ${className}`}>
      <a href="/games/mines" className="block">
        <div 
          className="relative rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.01] duration-300"
          style={{
            background: 'linear-gradient(to right, #1a0c00, #2a1500, #1a0c00)',
            height: '180px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Main content container with proper layout */}
          <div className="absolute inset-0 flex items-center">
            {/* Left side - Bitcoin coin */}
            <div className="w-[30%] h-full relative flex items-center justify-center">
              <motion.div 
                className="w-20 h-20 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center z-10"
                variants={floatAnimation}
                initial="initial"
                animate="animate"
              >
                <span className="text-white font-bold text-3xl">₿</span>
              </motion.div>
            </div>
            
            {/* Middle section - Game board */}
            <div className="w-[30%] h-full relative flex items-center justify-center">
              <div style={{ transform: 'translateX(-20px)' }}>
                <motion.div 
                  className="flex flex-col bg-black p-2 rounded-lg border-2 border-[#FFBB33]"
                  style={{ 
                    boxShadow: "0 0 20px rgba(255, 187, 51, 0.3)",
                    zIndex: 20,
                  }}
                  animate={{ 
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <div className="flex gap-1">
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#555]">
                      <Skull size={20} className="text-white" />
                    </div>
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#555]">
                      <Skull size={20} className="text-white" />
                    </div>
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#555]">
                      <Skull size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-10 h-10 bg-[#4CAF50] flex items-center justify-center rounded-md">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <div className="w-10 h-10 bg-[#FF5252] flex items-center justify-center rounded-md">
                      <Skull size={20} className="text-white" />
                    </div>
                    <div className="w-10 h-10 bg-[#4CAF50] flex items-center justify-center rounded-md">
                      <DollarSign size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-10 h-10 bg-[#4CAF50] flex items-center justify-center rounded-md">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#555]">
                      <Skull size={20} className="text-white" />
                    </div>
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#555]">
                      <Skull size={20} className="text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Right section - Text and cash blocks */}
            <div className="w-[40%] h-full relative">
              {/* Text with no overlap */}
              <div className="absolute top-8 right-10 text-right z-30 w-full max-w-[90%]">
                <motion.div 
                  className="text-white text-3xl md:text-4xl font-bold mb-1"
                  variants={glowAnimation}
                  initial="initial"
                  animate="animate"
                >
                  SKIP THE MINES.
                </motion.div>
                <motion.div 
                  className="text-[#FFBB33] text-5xl md:text-6xl font-extrabold leading-tight"
                  style={{ 
                    textShadow: "0 0 10px rgba(255, 187, 51, 0.5)",
                    letterSpacing: "1px"
                  }}
                  variants={glowAnimation}
                  initial="initial"
                  animate="animate"
                >
                  WIN<br/>THE CASH!
                </motion.div>
              </div>
              
              {/* Cash blocks positioned below text */}
              <div className="absolute bottom-10 left-10 flex space-x-4">
                <motion.div
                  variants={pulseAnimation}
                  initial="initial"
                  animate="animate"
                >
                  <div className="w-16 h-12 bg-[#FFBB33] rounded-md flex items-center justify-center shadow-lg" 
                      style={{ transform: 'perspective(500px) rotateY(20deg)' }}>
                    <DollarSign size={24} className="text-white" />
                  </div>
                </motion.div>
                
                <motion.div
                  variants={pulseAnimation}
                  initial="initial"
                  animate="animate"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="w-14 h-10 bg-[#FFBB33] rounded-md flex items-center justify-center shadow-lg" 
                      style={{ transform: 'perspective(500px) rotateY(20deg)' }}>
                    <DollarSign size={20} className="text-white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Bitcoin floating in the background */}
          <motion.div 
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center opacity-60"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            style={{ animationDelay: "1s" }}
          >
            <span className="text-white font-bold text-sm">₿</span>
          </motion.div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
        </div>
      </a>
    </div>
  );
};

export default PromotionalBanner;