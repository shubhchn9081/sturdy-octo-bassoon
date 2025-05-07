import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

// Define the image paths for the custom cup and ball
const cupImagePath = '/images/cup-game/red-cup.png';
const ballImagePath = '/images/cup-game/ball.png';

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
    cupBase?: React.CSSProperties;
    cupOverlay?: React.CSSProperties;
    ball?: React.CSSProperties;
    ballHighlight?: React.CSSProperties;
    gameResult?: React.CSSProperties;
    controls?: React.CSSProperties;
    playButton?: React.CSSProperties;
    disabledButton?: React.CSSProperties;
    soundButton?: React.CSSProperties;
    instructions?: React.CSSProperties;
  };
}

type GamePhase = 'ready' | 'starting' | 'playing' | 'guessing' | 'ended';

/**
 * CupGame - A standalone component implementing the classic cup and ball game
 * 
 * Features:
 * - Animated cup shuffling with configurable speed and complexity
 * - Sound effects for hits and success
 * - Mobile responsive design
 * - Customizable styling through CSS
 * 
 * @returns {JSX.Element} The cup game component
 */
const CupGame = forwardRef<{ startGame: () => void }, CupGameProps>((props, ref) => {
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
  // Initialize effect for animation and audio
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
  
  // Handle cup click during guessing phase
  const handleCupClick = useCallback((cupIndex: number) => {
    if (gamePhase !== 'guessing') return;
    
    if (cupPositions.indexOf(ballPosition) === cupIndex) {
      setMessage('');
      playSound(successSound);
      if (onCorrectGuess) onCorrectGuess();
    } else {
      setMessage('');
      playSound(hitSound);
      if (onWrongGuess) onWrongGuess();
    }
    
    setGamePhase('ended');
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
  
  // Handle play button click
  const handlePlayClick = useCallback(() => {
    if (gamePhase === 'ready' || gamePhase === 'ended') {
      startGame();
    }
  }, [gamePhase, startGame]);
  
  // Get cup style based on its position and game phase
  const getCupStyle = useCallback((index: number): React.CSSProperties => {
    const position = cupPositions.indexOf(index);
    
    // Calculate percentage-based positions for better responsiveness
    const leftPositions = [25, 50, 75];
    
    // Base styles - absolute positioning for each cup
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${leftPositions[position]}%`,
      transform: 'translateX(-50%)',
      transition: gamePhase === 'playing' 
        ? `all ${0.25 / speed}s cubic-bezier(0.4, 0, 0.2, 1)` 
        : 'all 0.5s ease-in-out',
      zIndex: 5,
      ...(customStyles.cup || {})
    };
    
    // When in starting phase and this is the cup over the ball, show it lifted
    if (gamePhase === 'starting' && index === ballPosition) {
      style.transform = 'translateX(-50%) translateY(-60px)';
    }
    
    // When game in guessing phase, add hover effect and subtle animation
    if (gamePhase === 'guessing') {
      style.cursor = 'pointer';
      style.animation = `${index === 0 ? '1.2s' : index === 1 ? '1s' : '1.4s'} cupPulse infinite ease-in-out`;
      style.transform = `translateX(-50%) translateY(-${Math.random() * 3}px)`;
      style.boxShadow = '0 15px 25px rgba(0,0,0,0.6), inset 0 -5px 10px rgba(0,0,0,0.2), inset 0 5px 10px rgba(255,255,255,0.2)';
    }
    
    return style;
  }, [cupPositions, gamePhase, ballPosition, speed, customStyles]);
  
  // CSS for the cup game
  const gameStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      background: '#0a111c',
      backgroundImage: 'linear-gradient(to bottom, #1a2435, #0a111c)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      padding: '2rem',
      maxWidth: '600px',
      border: '1px solid #2a3445',
      ...(customStyles.container || {})
    } as React.CSSProperties,
    gameArea: {
      height: '350px',
      width: '100%',
      position: 'relative',
      backgroundColor: '#101a27',
      backgroundImage: 'linear-gradient(to bottom, #15222f, #0c1520)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '20px',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
      border: '1px solid #2a3445',
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
      height: '140px',
      position: 'absolute',
      transformOrigin: 'bottom center',
      backgroundColor: 'transparent',
      ...(customStyles.cup || {})
    } as React.CSSProperties,
    // The cup consists of multiple parts for a 3D effect
    cupTop: {
      position: 'absolute',
      width: '100%',
      height: '20px',
      top: '0',
      borderRadius: '8px 8px 0 0',
      backgroundColor: '#d32f2f', 
      boxShadow: 'inset 0 3px 5px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.2)',
      border: '2px solid #b71c1c',
      borderBottom: 'none',
      zIndex: 3
    } as React.CSSProperties,
    cupBody: {
      position: 'absolute',
      width: '100%',
      height: '110px',
      top: '20px',
      backgroundImage: 'linear-gradient(to bottom, #d32f2f 0%, #b71c1c 100%)',
      borderRadius: '2px 2px 60px 60px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      zIndex: 2
    } as React.CSSProperties,
    cupShine: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
      borderRadius: 'inherit',
      pointerEvents: 'none'
    } as React.CSSProperties,
    cupShadow: {
      position: 'absolute',
      bottom: '-15px',
      left: '5%',
      width: '90%',
      height: '15px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0,0,0,0.3)',
      filter: 'blur(5px)',
      zIndex: 1
    } as React.CSSProperties,
    ball: {
      width: '50px',
      height: '50px',
      position: 'absolute',
      bottom: '60px',
      zIndex: 1,
      transition: 'all 0.5s ease-in-out',
      backgroundColor: 'transparent',
      ...(customStyles.ball || {})
    } as React.CSSProperties,
    // The ball consists of multiple elements to create a 3D effect
    ballSphere: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundImage: 'radial-gradient(circle at 30% 30%, #ffeb3b, #ffd700 50%, #ffc107 100%)',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
      zIndex: 2
    } as React.CSSProperties,
    ballHighlight: {
      position: 'absolute',
      top: '15%',
      left: '15%',
      width: '25%',
      height: '25%',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.9)',
      filter: 'blur(2px)',
      animation: 'pulse 2s infinite ease-in-out',
      zIndex: 3
    } as React.CSSProperties,
    ballShadow: {
      position: 'absolute',
      bottom: '-10px',
      left: '10%',
      width: '80%',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0,0,0,0.2)',
      filter: 'blur(3px)',
      zIndex: 1
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
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...(customStyles.controls || {})
    } as React.CSSProperties,
    playButton: {
      padding: '10px 20px',
      fontSize: '1.2rem',
      minWidth: '120px',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      ...(customStyles.playButton || {})
    } as React.CSSProperties,
    disabledButton: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
      ...(customStyles.disabledButton || {})
    } as React.CSSProperties,
    soundButton: {
      padding: '10px',
      backgroundColor: 'transparent',
      border: '1px solid #ddd',
      borderRadius: '5px',
      cursor: 'pointer',
      ...(customStyles.soundButton || {})
    } as React.CSSProperties,
    instructions: {
      textAlign: 'center',
      marginTop: '20px',
      lineHeight: '1.5',
      padding: '10px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#eee',
      background: 'rgba(0,0,0,0.6)',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,215,0,0.3)',
      ...(customStyles.instructions || {})
    } as React.CSSProperties
  };
  
  // Expose startGame function to parent component via ref
  useImperativeHandle(ref, () => ({
    startGame
  }), [startGame]);

  // Game phase style is intentionally empty as per requirements
  // No TIME title or X mark as per the specification

  return (
    <div style={gameStyles.container}>
      <div style={gameStyles.gameArea}>
        <div style={gameStyles.cupsContainer}>
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              style={{
                ...gameStyles.cup,
                ...getCupStyle(index)
              }}
              onClick={() => gamePhase === 'guessing' ? handleCupClick(index) : undefined}
            >
              {/* Cup Image */}
              <img 
                src={cupImagePath} 
                alt={`Cup ${index + 1}`} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
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
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
        
        {/* Game message removed as per requirements */}
      </div>

      {/* Hide controls by default, since we'll control it from the betting panel */}
      <div style={{...gameStyles.controls, display: 'none'}}>
        <button 
          style={{
            ...gameStyles.playButton,
            ...(gamePhase === 'playing' || gamePhase === 'starting' ? gameStyles.disabledButton : {})
          }}
          onClick={handlePlayClick}
          disabled={gamePhase === 'playing' || gamePhase === 'starting'}
        >
          {gamePhase === 'ready' ? 'Play' : 'Play Again'}
        </button>
        
        <button 
          style={gameStyles.soundButton}
          onClick={toggleMute}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      
      {/* Game instructions removed as per requirements */}
    </div>
  );
});

export default CupGame;