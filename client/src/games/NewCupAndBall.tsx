import React, { useState } from 'react';
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

// Import the custom images cup game component
import CupGame from './EnhancedCupGameWithCustomImages';

// Constants
const GAME_ID = 16; // New ID for the Cup Game

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
  // Determine if it's mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
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
    <div className="px-1 py-1">
      {/* For mobile view, create a more compact layout */}
      {isMobile ? (
        <div className="space-y-2 h-full flex flex-col justify-between">
          <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-amber-500 to-amber-300 text-transparent bg-clip-text">
              Desktop Experience Only
            </h3>
            
            <p className="text-slate-300 text-sm mb-3">
              This game is optimized for desktop browsers.
            </p>
            
            <div className="w-full py-2 px-3 bg-blue-800/30 rounded-md text-blue-300 text-sm flex items-center justify-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mobile version coming soon</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/70 rounded px-2 py-3 text-center">
                <div className="text-xs text-slate-400 mb-1">Difficulty</div>
                <div className="text-sm font-medium text-white">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </div>
              </div>
              <div className="bg-slate-800/70 rounded px-2 py-3 text-center">
                <div className="text-xs text-slate-400 mb-1">Payout</div>
                <div className="text-sm font-medium text-white">
                  {payoutMultiplier}x
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              className="bg-blue-700 hover:bg-blue-800 h-12 w-full max-w-xs text-base font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={true}
            >
              Play on Desktop
            </Button>
          </div>
        </div>
      ) : (
        /* Original desktop layout */
        <div className="space-y-3">
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

            {/* Game details - grid layout */}
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
                min={100}
                max={5000}
                step={100}
                onValueChange={onBetAmountSlider}
                disabled={isPlaying}
                className="my-2"
              />
              
              {/* Bet amount quick selectors */}
              <div className="grid grid-cols-4 gap-1 mt-1">
                {[100, 500, 1000, 5000].map(amount => (
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
      )}
    </div>
  );
};

// Main game component that manages game state and betting
const NewCupAndBall = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;
  
  // Game state
  const [difficulty, setDifficulty] = useState('easy');
  const [betAmount, setBetAmount] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gamePhase, setGamePhase] = useState('initial');
  const [selectedCup, setSelectedCup] = useState(null);
  const [ballPosition, setBallPosition] = useState(null);
  const [clientSeed, setClientSeed] = useState(() => Math.random().toString(36).substring(2, 15));
  const [gameResult, setGameResult] = useState(null);
  
  // Create a ref to the cup game component
  const cupGameRef = React.useRef<{ startGame: () => void }>(null);
  
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
    if (!isNaN(value) && value >= 100) {
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
    
    if (betAmount < 100) {
      toast({
        title: "Invalid Bet",
        description: "Minimum bet amount is 100",
        variant: "destructive"
      });
      return;
    }
    
    // First reset any existing game state to ensure clean start
    setIsPlaying(false);
    setGamePhase('initial');
    setSelectedCup(null);
    setBallPosition(null);
    setGameResult(null);
    
    // Short delay to ensure state is reset before starting
    setTimeout(() => {
      setIsPlaying(true);
      setGamePhase('ready');
      
      // Generate a random position for the ball (0, 1, or 2)
      const initialBallPosition = Math.floor(Math.random() * 3);
      setBallPosition(initialBallPosition);
      console.log("Setting initial ball position:", initialBallPosition);
      
      // Use the ref to start the game
      if (cupGameRef.current) {
        cupGameRef.current.startGame();
      } else {
        console.error("Cup game ref is not available!");
        // Fallback in case ref is not available (this might happen in some mobile scenarios)
        toast({
          title: "Game Error",
          description: "Please try again",
          variant: "destructive"
        });
        setIsPlaying(false);
        setGamePhase('initial');
      }
    }, 100);
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
  
  // Determine if it's mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Use state to handle window resize and update mobile detection
  const [isMobileView, setIsMobileView] = useState(isMobile);
  
  // Handle window resize to update mobile detection
  React.useEffect(() => {
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
  
  // Mobile notice component with premium styling
  const MobileNotice = () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-6 text-center">
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-transparent bg-clip-text mb-4">
        <h2 className="text-2xl font-bold">Desktop Experience Only</h2>
      </div>
      
      <div className="w-16 h-16 mb-4 relative">
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-slate-700 rounded-full border border-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <p className="text-slate-300 mb-3">
        This game is optimized for desktop browsers.
      </p>
      <p className="text-slate-400 text-sm mb-6">
        Please switch to a desktop device for the best experience.
      </p>
      
      <div className="relative inline-flex items-center px-6 py-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg">
        <span className="relative z-10">Mobile Version Coming Soon</span>
        <span className="absolute inset-0 bg-white opacity-10 animate-pulse"></span>
      </div>
    </div>
  );
  
  const gamePanel = (
    <div className="h-full w-full flex items-center justify-center">
      {isMobileView ? (
        <MobileNotice />
      ) : (
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
              height: undefined,
              minHeight: '350px',
              maxWidth: '600px',
              padding: '1.5rem',
              overflowX: 'hidden'
            },
            gameArea: {
              backgroundColor: '#0f1e2d',
              height: '350px',
              width: '100%'
            },
            cup: {
              zIndex: 20,
              width: isMobileView ? '90px' : '130px',
              height: isMobileView ? '140px' : '180px'
            },
            ball: {
              zIndex: 10,
              width: isMobileView ? '40px' : '70px',
              height: isMobileView ? '40px' : '70px'
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