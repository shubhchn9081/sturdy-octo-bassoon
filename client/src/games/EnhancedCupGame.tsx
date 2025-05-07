import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

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
  useEffect(() => {
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
      setMessage('Ball found! You win!');
      playSound(successSound);
      if (onCorrectGuess) onCorrectGuess();
    } else {
      setMessage('Wrong cup! Try again.');
      playSound(hitSound);
      if (onWrongGuess) onWrongGuess();
    }
    
    setGamePhase('ended');
  }, [gamePhase, ballPosition, cupPositions, playSound, successSound, hitSound, onCorrectGuess, onWrongGuess]);
  
  // Perform multiple shuffles
  const performShuffles = useCallback(() => {
    let count = 0;
    
    // Create shuffling patterns to make it more deceptive
    const shufflePatterns = [
      // Quick back and forth between adjacent cups
      [[0, 1], [1, 2], [0, 1], [1, 2], [0, 2]],
      // Circle pattern
      [[0, 1], [1, 2], [2, 0], [0, 1], [1, 2]],
      // Confusing zigzag
      [[0, 2], [1, 0], [2, 1], [0, 2], [1, 0]],
      // Fast adjacent swaps
      [[0, 1], [1, 2], [0, 1], [1, 2]],
      // Random pattern
      [[Math.floor(Math.random() * 3), (Math.floor(Math.random() * 3) + 1) % 3]]
    ];
    
    // Select a random shuffle pattern for this game
    const selectedPattern = shufflePatterns[Math.floor(Math.random() * shufflePatterns.length)];
    let patternIndex = 0;
    
    const doShuffle = () => {
      if (count >= shuffleCount) {
        // End shuffling and start guessing phase
        setTimeout(() => {
          setGamePhase('guessing');
          playSound(hitSound);
        }, 300 / speed);
        return;
      }
      
      // Play shuffle sound
      playSound(hitSound);
      
      // Get positions to swap - alternate between pattern and random swaps
      const newPositions = [...cupPositions];
      let pos1: number, pos2: number;
      
      if (count % 2 === 0 && patternIndex < selectedPattern.length) {
        // Use the predefined pattern
        [pos1, pos2] = selectedPattern[patternIndex];
        patternIndex = (patternIndex + 1) % selectedPattern.length;
      } else {
        // Use random swaps for unpredictability
        pos1 = Math.floor(Math.random() * 3);
        pos2 = (pos1 + 1 + Math.floor(Math.random() * 2)) % 3; // Ensure different cups
      }
      
      // Swap cup positions
      [newPositions[pos1], newPositions[pos2]] = [newPositions[pos2], newPositions[pos1]];
      setCupPositions(newPositions);
      
      count++;
      
      // Faster animation with shorter, variable delays based on difficulty
      const randomDelay = (Math.random() < 0.7 
        ? 300 + Math.random() * 150  // 70% chance of fast shuffle
        : 450 + Math.random() * 100) // 30% chance of slightly longer pause
        / speed; // Adjust by speed factor
        
      setTimeout(doShuffle, randomDelay);
    };
    
    // Start shuffling after a short delay
    setTimeout(doShuffle, 400 / speed);
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
        ? `all ${0.3 / speed}s cubic-bezier(0.4, 0, 0.2, 1)` 
        : 'all 0.5s ease-in-out',
      zIndex: 5,
      ...(customStyles.cup || {})
    };
    
    // When in starting phase and this is the cup over the ball, show it lifted
    if (gamePhase === 'starting' && index === ballPosition) {
      style.transform = 'translateX(-50%) translateY(-50px)';
    }
    
    // When game in guessing phase, add hover effect
    if (gamePhase === 'guessing') {
      style.cursor = 'pointer';
    }
    
    return style;
  }, [cupPositions, gamePhase, ballPosition, speed, customStyles]);
  
  // CSS for the cup game
  const gameStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '2rem',
      maxWidth: '500px',
      ...(customStyles.container || {})
    } as React.CSSProperties,
    gameArea: {
      height: '300px',
      width: '100%',
      position: 'relative',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '20px',
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
      ...(customStyles.cupsContainer || {})
    } as React.CSSProperties,
    cup: {
      width: '80px',
      height: '100px',
      backgroundColor: '#d32f2f',
      borderRadius: '5px 5px 40px 40px',
      position: 'absolute',
      transformOrigin: 'bottom center',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
      ...(customStyles.cupBase || {})
    } as React.CSSProperties,
    cupOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
      borderRadius: '5px 5px 40px 40px',
      pointerEvents: 'none',
      ...(customStyles.cupOverlay || {})
    } as React.CSSProperties,
    ball: {
      width: '30px',
      height: '30px',
      backgroundColor: '#4CAF50',
      borderRadius: '50%',
      position: 'absolute',
      bottom: '80px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1,
      transition: 'all 0.5s ease-in-out',
      ...(customStyles.ball || {})
    } as React.CSSProperties,
    ballHighlight: {
      position: 'absolute',
      top: '5px',
      left: '7px',
      width: '10px',
      height: '5px',
      backgroundColor: 'rgba(255,255,255,0.6)',
      borderRadius: '50%',
      transform: 'rotate(30deg)',
      ...(customStyles.ballHighlight || {})
    } as React.CSSProperties,
    gameResult: {
      position: 'absolute',
      top: '5px',
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '1.5rem',
      color: '#333',
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
      color: '#666',
      ...(customStyles.instructions || {})
    } as React.CSSProperties
  };
  
  // Expose startGame function to parent component via ref
  useImperativeHandle(ref, () => ({
    startGame
  }), [startGame]);

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
              <div style={gameStyles.cupOverlay}></div>
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
            <div style={gameStyles.ballHighlight}></div>
          </div>
        </div>
        
        {/* Game message */}
        {message && (
          <div style={gameStyles.gameResult}>
            {message}
          </div>
        )}
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
      
      <div style={gameStyles.instructions}>
        <p>Watch carefully as the cups shuffle. Can you follow the ball?</p>
        <p>
          {gamePhase === 'guessing' ? (
            <strong>Click on the cup where you think the ball is!</strong>
          ) : gamePhase === 'playing' ? (
            <strong>Keep your eye on the cups...</strong>
          ) : null}
        </p>
      </div>
    </div>
  );
});

export default CupGame;