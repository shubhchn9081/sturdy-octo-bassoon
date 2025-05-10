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
      y: [0, -8, 0],
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

  // Game board subtle animation
  const boardAnimation = {
    initial: { boxShadow: "0 0 8px rgba(255, 187, 51, 0.3)" },
    animate: { 
      boxShadow: ["0 0 8px rgba(255, 187, 51, 0.3)", "0 0 15px rgba(255, 187, 51, 0.7)", "0 0 8px rgba(255, 187, 51, 0.3)"],
      transition: { 
        duration: 3,
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
            background: 'linear-gradient(to right, #150b00, #1f1200, #150b00)',
            height: '180px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Left section with Bitcoin */}
          <motion.div 
            className="absolute left-16 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            style={{ zIndex: 20 }}
          >
            <span className="text-white font-bold text-3xl">₿</span>
          </motion.div>
          
          {/* Top-right Bitcoin */}
          <motion.div 
            className="absolute top-12 right-20 w-16 h-16 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center opacity-70"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            style={{ animationDelay: "1s", zIndex: 10 }}
          >
            <span className="text-white font-bold text-2xl">₿</span>
          </motion.div>
          
          {/* Game board - center but slightly offset left */}
          <motion.div 
            className="absolute left-1/2 -translate-x-2/3 top-1/2 -translate-y-1/2"
            animate={{ 
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{ zIndex: 30 }}
          >
            <motion.div 
              className="flex flex-col bg-black p-3 rounded-lg border-2 border-[#FFBB33]"
              variants={boardAnimation}
              initial="initial"
              animate="animate"
            >
              <div className="flex gap-1.5">
                <div className="w-11 h-11 bg-black flex items-center justify-center rounded-md border border-[#444]">
                  <Skull size={20} className="text-white" />
                </div>
                <div className="w-11 h-11 bg-black flex items-center justify-center rounded-md border border-[#444]">
                  <Skull size={20} className="text-white" />
                </div>
                <div className="w-11 h-11 bg-black flex items-center justify-center rounded-md border border-[#444]">
                  <Skull size={20} className="text-white" />
                </div>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <div className="w-11 h-11 bg-[#4CAF50] flex items-center justify-center rounded-md">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="w-11 h-11 bg-[#FF5252] flex items-center justify-center rounded-md">
                  <Skull size={20} className="text-white" />
                </div>
                <div className="w-11 h-11 bg-[#4CAF50] flex items-center justify-center rounded-md">
                  <DollarSign size={20} className="text-white" />
                </div>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <div className="w-11 h-11 bg-[#4CAF50] flex items-center justify-center rounded-md">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="w-11 h-11 bg-black flex items-center justify-center rounded-md border border-[#444]">
                  <Skull size={20} className="text-white" />
                </div>
                <div className="w-11 h-11 bg-black flex items-center justify-center rounded-md border border-[#444]">
                  <Skull size={20} className="text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Text - no overlap, positioned to the right of the board */}
          <div className="absolute right-28 top-16 text-center z-30">
            <motion.div 
              className="text-white text-3xl md:text-4xl font-bold mb-1"
              variants={glowAnimation}
              initial="initial"
              animate="animate"
            >
              SKIP THE
            </motion.div>
            <motion.div 
              className="text-white text-3xl md:text-4xl font-bold mb-2"
              variants={glowAnimation}
              initial="initial"
              animate="animate"
            >
              MINES.
            </motion.div>
          </div>
          
          {/* WIN THE CASH text positioned below */}
          <div className="absolute right-28 bottom-14 text-center z-30">
            <motion.div 
              className="text-[#FFBB33] text-5xl md:text-6xl font-extrabold"
              style={{ 
                textShadow: "0 0 10px rgba(255, 187, 51, 0.5)",
                letterSpacing: "1px"
              }}
              variants={glowAnimation}
              initial="initial"
              animate="animate"
            >
              WIN
            </motion.div>
          </div>
          
          {/* THE CASH text */}
          <div className="absolute right-8 bottom-5 text-center z-30">
            <motion.div 
              className="text-[#FFBB33] text-3xl md:text-4xl font-extrabold"
              style={{ 
                textShadow: "0 0 8px rgba(255, 187, 51, 0.5)",
                letterSpacing: "1px"
              }}
              variants={glowAnimation}
              initial="initial"
              animate="animate"
            >
              THE CASH!
            </motion.div>
          </div>
          
          {/* Cash blocks positioned correctly */}
          <motion.div 
            className="absolute right-40 bottom-12"
            variants={pulseAnimation}
            initial="initial"
            animate="animate"
            style={{ zIndex: 25 }}
          >
            <div className="w-16 h-14 bg-[#FFBB33] rounded-md flex items-center justify-center shadow-lg" 
                style={{ transform: 'perspective(500px) rotateY(15deg)' }}>
              <DollarSign size={24} className="text-white" />
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute right-16 bottom-8"
            variants={pulseAnimation}
            initial="initial"
            animate="animate"
            style={{ 
              animationDelay: "0.5s",
              zIndex: 20 
            }}
          >
            <div className="w-14 h-12 bg-[#FFBB33] rounded-md flex items-center justify-center shadow-lg" 
                style={{ transform: 'perspective(500px) rotateY(15deg)' }}>
              <DollarSign size={22} className="text-white" />
            </div>
          </motion.div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
        </div>
      </a>
    </div>
  );
};

export default PromotionalBanner;