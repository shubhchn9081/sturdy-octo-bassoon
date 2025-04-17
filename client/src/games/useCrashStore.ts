import { create } from 'zustand';
import { useCallback } from 'react';

// Game state types
export type GameState = 'waiting' | 'running' | 'crashed' | 'cashed_out';
type BetStatus = 'active' | 'won' | 'lost';

// Interfaces
interface Bet {
  id: number;
  username: string;
  amount: number;
  isPlayer: boolean;
  status: BetStatus;
  cashoutMultiplier?: number;
  profit?: number;
  isHidden?: boolean;
}

interface HistoryItem {
  crashPoint: number;
  timestamp: number;
}

// Store interface
interface CrashStore {
  // Game state
  gameState: GameState;
  currentMultiplier: number;
  crashPoint: number;
  countdown: number;
  timeStarted: number;
  dataPoints: Array<{x: number, y: number}>;
  hasPlacedBet: boolean;
  hasCashedOut: boolean;
  
  // Betting
  betAmount: number;
  autoCashoutValue: number | null;
  activeBets: Bet[];
  gameHistory: HistoryItem[];
  
  // Actions
  placeBet: () => void;
  cashOut: () => void;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number | null) => void;
  resetGame: () => void;
  startGame: () => void;
}

// Constants for the game
const TIME_SCALE = 50; // X-axis scale for time
const HEIGHT_SCALE = 300; // Y-axis scale for multiplier

// Helper functions
function generateCrashPoint(): number {
  // Using a simplified version of the formula mentioned
  const h = Math.random().toString();
  const n = parseInt(h.substring(2, 15), 16);
  
  if (n % 33 === 0) return 1.00; // 1 in 33 chance of instant crash
  
  const crashPoint = Math.floor((100 * (1e9)) / (n + 1)) / 1e7;
  return Math.min(crashPoint, 1000.00); // Cap at 1000x
}

// Create Zustand store
export const useCrashStore = create<CrashStore>((set, get) => {
  // Game interval reference
  let gameInterval: number | null = null;
  let countdownInterval: number | null = null;
  
  // AI player names
  const aiPlayerNames = [
    "CryptoKing", "LuckyJohn", "MoonGambler", "RiskTaker", 
    "WhaleBet", "DiamondHands", "FastCasher", "SlowPlayer",
    "EagleEye", "QuickDraw", "HighRoller", "SmallBets"
  ];
  
  // Create some initial AI bets
  const createInitialBets = (): Bet[] => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      username: aiPlayerNames[Math.floor(Math.random() * aiPlayerNames.length)],
      amount: parseFloat((Math.random() * 100).toFixed(8)),
      isPlayer: false,
      status: 'active',
      isHidden: Math.random() > 0.5
    }));
  };
  
  // Function to calculate multiplier based on elapsed time
  const getLiveMultiplier = (elapsed: number): number => {
    // Using the formula: 1.0024^(elapsed*1000)
    return Math.pow(1.0024, elapsed * 1000);
  };
  
  // Cashout AI players
  const cashoutAIPlayers = (currentMultiplier: number, activeBets: Bet[]): Bet[] => {
    return activeBets.map(bet => {
      if (!bet.isPlayer && bet.status === 'active') {
        // Random chance to cash out, higher at higher multipliers
        const cashoutChance = 0.1 + currentMultiplier / 30;
        
        if (Math.random() < cashoutChance) {
          return {
            ...bet,
            status: 'won' as BetStatus,
            cashoutMultiplier: currentMultiplier,
            profit: bet.amount * currentMultiplier
          };
        }
      }
      return bet;
    });
  };
  
  return {
    // Initial state
    gameState: 'waiting',
    currentMultiplier: 1.0,
    crashPoint: 0,
    countdown: 5,
    timeStarted: 0,
    dataPoints: [],
    hasPlacedBet: false,
    hasCashedOut: false,
    
    betAmount: 0.001,
    autoCashoutValue: null,
    activeBets: createInitialBets(),
    gameHistory: [],
    
    // Actions
    placeBet: () => {
      const { gameState, betAmount } = get();
      
      if (gameState !== 'waiting') {
        return;
      }
      
      if (!betAmount || betAmount <= 0) {
        console.error("Please enter a valid bet amount");
        return;
      }
      
      // Add player bet to active bets
      const newBet: Bet = {
        id: Date.now(),
        username: "Player",
        amount: betAmount,
        isPlayer: true,
        status: 'active'
      };
      
      set(state => ({
        hasPlacedBet: true,
        activeBets: [newBet, ...state.activeBets]
      }));
    },
    
    cashOut: () => {
      const { currentMultiplier, activeBets, hasPlacedBet, hasCashedOut } = get();
      
      if (!hasPlacedBet || hasCashedOut) {
        return;
      }
      
      // Update player's bet
      const updatedBets = activeBets.map(bet => {
        if (bet.isPlayer) {
          return {
            ...bet,
            status: 'won' as BetStatus,
            cashoutMultiplier: currentMultiplier,
            profit: bet.amount * currentMultiplier
          };
        }
        return bet;
      });
      
      set({
        activeBets: updatedBets,
        hasCashedOut: true
      });
    },
    
    setBetAmount: (amount: number) => {
      set({ betAmount: amount });
    },
    
    setAutoCashoutValue: (value: number | null) => {
      set({ autoCashoutValue: value });
    },
    
    resetGame: () => {
      // Clear any existing intervals
      if (gameInterval) window.clearInterval(gameInterval);
      if (countdownInterval) window.clearInterval(countdownInterval);
      
      // Generate new random bets for AI players
      const newAIBets = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
        id: Date.now() + i,
        username: aiPlayerNames[Math.floor(Math.random() * aiPlayerNames.length)],
        amount: parseFloat((Math.random() * 100).toFixed(8)),
        isPlayer: false,
        status: 'active' as BetStatus,
        isHidden: Math.random() > 0.5
      }));
      
      // Keep player bet if it exists
      const playerBet = get().activeBets.find(bet => bet.isPlayer);
      const nextBets = playerBet 
        ? [...newAIBets, { ...playerBet, status: 'active', cashoutMultiplier: undefined, profit: undefined }] 
        : newAIBets;
      
      const newCrashPoint = generateCrashPoint();
      
      set({
        gameState: 'waiting',
        currentMultiplier: 1.0,
        crashPoint: newCrashPoint,
        countdown: Math.floor(Math.random() * 3) + 3, // 3-5 seconds countdown
        dataPoints: [],
        hasPlacedBet: playerBet ? true : false,
        hasCashedOut: false,
        activeBets: nextBets
      });
      
      // Start countdown
      let count = get().countdown;
      countdownInterval = window.setInterval(() => {
        count--;
        if (count <= 0) {
          window.clearInterval(countdownInterval);
          get().startGame();
        } else {
          set({ countdown: count });
        }
      }, 1000);
    },
    
    startGame: () => {
      // Clear any existing intervals
      if (gameInterval) window.clearInterval(gameInterval);
      
      const startTime = Date.now();
      
      set({
        gameState: 'running',
        timeStarted: startTime,
        countdown: 0
      });
      
      // Main game loop
      gameInterval = window.setInterval(() => {
        const { 
          currentMultiplier, 
          crashPoint, 
          activeBets, 
          autoCashoutValue, 
          hasPlacedBet,
          hasCashedOut,
          dataPoints
        } = get();
        
        const elapsed = (Date.now() - startTime) / 1000;
        const newMultiplier = getLiveMultiplier(elapsed);
        const formattedMultiplier = parseFloat(newMultiplier.toFixed(2));
        
        // Check for auto cashout
        if (autoCashoutValue && 
            hasPlacedBet && 
            !hasCashedOut && 
            formattedMultiplier >= autoCashoutValue) {
          get().cashOut();
        }
        
        // Calculate new data point for graph
        const x = elapsed * TIME_SCALE;
        const y = (Math.log(newMultiplier) / Math.log(1.0024 * 100)) * HEIGHT_SCALE;
        const newDataPoints = [...dataPoints, { x, y }];
        
        // Random AI cashouts
        const updatedBets = cashoutAIPlayers(formattedMultiplier, activeBets);
        
        // Check for crash
        if (formattedMultiplier >= crashPoint) {
          // Game over - crashed
          if (gameInterval) window.clearInterval(gameInterval);
          
          // Update remaining bets as lost
          const finalBets = updatedBets.map(bet => {
            if (bet.status === 'active') {
              return { ...bet, status: 'lost' as BetStatus };
            }
            return bet;
          });
          
          // Add to history
          const newHistoryItem = {
            crashPoint: formattedMultiplier,
            timestamp: Date.now()
          };
          
          set(state => ({
            gameState: 'crashed',
            currentMultiplier: formattedMultiplier,
            activeBets: finalBets,
            dataPoints: newDataPoints,
            gameHistory: [newHistoryItem, ...state.gameHistory.slice(0, 9)]
          }));
          
          // Reset game after delay
          setTimeout(() => {
            get().resetGame();
          }, 3000);
        } else {
          // Update game state
          set({
            currentMultiplier: formattedMultiplier,
            activeBets: updatedBets,
            dataPoints: newDataPoints
          });
        }
      }, 100);
    }
  };
});

// Helper hook to use the store
export function useCrashGame() {
  const store = useCrashStore();
  
  // Auto-initialize game on first load
  const initialize = useCallback(() => {
    if (store.gameState === 'waiting' && store.dataPoints.length === 0) {
      store.resetGame();
    }
  }, [store]);
  
  return {
    ...store,
    initialize
  };
}