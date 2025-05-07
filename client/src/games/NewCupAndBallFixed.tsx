import React, { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import CupGame from './cup-and-ball/CupAndBallGame';
import GameLayout from '@/components/games/GameLayout';
import CupGameControls from '@/components/games/cup-and-ball/CupGameControls';

// Game configuration settings
const GAME_SETTINGS = {
  easy: {
    shuffles: 3,
    speed: 'slow',
    multiplier: 1.5
  },
  medium: {
    shuffles: 5,
    speed: 'medium',
    multiplier: 2.0
  },
  hard: {
    shuffles: 7,
    speed: 'fast',
    multiplier: 3.0
  }
};

// Payout multipliers for each difficulty level
const PAYOUT_MULTIPLIERS = {
  easy: 1.5,
  medium: 2.0,
  hard: 3.0
};

// Define types for cup game controls
interface CupGameControlsProps {
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  betAmount: number;
  onBetAmountChange: (amount: number) => void;
  onBetAmountSlider: (e: React.ChangeEvent<HTMLInputElement>) => void;
  potentialProfit: number;
  onStart: () => void;
  onReset: () => void;
  isPlaying: boolean;
  gamePhase: string;
  gameResult: { win: boolean; profit: number } | null;
  payoutMultiplier: number;
}

// Cup and Ball Game Component
const NewCupAndBall: React.FC = () => {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [betAmount, setBetAmount] = useState(10);
  const [gamePhase, setGamePhase] = useState<'ready' | 'starting' | 'playing' | 'guessing' | 'revealing' | 'complete'>('ready');
  const [ballPosition, setBallPosition] = useState<number | null>(null);
  const [selectedCup, setSelectedCup] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<{ win: boolean; profit: number } | null>(null);

  // Reference to the cup game component
  const cupGameRef = useRef<any>(null);
  
  // Bet mutation hook
  const betMutation = useMutation({
    mutationFn: () => {
      const win = selectedCup === ballPosition;
      const profit = win ? betAmount * PAYOUT_MULTIPLIERS[difficulty as keyof typeof PAYOUT_MULTIPLIERS] : 0;
      
      return apiRequest('/api/games/cup-and-ball/bet', {
        method: 'POST',
        body: {
          amount: betAmount,
          difficulty,
          cupSelected: selectedCup,
          ballPosition,
          win,
          profit
        }
      });
    },
    onSuccess: (data) => {
      // Determine win state based on the ball position and selected cup
      const didWin = selectedCup === ballPosition;
      const profit = didWin ? betAmount * PAYOUT_MULTIPLIERS[difficulty as keyof typeof PAYOUT_MULTIPLIERS] : 0;
      
      // Update game result
      setGameResult({ 
        win: didWin,
        profit: profit 
      });
      
      // Update game phase to complete
      setGamePhase('complete');
    },
    onError: (error) => {
      console.error('Error placing bet:', error);
      // Reset to ready state
      setGamePhase('ready');
      resetGame();
    }
  });
  
  // Helper function to generate random ball position (0, 1, or 2)
  const getRandomBallPosition = () => {
    return Math.floor(Math.random() * 3);
  };
  
  // Function to start the game
  const startGame = () => {
    // Reset previous game state
    setSelectedCup(null);
    setGameResult(null);
    setIsPlaying(true);
    setGamePhase('starting');
    
    // Generate random ball position
    const newBallPosition = getRandomBallPosition();
    setBallPosition(newBallPosition);
    
    // Show the ball briefly, then start the game
    setTimeout(() => {
      setGamePhase('playing');
      
      // Shuffle cups according to difficulty
      if (cupGameRef.current && typeof cupGameRef.current.startGame === 'function') {
        cupGameRef.current.startGame();
      }
      
      // After shuffling, set the game to guessing phase
      setTimeout(() => {
        setGamePhase('guessing');
      }, GAME_SETTINGS[difficulty as keyof typeof GAME_SETTINGS].shuffles * 1000);
    }, 1500);
  };
  
  // Function to reset the game
  const resetGame = () => {
    setIsPlaying(false);
    setGamePhase('ready');
    setBallPosition(null);
    setSelectedCup(null);
    setGameResult(null);
    
    if (cupGameRef.current && typeof cupGameRef.current.resetGame === 'function') {
      cupGameRef.current.resetGame();
    }
  };
  
  // Function to calculate potential profit
  const calculateProfit = () => {
    return betAmount * PAYOUT_MULTIPLIERS[difficulty as keyof typeof PAYOUT_MULTIPLIERS];
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: string) => {
    if (!isPlaying) {
      setDifficulty(newDifficulty);
    }
  };
  
  // Handle bet amount change
  const handleBetAmountChange = (value: number) => {
    if (!isPlaying) {
      setBetAmount(value);
    }
  };
  
  // Handle bet amount slider change
  const handleBetAmountSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying) {
      setBetAmount(Number(e.target.value));
    }
  };
  
  // Handle correct guess (when user selects the cup with the ball)
  const handleCorrectGuess = () => {
    setSelectedCup(ballPosition);
    setGamePhase('revealing');
    
    // Place bet after selection
    betMutation.mutate();
  };
  
  const handleWrongGuess = () => {
    // We need to determine which cup the player selected
    // In this case, we'll use the first cup that's not the ball position
    const wrongCup = [0, 1, 2].find(cup => cup !== ballPosition);
    setSelectedCup(wrongCup || 0);
    setGamePhase('revealing');
    
    // Place bet after selection
    betMutation.mutate();
  };
  
  // Function to handle cup selection in mobile view
  const handleCupSelect = (cupIndex: number) => {
    console.log(`Cup selected: ${cupIndex}, current phase: ${gamePhase}`);
    
    // Only allow selection if the game is in the guessing phase
    if (gamePhase !== 'guessing') return;
    
    // Update selected cup and transition to revealing phase
    setSelectedCup(cupIndex);
    setGamePhase('revealing');
    
    // Delay to show the animation of lifting the cup
    setTimeout(() => {
      // Here we need to check if the selected cup matches the ball position
      const isCorrect = cupIndex === ballPosition;
      console.log(`User selected cup ${cupIndex}, ball was at ${ballPosition}, correct: ${isCorrect}`);
      
      // Place the bet with the API
      betMutation.mutate();
    }, 1000);
  };
  
  // Create the game panels for the layout
  const controlsPanel = (
    <CupGameControls
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      onBetAmountSlider={handleBetAmountSlider}
      potentialProfit={calculateProfit()}
      onStart={startGame}
      onReset={resetGame}
      isPlaying={isPlaying}
      gamePhase={gamePhase}
      gameResult={gameResult}
      payoutMultiplier={PAYOUT_MULTIPLIERS[difficulty as keyof typeof PAYOUT_MULTIPLIERS]}
    />
  );
  
  // Determine mobile view with responsive state
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Handle window resize to update mobile detection - with detailed checks
  React.useEffect(() => {
    const checkMobile = () => {
      const smallScreen = window.innerWidth < 768;
      const narrowScreen = window.innerWidth < 500;
      const lowHeight = window.innerHeight < 600;
      // Log dimensions for debugging
      console.log(`Current screen dimensions: ${window.innerWidth}x${window.innerHeight}`);
      
      setIsMobileView(smallScreen || narrowScreen || lowHeight);
    };
    
    // Set initial value
    checkMobile();
    
    // Add event listeners with throttling for better performance
    let resizeTimeout: any = null;
    const throttledResize = () => {
      if (resizeTimeout === null) {
        resizeTimeout = setTimeout(() => {
          resizeTimeout = null;
          checkMobile();
        }, 200);
      }
    };
    
    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', checkMobile); // Critical for mobile
    
    // Clean up
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', checkMobile);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Render different game implementation for mobile vs desktop
  const gamePanel = (
    <div className="h-full w-full flex items-center justify-center">
      {isMobileView ? (
        // Simple mobile fallback version that's guaranteed to work
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 rounded-lg p-4">
          <div className="text-center text-white mb-4">
            <h3 className="text-lg font-bold">Cup and Ball Game</h3>
            <p className="text-sm opacity-80 mt-1">Follow the ball under the cups!</p>
          </div>
          
          <div className="relative w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center">
            {/* Basic flat mobile implementation - guaranteed to work */}
            <div className="flex justify-around items-end w-full px-4">
              {[0, 1, 2].map((index) => (
                <div 
                  key={index}
                  className={`relative flex flex-col items-center ${gamePhase === 'guessing' ? 'cursor-pointer active:opacity-80' : ''}`}
                  onClick={() => {
                    if (gamePhase === 'guessing') {
                      handleCupSelect(index);
                    }
                  }}
                >
                  {/* Cup */}
                  <div 
                    className={`w-20 h-28 bg-gradient-to-b from-red-600 to-red-800 rounded-t-2xl rounded-b-lg
                      ${gamePhase === 'guessing' ? 'animate-pulse' : ''}
                      ${(gamePhase === 'revealing' || gamePhase === 'complete') && ballPosition === index ? 'translate-y-[-40px]' : ''}`}
                    style={{
                      transition: 'transform 0.3s ease',
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {/* Cup number */}
                    <div className="bg-slate-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Ball - only show if it's the correct position and in reveal phase */}
                  {(gamePhase === 'ready' || gamePhase === 'starting' || gamePhase === 'revealing' || gamePhase === 'complete') && 
                   ballPosition === index && (
                    <div className="absolute bottom-[-15px] w-8 h-8 bg-blue-500 rounded-full border-2 border-blue-600"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Game state indication */}
            {gamePhase === 'starting' && (
              <div className="absolute top-2 left-0 w-full text-center text-sm text-white bg-blue-600 py-1 px-2 rounded">
                Watch carefully...
              </div>
            )}
            {gamePhase === 'playing' && (
              <div className="absolute top-2 left-0 w-full text-center text-sm text-white bg-yellow-600 py-1 px-2 rounded">
                Shuffling cups...
              </div>
            )}
            {gamePhase === 'guessing' && (
              <div className="absolute top-2 left-0 w-full text-center text-sm text-white bg-green-600 py-1 px-2 rounded">
                Find the ball!
              </div>
            )}
            {gamePhase === 'complete' && gameResult && (
              <div className={`absolute top-2 left-0 w-full text-center text-sm text-white ${gameResult.win ? 'bg-green-600' : 'bg-red-600'} py-1 px-2 rounded`}>
                {gameResult.win ? `You won ${gameResult.profit.toFixed(2)}!` : 'Better luck next time!'}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Original desktop implementation
        <CupGame
          ref={cupGameRef}
          onCorrectGuess={handleCorrectGuess}
          onWrongGuess={handleWrongGuess}
          difficulty={difficulty as 'easy' | 'medium' | 'hard'}
          soundsEnabled={true}
          customStyles={{
            container: {
              background: '#1a293a',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              width: '100%',
              minHeight: '350px',
              maxWidth: '600px',
              padding: '1.5rem',
            },
            gameArea: {
              backgroundColor: '#0f1e2d',
              height: '350px',
              width: '100%'
            },
            cup: {
              zIndex: 20,
              width: '130px',
              height: '180px' 
            },
            ball: {
              zIndex: 10,
              width: '70px',
              height: '70px'
            },
            gameResult: {
              color: '#ffffff'
            },
            instructions: {
              color: '#adbbc8'
            }
          }}
        />
      )}
    </div>
  );
  
  return (
    <GameLayout
      title="Cup and Ball"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
      isMobileFriendly={true}
      mobileFirst={true}
    />
  );
};

export default NewCupAndBall;