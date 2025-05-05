import React, { useEffect, useState, useRef } from 'react';

// Rocket ship component
export const RocketShip: React.FC<{ size: number; flameActive?: boolean }> = ({ 
  size, 
  flameActive = true 
}) => {
  return (
    <div className="relative" style={{ width: size, height: size * 2 }}>
      {/* Rocket body */}
      <div 
        className="absolute w-full h-[60%] bg-gradient-to-b from-white to-gray-300 rounded-full"
        style={{ 
          top: '10%',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
        }}
      >
        {/* Windows */}
        <div className="absolute w-[30%] h-[20%] bg-blue-400 rounded-full left-[35%] top-[20%]" />
        <div className="absolute w-[20%] h-[15%] bg-blue-400 rounded-full left-[40%] top-[50%]" />
      </div>
      
      {/* Rocket nose */}
      <div 
        className="absolute w-[60%] h-[20%] bg-red-500 rounded-t-full"
        style={{ 
          left: '20%',
          top: '0%'
        }}
      />
      
      {/* Rocket fins */}
      <div 
        className="absolute w-[30%] h-[20%] bg-red-500"
        style={{ 
          left: '-15%',
          bottom: '20%',
          transform: 'skew(30deg, 0deg)'
        }}
      />
      <div 
        className="absolute w-[30%] h-[20%] bg-red-500"
        style={{ 
          right: '-15%',
          bottom: '20%',
          transform: 'skew(-30deg, 0deg)'
        }}
      />
      
      {/* Rocket base */}
      <div 
        className="absolute w-[80%] h-[10%] bg-gray-700 rounded-b-lg"
        style={{ 
          left: '10%',
          bottom: '10%'
        }}
      />
      
      {/* Flame effect when active */}
      {flameActive && (
        <div className="absolute" style={{ bottom: '0%', left: '20%', width: '60%', height: '30%' }}>
          <div className="h-full w-full relative overflow-hidden">
            <div className="absolute inset-0 flex justify-center items-end">
              <div className="w-full animate-flame-outer">
                <div className="h-full w-full bg-orange-500 rounded-t-full animate-flame" />
              </div>
              <div className="w-[60%] absolute animate-flame-inner">
                <div className="h-full w-full bg-yellow-300 rounded-t-full animate-flame-fast" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rocket explosion animation
export const RocketExplosion: React.FC<{ size: number }> = ({ size }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full bg-orange-500 rounded-full opacity-80 animate-explosion-outer" />
        <div className="absolute w-[80%] h-[80%] bg-yellow-500 rounded-full opacity-90 animate-explosion-middle" />
        <div className="absolute w-[60%] h-[60%] bg-white rounded-full opacity-90 animate-explosion-inner" />
        
        {/* Explosion particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-[10%] h-[10%] bg-orange-500 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              opacity: 0.7 + Math.random() * 0.3,
              animation: `particle-explosion 1s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Fuel gauge component
export const FuelGauge: React.FC<{ level: number; size: number }> = ({ level, size }) => {
  // Level should be between 0 and 1
  const safeLevel = Math.max(0, Math.min(1, level));
  const gaugeHeight = size * 0.8;
  const gaugeWidth = size * 0.3;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="flex items-center gap-2">
        <div className="text-sm text-white font-bold">FUEL</div>
        <div className="relative" style={{ height: gaugeHeight, width: gaugeWidth }}>
          {/* Gauge background */}
          <div 
            className="absolute inset-0 bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden"
          />
          
          {/* Gauge level */}
          <div 
            className={`absolute bottom-0 left-0 right-0 rounded-b-[0.25rem] transition-height duration-200
              ${safeLevel > 0.6 ? 'bg-green-500' : safeLevel > 0.3 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ 
              height: `${safeLevel * 100}%`,
            }}
          >
            {/* Fuel gauge lines */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-full h-[1px] bg-gray-800/40"
                style={{ bottom: `${i * 10}%` }}
              />
            ))}
          </div>
          
          {/* Gauge markings */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-full flex justify-between items-center"
              style={{ bottom: `${i * 25}%`, transform: 'translateY(50%)' }}
            >
              <div className="w-[4px] h-[2px] bg-gray-400 -ml-[1px]" />
              <div className="text-[8px] text-gray-300 absolute -left-[20px]">
                {i * 25}%
              </div>
              <div className="w-[4px] h-[2px] bg-gray-400 -mr-[1px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Space background with stars
export const SpaceBackground: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  // Generate random stars
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2,
    opacity: 0.5 + Math.random() * 0.5,
    twinkle: Math.random() > 0.7
  }));
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-black opacity-30" />
      
      {/* Stars */}
      {stars.map(star => (
        <div 
          key={star.id}
          className={`absolute rounded-full bg-white ${star.twinkle ? 'animate-twinkle' : ''}`}
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  );
};

// Galaxy background with nebula
export const GalaxyBackground: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40" />
      
      {/* Nebula effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-1/3 h-1/3 rounded-full bg-pink-500/20 blur-3xl" />
      </div>
    </div>
  );
};

// Atmosphere stage visuals
export const AtmosphereStage: React.FC<{ 
  stage: 'ground' | 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere' | 'space',
  width: number,
  height: number
}> = ({ stage, width, height }) => {
  
  // Background gradients for different atmosphere layers
  const backgrounds = {
    ground: 'bg-gradient-to-t from-gray-900 via-gray-800 to-blue-900',
    troposphere: 'bg-gradient-to-t from-blue-900 via-blue-700 to-blue-500',
    stratosphere: 'bg-gradient-to-t from-blue-500 via-indigo-600 to-indigo-700',
    mesosphere: 'bg-gradient-to-t from-indigo-700 via-purple-700 to-purple-800',
    thermosphere: 'bg-gradient-to-t from-purple-800 via-violet-900 to-violet-950',
    exosphere: 'bg-gradient-to-t from-violet-950 via-slate-900 to-black',
    space: 'bg-black'
  };
  
  // Background visuals for different layers
  const renderLayerSpecificElements = () => {
    switch (stage) {
      case 'ground':
        return (
          <div className="absolute inset-0">
            {/* Launch pad - fixed position */}
            <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gray-800" />
            <div className="absolute bottom-[15%] left-[40%] right-[40%] h-[5%] bg-gray-700 shadow-lg" />
            <div className="absolute bottom-[20%] left-[45%] right-[45%] h-[15%] bg-gray-600 opacity-60" />
            
            {/* Control towers */}
            <div className="absolute bottom-[15%] left-[30%] w-[5%] h-[20%] bg-gray-700" />
            <div className="absolute bottom-[15%] right-[30%] w-[5%] h-[20%] bg-gray-700" />
            
            {/* Buildings in background */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bottom-[15%] bg-gray-900"
                style={{
                  left: `${5 + i * 12}%`,
                  height: `${5 + Math.random() * 10}%`,
                  width: '5%'
                }}
              />
            ))}
            
            {/* Clouds */}
            <div className="absolute bottom-[30%] left-[10%] w-[25%] h-[5%] bg-white/10 rounded-full" />
            <div className="absolute bottom-[40%] right-[15%] w-[30%] h-[7%] bg-white/10 rounded-full" />
          </div>
        );
        
      case 'troposphere':
        return (
          <div className="absolute inset-0">
            {/* Clouds */}
            <div className="absolute bottom-[5%] left-[5%] w-[40%] h-[10%] bg-white/20 rounded-full" />
            <div className="absolute bottom-[15%] right-[10%] w-[50%] h-[12%] bg-white/20 rounded-full" />
            <div className="absolute bottom-[25%] left-[20%] w-[45%] h-[8%] bg-white/15 rounded-full" />
            <div className="absolute top-[10%] right-[5%] w-[30%] h-[7%] bg-white/10 rounded-full" />
          </div>
        );
        
      case 'stratosphere':
        return (
          <div className="absolute inset-0">
            {/* Thin clouds */}
            <div className="absolute bottom-[5%] left-[15%] w-[70%] h-[3%] bg-white/10 rounded-full" />
            <div className="absolute bottom-[12%] right-[5%] w-[50%] h-[2%] bg-white/10 rounded-full" />
            
            {/* Subtle horizon line instead of big earth curve */}
            <div className="absolute bottom-0 left-0 right-0 h-[2%] bg-blue-800/30" />
          </div>
        );
        
      case 'mesosphere':
        return (
          <div className="absolute inset-0">
            {/* Just a thin horizon line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-blue-700/40" />
            
            {/* Auroras */}
            <div className="absolute bottom-[10%] left-[10%] right-[10%] h-[15%] bg-green-500/10 blur-xl" />
            <div className="absolute bottom-[5%] left-[5%] right-[5%] h-[10%] bg-blue-500/10 blur-xl" />
            
            {/* Stars appearing in the distance */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  opacity: 0.2 + Math.random() * 0.4
                }}
              />
            ))}
          </div>
        );
        
      case 'thermosphere':
        return (
          <div className="absolute inset-0">
            {/* No visible earth, just stars and auroras */}
            
            {/* Auroras */}
            <div className="absolute bottom-[5%] left-[5%] right-[5%] h-[20%] bg-purple-500/15 blur-xl" />
            <div className="absolute bottom-[0%] left-[0%] right-[0%] h-[15%] bg-green-500/15 blur-xl" />
            
            {/* Stars */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  opacity: 0.4 + Math.random() * 0.6
                }}
              />
            ))}
          </div>
        );
        
      case 'exosphere':
        return (
          <div className="absolute inset-0">
            {/* Very subtle atmospheric glow instead of large earth */}
            <div className="absolute bottom-0 left-0 right-0 h-[5%] bg-blue-500/5 blur-xl" />
            
            {/* Many stars */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 3}px`,
                  height: `${1 + Math.random() * 3}px`,
                  opacity: 0.5 + Math.random() * 0.5
                }}
              />
            ))}
            
            {/* Distant galaxies */}
            <div className="absolute top-[20%] left-[10%] w-[15%] h-[8%] bg-purple-500/10 blur-lg rounded-full" />
            <div className="absolute top-[60%] right-[20%] w-[10%] h-[5%] bg-blue-500/10 blur-lg rounded-full" />
          </div>
        );
        
      case 'space':
        return (
          <div className="absolute inset-0">
            {/* Small distant earth instead of huge blue circle */}
            <div 
              className="absolute bottom-[5%] right-[10%] w-[5%] h-[5%] bg-blue-600/60 rounded-full border border-blue-400/30" 
            />
            
            {/* Space debris/satellites */}
            <div className="absolute top-[30%] left-[20%] w-[2%] h-[0.5%] bg-gray-300 rotate-45" />
            <div className="absolute top-[60%] right-[30%] w-[3%] h-[1%] bg-gray-400 -rotate-30" />
            
            {/* Many bright stars */}
            {Array.from({ length: 70 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 3}px`,
                  height: `${1 + Math.random() * 3}px`,
                  opacity: 0.6 + Math.random() * 0.4
                }}
              />
            ))}
            
            {/* Distant nebulae */}
            <div className="absolute top-[40%] left-[30%] w-[25%] h-[20%] bg-purple-500/5 blur-xl rounded-full" />
            <div className="absolute top-[20%] right-[40%] w-[15%] h-[10%] bg-blue-500/5 blur-xl rounded-full" />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`absolute inset-0 ${backgrounds[stage]} transition-colors duration-1000`}
      style={{ width, height }}
    >
      {renderLayerSpecificElements()}
    </div>
  );
};

// ScrollingBackground - Creates illusion of rocket ascending while staying in place
export const ScrollingBackground: React.FC<{ 
  gameState: 'waiting' | 'countdown' | 'running' | 'crashed';
  multiplier: number;
  atmosphereStage: 'ground' | 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere' | 'space';
}> = ({ gameState, multiplier, atmosphereStage }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [parallaxLayers, setParallaxLayers] = useState<{
    near: {
      id: number; 
      y: number; 
      x: number;
      type: string; 
      size: number;
      shape: string;
      color: string;
      rotation?: number;
      opacity: number;
      speed: number;
      layer: 'near' | 'mid' | 'far';
      animate?: boolean;
      glowColor?: string;
    }[];
    mid: {
      id: number; 
      y: number; 
      x: number;
      type: string; 
      size: number;
      shape: string;
      color: string;
      rotation?: number;
      opacity: number;
      speed: number;
      layer: 'near' | 'mid' | 'far';
      animate?: boolean;
      glowColor?: string;
    }[];
    far: {
      id: number; 
      y: number; 
      x: number;
      type: string; 
      size: number;
      shape: string;
      color: string;
      rotation?: number;
      opacity: number;
      speed: number;
      layer: 'near' | 'mid' | 'far';
      animate?: boolean;
      glowColor?: string;
    }[];
  }>({ near: [], mid: [], far: [] });
  
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate parallax background elements for 3D depth effect
  useEffect(() => {
    // Generate different elements based on atmosphere stage
    const generateElements = () => {
      const near = [];
      const mid = [];
      const far = [];
      
      // Height range for elements distribution
      const heightRange = 3000; // Increased to have more elements offscreen ready to scroll in
      
      // Element counts for each layer
      const nearCount = atmosphereStage === 'ground' ? 50 : 
                       atmosphereStage === 'troposphere' ? 70 :
                       atmosphereStage === 'stratosphere' ? 90 : 120;
                       
      const midCount = atmosphereStage === 'ground' ? 60 : 
                      atmosphereStage === 'troposphere' ? 80 :
                      atmosphereStage === 'stratosphere' ? 100 : 150;
                      
      const farCount = atmosphereStage === 'ground' ? 80 : 
                      atmosphereStage === 'troposphere' ? 100 :
                      atmosphereStage === 'stratosphere' ? 120 : 200;
      
      // Generate elements for each parallax layer
      for (let i = 0; i < nearCount + midCount + farCount; i++) {
        // Element type depends on atmosphere stage
        let type, shape, color, size, opacity, rotation, speed, layer, animate = false, glowColor;
        const randomValue = Math.random();
        
        // Determine which layer this element belongs to
        if (i < nearCount) {
          layer = 'near';
          speed = 2.0 + Math.random() * 0.5; // Near elements move fastest
        } else if (i < nearCount + midCount) {
          layer = 'mid';
          speed = 1.2 + Math.random() * 0.3; // Mid elements move medium speed
        } else {
          layer = 'far';
          speed = 0.5 + Math.random() * 0.3; // Far elements move slowest
        }
        
        // Different element types for different atmosphere stages
        if (atmosphereStage === 'ground') {
          if (layer === 'near') {
            if (randomValue < 0.4) {
              type = 'building';
              shape = 'rect';
              color = `rgb(${50 + Math.floor(Math.random() * 30)}, ${50 + Math.floor(Math.random() * 30)}, ${50 + Math.floor(Math.random() * 30)})`;
              size = 18 + Math.random() * 30;
              opacity = 0.7 + Math.random() * 0.3;
            } else if (randomValue < 0.7) {
              type = 'tree';
              shape = 'triangle';
              color = `rgb(${20 + Math.floor(Math.random() * 30)}, ${80 + Math.floor(Math.random() * 40)}, ${20 + Math.floor(Math.random() * 30)})`;
              size = 15 + Math.random() * 20;
              opacity = 0.6 + Math.random() * 0.3;
            } else {
              type = 'ground-detail';
              shape = 'rect';
              color = `rgb(${50 + Math.floor(Math.random() * 20)}, ${50 + Math.floor(Math.random() * 20)}, ${50 + Math.floor(Math.random() * 20)})`;
              size = 8 + Math.random() * 12;
              opacity = 0.5 + Math.random() * 0.2;
            }
          } else if (layer === 'mid') {
            if (randomValue < 0.4) {
              type = 'cloud';
              shape = 'rounded';
              color = 'white';
              size = 30 + Math.random() * 70;
              opacity = 0.2 + Math.random() * 0.2;
            } else if (randomValue < 0.6) {
              type = 'bird';
              shape = 'vee';
              color = 'gray';
              size = 5 + Math.random() * 10;
              opacity = 0.4 + Math.random() * 0.3;
              rotation = Math.random() * 45 - 22.5;
              animate = true;
            } else {
              type = 'distant-mountain';
              shape = 'triangle';
              color = `rgb(${40 + Math.floor(Math.random() * 20)}, ${40 + Math.floor(Math.random() * 20)}, ${60 + Math.floor(Math.random() * 20)})`;
              size = 60 + Math.random() * 100;
              opacity = 0.3 + Math.random() * 0.2;
            }
          } else { // far layer
            if (randomValue < 0.7) {
              type = 'cloud';
              shape = 'rounded';
              color = 'white';
              size = 100 + Math.random() * 200;
              opacity = 0.1 + Math.random() * 0.1;
            } else {
              type = 'sky-gradient';
              shape = 'blob';
              color = 'rgba(135, 206, 235, 0.2)';
              size = 200 + Math.random() * 300;
              opacity = 0.05 + Math.random() * 0.05;
            }
          }
        } else if (atmosphereStage === 'troposphere') {
          if (layer === 'near') {
            if (randomValue < 0.5) {
              type = 'cloud';
              shape = 'rounded';
              color = 'white';
              size = 40 + Math.random() * 80;
              opacity = 0.25 + Math.random() * 0.15;
            } else if (randomValue < 0.8) {
              type = 'bird';
              shape = 'vee';
              color = 'white';
              size = 4 + Math.random() * 6;
              opacity = 0.5 + Math.random() * 0.3;
              rotation = Math.random() * 45 - 22.5;
              animate = true;
            } else {
              type = 'weather';
              shape = 'lightning';
              color = '#ffe74c';
              size = 6 + Math.random() * 12;
              opacity = 0.4 + Math.random() * 0.3;
              glowColor = '#ffe74c';
            }
          } else if (layer === 'mid') {
            if (randomValue < 0.6) {
              type = 'cloud';
              shape = 'rounded';
              color = 'white';
              size = 80 + Math.random() * 150;
              opacity = 0.15 + Math.random() * 0.1;
            } else {
              type = 'mist';
              shape = 'blob';
              color = 'white';
              size = 100 + Math.random() * 200;
              opacity = 0.08 + Math.random() * 0.07;
            }
          } else { // far layer
            type = 'atmosphere-gradient';
            shape = 'blob';
            const blueShades = [
              'rgba(65, 105, 225, 0.1)', // Royal blue
              'rgba(0, 191, 255, 0.1)',  // Deep sky blue
              'rgba(30, 144, 255, 0.1)',  // Dodger blue
              'rgba(0, 0, 139, 0.1)'   // Dark blue
            ];
            color = blueShades[Math.floor(Math.random() * blueShades.length)];
            size = 300 + Math.random() * 500;
            opacity = 0.05 + Math.random() * 0.05;
          }
        } else if (atmosphereStage === 'stratosphere' || atmosphereStage === 'mesosphere') {
          if (layer === 'near') {
            if (randomValue < 0.5) {
              type = 'star';
              shape = 'star';
              color = 'white';
              size = 2 + Math.random() * 4;
              opacity = 0.7 + Math.random() * 0.3;
              animate = Math.random() > 0.5;
              glowColor = 'white';
            } else if (randomValue < 0.7) {
              type = 'satellite';
              shape = 'rect';
              color = 'silver';
              size = 5 + Math.random() * 10;
              opacity = 0.7 + Math.random() * 0.3;
              rotation = Math.random() * 360;
            } else {
              type = 'meteor';
              shape = 'line';
              color = '#ff6347';
              size = 10 + Math.random() * 20;
              opacity = 0.7 + Math.random() * 0.3;
              rotation = Math.random() * 45 - 22.5;
              animate = true;
              glowColor = '#ff6347';
            }
          } else if (layer === 'mid') {
            if (randomValue < 0.6) {
              type = 'star';
              shape = 'circle';
              color = 'white';
              size = 1 + Math.random() * 3;
              opacity = 0.5 + Math.random() * 0.4;
              animate = Math.random() > 0.7;
            } else {
              type = 'auroras';
              shape = 'wave';
              // Different aurora colors
              const auroraColors = ['#40e0d0', '#9370db', '#7cfc00', '#ff69b4'];
              color = auroraColors[Math.floor(Math.random() * auroraColors.length)];
              size = 120 + Math.random() * 200;
              opacity = 0.15 + Math.random() * 0.15;
              animate = true;
            }
          } else { // far layer
            if (randomValue < 0.8) {
              type = 'star';
              shape = 'circle';
              color = 'white';
              size = 1 + Math.random() * 2;
              opacity = 0.3 + Math.random() * 0.3;
              animate = Math.random() > 0.8;
            } else {
              type = 'distant-planet';
              shape = 'circle';
              const planetHues = ['#b0c4de', '#ffa07a', '#20b2aa', '#f08080'];
              color = planetHues[Math.floor(Math.random() * planetHues.length)];
              size = 5 + Math.random() * 10;
              opacity = 0.15 + Math.random() * 0.15;
            }
          }
        } else { // Space layers (thermosphere, exosphere, space)
          if (layer === 'near') {
            if (randomValue < 0.4) {
              type = 'bright-star';
              shape = 'star';
              // Star colors: white, blue-white, yellow, orange, red
              const starColors = ['white', '#b0e0e6', '#fffacd', '#ffa07a', '#cd5c5c'];
              color = starColors[Math.floor(Math.random() * starColors.length)];
              size = 3 + Math.random() * 5;
              opacity = 0.8 + Math.random() * 0.2;
              animate = Math.random() > 0.3;
              glowColor = color;
            } else if (randomValue < 0.6) {
              type = 'planet';
              shape = 'planet';
              // Planet colors with rich hues
              const planetColors = [
                '#b0c4de', // Light steel blue (icy planet)
                '#ffa07a', // Light salmon (desert planet)
                '#20b2aa', // Light sea green (ocean planet)
                '#f08080', // Light coral (reddish planet)
                '#9370db', // Medium purple (gas giant)
                '#3cb371', // Medium sea green (forest planet)
                '#6a5acd'  // Slate blue (gas giant)
              ];
              color = planetColors[Math.floor(Math.random() * planetColors.length)];
              size = 20 + Math.random() * 30;
              opacity = 0.5 + Math.random() * 0.5;
              glowColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`;
            } else if (randomValue < 0.8) {
              type = 'comet';
              shape = 'comet';
              color = '#e6e6fa'; // Lavender
              size = 12 + Math.random() * 15;
              opacity = 0.6 + Math.random() * 0.4;
              rotation = Math.random() * 30 - 15;
              animate = true;
              glowColor = '#e6e6fa';
            } else {
              type = 'space-debris';
              shape = 'poly';
              color = '#c0c0c0'; // Silver
              size = 4 + Math.random() * 8;
              opacity = 0.6 + Math.random() * 0.4;
              rotation = Math.random() * 360;
            }
          } else if (layer === 'mid') {
            if (randomValue < 0.6) {
              type = 'star';
              shape = 'circle';
              color = 'white';
              size = 1.5 + Math.random() * 3;
              opacity = 0.6 + Math.random() * 0.4;
              animate = Math.random() > 0.6;
            } else if (randomValue < 0.8) {
              type = 'distant-galaxy';
              shape = 'galaxy';
              // Galaxy colors
              const galaxyColors = ['#663399', '#4169e1', '#9932cc', '#8a2be2'];
              color = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];
              size = 30 + Math.random() * 60;
              opacity = 0.3 + Math.random() * 0.3;
              rotation = Math.random() * 360;
              glowColor = color;
            } else {
              type = 'nebula';
              shape = 'blob';
              // Nebula colors
              const nebulaColors = ['#663399', '#4169e1', '#ff1493', '#00ced1'];
              color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
              size = 150 + Math.random() * 250;
              opacity = 0.1 + Math.random() * 0.1;
              glowColor = color;
            }
          } else { // far layer
            if (randomValue < 0.7) {
              type = 'distant-star';
              shape = 'circle';
              color = 'white';
              size = 1 + Math.random() * 2;
              opacity = 0.4 + Math.random() * 0.3;
              animate = Math.random() > 0.8;
            } else if (randomValue < 0.9) {
              type = 'star-cluster';
              shape = 'star-cluster';
              color = 'white';
              size = 50 + Math.random() * 100;
              opacity = 0.2 + Math.random() * 0.2;
            } else {
              type = 'distant-nebula';
              shape = 'blob';
              const deepSpaceColors = ['#191970', '#483d8b', '#4b0082', '#800080'];
              color = deepSpaceColors[Math.floor(Math.random() * deepSpaceColors.length)];
              size = 200 + Math.random() * 300;
              opacity = 0.05 + Math.random() * 0.1;
            }
          }
        }
        
        // Create element object
        const element = {
          id: i,
          y: Math.random() * heightRange,  // Distribute elements over a larger height range
          x: Math.random() * 100,           // Random horizontal position
          type,
          shape: shape || 'circle',
          color: color || 'white',
          size: size || (2 + Math.random() * 5),
          opacity: opacity || 0.5,
          rotation: rotation || 0,
          speed: speed || 1.0,
          layer: layer as 'near' | 'mid' | 'far',
          animate,
          glowColor
        };
        
        // Add to appropriate layer
        if (layer === 'near') {
          near.push(element);
        } else if (layer === 'mid') {
          mid.push(element);
        } else {
          far.push(element);
        }
      }
      
      return { near, mid, far };
    };
    
    setParallaxLayers(generateElements());
  }, [atmosphereStage]);
  
  // Animation loop for scrolling effect
  useEffect(() => {
    if (gameState !== 'running') {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    // Calculate scroll speed based on multiplier - the higher the multiplier, the faster we scroll
    const baseScrollSpeed = atmosphereStage === 'ground' ? 1.0 : // Faster start
                       multiplier < 2 ? multiplier * 0.9 : 
                       multiplier < 5 ? multiplier * 1.3 :
                       multiplier * 2.0; // Higher speed increases with multiplier
    
    const animate = () => {
      setScrollPosition(prev => prev + baseScrollSpeed);
      animationRef.current = window.requestAnimationFrame(animate);
    };
    
    animationRef.current = window.requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameState, multiplier, atmosphereStage]);
  
  // Render background elements with parallax effect
  const renderLayer = (layer: 'near' | 'mid' | 'far') => {
    const elements = layer === 'near' ? parallaxLayers.near : 
                    layer === 'mid' ? parallaxLayers.mid : parallaxLayers.far;
    
    return elements.map(element => {
      // Calculate position with scroll offset, applying element's individual speed modifier
      const speedMultiplier = element.speed;
      const posY = (element.y - (scrollPosition * speedMultiplier)) % 2000;
      
      // Only render elements within the viewport with some margin
      if (posY < -200 || posY > 900) return null;
      
      // Base styles
      const styles: React.CSSProperties = {
        position: 'absolute',
        top: `${posY}px`,
        left: `${element.x}%`,
        opacity: element.opacity || 0.5,
      };
      
      // Animation classes based on element type and animate flag
      let animationClass = '';
      if (element.animate) {
        switch (element.type) {
          case 'star':
          case 'bright-star':
            animationClass = 'animate-pulse-slow';
            break;
          case 'meteor':
          case 'comet':
            animationClass = 'animate-meteor';
            break;
          case 'bird':
            animationClass = 'animate-fly';
            break;
          case 'auroras':
            animationClass = 'animate-wave';
            break;
          default:
            animationClass = '';
        }
      }
      
      // Different elements based on type and shape
      switch (element.shape) {
        case 'circle':
          return (
            <div 
              key={element.id}
              className={`absolute rounded-full ${animationClass}`}
              style={{
                ...styles,
                backgroundColor: element.color,
                width: `${element.size}px`,
                height: `${element.size}px`,
                boxShadow: element.glowColor ? 
                  `0 0 ${element.size * 2}px ${element.glowColor}` : 'none'
              }}
            />
          );
        
        case 'star':
          // Five-pointed star shape with CSS
          return (
            <div 
              key={element.id}
              className={`absolute ${animationClass}`}
              style={{
                ...styles,
                width: `${element.size}px`,
                height: `${element.size}px`,
                backgroundColor: 'transparent',
                boxShadow: element.glowColor ? 
                  `0 0 ${element.size * 2}px ${element.glowColor}` : 'none'
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: element.color,
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          );
          
        case 'planet':
          // Planet with subtle details
          return (
            <div 
              key={element.id}
              className="absolute rounded-full overflow-hidden"
              style={{
                ...styles,
                width: `${element.size}px`,
                height: `${element.size}px`,
                background: `radial-gradient(circle at 30% 30%, ${element.color}, ${element.color}cc 60%, ${element.color}88 100%)`,
                boxShadow: element.glowColor ? 
                  `0 0 ${element.size/1.5}px ${element.glowColor}` : 'none',
              }}
            >
              {/* Planet surface details */}
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '20%',
                width: '20%',
                height: '15%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '30%',
                width: '40%',
                height: '10%',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.2)',
              }} />
            </div>
          );
          
        case 'comet':
          // Comet with tail
          return (
            <div 
              key={element.id}
              className={`absolute ${animationClass}`}
              style={{
                ...styles,
                transform: `rotate(${element.rotation || 45}deg)`,
              }}
            >
              {/* Comet head */}
              <div
                style={{
                  position: 'absolute',
                  width: `${element.size/4}px`,
                  height: `${element.size/4}px`,
                  borderRadius: '50%',
                  backgroundColor: element.color,
                  boxShadow: `0 0 ${element.size/3}px ${element.glowColor || element.color}`,
                }}
              />
              {/* Comet tail */}
              <div
                style={{
                  position: 'absolute',
                  left: `${element.size/8}px`,
                  width: `${element.size}px`,
                  height: `${element.size/10}px`,
                  background: `linear-gradient(to left, transparent, ${element.color})`,
                  boxShadow: `0 0 ${element.size/5}px ${element.glowColor || element.color}`,
                }}
              />
            </div>
          );
          
        case 'galaxy':
          // Spiral galaxy
          return (
            <div 
              key={element.id}
              className="absolute rounded-full overflow-hidden"
              style={{
                ...styles,
                width: `${element.size}px`,
                height: `${element.size}px`,
                background: `conic-gradient(
                  ${element.color}00, 
                  ${element.color}44, 
                  ${element.color}88, 
                  ${element.color}cc, 
                  ${element.color}, 
                  ${element.color}cc, 
                  ${element.color}88, 
                  ${element.color}44, 
                  ${element.color}00
                )`,
                transform: `rotate(${element.rotation}deg)`,
                boxShadow: element.glowColor ? 
                  `0 0 ${element.size/2}px ${element.glowColor}` : 'none',
                filter: 'blur(2px)',
              }}
            >
              {/* Galaxy core */}
              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: '35%',
                  width: '30%',
                  height: '30%',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.6)',
                  boxShadow: '0 0 15px white',
                }}
              />
            </div>
          );
          
        case 'star-cluster':
          // Cluster of small stars
          return (
            <div 
              key={element.id}
              className="absolute"
              style={{
                ...styles,
                width: `${element.size}px`,
                height: `${element.size}px`,
                position: 'relative',
              }}
            >
              {Array.from({ length: 15 }).map((_, starIdx) => (
                <div
                  key={starIdx}
                  className={Math.random() > 0.7 ? 'animate-pulse-slow' : ''}
                  style={{
                    position: 'absolute',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${1 + Math.random() * 2}px`,
                    height: `${1 + Math.random() * 2}px`,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    opacity: 0.5 + Math.random() * 0.5,
                  }}
                />
              ))}
            </div>
          );
          
        case 'rounded':
          // Clouds and similar rounded shapes
          return (
            <div 
              key={element.id}
              className="absolute rounded-full"
              style={{
                ...styles,
                backgroundColor: element.color,
                width: `${element.size}px`,
                height: `${element.size * 0.6}px`,
                boxShadow: element.type === 'cloud' ? 
                  `0 0 ${element.size * 0.5}px rgba(255, 255, 255, 0.1)` : 'none',
                filter: 'blur(3px)'
              }}
            />
          );
          
        case 'rect':
          // Buildings, satellites, etc.
          return (
            <div 
              key={element.id}
              className="absolute"
              style={{
                ...styles,
                backgroundColor: element.color,
                width: `${element.size}px`,
                height: element.type === 'building' ? 
                  `${element.size * 3}px` : `${element.size * 0.5}px`,
                transform: element.rotation ? 
                  `rotate(${element.rotation}deg)` : 'none'
              }}
            />
          );
          
        case 'vee':
          // Birds and similar V shapes
          return (
            <div 
              key={element.id}
              className={`absolute ${animationClass}`}
              style={{
                ...styles,
              }}
            >
              <div
                style={{
                  borderLeft: `${element.size/2}px solid transparent`,
                  borderRight: `${element.size/2}px solid transparent`,
                  borderBottom: `${element.size}px solid ${element.color}`,
                  transform: `rotate(${element.rotation || 0}deg)`,
                }}
              />
            </div>
          );
          
        case 'triangle':
          // Trees, etc.
          return (
            <div 
              key={element.id}
              className="absolute"
              style={{
                ...styles,
                width: '0',
                height: '0',
                borderLeft: `${element.size/2}px solid transparent`,
                borderRight: `${element.size/2}px solid transparent`,
                borderBottom: `${element.size}px solid ${element.color}`,
              }}
            />
          );
          
        case 'blob':
          // Nebulas, mist, etc.
          return (
            <div 
              key={element.id}
              className="absolute rounded-full"
              style={{
                ...styles,
                backgroundColor: element.color,
                width: `${element.size}px`,
                height: `${element.size * 0.7}px`,
                filter: 'blur(15px)',
                transform: `scale(${0.8 + Math.random() * 0.4})`,
              }}
            />
          );
          
        case 'line':
          // Meteors, shooting stars
          return (
            <div 
              key={element.id}
              className={`absolute ${animationClass}`}
              style={{
                ...styles,
                width: `${element.size}px`,
                height: '2px',
                backgroundColor: element.color,
                transform: `rotate(${element.rotation || 45}deg)`,
                boxShadow: `0 0 8px ${element.glowColor || element.color}`,
              }}
            />
          );
          
        case 'wave':
          // Auroras
          return (
            <div 
              key={element.id}
              className={`absolute ${animationClass}`}
              style={{
                ...styles,
                width: `${element.size}px`,
                height: `${element.size * 0.3}px`,
                background: `linear-gradient(to bottom, transparent, ${element.color}, transparent)`,
                borderRadius: '50%',
                filter: 'blur(10px)',
                transform: `skew(${Math.random() * 20 - 10}deg, ${Math.random() * 20 - 10}deg)`,
              }}
            />
          );
          
        case 'lightning':
          // Weather effects
          return (
            <div 
              key={element.id}
              className="absolute"
              style={{
                ...styles,
                width: '2px',
                height: `${element.size * 3}px`,
                backgroundColor: element.color,
                boxShadow: `0 0 5px ${element.glowColor || element.color}, 0 0 10px ${element.glowColor || element.color}`,
                transform: `rotate(${Math.random() * 10 - 5}deg) translateX(${Math.random() * 10 - 5}px)`,
              }}
            />
          );
          
        case 'poly':
          // Space debris, asteroids
          return (
            <div 
              key={element.id}
              className="absolute"
              style={{
                ...styles,
                width: `${element.size}px`,
                height: `${element.size}px`,
                backgroundColor: element.color,
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                transform: `rotate(${element.rotation || 0}deg)`,
              }}
            />
          );
          
        default:
          return (
            <div 
              key={element.id}
              className="absolute rounded-full"
              style={{
                ...styles,
                backgroundColor: element.color || 'white',
                width: `${element.size}px`,
                height: `${element.size}px`,
              }}
            />
          );
      }
    });
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" ref={containerRef}>
      {/* Far layer (slowest moving) */}
      <div className="absolute inset-0 z-0">
        {renderLayer('far')}
      </div>
      
      {/* Mid layer (medium speed) */}
      <div className="absolute inset-0 z-10">
        {renderLayer('mid')}
      </div>
      
      {/* Near layer (fastest moving) */}
      <div className="absolute inset-0 z-20">
        {renderLayer('near')}
      </div>
    </div>
  );
};