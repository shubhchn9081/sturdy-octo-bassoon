import React, { useEffect } from 'react';
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

  // Text animation variants
  const glowAnimation = {
    initial: { textShadow: "0 0 0px rgba(255,255,255,0)" },
    animate: { 
      textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 10px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"],
      transition: { 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" 
      }
    }
  };

  // Game board rotation animation variants
  const rotateAnimation = {
    initial: { rotate: 0 },
    animate: { 
      rotate: [0, 2, 0, -2, 0],
      transition: { 
        duration: 5,
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
          {/* Animated Bitcoin coins */}
          <motion.div 
            className="absolute top-8 left-12 w-16 h-16 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center z-10"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
          >
            <span className="text-white font-bold text-2xl">₿</span>
          </motion.div>
          
          <motion.div 
            className="absolute top-10 right-12 w-12 h-12 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center opacity-80"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="text-white font-bold text-xl">₿</span>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-12 right-40 w-10 h-10 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center opacity-60"
            variants={floatAnimation}
            initial="initial"
            animate="animate"
            style={{ animationDelay: "1s" }}
          >
            <span className="text-white font-bold text-lg">₿</span>
          </motion.div>
          
          {/* Left side - Mines game grid with rotation animation */}
          <motion.div 
            className="absolute left-20 top-1/2 transform -translate-y-1/2 flex flex-col bg-black p-2 rounded-lg border-2 border-[#FFBB33]"
            style={{ 
              boxShadow: "0 0 20px rgba(255, 187, 51, 0.3)",
            }}
            variants={rotateAnimation}
            initial="initial"
            animate="animate"
          >
            <div className="flex gap-1">
              <div className="w-12 h-12 bg-black flex items-center justify-center rounded-md border border-[#555]">
                <Skull size={22} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-black flex items-center justify-center rounded-md border border-[#555]">
                <Skull size={22} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-black flex items-center justify-center rounded-md border border-[#555]">
                <Skull size={22} className="text-white" />
              </div>
            </div>
            <div className="flex gap-1 mt-1">
              <div className="w-12 h-12 bg-[#4CAF50] flex items-center justify-center rounded-md">
                <DollarSign size={22} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-[#FF5252] flex items-center justify-center rounded-md">
                <Skull size={22} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-[#4CAF50] flex items-center justify-center rounded-md">
                <DollarSign size={22} className="text-white" />
              </div>
            </div>
            <div className="flex gap-1 mt-1">
              <div className="w-12 h-12 bg-[#4CAF50] flex items-center justify-center rounded-md">
                <DollarSign size={22} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-black flex items-center justify-center rounded-md border border-[#555]">
                <Skull size={22} className="text-white" />
              </div>
              <div className="w-12 h-12 bg-black flex items-center justify-center rounded-md border border-[#555]">
                <Skull size={22} className="text-white" />
              </div>
            </div>
          </motion.div>
          
          {/* Animated Cash blocks */}
          <motion.div 
            className="absolute left-52 bottom-12"
            variants={pulseAnimation}
            initial="initial"
            animate="animate"
          >
            <div className="w-20 h-16 bg-[#FFBB33] rounded-md flex items-center justify-center shadow-lg" 
                 style={{ transform: 'perspective(500px) rotateY(20deg)' }}>
              <DollarSign size={28} className="text-white" />
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute left-80 bottom-8"
            variants={pulseAnimation}
            initial="initial"
            animate="animate"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-16 h-12 bg-[#FFBB33] rounded-md flex items-center justify-center shadow-lg" 
                 style={{ transform: 'perspective(500px) rotateY(20deg)' }}>
              <DollarSign size={24} className="text-white" />
            </div>
          </motion.div>
          
          {/* Right side - Text with glow animation */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 text-right z-10">
            <motion.div 
              className="text-white text-3xl md:text-4xl font-bold mb-2"
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
                letterSpacing: "1px",
                fontStyle: "italic"
              }}
              variants={glowAnimation}
              initial="initial"
              animate="animate"
            >
              WIN <br/>THE CASH!
            </motion.div>
          </div>
          
          {/* Gradient overlay to improve visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0c00] via-transparent to-[#1a0c00] opacity-30"></div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
        </div>
      </a>
    </div>
  );
};

export default PromotionalBanner;