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
  const [backgroundElements, setBackgroundElements] = useState<{ id: number; y: number; type: string; size: number }[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // Generate background elements like clouds, stars etc. that will scroll by
  useEffect(() => {
    // Generate different elements based on atmosphere stage
    const generateElements = () => {
      const elements = [];
      const totalElements = atmosphereStage === 'ground' ? 10 : 
                           atmosphereStage === 'troposphere' ? 15 :
                           atmosphereStage === 'stratosphere' ? 20 : 25;
      
      for (let i = 0; i < totalElements; i++) {
        let type;
        if (atmosphereStage === 'ground' || atmosphereStage === 'troposphere') {
          type = Math.random() > 0.7 ? 'cloud' : 'bird';
        } else if (atmosphereStage === 'stratosphere' || atmosphereStage === 'mesosphere') {
          type = Math.random() > 0.6 ? 'star' : 'satellite';
        } else {
          type = Math.random() > 0.3 ? 'star' : 'debris';
        }
        
        elements.push({
          id: i,
          y: Math.random() * 2000, // Position them down below the screen to scroll up
          type,
          size: type === 'cloud' ? 20 + Math.random() * 60 : 2 + Math.random() * 5
        });
      }
      
      return elements;
    };
    
    setBackgroundElements(generateElements());
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
    const scrollSpeed = atmosphereStage === 'ground' ? 0.5 : // Slow start
                       multiplier < 2 ? multiplier * 0.5 : 
                       multiplier < 5 ? multiplier * 1 :
                       multiplier * 1.5; // Speed increases with multiplier
    
    const animate = () => {
      setScrollPosition(prev => prev + scrollSpeed);
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
  
  // Render background elements that will scroll by the rocket
  const renderElements = () => {
    return backgroundElements.map(element => {
      // Calculate position with scroll offset
      const posY = (element.y - scrollPosition) % 1200;
      
      // Only render elements within the viewport 
      if (posY < -100 || posY > 800) return null;
      
      // Different elements based on type
      switch (element.type) {
        case 'cloud':
          return (
            <div 
              key={element.id}
              className="absolute rounded-full bg-white opacity-20"
              style={{
                top: `${posY}px`,
                left: `${(element.id * 30) % 100}%`, 
                width: `${element.size}px`,
                height: `${element.size / 2}px`,
              }}
            />
          );
        case 'star':
          return (
            <div 
              key={element.id}
              className="absolute rounded-full bg-white"
              style={{
                top: `${posY}px`,
                left: `${(element.id * 50) % 100}%`, 
                width: `${element.size}px`,
                height: `${element.size}px`,
                opacity: 0.5 + Math.random() * 0.5
              }}
            />
          );
        case 'satellite':
          return (
            <div 
              key={element.id}
              className="absolute bg-gray-300"
              style={{
                top: `${posY}px`,
                left: `${(element.id * 40) % 100}%`, 
                width: `${element.size * 3}px`,
                height: `${element.size}px`,
                transform: `rotate(${element.id * 30}deg)`,
                opacity: 0.7
              }}
            />
          );
        default:
          return (
            <div 
              key={element.id}
              className="absolute rounded-full bg-gray-400"
              style={{
                top: `${posY}px`,
                left: `${(element.id * 20) % 100}%`, 
                width: `${element.size}px`,
                height: `${element.size}px`,
                opacity: 0.6
              }}
            />
          );
      }
    });
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {renderElements()}
    </div>
  );
};