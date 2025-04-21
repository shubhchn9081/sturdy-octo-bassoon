import { create } from 'zustand';
import { useCallback } from 'react';
import { useBalance } from '@/hooks/use-balance';
import { SupportedCurrency } from '@/context/CurrencyContext'; 

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
  betId?: number; // Server-side bet ID
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
  currency: SupportedCurrency;
  
  // Actions
  placeBet: () => void;
  cashOut: () => void;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number | null) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  resetGame: () => void;
  startGame: () => void;
}

// Constants for the game
const TIME_SCALE = 2000; // Even more extreme horizontal stretching for flatter curve
const HEIGHT_SCALE = 50; // Reduced vertical scaling for ultra-flat trajectory

// Helper functions
function generateCrashPoint(): number {
  // Generate crash points with distribution matching reference
  const r = Math.random();
  
  // Distribution of crash points similar to real Stake.com crash games
  if (r < 0.20) {
    // Very early crash (1.00x to 1.50x) - 20% chance
    return 1.00 + (Math.random() * 0.5);
  } else if (r < 0.40) {
    // Early crash (1.50x to 2.00x) - 20% chance
    return 1.50 + (Math.random() * 0.5);
  } else if (r < 0.70) {
    // Medium crash (2.00x to 4.00x) - 30% chance 
    return 2.00 + (Math.random() * 2);
  } else if (r < 0.90) {
    // Higher crash (4.00x to 10.00x) - 20% chance
    return 4.00 + (Math.random() * 6);
  } else if (r < 0.98) {
    // Very high crash (10.00x to 50.00x) - 8% chance
    return 10.00 + (Math.random() * 40);
  } else {
    // Extreme rare crash (50.00x to 250.00x) - 2% chance
    return 50.00 + (Math.random() * 200);
  }
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
    // Using the ideal Stake-style formula with logarithmic time-based exponential growth:
    // t = time in seconds
    // baseMultiplier = starting value (1.00x)
    // growthRate = smoothness control (typically between 0.05 to 0.15)
    const baseMultiplier = 1.0;
    const growthRate = 0.12; // This produces a moderate curve similar to Stake
    
    // Math.exp() gives a natural exponential curve, not too sharp
    return baseMultiplier * Math.exp(growthRate * elapsed);
    
    // This produces multipliers like:
    // Seconds (t)   Multiplier
    // 1s            1.127
    // 2s            1.271
    // 3s            1.432
    // 4s            1.611
    // 5s            1.822
    // 6s            2.057
    // 7s            2.320
    // 8s            2.614
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
    currency: 'BTC' as SupportedCurrency,
    
    // Actions
    placeBet: () => {
      const { gameState, betAmount, currency } = get();
      
      if (gameState !== 'waiting') {
        return;
      }
      
      if (!betAmount || betAmount <= 0) {
        console.error("Please enter a valid bet amount");
        return;
      }
      
      // Generate a random client seed
      const generateClientSeed = () => {
        return Math.random().toString(36).substring(2, 15);
      };
      
      // Create a clientSeed for provably fair gaming
      const clientSeed = generateClientSeed();
      
      // Get the game ID for Crash (should be 1 based on the schema)
      const gameId = 1;
      
      try {
        // Use the placeBet API function
        const placeBetFn = window.placeBetFunction;
        
        if (placeBetFn && placeBetFn.placeBet) {
          console.log("Using real wallet integration for bet placement");
          // Use the placeBet mutation from the balance hook
          placeBetFn.placeBet.mutate({
            gameId,
            amount: betAmount,
            clientSeed,
            currency,
            options: {
              autoExit: get().autoCashoutValue
            }
          }, {
            onSuccess: (response) => {
              console.log("Bet placed successfully with ID:", response.betId);
              
              // Add player bet to active bets with the server betId
              const newBet: Bet = {
                id: Date.now(),
                username: "Player",
                amount: betAmount,
                isPlayer: true,
                status: 'active',
                betId: response.betId
              };
              
              set(state => ({
                hasPlacedBet: true,
                activeBets: [newBet, ...state.activeBets]
              }));
            },
            onError: (error) => {
              console.error("Error placing bet:", error);
            }
          });
        } else {
          // If the global balance object isn't available, use a fallback approach
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
          
          console.warn("Using fallback bet placement - wallet integration may not work");
        }
      } catch (error) {
        console.error("Error in placeBet:", error);
      }
    },
    
    cashOut: () => {
      const { currentMultiplier, activeBets, hasPlacedBet, hasCashedOut } = get();
      
      // Prevent multiple cashouts or invalid cashout attempts
      if (!hasPlacedBet || hasCashedOut) {
        console.log("Cashout prevented - already cashed out or no bet placed");
        return;
      }
      
      // Find the player bet with server betId
      const playerBet = activeBets.find(bet => bet.isPlayer);
      
      // Mark as cashed out immediately to prevent multiple cashout attempts
      set({ hasCashedOut: true });
      
      if (playerBet && playerBet.betId) {
        try {
          // Use the completeBet API function
          const completeBetFn = window.completeBetFunction;
          
          if (completeBetFn && completeBetFn.completeBet) {
            console.log("Using real wallet integration for cashout with bet ID:", playerBet.betId);
            // Use the completeBet mutation from the balance hook
            completeBetFn.completeBet.mutate({
              betId: playerBet.betId,
              outcome: {
                win: true,
                multiplier: currentMultiplier
              }
            }, {
              onSuccess: (response) => {
                console.log("Bet completed successfully:", response);
                
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
                
                set({ activeBets: updatedBets });
              },
              onError: (error) => {
                console.error("Error completing bet:", error);
                // Even if there's an error, we keep the UI state as cashed out
                // since the bet might have been processed on the server already
              }
            });
          } else {
            // If the global balance object isn't available, use a fallback approach
            // Update player's bet locally without API integration
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
            
            console.warn("Using fallback cashout - wallet integration may not work");
          }
        } catch (error) {
          console.error("Error in cashOut:", error);
        }
      } else {
        // If no server betId is available, just update the UI
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
      }
    },
    
    setBetAmount: (amount: number) => {
      set({ betAmount: amount });
    },
    
    setAutoCashoutValue: (value: number | null) => {
      set({ autoCashoutValue: value });
    },
    
    setCurrency: (currency: SupportedCurrency) => {
      set({ currency });
    },
    
    resetGame: () => {
      // Clear any existing intervals
      if (gameInterval) window.clearInterval(gameInterval as number);
      if (countdownInterval) window.clearInterval(countdownInterval as number);
      
      // Generate new random bets for AI players
      const newAIBets = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
        id: Date.now() + i,
        username: aiPlayerNames[Math.floor(Math.random() * aiPlayerNames.length)],
        amount: parseFloat((Math.random() * 100).toFixed(8)),
        isPlayer: false,
        status: 'active' as BetStatus,
        isHidden: Math.random() > 0.5
      }));
      
      // Always start a fresh round without player bets
      // This ensures bets don't carry over between rounds automatically
      const newCrashPoint = generateCrashPoint();
      
      set({
        gameState: 'waiting',
        currentMultiplier: 1.0,
        crashPoint: newCrashPoint,
        countdown: Math.floor(Math.random() * 3) + 3, // 3-5 seconds countdown
        dataPoints: [],
        hasPlacedBet: false, // Always reset player bet state
        hasCashedOut: false,
        activeBets: newAIBets // Use only AI bets
      });
      
      // Start countdown
      let count = get().countdown;
      countdownInterval = window.setInterval(() => {
        count--;
        if (count <= 0) {
          if (countdownInterval) {
            window.clearInterval(countdownInterval as number);
            countdownInterval = null;
          }
          get().startGame();
        } else {
          set({ countdown: count });
        }
      }, 1000);
    },
    
    startGame: () => {
      // Clear any existing intervals
      if (gameInterval) {
        window.clearInterval(gameInterval as number);
        gameInterval = null;
      }
      
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
        
        // Calculate new data point for graph - matching exact trajectory from reference
        const x = elapsed * TIME_SCALE;
        
        // Drastically reduced vertical scaling to create extremely flat trajectory
        // This creates an almost horizontal line with minimal vertical rise
        // Maximizing horizontal movement while minimizing vertical movement
        const y = (newMultiplier - 1.0) * HEIGHT_SCALE * 0.3; // Extremely reduced scaling factor for ultra-flat appearance
        
        const newDataPoints = [...dataPoints, { x, y }];
        
        // Random AI cashouts
        const updatedBets = cashoutAIPlayers(formattedMultiplier, activeBets);
        
        // Check for crash
        if (formattedMultiplier >= crashPoint) {
          // Game over - crashed
          if (gameInterval) {
            window.clearInterval(gameInterval as number);
            gameInterval = null;
          }
          
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
      }, 250); // More frequent updates with smaller changes for smoother animation
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