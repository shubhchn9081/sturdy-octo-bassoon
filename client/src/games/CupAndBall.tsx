import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/context/WalletContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Game UI components
import GameLayout from '@/components/games/GameLayout';
import type { GameLayoutProps } from '@/components/games/GameLayout';
// Import cup game components directly
import CupControls from '@/games/cup-and-ball/CupControls';
// Import the enhanced version with improved animations
import EnhancedCupAndBallGame from '@/games/cup-and-ball/EnhancedCupAndBallGame';

const GAME_ID = 15; // Assigned ID for the Cup and Ball game

const CupAndBall = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user; // Derive authentication status from user object
  
  // Game state
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [betAmount, setBetAmount] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gamePhase, setGamePhase] = useState<'initial' | 'shuffling' | 'selecting' | 'revealing' | 'complete'>('initial');
  const [selectedCup, setSelectedCup] = useState<number | null>(null);
  const [ballPosition, setBallPosition] = useState<number | null>(null);
  const [shuffleMoves, setShuffleMoves] = useState<number[]>([]);
  const [clientSeed, setClientSeed] = useState<string>(() => Math.random().toString(36).substring(2, 15));
  const [gameResult, setGameResult] = useState<{ win: boolean; profit: number } | null>(null);
  
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
  const handleDifficultyChange = (value: 'easy' | 'medium' | 'hard') => {
    setDifficulty(value);
  };
  
  // Handle bet amount change from slider
  const handleBetAmountSlider = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  // Handle bet amount change from input
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(value);
    }
  };
  
  // Bet mutation
  const betMutation = useMutation({
    mutationFn: async () => {
      setGamePhase('shuffling');
      
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
      
      // Store the ball position and shuffle moves for animation
      setBallPosition(outcome.ballPosition);
      setShuffleMoves(outcome.shuffleMoves);
      
      // Set the game result
      setGameResult({
        win: outcome.win,
        profit: data.bet.profit
      });
      
      // Start the animation sequence
      playGameSequence(outcome);
      
      // Invalidate wallet balance queries to reflect new balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    },
    onError: (error) => {
      setGamePhase('initial');
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
    setGamePhase('initial');
    setSelectedCup(null);
    setBallPosition(null);
    setShuffleMoves([]);
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
    setGamePhase('initial');
    
    // Show initial ball placement under a random cup (0, 1, or 2)
    const initialPosition = Math.floor(Math.random() * 3);
    console.log(`Setting initial ball position to: ${initialPosition}`);
    setBallPosition(initialPosition);
    
    // Show the ball for a full 3.5 seconds at the start for initial ball placement
    setTimeout(() => {
      setGamePhase('shuffling');
      
      // Generate temporary shuffling for the animation
      // The actual shuffling will come from the server
      const tempShuffles = [];
      // Number of moves based on difficulty
      const numMoves = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
      
      for (let i = 0; i < numMoves; i++) {
        tempShuffles.push(Math.floor(Math.random() * 3));
      }
      setShuffleMoves(tempShuffles);
      
      // After shuffling animation completes, let the player select a cup
      // Timing adjusted for enhanced animation sequence:
      // - Pre-shuffle anticipation: ~500ms
      // - Each swap: 350-550ms based on difficulty
      // - Post-shuffle settlement: ~500ms
      const shuffleDuration = 
        difficulty === 'easy' ? 5500 : // 5 swaps + pauses + pre/post phases
        difficulty === 'medium' ? 9000 : // 10 swaps + pauses + pre/post phases
        13000; // 15 swaps + pauses + pre/post phases for hard
        
      setTimeout(() => {
        setGamePhase('selecting');
      }, shuffleDuration);
    }, 3500);
  };
  
  // Handle cup selection
  const handleCupSelect = (cupIndex: number) => {
    if (gamePhase !== 'selecting') {
      console.log(`Cup selection ignored - not in selecting phase (current phase: ${gamePhase})`);
      return;
    }
    
    console.log(`Player selected cup with index: ${cupIndex}`);
    setSelectedCup(cupIndex);
    
    // Place the bet after cup selection
    betMutation.mutate();
  };
  
  // Play the game sequence based on the server outcome
  const playGameSequence = (outcome: any) => {
    // Pre-reveal anticipation timing (1000ms)
    const preRevealDuration = 1000;
    
    console.log("Playing game outcome sequence with:", outcome);
    console.log(`Ball final position: ${outcome.ballPosition}, Player selected: ${outcome.selectedCup}, Win: ${outcome.win}`);
    
    // After "server-side" shuffling finishes, show the result
    setTimeout(() => {
      // Start the sequential cup reveal animation
      setGamePhase('revealing');
      
      // Sequential cup reveal timing (3000ms total)
      // The actual animation timings are handled in the EnhancedCupAndBallGame component
      setTimeout(() => {
        // Transition to complete phase
        setGamePhase('complete');
        
        // Show toast for win/loss
        if (outcome.win) {
          toast({
            title: "You Won!",
            description: `You won ${gameResult?.profit.toFixed(2)}!`,
            variant: "default"
          });
        } else {
          toast({
            title: "You Lost",
            description: "Better luck next time!",
            variant: "destructive"
          });
        }
      }, 3000); // Total reveal animation duration
    }, preRevealDuration);
  };
  
  // Create the game panels for the layout
  const controlsPanel = (
    <CupControls
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
    <EnhancedCupAndBallGame
      gamePhase={gamePhase}
      ballPosition={ballPosition}
      selectedCup={selectedCup}
      shuffleMoves={shuffleMoves}
      difficulty={difficulty}
      onCupSelect={handleCupSelect}
      gameResult={gameResult}
    />
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

export default CupAndBall;