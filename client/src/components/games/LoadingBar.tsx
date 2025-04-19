import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoadingBarProps {
  duration?: number;
  onComplete?: () => void;
  color?: string;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ 
  duration = 5, 
  onComplete, 
  color = '#00ff00' 
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: "100%",
        duration: duration,
        ease: "power1.inOut",
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    }
    
    return () => {
      // Clean up animation on unmount
      gsap.killTweensOf(progressBarRef.current);
    };
  }, [duration, onComplete]);

  return (
    <div className="w-full h-1 bg-gray-800 fixed top-0 left-0 z-50">
      <div 
        ref={progressBarRef} 
        className="h-full" 
        style={{ 
          width: '0%', 
          backgroundColor: color,
          transition: 'width 0.1s linear'
        }}
      ></div>
    </div>
  );
};

export default LoadingBar;