import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/context/WalletContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GameLayout from '@/components/games/GameLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Constants
const GAME_ID = 16; // New ID for the Cup Game

// Image paths
const cupImagePath = '/images/cup-game/red-cup.png';
const ballImagePath = '/images/cup-game/ball.png';

// Game component itself - directly from the provided file
const CupGameComponent = ({ 
  onCorrectGuess, 
  onWrongGuess, 
  difficulty = 'medium',
  soundsEnabled = true,
  customStyles = {}
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
  
  // Shuffle cup positions using Fisher-Yates algorithm
  const shufflePositions = useCallback((positions) => {
    const newPositions = [...positions];
    
    for (let i = newPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPositions[i], newPositions[j]] = [newPositions[j], newPositions[i]];
    }
    
    return newPositions;
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
  
  // Get cup style based on its position and game phase
  const getCupStyle = useCallback((index) => {
    const position = cupPositions.indexOf(index);
    
    // Calculate percentage-based positions for better responsiveness
    const leftPositions = [25, 50, 75];
    
    // Base styles - absolute positioning for each cup
    const style = {
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
      background: '#1a293a',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      padding: '2rem',
      maxWidth: '500px',
      ...(customStyles.container || {})
    },
    gameArea: {
      height: '300px',
      width: '100%',
      position: 'relative',
      backgroundColor: '#0f1e2d',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '20px',
      ...(customStyles.gameArea || {})
    },
    cupsContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      position: 'relative',
      padding: '20px',
      ...(customStyles.cupsContainer || {})
    },
    cup: {
      width: '80px',
      height: '100px',
      position: 'absolute',
      transformOrigin: 'bottom center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...(customStyles.cupBase || {})
    },
    cupImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      ...(customStyles.cupImage || {})
    },
    ball: {
      width: '30px',
      height: '30px',
      position: 'absolute',
      bottom: '80px',
      zIndex: 1,
      transition: 'all 0.5s ease-in-out',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...(customStyles.ball || {})
    },
    ballImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      ...(customStyles.ballImage || {})
    },
    gameResult: {
      position: 'absolute',
      top: '5px',
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '1.5rem',
      color: '#fff',
      ...(customStyles.gameResult || {})
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...(customStyles.controls || {})
    },
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
    },
    disabledButton: {
      backgroundColor: '#3a4a5a',
      cursor: 'not-allowed',
      ...(customStyles.disabledButton || {})
    },
    soundButton: {
      padding: '10px',
      backgroundColor: 'transparent',
      border: '1px solid #2a3a4a',
      borderRadius: '5px',
      cursor: 'pointer',
      ...(customStyles.soundButton || {})
    },
    instructions: {
      textAlign: 'center',
      marginTop: '20px',
      lineHeight: '1.5',
      color: '#adbbc8',
      ...(customStyles.instructions || {})
    }
  };
  
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
              <img
                src={cupImagePath}
                alt={`Cup ${index + 1}`}
                style={gameStyles.cupImage}
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
        
        {/* Game message */}
        {message && (
          <div style={gameStyles.gameResult}>
            {message}
          </div>
        )}
      </div>

      <div style={gameStyles.controls}>
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
};

// Controls for the game
const CupGameControls = ({
  difficulty,
  onDifficultyChange,
  betAmount,
  onBetAmountChange,
  onBetAmountSlider,
  potentialProfit,
  onStart,
  onReset,
  isPlaying,
  gamePhase,
  gameResult,
  payoutMultiplier
}) => {
  const difficultyDetails = {
    easy: {
      shuffles: 5,
      speed: 'Slow',
      multiplier: 1.5
    },
    medium: {
      shuffles: 8,
      speed: 'Medium',
      multiplier: 2.0
    },
    hard: {
      shuffles: 12,
      speed: 'Fast',
      multiplier: 3.0
    }
  };

  const selectedDifficulty = difficultyDetails[difficulty];

  return (
    <div className="space-y-3 px-2 py-1">
      <h2 className="text-lg md:text-xl font-bold">Game Controls</h2>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Difficulty</label>
          <Select 
            value={difficulty} 
            onValueChange={(value) => onDifficultyChange(value)}
            disabled={isPlaying}
          >
            <SelectTrigger className="w-full h-8 md:h-10 text-xs md:text-sm">
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile optimized game details - grid layout */}
        <div className="grid grid-cols-3 gap-1 mt-1">
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <span className="text-xs md:text-sm">Shuffles</span>
            </div>
            <span className="font-medium text-xs md:text-sm">{selectedDifficulty.shuffles}</span>
          </div>
          
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <span className="text-xs md:text-sm">Speed</span>
            </div>
            <span className="font-medium text-xs md:text-sm">{selectedDifficulty.speed}</span>
          </div>
          
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <span className="text-xs md:text-sm">Payout</span>
            </div>
            <span className="font-medium text-xs md:text-sm">{selectedDifficulty.multiplier}x</span>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Bet Amount</label>
          <div className="flex space-x-2 mb-1">
            <Input
              type="number"
              value={betAmount}
              onChange={onBetAmountChange}
              disabled={isPlaying}
              className="flex-1 h-8 md:h-10 text-xs md:text-sm"
            />
          </div>
          <Slider
            value={[betAmount]}
            min={1}
            max={100}
            step={1}
            onValueChange={onBetAmountSlider}
            disabled={isPlaying}
            className="my-2"
          />
          
          {/* Bet amount quick selectors */}
          <div className="grid grid-cols-4 gap-1 mt-1">
            {[5, 10, 25, 50].map(amount => (
              <button
                key={amount}
                className={`text-xs md:text-sm py-1 px-2 rounded-md ${betAmount === amount ? 'bg-blue-600' : 'bg-slate-700'}`}
                onClick={() => onBetAmountSlider([amount])}
                disabled={isPlaying}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          <label className="block text-xs md:text-sm font-medium mb-1">Payout Information</label>
          <div className="bg-slate-800 p-2 rounded-md">
            <div className="flex justify-between mb-1">
              <span className="text-xs md:text-sm">Bet Amount:</span>
              <span className="font-medium text-xs md:text-sm">{betAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-xs md:text-sm">Multiplier:</span>
              <span className="font-medium text-xs md:text-sm">{payoutMultiplier}x</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-xs md:text-sm">Potential Profit:</span>
              <span className="text-green-400 text-xs md:text-sm">{potentialProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {gameResult && gamePhase === 'complete' && (
          <div className={`mt-2 p-2 rounded-md ${gameResult.win ? 'bg-green-800' : 'bg-red-800'}`}>
            <h3 className="text-xs md:text-sm font-bold mb-1">{gameResult.win ? 'You Won!' : 'You Lost'}</h3>
            {gameResult.win && (
              <div className="flex justify-between">
                <span className="text-xs md:text-sm">Profit:</span>
                <span className="font-medium text-xs md:text-sm">{gameResult.profit.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between space-x-2 mt-3">
          {!isPlaying ? (
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 md:h-10 text-xs md:text-sm" 
              onClick={onStart}
            >
              Start Game
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 h-8 md:h-10 text-xs md:text-sm" 
              onClick={onReset}
              disabled={gamePhase !== 'complete'}
            >
              {gamePhase === 'complete' ? 'Play Again' : 'In Progress...'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main game component that manages game state and betting
const CupGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;
  
  // Game state
  const [difficulty, setDifficulty] = useState('easy');
  const [betAmount, setBetAmount] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gamePhase, setGamePhase] = useState('initial');
  const [selectedCup, setSelectedCup] = useState(null);
  const [ballPosition, setBallPosition] = useState(null);
  const [clientSeed, setClientSeed] = useState(() => Math.random().toString(36).substring(2, 15));
  const [gameResult, setGameResult] = useState(null);
  
  // Set up payouts based on difficulty
  const payoutMultipliers = {
    easy: 1.5,
    medium: 2.0,
    hard: 3.0
  };
  
  // Calculate potential profit
  const calculateProfit = () => {
    return betAmount * payoutMultipliers[difficulty] - betAmount;
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (value) => {
    setDifficulty(value);
  };
  
  // Handle bet amount change from slider
  const handleBetAmountSlider = (value) => {
    setBetAmount(value[0]);
  };
  
  // Handle bet amount change from input
  const handleBetAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
    }
  };
  
  // Bet mutation
  const betMutation = useMutation({
    mutationFn: async () => {
      // Create a new client seed for each game
      const newClientSeed = Math.random().toString(36).substring(2, 15);
      setClientSeed(newClientSeed);
      
      console.log(`Placing bet with selectedCup: ${selectedCup}, difficulty: ${difficulty}`);
      
      const response = await apiRequest('POST', '/api/cup-and-ball/place-bet', {
        gameId: GAME_ID,
        amount: betAmount,
        clientSeed: newClientSeed,
        difficulty,
        selectedCup: selectedCup
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      // Get the outcome from the response
      const outcome = data.bet.outcome;
      
      console.log('Server response:', outcome);
      console.log(`Ball position: ${outcome.ballPosition}, Selected cup: ${outcome.selectedCup}, Win: ${outcome.win}`);
      
      // Store the ball position
      setBallPosition(outcome.ballPosition);
      
      // Set the game result
      setGameResult({
        win: outcome.win,
        profit: data.bet.profit
      });
      
      // Transition to complete phase
      setGamePhase('complete');
      
      // Show toast for win/loss
      if (outcome.win) {
        toast({
          title: "You Won!",
          description: `You won ${data.bet.profit.toFixed(2)}!`,
          variant: "default"
        });
      } else {
        toast({
          title: "You Lost",
          description: "Better luck next time!",
          variant: "destructive"
        });
      }
      
      // Invalidate wallet balance queries to reflect new balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    },
    onError: (error) => {
      setGamePhase('ready');
      setIsPlaying(false);
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place bet",
        variant: "destructive"
      });
    }
  });
  
  // Reset game
  const resetGame = () => {
    setIsPlaying(false);
    setGamePhase('ready');
    setSelectedCup(null);
    setBallPosition(null);
    setGameResult(null);
  };
  
  // Start the game
  const startGame = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to play",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsPlaying(true);
    setGamePhase('ready');
  };
  
  // Handle game events
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
    setSelectedCup(wrongCup);
    setGamePhase('revealing');
    
    // Place bet after selection
    betMutation.mutate();
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
      payoutMultiplier={payoutMultipliers[difficulty]}
    />
  );
  
  const gamePanel = (
    <div className="h-full flex items-center justify-center">
      <CupGameComponent
        onCorrectGuess={handleCorrectGuess}
        onWrongGuess={handleWrongGuess}
        difficulty={difficulty}
        soundsEnabled={true}
        customStyles={{
          container: {
            background: '#1a293a',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          },
          gameArea: {
            backgroundColor: '#0f1e2d'
          },
          cup: {
            backgroundColor: '#e74c3c'
          },
          ball: {
            backgroundColor: '#2ecc71'
          },
          gameResult: {
            color: '#ffffff'
          },
          instructions: {
            color: '#adbbc8'
          }
        }}
      />
    </div>
  );
  
  return (
    <GameLayout
      title="New Cup Game"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
      isMobileFriendly={true}
      mobileFirst={true}
    />
  );
};

export default CupGame;