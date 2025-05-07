import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';

// Define the cup pulse animation keyframes
const cupPulseKeyframes = `
@keyframes cupPulse {
  0% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
  100% {
    transform: translateX(-50%) translateY(0);
  }
}`;

// Image paths
const cupImagePath = 'https://res.cloudinary.com/dbbig5cq5/image/upload/v1746582213/Inverted_Red_Plastic_Cup_zdvtjf.png'; // Using red plastic cup from Cloudinary
const ballImagePath = '/images/cup-game/ball.png';

// Inject the animation styles into the document head
const insertCupGameStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('cup-game-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'cup-game-styles';
    styleSheet.textContent = cupPulseKeyframes;
    document.head.appendChild(styleSheet);
  }
};

// Type definitions
interface CupGameProps {
  onCorrectGuess?: () => void;
  onWrongGuess?: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  soundsEnabled?: boolean;
  customStyles?: {
    container?: React.CSSProperties;
    gameArea?: React.CSSProperties;
    cupsContainer?: React.CSSProperties;
    cup?: React.CSSProperties;
    ball?: React.CSSProperties;
    gameResult?: React.CSSProperties;
    controls?: React.CSSProperties;
    playButton?: React.CSSProperties;
    soundButton?: React.CSSProperties;
    instructions?: React.CSSProperties;
  };
}

type GamePhase = 'ready' | 'starting' | 'playing' | 'guessing' | 'ended';

/**
 * CupGame - A standalone component implementing the classic cup and ball game
 * Uses custom uploaded images for the cup and ball
 */
const EnhancedCupGameWithCustomImages = forwardRef<{ startGame: () => void }, CupGameProps>((props, ref) => {
  const { 
    onCorrectGuess, 
    onWrongGuess, 
    difficulty = 'medium', 
    soundsEnabled = true,
    customStyles = {}
  } = props;
  
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('ready');
  const [ballPosition, setBallPosition] = useState<number>(0);
  const [cupPositions, setCupPositions] = useState<number[]>([0, 1, 2]);
  const [message, setMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(!soundsEnabled);
  
  // Audio elements
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);
  const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
  
  // Set up difficulty parameters
  const difficultySettings = {
    easy: { shuffleCount: 5, speed: 0.7 },
    medium: { shuffleCount: 8, speed: 1 },
    hard: { shuffleCount: 12, speed: 1.3 }
  };
  
  const { shuffleCount, speed } = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;
  
  // Initialize audio elements
  useEffect(() => {
    // Insert cup animation
    insertCupGameStyles();
    
    // Set up audio
    const success = new Audio();
    success.src = 'https://assets.codepen.io/21542/success-1.mp3';
    setSuccessSound(success);
    
    const hit = new Audio();
    hit.src = 'https://assets.codepen.io/21542/click.mp3';
    setHitSound(hit);
    
    return () => {
      // Clean up audio elements
      success.pause();
      hit.pause();
      
      // Remove animation styles when component unmounts
      const styleEl = document.getElementById('cup-game-styles');
      if (styleEl) {
        styleEl.remove();
      }
    }
  }, []);
  
  // Play sound effects
  const playSound = useCallback((sound: HTMLAudioElement | null) => {
    if (sound && !isMuted) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Error playing sound:', err));
    }
  }, [isMuted]);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Shuffle cup positions using Fisher-Yates algorithm
  const shufflePositions = useCallback((positions: number[]) => {
    const newPositions = [...positions];
    
    for (let i = newPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPositions[i], newPositions[j]] = [newPositions[j], newPositions[i]];
    }
    
    return newPositions;
  }, []);
  
  // Handle cup click or touch during guessing phase - with safeguards for mobile
  const handleCupClick = useCallback((cupIndex: number) => {
    // Only allow clicks in guessing phase and prevent double-clicks with a guard
    if (gamePhase !== 'guessing') return;
    
    // Immediately set to ended phase to prevent multiple selections
    setGamePhase('ended');
    
    // Check if player selected the correct cup and trigger appropriate callbacks
    const isCorrect = cupPositions.indexOf(ballPosition) === cupIndex;
    
    if (isCorrect) {
      setMessage('');
      playSound(successSound);
      if (onCorrectGuess) onCorrectGuess();
    } else {
      setMessage('');
      playSound(hitSound);
      if (onWrongGuess) onWrongGuess();
    }
    
    // Log for debugging on mobile
    console.log(`Cup selection: Player chose ${cupIndex}, ball was at ${ballPosition}, correct: ${isCorrect}`);
    
  }, [gamePhase, ballPosition, cupPositions, playSound, successSound, hitSound, onCorrectGuess, onWrongGuess]);
  
  // Perform multiple shuffles with enhanced confusion and speed
  const performShuffles = useCallback(() => {
    let count = 0;
    
    // Create more complex and confusing shuffling patterns
    const shufflePatterns = [
      // Quick triple swaps with focus on center
      [[0, 1], [1, 2], [0, 2], [1, 0], [2, 1], [0, 1], [2, 0]],
      // Zigzag with misdirection
      [[0, 2], [1, 0], [2, 1], [0, 2], [1, 0], [1, 2], [0, 1], [2, 0]],
      // Circle with double back
      [[0, 1], [1, 2], [2, 0], [1, 0], [2, 1], [0, 2], [1, 0]],
      // Alternating focus pattern
      [[0, 1], [1, 2], [0, 2], [1, 0], [2, 1], [0, 1], [2, 0], [1, 2]],
      // Professional magician pattern - focus on one then switch
      [[0, 1], [0, 1], [1, 2], [1, 2], [0, 2], [0, 2]],
      // "Shell game" classic pattern
      [[0, 2], [1, 0], [2, 1], [0, 1], [2, 0], [1, 2], [0, 2]]
    ];
    
    // Select a random shuffle pattern as base, then add randomness
    const selectedPattern = shufflePatterns[Math.floor(Math.random() * shufflePatterns.length)];
    let patternIndex = 0;
    
    const doShuffle = () => {
      if (count >= shuffleCount) {
        // End shuffling and start guessing phase
        setTimeout(() => {
          setGamePhase('guessing');
          playSound(hitSound);
        }, 250 / speed); // Reduced delay before guessing phase
        return;
      }
      
      // Play shuffle sound
      playSound(hitSound);
      
      // Get positions to swap with increased randomness
      const newPositions = [...cupPositions];
      let pos1: number, pos2: number;
      
      // Increase randomness by sometimes doing completely random moves
      if ((count % 2 === 0 || Math.random() > 0.25) && patternIndex < selectedPattern.length) {
        // Use the predefined pattern but with some chaos
        [pos1, pos2] = selectedPattern[patternIndex];
        
        // Occasionally reverse the swap direction for more confusion
        if (Math.random() > 0.7) {
          [pos1, pos2] = [pos2, pos1];
        }
        
        patternIndex = (patternIndex + 1) % selectedPattern.length;
      } else {
        // Use completely random swaps for unpredictability
        pos1 = Math.floor(Math.random() * 3);
        
        // Sometimes do adjacent swaps, sometimes do opposite swaps
        if (Math.random() > 0.5) {
          pos2 = (pos1 + 1) % 3; // Adjacent cup
        } else {
          pos2 = (pos1 + 2) % 3; // Opposite cup
        }
      }
      
      // Swap cup positions
      [newPositions[pos1], newPositions[pos2]] = [newPositions[pos2], newPositions[pos1]];
      setCupPositions(newPositions);
      
      count++;
      
      // Faster animation with shorter delays based on difficulty
      const randomDelay = (Math.random() < 0.8 
        ? 220 + Math.random() * 80  // 80% chance of very fast shuffle
        : 300 + Math.random() * 100) // 20% chance of slightly longer pause
        / (speed * 1.2); // Increase overall speed by 20%
        
      setTimeout(doShuffle, randomDelay);
    };
    
    // Start shuffling after a shorter delay
    setTimeout(doShuffle, 300 / speed);
  }, [shuffleCount, speed, cupPositions, playSound, hitSound]);
  
  // Start the game
  const startGame = useCallback(() => {
    // Reset positions
    setCupPositions([0, 1, 2]);
    
    // Choose random ball position
    const randomPos = Math.floor(Math.random() * 3);
    setBallPosition(randomPos);
    console.log("Setting initial ball position to:", randomPos);
    
    // Clear message
    setMessage('');
    
    // Change phase to 'starting' to show the ball first
    setGamePhase('starting');
    
    // After a delay, show cup going over the ball, then start shuffling
    setTimeout(() => {
      // Hide the ball as it's now under the cup
      setGamePhase('playing');
      
      // Start shuffling after the cup covers the ball
      setTimeout(performShuffles, 1000 / speed);
    }, 1500 / speed);
  }, [performShuffles, speed]);
  
  // Expose startGame to parent component
  useImperativeHandle(ref, () => ({
    startGame
  }));
  
  // Get cup style based on its position and game phase
  const getCupStyle = useCallback((index: number): React.CSSProperties => {
    const position = cupPositions.indexOf(index);
    
    // Calculate percentage-based positions for better responsiveness
    const leftPositions = [25, 50, 75];
    
    // Use the state-based mobile detection
    const isMobile = isMobileView;
    
    // Base styles - absolute positioning for each cup
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${leftPositions[position]}%`,
      transform: 'translateX(-50%)',
      transition: gamePhase === 'playing' 
        ? `all ${0.3 / speed}s ease-out` // Simpler transition function for mobile
        : 'all 0.5s ease-in-out',
      zIndex: 5,
      touchAction: 'manipulation', // Improves touch behavior
      ...(customStyles.cup || {})
    };
    
    // Adjust size for mobile
    if (isMobile) {
      style.width = '100px';
      style.height = '140px';
    }
    
    // When in starting phase and this is the cup over the ball, show it lifted
    if (gamePhase === 'starting' && index === ballPosition) {
      style.transform = 'translateX(-50%) translateY(-60px)';
    }
    
    // When game in guessing phase, add hover effect and subtle animation
    if (gamePhase === 'guessing') {
      style.cursor = 'pointer';
      style.animation = `${index === 0 ? '1.2s' : index === 1 ? '1s' : '1.4s'} cupPulse infinite ease-in-out`;
      style.transform = `translateX(-50%) translateY(-${Math.random() * 3}px)`;
      style.boxShadow = '0 15px 25px rgba(0,0,0,0.6)';
    }
    
    return style;
  }, [cupPositions, gamePhase, ballPosition, speed, customStyles]);
  
  // State to track if we're on mobile
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  
  // Handle window resize to update mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // CSS for the cup game
  // Use state-based mobile detection that updates on resize
  const isMobileDevice = isMobileView;
  
  const gameStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      background: '#0a111c',
      backgroundImage: 'linear-gradient(to bottom, #1a2435, #0a111c)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      padding: isMobileDevice ? '1rem' : '2rem',
      maxWidth: '600px',
      border: '1px solid #2a3445',
      touchAction: 'manipulation', // Optimize for touch
      ...(customStyles.container || {})
    } as React.CSSProperties,
    gameArea: {
      height: isMobileDevice ? '280px' : '350px', // Reduced height for mobile
      width: '100%',
      position: 'relative',
      backgroundColor: '#101a27',
      backgroundImage: 'linear-gradient(to bottom, #15222f, #0c1520)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: isMobileDevice ? '10px' : '20px',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
      border: '1px solid #2a3445',
      touchAction: 'manipulation', // Optimize for touch
      ...(customStyles.gameArea || {})
    } as React.CSSProperties,
    cupsContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      position: 'relative',
      padding: '20px',
      backgroundImage: 'radial-gradient(circle at center 30%, rgba(40, 80, 120, 0.2) 0%, transparent 70%)',
      ...(customStyles.cupsContainer || {})
    } as React.CSSProperties,
    cup: {
      width: '120px',
      height: '160px',
      position: 'absolute',
      transformOrigin: 'bottom center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      ...(customStyles.cup || {})
    } as React.CSSProperties,
    cupImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.4))',
      transform: 'scale(1.05)',
    } as React.CSSProperties,
    ball: {
      width: isMobileDevice ? '50px' : '60px',
      height: isMobileDevice ? '50px' : '60px',
      position: 'absolute',
      bottom: isMobileDevice ? '40px' : '60px',
      zIndex: 5,
      transition: 'all 0.5s ease-in-out',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      touchAction: 'none', // Prevent additional touch events
      ...(customStyles.ball || {})
    } as React.CSSProperties,
    ballImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0px 5px 5px rgba(0,0,0,0.5))',
    } as React.CSSProperties,
    gameResult: {
      position: 'absolute',
      top: '10px',
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontWeight: '800',
      fontSize: '1.8rem',
      color: '#fff',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5), 0 2px 2px rgba(0, 0, 0, 0.7)',
      letterSpacing: '1px',
      padding: '10px',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(3px)',
      borderRadius: '5px',
      animation: 'fadeIn 0.5s ease-out',
      ...(customStyles.gameResult || {})
    } as React.CSSProperties,
    instructions: {
      textAlign: 'center',
      fontSize: '1rem',
      color: '#adbbc8',
      marginBottom: '15px',
      ...(customStyles.instructions || {})
    } as React.CSSProperties,
    soundButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 10,
      cursor: 'pointer',
      background: 'rgba(0, 0, 0, 0.5)',
      border: 'none',
      borderRadius: '50%',
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      ...(customStyles.soundButton || {})
    } as React.CSSProperties
  };

  // Game difficulty instructions
  const getDifficultyInstructions = () => {
    if (difficulty === 'easy') {
      return "Easy mode: Find the ball after 5 shuffles";
    } else if (difficulty === 'medium') {
      return "Medium mode: Find the ball after 8 shuffles";
    } else {
      return "Hard mode: Find the ball after 12 shuffles";
    }
  };

  return (
    <div style={gameStyles.container}>
      {/* Game instructions removed as per requirements */}
      
      <div style={gameStyles.gameArea}>
        {/* Sound button removed as per requirements */}
        
        <div style={gameStyles.cupsContainer}>
          {/* Cups - with enhanced touch/click handlers */}
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              style={{
                ...gameStyles.cup,
                ...getCupStyle(index)
              }}
              onClick={() => gamePhase === 'guessing' ? handleCupClick(index) : undefined}
              onTouchStart={(e) => {
                // Prevent default behavior to avoid scrolling or zooming
                if (gamePhase === 'guessing') {
                  e.preventDefault();
                }
              }}
              onTouchEnd={(e) => {
                // Handle touch end to trigger the cup click
                if (gamePhase === 'guessing') {
                  e.preventDefault();
                  handleCupClick(index);
                }
              }}
              role="button"
              aria-label={`Cup ${index + 1}`}
            >
              <img 
                src={cupImagePath} 
                alt={`Cup ${index + 1}`} 
                style={gameStyles.cupImage}
                // Prevent dragging of the image which can interfere with touch events
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          ))}
          
          {/* Ball */}
          <div 
            style={{
              ...gameStyles.ball,
              opacity: (gamePhase === 'ready' || gamePhase === 'starting' || gamePhase === 'ended') ? 1 : 0,
              left: `${[25, 50, 75][ballPosition]}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <img 
              src={ballImagePath} 
              alt="Ball" 
              style={gameStyles.ballImage}
            />
          </div>
        </div>
        
        {/* Game message removed as per requirements */}
      </div>
    </div>
  );
});

export default EnhancedCupGameWithCustomImages;