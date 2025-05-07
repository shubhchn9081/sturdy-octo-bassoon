import React, { useState, useEffect, useCallback } from 'react';
import './CupGame.css';

/**
 * CupGame - A standalone component implementing the classic cup and ball game
 * Using CSS classes instead of inline styles
 * 
 * @returns {JSX.Element} The cup game component
 */
const CupGame = ({ 
  onCorrectGuess, // Callback when player guesses correctly
  onWrongGuess,   // Callback when player guesses incorrectly
  difficulty = 'medium',  // 'easy', 'medium', 'hard'
  soundsEnabled = true,   // Enable or disable sound effects
}) => {
  // Game state
  const [gamePhase, setGamePhase] = useState('ready'); // 'ready', 'starting', 'playing', 'guessing', 'ended'
  const [ballPosition, setBallPosition] = useState(0);
  const [cupPositions, setCupPositions] = useState([0, 1, 2]);
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(!soundsEnabled);
  
  // Audio elements
  const [successSound, setSuccessSound] = useState(null);
  const [hitSound, setHitSound] = useState(null);
  
  // Set up difficulty parameters
  const difficultySettings = {
    easy: { shuffleCount: 5, speed: 0.7 },
    medium: { shuffleCount: 8, speed: 1 },
    hard: { shuffleCount: 12, speed: 1.3 }
  };
  
  const { shuffleCount, speed } = difficultySettings[difficulty] || difficultySettings.medium;
  
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
  const playSound = useCallback((sound) => {
    if (sound && !isMuted) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Error playing sound:', err));
    }
  }, [isMuted]);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Handle cup click during guessing phase
  const handleCupClick = useCallback((cupIndex) => {
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
      let pos1, pos2;
      
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
  
  // Get cup position class and style
  const getCupPosition = (index) => {
    const position = cupPositions.indexOf(index);
    const leftPositions = [25, 50, 75]; // Position at 25%, 50%, or 75%
    
    return {
      left: `${leftPositions[position]}%`,
      transform: 'translateX(-50%)'
    };
  };
  
  return (
    <div className="cup-game-container">
      <div className="cup-game-area">
        <div className="cups-container">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className={`cup ${gamePhase === 'playing' ? 'playing' : ''} ${
                gamePhase === 'starting' && index === ballPosition ? 'lifted' : ''
              }`}
              style={getCupPosition(index)}
              data-guessable={gamePhase === 'guessing' ? 'true' : 'false'}
              onClick={() => gamePhase === 'guessing' ? handleCupClick(index) : undefined}
            >
              <div className="cup-overlay"></div>
            </div>
          ))}
          
          {/* Ball */}
          <div 
            className="ball"
            style={{
              opacity: (gamePhase === 'ready' || gamePhase === 'starting' || gamePhase === 'ended') ? 1 : 0,
              left: `${[25, 50, 75][ballPosition]}%`,
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>
        
        {/* Game message */}
        {message && (
          <div className="game-result">
            {message}
          </div>
        )}
      </div>

      <div className="controls">
        <button 
          className="play-button"
          onClick={handlePlayClick}
          disabled={gamePhase === 'playing' || gamePhase === 'starting'}
        >
          {gamePhase === 'ready' ? 'Play' : 'Play Again'}
        </button>
        
        <button 
          className="sound-button"
          onClick={toggleMute}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      
      <div className="instructions">
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
};

export default CupGame;