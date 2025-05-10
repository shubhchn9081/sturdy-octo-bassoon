import React from 'react';
import { DollarSign, Skull } from 'lucide-react';

interface PromotionalBannerProps {
  className?: string;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  className = ''
}) => {
  return (
    <div className={`w-full mb-6 ${className}`}>
      {/* Custom banner with Mines theme - matches the original image style */}
      <a href="/games/mines" className="block">
        <div 
          className="relative rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.01] duration-300"
          style={{
            background: 'linear-gradient(to right, #1a1207, #362100, #1a1207)',
            height: '180px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Decorative Bitcoin coins */}
          <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">₿</span>
          </div>
          <div className="absolute top-24 right-24 w-10 h-10 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center opacity-60">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <div className="absolute bottom-10 left-40 w-8 h-8 rounded-full bg-[#F7931A] shadow-lg flex items-center justify-center opacity-40">
            <span className="text-white font-bold text-sm">₿</span>
          </div>
          
          {/* Left side - Mines game grid */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 flex flex-col bg-[#18150e] p-2 rounded-lg border-2 border-[#F7931A]" style={{ transform: 'rotate(10deg)' }}>
            <div className="flex gap-1">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#444]">
                <Skull size={20} className="text-white" />
              </div>
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#444]">
                <Skull size={20} className="text-white" />
              </div>
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#444]">
                <Skull size={20} className="text-white" />
              </div>
            </div>
            <div className="flex gap-1 mt-1">
              <div className="w-10 h-10 bg-[#4CAF50] flex items-center justify-center rounded-md">
                <DollarSign size={20} className="text-white" />
              </div>
              <div className="w-10 h-10 bg-[#F44336] flex items-center justify-center rounded-md">
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
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#444]">
                <Skull size={20} className="text-white" />
              </div>
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-md border border-[#444]">
                <Skull size={20} className="text-white" />
              </div>
            </div>
          </div>
          
          {/* Cash blocks */}
          <div className="absolute left-40 bottom-8">
            <div className="w-16 h-12 bg-[#F7931A] rounded-md flex items-center justify-center shadow-lg" style={{ transform: 'perspective(500px) rotateY(20deg)' }}>
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
          <div className="absolute left-60 bottom-8">
            <div className="w-14 h-10 bg-[#F7931A] rounded-md flex items-center justify-center shadow-lg" style={{ transform: 'perspective(500px) rotateY(20deg)' }}>
              <DollarSign size={20} className="text-white" />
            </div>
          </div>
          
          {/* Right side - Text */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 text-right">
            <div className="text-white text-2xl md:text-3xl font-bold mb-1">SKIP THE MINES.</div>
            <div className="text-[#F7931A] text-4xl md:text-5xl font-extrabold leading-tight">WIN <br/>THE CASH!</div>
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
        </div>
      </a>
    </div>
  );
};

export default PromotionalBanner;