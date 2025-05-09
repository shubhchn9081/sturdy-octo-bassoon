import { create } from "zustand";
import { createContext, useContext, ReactNode, FC } from "react";
import { useAuth } from "./useAuth";
import { useWallet } from "./useWallet";
import { useGameHistory, GameHistoryItem } from "./useGameHistory";
import { useGameSettings } from "./useGameSettings";
import { apiRequest } from "../queryClient";

// Game state types
export type GameState = "inactive" | "countdown" | "active" | "crashed";
type BetStatus = "active" | "won" | "lost";

// Interfaces
interface Bet {
  id: number;
  username: string;
  amount: number;
  isPlayer: boolean;
  status: BetStatus;
  cashoutMultiplier?: number;
}

interface HistoryItem {
  value: number;
  timestamp: number;
}

// Main store interface
interface CrashGameState {
  // Game state
  gameState: GameState;
  currentMultiplier: number;
  crashMultiplier: number | null;
  countdown: number | null;
  isWaiting: boolean;
  
  // Betting
  betAmount: number;
  autoCashoutValue: number | null;
  activeBets: Bet[];
  gameHistory: HistoryItem[];
  cashoutTriggered: number | null;
  errorMessage: string | null;
  
  // User and wallet integration
  lastGameId: number | null;
  
  // AI players
  aiPlayers: string[];
  
  // Actions
  placeBet: () => void;
  cashOut: () => void;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number) => void;
  clearError: () => void;
  
  // New actions for user integration
  saveGameResult: (crashPoint: number) => Promise<void>;
  recordBet: (amount: number, won: boolean, cashoutMultiplier?: number) => Promise<void>;
  syncHistoryWithServer: (limit?: number) => Promise<void>;
}

// Helper functions for the game
function generateCrashPoint(): number {
  // Get the winning percentage from game settings
  const { winningPercentage } = useGameSettings.getState();
  const winPercentage = parseInt(winningPercentage || '50');
  
  // Set minimum crash point to 2.0 if winning percentage is 100%
  if (winPercentage >= 100) {
    console.log('Guaranteed win mode: Crash point will be high');
    // Generate a crash point between 2.0 and 10.0 for guaranteed wins
    return 2.0 + Math.random() * 8.0;
  }
  
  // Adjust house edge based on winning percentage
  // Lower house edge means higher crash points on average
  // 50% is the baseline (neutral)
  // 0% means maximum house edge, 100% means minimum house edge (player advantage)
  const baseHouseEdge = 0.98;
  const houseEdgeAdjustment = ((winPercentage - 50) / 100) * 0.1; // -0.05 to +0.05 adjustment
  const houseEdge = Math.min(0.995, Math.max(0.95, baseHouseEdge + houseEdgeAdjustment));
  
  console.log(`Game settings: Winning percentage ${winPercentage}%, House edge: ${houseEdge}`);
  
  // Generate random value
  const randomValue = Math.random();
  
  // Higher winning percentage decreases chance of early crashes
  const earlyChance = Math.max(0.01, 0.08 - (winPercentage / 100) * 0.07); // 0.01 to 0.08
  if (Math.random() < earlyChance) {
    return 1 + Math.random() * 0.8; // Random between 1.0 and 1.8
  }
  
  // Higher winning percentage increases chance of high multipliers
  const highChance = 0.05 + (winPercentage / 100) * 0.05; // 0.05 to 0.10
  if (Math.random() < highChance) {
    return 15 + Math.random() * 85; // Random between 15 and 100
  }
  
  // Generate crash point using exponential distribution
  // Formula creates a realistic crash point distribution with house edge applied
  const crashPoint = Math.max(1.0, (1 / (1 - randomValue)) * houseEdge);
  
  // Cap at 100x for sanity
  return Math.min(crashPoint, 100);
}

function playSound(type: 'crash' | 'success' | 'countdown' | 'final-countdown') {
  // Simple sound playing function with AudioPlayer component integration
  try {
    // Try to use the AudioPlayer component first
    if ((window as any).audioPlayers) {
      // Map sound types to AudioPlayer IDs
      let audioId = '';
      switch (type) {
        case 'crash':
          audioId = 'explosion-sound';
          break;
        case 'countdown':
          audioId = 'countdown-sound';
          break;
        case 'final-countdown':
          audioId = 'countdown-sound'; // We'll use the same sound with different volume
          break;
        case 'success':
          audioId = 'success-sound';
          break;
      }
      
      // If we found a matching AudioPlayer, use it
      if (audioId && (window as any).audioPlayers[audioId]) {
        console.log(`Playing ${type} sound from AudioPlayer: ${audioId}`);
        
        // For final countdown, play louder
        if (type === 'final-countdown') {
          (window as any).audioPlayers[audioId].setVolume(0.8);
        } else if (type === 'countdown') {
          (window as any).audioPlayers[audioId].setVolume(0.5);
        }
        
        (window as any).audioPlayers[audioId].play();
        return;
      }
    }
    
    // Fallback to original implementation
    const audioStore = require('./useAudio').useAudio;
    const { isMuted } = audioStore.getState();
    
    // Skip if muted
    if (isMuted) {
      console.log(`${type} sound skipped (muted)`);
      return;
    }
    
    // Use the appropriate method from the audio store based on sound type
    switch (type) {
      case 'crash':
        audioStore.getState().playExplosion(); // Use explosion sound for crash
        break;
      case 'success':
        audioStore.getState().playSuccess();
        break;
      case 'countdown':
        audioStore.getState().playCountdown();
        break;
      case 'final-countdown':
        audioStore.getState().playFinalCountdown();
        break;
    }
  } catch (error) {
    console.log('Failed to play sound:', error);
  }
}

// Create Zustand store
const useCrashGameStore = create<CrashGameState>((set, get) => {
  // Game interval reference
  let gameInterval: number | null = null;
  let countdownInterval: number | null = null;
  
  // AI player names
  const aiPlayerNames = [
    "CryptoKing", "LuckyJohn", "MoonGambler", "RiskTaker", 
    "WhaleBet", "DiamondHands", "FastCasher", "SlowPlayer",
    "EagleEye", "QuickDraw", "HighRoller", "SmallBets"
  ];
  
  // Helper functions for the store
  const startGame = () => {
    const { autoCashoutValue } = get();
    
    set({ 
      gameState: "active", 
      currentMultiplier: 1.0,
      isWaiting: false,
      countdown: null
    });
    
    if (gameInterval) clearInterval(gameInterval);
    
    // Start the plane background music - using window.audioPlayers
    try {
      // Access the plane music from our AudioPlayer component
      if ((window as any).audioPlayers && (window as any).audioPlayers['plane-music']) {
        console.log('Playing plane music from AudioPlayer');
        (window as any).audioPlayers['plane-music'].play();
      } else {
        // Fallback to original implementation
        const audioStore = require('./useAudio').useAudio;
        audioStore.getState().startPlaneMusic();
      }
    } catch (error) {
      console.error('Failed to start plane music:', error);
    }
    
    let crashPoint = generateCrashPoint();
    let lastAiCashout = 1.2; // Starting point for AI cashouts
    
    gameInterval = window.setInterval(() => {
      const { currentMultiplier, activeBets, autoCashoutValue, cashoutTriggered } = get();
      
      // Increase multiplier (non-linear growth for more excitement)
      // Higher growth factor for faster and more exciting gameplay
      const growthFactor = 0.08 * (1 + currentMultiplier / 15);
      const newMultiplier = currentMultiplier + growthFactor;
      
      // Check for auto cashout
      if (autoCashoutValue && newMultiplier >= autoCashoutValue && !cashoutTriggered) {
        get().cashOut();
      }
      
      // Random AI cashouts
      if (newMultiplier > lastAiCashout) {
        const updatedBets = activeBets.map(bet => {
          // Only process active AI bets
          if (!bet.isPlayer && bet.status === "active") {
            // Random chance to cash out, higher at higher multipliers
            const cashoutChance = 0.1 + (newMultiplier - lastAiCashout) / 10;
            
            if (Math.random() < cashoutChance) {
              return {
                ...bet,
                status: "won" as BetStatus,
                cashoutMultiplier: newMultiplier
              };
            }
          }
          return bet;
        });
        
        set({ activeBets: updatedBets });
        lastAiCashout = newMultiplier;
      }
      
      // Check for crash
      if (newMultiplier >= crashPoint) {
        endGame(newMultiplier);
      } else {
        set({ currentMultiplier: newMultiplier });
      }
    }, 100);
  };
  
  const endGame = (finalMultiplier: number) => {
    if (gameInterval) clearInterval(gameInterval);
    
    const { activeBets, gameHistory, cashoutTriggered } = get();
    
    // Set remaining bets as lost
    const updatedBets = activeBets.map(bet => {
      if (bet.status === "active") {
        return { ...bet, status: "lost" as BetStatus };
      }
      return bet;
    });
    
    // Add to history
    const newHistoryItem = {
      value: finalMultiplier,
      timestamp: Date.now()
    };
    
    // Limit history to 20 items
    const updatedHistory = [newHistoryItem, ...gameHistory.slice(0, 19)];
    
    set({
      gameState: "crashed",
      activeBets: updatedBets,
      gameHistory: updatedHistory,
      crashMultiplier: finalMultiplier
    });
    
    // Stop the plane music first using AudioPlayer component
    try {
      if ((window as any).audioPlayers && (window as any).audioPlayers['plane-music']) {
        console.log('Stopping plane music from AudioPlayer');
        (window as any).audioPlayers['plane-music'].fadeOut(300);
      } else {
        // Fallback to original implementation
        const audioStore = require('./useAudio').useAudio;
        audioStore.getState().stopPlaneMusic();
      }
    } catch (error) {
      console.error('Failed to stop plane music:', error);
    }
    
    // Play crash sound if player didn't cash out
    if (!cashoutTriggered) {
      // Play explosion sound after a small delay to let music fade
      try {
        setTimeout(() => {
          if ((window as any).audioPlayers && (window as any).audioPlayers['explosion-sound']) {
            console.log('Playing explosion sound from AudioPlayer');
            (window as any).audioPlayers['explosion-sound'].play();
          } else {
            // Fallback to original implementation
            const audioStore = require('./useAudio').useAudio;
            audioStore.getState().playExplosion();
          }
        }, 300);
      } catch (error) {
        console.error('Failed to play explosion sound:', error);
      }
    }
    
    // Save game result to the database
    get().saveGameResult(finalMultiplier);
    
    // If user has placed a bet, record it
    const playerBet = activeBets.find(bet => bet.isPlayer);
    if (playerBet) {
      const won = playerBet.status === "won";
      get().recordBet(
        playerBet.amount, 
        won,
        won ? playerBet.cashoutMultiplier : undefined
      );
    }
    
    // Reset game after delay but keep plane visible
    setTimeout(() => {
      set({
        gameState: "inactive",
        currentMultiplier: 1.0,
        cashoutTriggered: null,
        // Keep crash multiplier for positioning the plane
        crashMultiplier: finalMultiplier
      });
    }, 3000);
  };
  
  return {
    // Initial state
    gameState: "inactive",
    currentMultiplier: 1.0,
    // Set default crash multiplier to 1.5 so plane is always visible
    crashMultiplier: 1.5,
    countdown: null,
    isWaiting: false,
    betAmount: 100,
    autoCashoutValue: null,
    activeBets: [],
    gameHistory: [],
    cashoutTriggered: null,
    errorMessage: null,
    lastGameId: null,
    aiPlayers: aiPlayerNames,
    
    // Actions
    placeBet: () => {
      const { gameState, betAmount, isWaiting } = get();
      
      if (gameState === "active" || isWaiting) {
        return;
      }
      
      if (!betAmount || betAmount <= 0) {
        set({ errorMessage: "Please enter a valid bet amount" });
        return;
      }
      
      // Check user wallet balance before placing bet
      const walletStore = useWallet.getState();
      const userWallet = walletStore.wallet;
      
      // If wallet exists, check if user has enough balance
      if (userWallet) {
        const currentBalance = parseFloat(userWallet.balance);
        if (currentBalance < betAmount) {
          set({ errorMessage: "Insufficient balance in your wallet" });
          return;
        }
      }
      
      // Add player bet
      const newBet: Bet = {
        id: Date.now(),
        username: "Player",
        amount: betAmount,
        isPlayer: true,
        status: "active"
      };
      
      // Add some AI bets
      const aiBets: Bet[] = [];
      const aiCount = Math.floor(Math.random() * 5) + 3; // 3-7 AI players
      
      // Shuffle and take a subset of AI names
      const shuffledAIs = [...get().aiPlayers].sort(() => 0.5 - Math.random()).slice(0, aiCount);
      
      shuffledAIs.forEach(name => {
        aiBets.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          username: name,
          amount: Math.floor(Math.random() * 900) + 100, // Random 100-1000
          isPlayer: false,
          status: "active"
        });
      });
      
      // Start countdown if game isn't already counting down
      if (gameState !== "countdown") {
        set({ 
          activeBets: [newBet, ...aiBets],
          gameState: "countdown", 
          countdown: 5,
          isWaiting: true,
          cashoutTriggered: null
        });
        
        // Start countdown
        if (countdownInterval) clearInterval(countdownInterval);
        
        countdownInterval = window.setInterval(() => {
          const { countdown } = get();
          
          if (countdown === null || countdown <= 1) {
            // Last tick - play final countdown sound
            try {
              playSound('final-countdown');
            } catch (e) {
              console.log('Error playing final countdown sound', e);
            }
            
            // Clear interval and start the game
            clearInterval(countdownInterval!);
            startGame();
          } else {
            // Regular countdown tick - play normal countdown sound
            try {
              playSound('countdown');
            } catch (e) {
              console.log('Error playing countdown sound', e);
            }
            
            // Decrement countdown
            set({ countdown: countdown - 1 });
          }
        }, 1000);
      } else {
        // Just add the new bets if already counting down
        set(state => ({ 
          activeBets: [...state.activeBets, newBet, ...aiBets],
          isWaiting: true,
          cashoutTriggered: null 
        }));
      }
    },
    
    cashOut: () => {
      const { gameState, currentMultiplier, activeBets, cashoutTriggered } = get();
      
      if (gameState !== "active" || cashoutTriggered) {
        return;
      }
      
      // Find player bet
      const updatedBets = activeBets.map(bet => {
        if (bet.isPlayer && bet.status === "active") {
          return {
            ...bet,
            status: "won" as BetStatus,
            cashoutMultiplier: currentMultiplier
          };
        }
        return bet;
      });
      
      set({ 
        activeBets: updatedBets,
        cashoutTriggered: currentMultiplier
      });
      
      // Play cash out sound
      playSound('success');
    },
    
    setBetAmount: (amount: number) => {
      set({ betAmount: amount });
    },
    
    setAutoCashoutValue: (value: number) => {
      set({ autoCashoutValue: value <= 0 ? null : value });
    },
    
    clearError: () => {
      set({ errorMessage: null });
    },
    
    // New methods to integrate with backend
    saveGameResult: async (crashPoint: number) => {
      try {
        // Only save game results to the database if we're in a logged-in state
        const authStore = useAuth.getState();
        if (!authStore.isAuthenticated) return;
        
        const response = await apiRequest({
          url: '/api/game/record',
          method: 'POST',
          data: { crashPoint }
        });
        
        if (response && response.id) {
          set({ lastGameId: response.id });
        }
      } catch (error) {
        console.error('Error saving game result:', error);
      }
    },
    
    recordBet: async (amount: number, won: boolean, cashoutMultiplier?: number) => {
      try {
        // Only record bets to the database if we're in a logged-in state
        const authStore = useAuth.getState();
        if (!authStore.isAuthenticated) return;
        
        const { lastGameId } = get();
        if (!lastGameId) {
          console.error('No game ID available to record bet');
          return;
        }
        
        await apiRequest({
          url: '/api/game/bet',
          method: 'POST',
          data: {
            gameId: lastGameId,
            amount,
            result: won ? 'win' : 'loss',
            cashoutMultiplier: won ? cashoutMultiplier : undefined
          }
        });
        
        // Refresh wallet data
        const walletStore = useWallet.getState();
        walletStore.fetchWallet();
      } catch (error) {
        console.error('Error recording bet:', error);
      }
    },
    
    syncHistoryWithServer: async (limit = 20) => {
      try {
        // Only sync history if authenticated
        const authStore = useAuth.getState();
        if (!authStore.isAuthenticated) return;
        
        // Fetch game history from server
        const gameHistoryStore = useGameHistory.getState();
        await gameHistoryStore.fetchGameHistory(limit);
        
        // Convert server history to local format
        const serverHistory = gameHistoryStore.gameHistory;
        if (serverHistory && serverHistory.length > 0) {
          const formattedHistory: HistoryItem[] = serverHistory.map(item => ({
            value: parseFloat(item.crashPoint),
            timestamp: new Date(item.createdAt).getTime()
          }));
          
          set({ gameHistory: formattedHistory });
        }
      } catch (error) {
        console.error('Error syncing history with server:', error);
      }
    }
  };
});

// Create the context
const CrashGameContext = createContext<ReturnType<typeof useCrashGameStore> | null>(null);

// Provider component
export const CrashGameProvider: FC<{children: ReactNode}> = ({ children }) => (
  <CrashGameContext.Provider value={useCrashGameStore()}>
    {children}
  </CrashGameContext.Provider>
);

// Hook to use the store
export const useCrashGame = () => {
  const context = useContext(CrashGameContext);
  if (!context) {
    throw new Error('useCrashGame must be used within a CrashGameProvider');
  }
  return context;
};
