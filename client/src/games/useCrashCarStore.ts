import { create } from 'zustand';
import { useCallback } from 'react';
import { useBalance } from '@/hooks/use-balance';
import { SupportedCurrency } from '@/context/CurrencyContext'; 

// Game state types
export type GameState = 'waiting' | 'running' | 'crashed';
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
interface CrashCarGameState {
  // Game state
  gameState: GameState;
  currentMultiplier: number;
  crashMultiplier: number | null;
  countdown: number | null;
  isWaiting: boolean;
  gameId: string | null; // Current game ID
  
  // Betting
  betAmount: number;
  autoCashoutValue: number | null;
  activeBets: Bet[];
  gameHistory: HistoryItem[];
  cashoutTriggered: number | null;
  errorMessage: string | null;
  
  // Car-specific state
  fuelLevel: number; // 0-100% fuel remaining
  speed: number; // current speed multiplier
  
  // Actions
  placeBet: () => void;
  cashOut: () => void;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number | null) => void;
  clearError: () => void;
  
  // WebSocket connection management
  resetConnection: () => void;
}

// Helper functions for the game
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Create the store
export const useCrashCarStore = create<CrashCarGameState>((set, get) => {
  // WebSocket connection
  let socket: WebSocket | null = null;
  let gameInterval: NodeJS.Timeout | null = null;
  let autoCashoutCheckInterval: NodeJS.Timeout | null = null;
  let reconnectInterval: NodeJS.Timeout | null = null;
  
  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to crash car game updates
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          action: 'subscribe',
          topic: 'crash-car-game'
        }));
      }
      
      // Clear reconnect interval if it's running
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Only process messages for the crash car game topic
        if (data.topic === 'crash-car-game') {
          const payload = data.payload;
          
          // Update game state
          set({
            gameState: payload.gameState,
            countdown: payload.countdown,
            currentMultiplier: payload.currentMultiplier,
            gameId: payload.gameId, // Store the game ID
            activeBets: payload.activeBets.map((bet: any) => ({
              ...bet,
              isPlayer: bet.userId === getCurrentUserId(), // Mark player's bet
              status: bet.cashedOut ? 'won' : 'active'
            })),
            gameHistory: payload.previousGames.map((game: any) => ({
              crashPoint: game.crashPoint,
              timestamp: game.timestamp
            }))
          });
          
          // Calculate fuel level and speed based on the current multiplier
          const fuelLevel = Math.max(0, 100 - (payload.currentMultiplier - 1) * 10);
          const speed = payload.currentMultiplier;
          
          set({ fuelLevel, speed });
          
          // If the game is running, check for auto-cashout
          if (payload.gameState === 'running') {
            const { autoCashoutValue, cashoutTriggered } = get();
            
            // If auto-cashout is set and the player hasn't cashed out yet
            if (
              autoCashoutValue !== null && 
              cashoutTriggered === null && 
              payload.currentMultiplier >= autoCashoutValue
            ) {
              // Cash out automatically
              get().cashOut();
            }
          }
          
          // If the game just crashed, mark any active bets as lost
          if (payload.gameState === 'crashed') {
            set(state => ({
              activeBets: state.activeBets.map(bet => 
                bet.status === 'active' ? { ...bet, status: 'lost' } : bet
              ),
              crashMultiplier: payload.currentMultiplier
            }));
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      
      // Handle disconnect - reset state to ensure UI doesn't get stuck
      set({
        gameState: 'waiting',
        currentMultiplier: 1.0,
        countdown: null,
        isWaiting: true
      });
      
      // Attempt to reconnect every 3 seconds
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          console.log('Attempting to reconnect WebSocket...');
          initializeWebSocket();
        }, 3000);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };
  
  // Get current user ID (placeholder - replace with actual implementation)
  const getCurrentUserId = (): number => {
    // This should be replaced with actual user ID retrieval
    return 4; // Placeholder for now
  };
  
  // Connection status check function
  const checkConnection = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected, reconnecting...');
      initializeWebSocket();
      return false;
    }
    return true;
  };

  // Reset connection function - can be called manually from UI
  const resetWebSocketConnection = () => {
    console.log('Manually resetting WebSocket connection');
    if (socket) {
      socket.close();
      socket = null;
    }
    
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    
    // Reset state to ensure UI doesn't get stuck
    set({
      gameState: 'waiting',
      currentMultiplier: 1.0,
      countdown: null,
      isWaiting: true
    });
    
    // Re-initialize connection
    initializeWebSocket();
  };
  
  // Set up a periodic connection check
  let connectionCheckInterval: NodeJS.Timeout | null = null;
  if (typeof window !== 'undefined') {
    initializeWebSocket();
    
    // Check connection status every 10 seconds
    connectionCheckInterval = setInterval(() => {
      checkConnection();
    }, 10000);
  }
  
  return {
    // Initial state
    gameState: 'waiting',
    currentMultiplier: 1.0,
    crashMultiplier: null,
    countdown: null,
    isWaiting: true,
    gameId: null,
    betAmount: 10.0,
    autoCashoutValue: null,
    activeBets: [],
    gameHistory: [],
    cashoutTriggered: null,
    errorMessage: null,
    fuelLevel: 100,
    speed: 0,
    
    // Actions
    placeBet: async () => {
      try {
        const { betAmount, gameState } = get();
        
        // Validate game state
        if (gameState === 'running') {
          // Show error message because we are using buttons now
          set({ errorMessage: 'Cannot place bets during active game' });
          return;
        }
        
        // Log attempt to place bet for debugging
        console.log('Attempting to place bet:', {
          amount: betAmount,
          autoCashout: get().autoCashoutValue,
          gameState: gameState
        });
        
        // Validate bet amount
        if (betAmount < 100) {
          set({ errorMessage: 'Minimum bet amount is ₹100' });
          return;
        }
        
        // Send bet to server
        const response = await fetch('/api/crash-car/place-bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: betAmount,
            autoCashout: get().autoCashoutValue
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Show error in UI for better user feedback
          const errorMsg = data.message || 'Failed to place bet';
          console.error('Failed to place bet:', errorMsg);
          set({ errorMessage: errorMsg });
          return;
        }
        
        // Update game state with the new bet
        console.log('Bet placed successfully:', data);
        
        // Force refresh wallet balance
        if (typeof window !== 'undefined' && (window as any).refreshBalance) {
          (window as any).refreshBalance();
        }
      } catch (error) {
        // Provide user feedback
        console.error('Error placing bet:', error);
        set({ 
          errorMessage: error instanceof Error 
            ? error.message 
            : 'Error placing bet' 
        });
      }
    },
    
    cashOut: async () => {
      try {
        const { gameState, cashoutTriggered, currentMultiplier } = get();
        
        // Validate game state with detailed logging
        console.log('Attempting to cash out:', { gameState, currentMultiplier });
        
        if (gameState !== 'running') {
          set({ errorMessage: 'Can only cash out during active game' });
          return;
        }
        
        // Check if already cashed out
        if (cashoutTriggered !== null) {
          console.log('Already cashed out at', cashoutTriggered);
          return;
        }
        
        // Get the current game ID from the store state
        const currentGameId = get().gameId || '';
        
        console.log('Making cashout request for game:', currentGameId);
        
        // Pre-emptively update UI to show cashout - this improves user experience
        // even if the server request fails, showing that their action was registered
        set({ cashoutTriggered: currentMultiplier });
        
        // Send cashout request to server
        const response = await fetch('/api/crash-car/cashout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gameId: currentGameId
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Even with error, keep the UI showing the cashout attempt
          const errorMsg = data.message || 'Failed to cash out';
          console.error('Failed to cash out:', errorMsg);
          
          // Don't show errors in UI for common cases like "already cashed out"
          if (!errorMsg.includes('already cashed out')) {
            set({ errorMessage: errorMsg });
          }
          
          return;
        }
        
        // Update game state with the successful cashout
        console.log('Successfully cashed out:', data);
        
        // Force refresh wallet balance
        if (typeof window !== 'undefined' && (window as any).refreshBalance) {
          (window as any).refreshBalance();
        }
      } catch (error) {
        console.error('Error cashing out:', error);
        set({ 
          errorMessage: error instanceof Error 
            ? error.message 
            : 'Error cashing out' 
        });
      }
    },
    
    setBetAmount: (amount: number) => {
      set({ betAmount: amount });
    },
    
    setAutoCashoutValue: (value: number | null) => {
      set({ autoCashoutValue: value });
    },
    
    clearError: () => {
      set({ errorMessage: null });
    },
    
    // WebSocket connection management
    resetConnection: resetWebSocketConnection
  };
});