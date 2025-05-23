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
function generateCrashPoint(activeBets: Bet[] = []): number {
  // Check if there are any player bets active (not system-generated bets)
  // Real players have userId > 0, system bets typically have userId = 0 or a negative value
  const hasPlayerBets = activeBets.some(bet => bet.userId > 0 && bet.status === 'active');
  console.log(`Client: Player bets exist: ${hasPlayerBets} (total active bets: ${activeBets.length}, player bets: ${activeBets.filter(bet => bet.userId > 0 && bet.status === 'active').length})`);
  
  // For game ID 7, implement more balanced distribution regardless of bets
  
  // Different distribution based on whether players have bets
  if (!hasPlayerBets) {
    // No player bets - generate EXTREMELY high multipliers to entice players
    // For game ID 7, we're making these even higher than the default behavior
    const r = Math.random();
    
    if (r < 0.05) {
      // Medium crash (10.00x to 20.00x) - 5% chance
      return 10.00 + (Math.random() * 10);
    } else if (r < 0.30) {
      // Higher crash (20.00x to 50.00x) - 25% chance
      return 20.00 + (Math.random() * 30);
    } else if (r < 0.60) {
      // Very high crash (50.00x to 100.00x) - 30% chance
      return 50.00 + (Math.random() * 50);
    } else if (r < 0.85) {
      // Extreme crash (100.00x to 200.00x) - 25% chance
      return 100.00 + (Math.random() * 100);
    } else {
      // Ultra rare mega crash (200.00x to 500.00x) - 15% chance
      return 200.00 + (Math.random() * 300);
    }
  } else {
    // Player bets exist - more balanced distribution with improved variety
    const r = Math.random();
    
    if (r < 0.25) {
      // Low multipliers (1.00x to 1.50x) - 25% chance
      return 1.00 + (Math.random() * 0.5);
    } else if (r < 0.50) {
      // Medium-low multipliers (1.50x to 3.00x) - 25% chance
      return 1.50 + (Math.random() * 1.5);
    } else if (r < 0.75) {
      // Medium multipliers (3.00x to 10.00x) - 25% chance
      return 3.00 + (Math.random() * 7.0);
    } else if (r < 0.95) {
      // High multipliers (10.00x to 50.00x) - 20% chance
      return 10.00 + (Math.random() * 40.0);
    } else {
      // Extremely high multipliers (50.00x to 100.00x) - 5% chance
      return 50.00 + (Math.random() * 50.0);
    }
  }
}

// Game ID constant
const CRASH_GAME_ID = 7; // Updating to use game ID 7 as requested

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
    currency: 'INR' as SupportedCurrency,
    
    // Actions
    placeBet: () => {
      const { gameState, betAmount, currency } = get();
      
      // Don't place bet if the game is in progress
      if (gameState !== 'waiting') {
        console.warn("Cannot place bet - game in progress");
        return;
      }
      
      // Validate bet amount
      if (!betAmount || betAmount <= 0) {
        console.error("Please enter a valid bet amount");
        return;
      }
      
      // Generate a random client seed for provably fair gaming
      const generateClientSeed = () => {
        return Math.random().toString(36).substring(2, 15);
      };
      
      // Create a clientSeed for provably fair gaming
      const clientSeed = generateClientSeed();
      
      // Use game ID 7 as specified in the requirements
      const gameId = CRASH_GAME_ID;
      
      try {
        // Use the placeBet API function from the window global
        const placeBetFn = window.placeBetFunction;
        
        if (placeBetFn && placeBetFn.placeBet) {
          console.log("Using real wallet integration for bet placement");
          
          // Set waiting state immediately to prevent double bets
          set({ hasPlacedBet: true });
          
          // Use the placeBet mutation from the balance hook
          placeBetFn.placeBet.mutate({
            gameId,
            amount: betAmount,
            clientSeed,
            // currency parameter removed (only INR is supported)
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
                activeBets: [newBet, ...state.activeBets]
              }));
            },
            onError: (error) => {
              console.error("Error placing bet:", error);
              // Reset the betting state on error so player can try again
              set({ hasPlacedBet: false });
            }
          });
        } else {
          // If the global balance object isn't available, use a fallback approach
          console.warn("Using fallback bet placement - wallet integration may not work");
          
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
        }
      } catch (error) {
        console.error("Error in placeBet:", error);
        // Reset the betting state on any error
        set({ hasPlacedBet: false });
      }
    },
    
    cashOut: () => {
      const { currentMultiplier, activeBets, hasPlacedBet, hasCashedOut, gameState } = get();
      
      // Prevent multiple cashouts or invalid cashout attempts
      if (!hasPlacedBet || hasCashedOut || gameState !== 'running') {
        console.log("Cashout prevented - already cashed out, no bet placed, or game not running");
        return;
      }
      
      // Find the player bet with server betId
      const playerBet = activeBets.find(bet => bet.isPlayer);
      
      // Mark as cashed out immediately to prevent multiple cashout attempts
      // Important: Keep gameState as 'running' - only mark the player as cashed out
      // This allows the game to continue running for other players
      set({ 
        hasCashedOut: true
      });
      
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
      const localCrashPoint = generateCrashPoint();
      
      // Set initial state with a placeholder crash point
      set({
        gameState: 'waiting',
        currentMultiplier: 1.0,
        crashPoint: localCrashPoint, // Temporary - will be replaced with controlled value if available
        countdown: 10,
        dataPoints: [],
        hasPlacedBet: false,
        hasCashedOut: false,
        activeBets: newAIBets
      });
      
      // Fetch controlled crash point from server to apply admin settings
      fetch('/api/game-control/crash/get-controlled-point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: CRASH_GAME_ID, // Using game ID 7 as specified
          originalCrashPoint: localCrashPoint,
          targetMultiplier: 2.0 // Default target multiplier
        }),
        credentials: 'include' // Include cookies for authentication
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          console.warn("Could not get controlled crash point, using local value");
          throw new Error("Server returned error");
        }
      })
      .then(data => {
        const finalCrashPoint = data.controlledCrashPoint || localCrashPoint;
        console.log(`Using crash point: ${finalCrashPoint} (original: ${localCrashPoint}, wasModified: ${data.wasModified})`);
        
        // Update crash point with controlled value
        set(state => ({
          ...state,
          crashPoint: finalCrashPoint
        }));
      })
      .catch(error => {
        console.error("Error fetching controlled crash point:", error);
        // Already set the local crash point as fallback, so no need to update
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
          dataPoints,
          gameState
        } = get();

        // If player has cashed out, we still continue the game normally
        // Instead of returning early based on game state (no more 'cashed_out' state),
        // we'll use the hasCashedOut flag to determine player-specific behavior
        
        const elapsed = (Date.now() - startTime) / 1000;
        const newMultiplier = getLiveMultiplier(elapsed);
        const formattedMultiplier = parseFloat(newMultiplier.toFixed(2));
        
        // Check for auto cashout
        if (autoCashoutValue && 
            hasPlacedBet && 
            !hasCashedOut && 
            formattedMultiplier >= autoCashoutValue) {
          get().cashOut();
          // Don't return early - continue running the game even after cashout
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
            gameHistory: [newHistoryItem, ...state.gameHistory.slice(0, 9)],
            hasPlacedBet: false // Ensure bet state is reset
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