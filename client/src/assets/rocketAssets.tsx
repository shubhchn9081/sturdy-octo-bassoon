import React from 'react';

// Main rocket SVG with animation
export const RocketShip: React.FC<{ size?: number, flameActive?: boolean }> = ({ 
  size = 64, 
  flameActive = true 
}) => (
  <svg 
    width={size} 
    height={size * 1.5} 
    viewBox="0 0 100 150" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Rocket body */}
    <g transform="translate(0, 0)">
      {/* Rocket nose cone */}
      <path 
        d="M50 0C30 25 30 35 30 50L70 50C70 35 70 25 50 0Z" 
        fill="#E63946" 
        stroke="#111827" 
        strokeWidth="2"
      />
      
      {/* Rocket body */}
      <rect 
        x="30" 
        y="50" 
        width="40" 
        height="60" 
        fill="#F1FAEE" 
        stroke="#111827" 
        strokeWidth="2"
      />
      
      {/* Windows */}
      <circle cx="50" cy="70" r="8" fill="#A8DADC" stroke="#111827" strokeWidth="1.5" />
      <circle cx="50" cy="70" r="4" fill="#1D3557" />
      
      {/* Fins */}
      <path 
        d="M25 110L30 95V110H25Z" 
        fill="#457B9D" 
        stroke="#111827" 
        strokeWidth="1.5"
      />
      <path 
        d="M75 110L70 95V110H75Z" 
        fill="#457B9D" 
        stroke="#111827" 
        strokeWidth="1.5"
      />
      
      {/* Rocket bottom */}
      <path 
        d="M30 110H70V120C70 122 65 125 50 125C35 125 30 122 30 120V110Z" 
        fill="#1D3557" 
        stroke="#111827" 
        strokeWidth="2"
      />
      
      {/* Rocket text */}
      <text 
        x="50" 
        y="95" 
        fill="#1D3557" 
        fontSize="12" 
        textAnchor="middle" 
        fontWeight="bold"
      >
        NOVITO
      </text>
      
      {/* Flames (animated when active) */}
      {flameActive && (
        <>
          <path 
            d="M40 125C40 135 45 145 50 155C55 145 60 135 60 125C60 120 55 120 50 120C45 120 40 120 40 125Z" 
            fill="#E63946"
            className="animate-pulse"
          >
            <animate 
              attributeName="d" 
              values="
                M40 125C40 135 45 145 50 155C55 145 60 135 60 125C60 120 55 120 50 120C45 120 40 120 40 125Z;
                M42 125C42 140 45 150 50 160C55 150 58 140 58 125C58 122 55 120 50 120C45 120 42 122 42 125Z;
                M40 125C40 135 45 145 50 155C55 145 60 135 60 125C60 120 55 120 50 120C45 120 40 120 40 125Z
              "
              dur="0.5s" 
              repeatCount="indefinite"
            />
          </path>
          
          <path 
            d="M43 125C43 132 45 140 50 148C55 140 57 132 57 125C57 123 55 122 50 122C45 122 43 123 43 125Z" 
            fill="#F4A261"
          >
            <animate 
              attributeName="d" 
              values="
                M43 125C43 132 45 140 50 148C55 140 57 132 57 125C57 123 55 122 50 122C45 122 43 123 43 125Z;
                M45 125C45 137 47 142 50 150C53 142 55 137 55 125C55 124 53 122 50 122C47 122 45 124 45 125Z;
                M43 125C43 132 45 140 50 148C55 140 57 132 57 125C57 123 55 122 50 122C45 122 43 123 43 125Z
              "
              dur="0.4s" 
              repeatCount="indefinite"
            />
          </path>
          
          <path 
            d="M46 125C46 130 47 135 50 140C53 135 54 130 54 125C54 124 52 124 50 124C48 124 46 124 46 125Z" 
            fill="#FFBA08"
          >
            <animate 
              attributeName="d" 
              values="
                M46 125C46 130 47 135 50 140C53 135 54 130 54 125C54 124 52 124 50 124C48 124 46 124 46 125Z;
                M47 125C47 132 48 136 50 142C52 136 53 132 53 125C53 124.5 52 124 50 124C48 124 47 124.5 47 125Z;
                M46 125C46 130 47 135 50 140C53 135 54 130 54 125C54 124 52 124 50 124C48 124 46 124 46 125Z
              "
              dur="0.3s" 
              repeatCount="indefinite"
            />
          </path>
        </>
      )}
    </g>
  </svg>
);

// Explosion animation for when the rocket crashes
export const RocketExplosion: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="animate-pulse"
  >
    {/* Central explosion */}
    <circle cx="60" cy="60" r="30" fill="#E63946">
      <animate 
        attributeName="r" 
        values="10;40;30" 
        dur="0.8s" 
        repeatCount="2"
      />
      <animate 
        attributeName="opacity" 
        values="1;0.8;0.6" 
        dur="0.8s" 
        repeatCount="2"
      />
    </circle>
    
    {/* Outer explosion ring */}
    <circle cx="60" cy="60" r="45" stroke="#F4A261" strokeWidth="6" opacity="0.8">
      <animate 
        attributeName="r" 
        values="20;60;45" 
        dur="1s" 
        repeatCount="2"
      />
      <animate 
        attributeName="opacity" 
        values="0.8;0.4;0" 
        dur="1s" 
        repeatCount="2"
      />
    </circle>
    
    {/* Explosion particles */}
    {[...Array(12)].map((_, i) => (
      <circle 
        key={i} 
        cx={60 + 25 * Math.cos(i * Math.PI / 6)} 
        cy={60 + 25 * Math.sin(i * Math.PI / 6)} 
        r="4" 
        fill="#FFBA08"
      >
        <animate 
          attributeName="cx" 
          values={`${60 + 25 * Math.cos(i * Math.PI / 6)};${60 + 50 * Math.cos(i * Math.PI / 6)}`} 
          dur="0.8s" 
          repeatCount="2"
        />
        <animate 
          attributeName="cy" 
          values={`${60 + 25 * Math.sin(i * Math.PI / 6)};${60 + 50 * Math.sin(i * Math.PI / 6)}`} 
          dur="0.8s" 
          repeatCount="2"
        />
        <animate 
          attributeName="opacity" 
          values="1;0" 
          dur="0.8s" 
          repeatCount="2"
        />
      </circle>
    ))}
  </svg>
);

// Stars background for space atmosphere
export const SpaceBackground: React.FC<{ width: number, height: number }> = ({ width, height }) => {
  // Generate random stars
  const stars = Array.from({ length: 100 }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.8 + 0.2,
    animationDelay: Math.random() * 3
  }));

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      {/* Stars */}
      {stars.map((star, i) => (
        <circle 
          key={i} 
          cx={star.x} 
          cy={star.y} 
          r={star.r} 
          fill="white" 
          opacity={star.opacity}
          style={{
            animation: `twinkle 3s ease-in-out infinite`,
            animationDelay: `${star.animationDelay}s`
          }}
        />
      ))}
      
      {/* Add a few planets or celestial bodies */}
      <circle cx={width * 0.8} cy={height * 0.2} r={15} fill="#A8DADC" opacity={0.7} />
      <circle cx={width * 0.2} cy={height * 0.8} r={8} fill="#F4A261" opacity={0.5} />
      
      {/* Add a distant galaxy or nebula */}
      <ellipse 
        cx={width * 0.7} 
        cy={height * 0.7} 
        rx={40} 
        ry={20} 
        fill="url(#nebula)" 
        opacity={0.3} 
        transform="rotate(-30 330 350)"
      />
      
      {/* Gradients */}
      <defs>
        <radialGradient id="nebula" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9D4EDD" />
          <stop offset="100%" stopColor="#3A0CA3" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// Animated fuel gauge
export const FuelGauge: React.FC<{ level: number, size?: number }> = ({ level, size = 100 }) => (
  <svg 
    width={size} 
    height={size/2} 
    viewBox="0 0 100 50" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Gauge outline */}
    <rect x="5" y="15" width="90" height="20" rx="10" fill="#1D3557" stroke="#F1FAEE" strokeWidth="2" />
    
    {/* Fuel level */}
    <rect 
      x="8" 
      y="18" 
      width={Math.max(0, Math.min(84, level * 84))} 
      height="14" 
      rx="7" 
      fill={level > 0.25 ? (level > 0.6 ? "#57CC99" : "#F4A261") : "#E63946"} 
    />
    
    {/* Gauge text */}
    <text 
      x="50" 
      y="30" 
      fill="#F1FAEE" 
      fontSize="12" 
      textAnchor="middle" 
      fontWeight="bold"
      dominantBaseline="middle"
    >
      FUEL
    </text>
  </svg>
);

// Galaxy background
export const GalaxyBackground: React.FC<{ width: number, height: number }> = ({ width, height }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox={`0 0 ${width} ${height}`} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
  >
    {/* Background gradient */}
    <rect width={width} height={height} fill="url(#galaxyGradient)" />
    
    {/* Nebula effects */}
    <g opacity="0.4">
      <ellipse 
        cx={width * 0.3} 
        cy={height * 0.4} 
        rx={width * 0.4} 
        ry={height * 0.3} 
        fill="url(#purpleNebula)" 
        opacity="0.3"
      />
      <ellipse 
        cx={width * 0.7} 
        cy={height * 0.7} 
        rx={width * 0.3} 
        ry={height * 0.2} 
        fill="url(#blueNebula)" 
        opacity="0.3"
      />
    </g>
    
    {/* Gradients */}
    <defs>
      <linearGradient id="galaxyGradient" x1="0" y1="0" x2={width} y2={height} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0B090A" />
        <stop offset="50%" stopColor="#161A1D" />
        <stop offset="100%" stopColor="#0B090A" />
      </linearGradient>
      
      <radialGradient id="purpleNebula" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7209B7" />
        <stop offset="100%" stopColor="#3A0CA3" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="blueNebula" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4361EE" />
        <stop offset="100%" stopColor="#3A0CA3" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Atmospheric stages visualization
export const AtmosphereStage: React.FC<{ 
  stage: 'ground' | 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere' | 'space', 
  width: number, 
  height: number 
}> = ({ stage, width, height }) => {
  // Different background colors for different stages
  const getGradient = () => {
    switch (stage) {
      case 'ground':
        return 'url(#groundGradient)';
      case 'troposphere':
        return 'url(#troposphereGradient)';
      case 'stratosphere':
        return 'url(#stratosphereGradient)';
      case 'mesosphere':
        return 'url(#mesosphereGradient)';
      case 'thermosphere':
        return 'url(#thermosphereGradient)';
      case 'exosphere':
        return 'url(#exosphereGradient)';
      case 'space':
        return 'url(#spaceGradient)';
      default:
        return 'url(#spaceGradient)';
    }
  };

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      {/* Background with appropriate gradient */}
      <rect width={width} height={height} fill={getGradient()} />
      
      {/* Add visual elements based on stage */}
      {stage === 'ground' && (
        <>
          <rect x="0" y={height - 50} width={width} height="50" fill="#4D4D4D" />
          <rect x="0" y={height - 60} width={width} height="10" fill="#6D6D6D" />
          <text x={width/2} y={height - 30} fill="white" fontSize="12" textAnchor="middle">LAUNCH PAD</text>
        </>
      )}
      
      {/* Gradients */}
      <defs>
        <linearGradient id="groundGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4A87C5" />
          <stop offset="100%" stopColor="#85B7E8" />
        </linearGradient>
        
        <linearGradient id="troposphereGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2D6BB3" />
          <stop offset="100%" stopColor="#4A87C5" />
        </linearGradient>
        
        <linearGradient id="stratosphereGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4A90" />
          <stop offset="100%" stopColor="#2D6BB3" />
        </linearGradient>
        
        <linearGradient id="mesosphereGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#123070" />
          <stop offset="100%" stopColor="#1D4A90" />
        </linearGradient>
        
        <linearGradient id="thermosphereGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0E1C49" />
          <stop offset="100%" stopColor="#123070" />
        </linearGradient>
        
        <linearGradient id="exosphereGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A1432" />
          <stop offset="100%" stopColor="#0E1C49" />
        </linearGradient>
        
        <linearGradient id="spaceGradient" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#050A1A" />
          <stop offset="100%" stopColor="#0A1432" />
        </linearGradient>
      </defs>
    </svg>
  );
};