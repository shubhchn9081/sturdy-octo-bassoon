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
          set(state => ({
            gameState: payload.gameState,
            countdown: payload.countdown,
            currentMultiplier: payload.currentMultiplier,
            gameId: payload.gameId, // Store the game ID
            // Reset waiting state and error message when a new game starts
            isWaiting: payload.gameState === 'waiting' ? false : state.isWaiting,
            errorMessage: payload.gameState === 'waiting' ? null : state.errorMessage,
            activeBets: payload.activeBets.map((bet: any) => ({
              ...bet,
              isPlayer: bet.userId === getCurrentUserId(), // Mark player's bet
              status: bet.cashedOut ? 'won' : 'active'
            })),
            gameHistory: payload.previousGames.map((game: any) => ({
              crashPoint: game.crashPoint,
              timestamp: game.timestamp
            })),
            // Use server-provided fuel level and speed
            fuelLevel: payload.fuelLevel !== undefined ? payload.fuelLevel : state.fuelLevel,
            speed: payload.speed !== undefined ? payload.speed : state.speed
          }));
          
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
    isWaiting: false, // Changed to false so the button shows 'PLACE BET' by default
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
          set({ errorMessage: 'Cannot place bets during active game' });
          return;
        }
        
        // Validate bet amount (we'll use 1.0 as min bet like in slots game)
        if (betAmount < 1) {
          set({ errorMessage: 'Minimum bet amount is ₹1' });
          return;
        }
        
        // Set waiting state to disable UI during request
        set({ isWaiting: true, errorMessage: null });
        
        // Log the bet attempt for debugging
        console.log('Placing bet with:', {
          amount: betAmount,
          autoCashout: get().autoCashoutValue
        });
        
        try {
          console.log('Sending bet request to server...');
          // Send bet to server with the corrected path
          const response = await fetch('/api/crash-car/bet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: betAmount,
              autoCashout: get().autoCashoutValue
            }),
            credentials: 'include' // Important: Include credentials for session cookies
          });
          
          console.log('Received response:', response.status, response.statusText);
          
          if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              errorData = { message: errorText || 'Unknown error' };
            }
            
            console.error('Bet placement failed:', errorData);
            set({
              errorMessage: errorData.message || 'Failed to place bet',
              isWaiting: false // Ensure waiting state is cleared on error
            });
            return;
          }
          
          // Try to parse the response as JSON
          let data;
          try {
            const responseText = await response.text();
            console.log('Response text:', responseText);
            data = JSON.parse(responseText);
            console.log('Bet placed successfully:', data);
            
            // Reset cashout triggered if we placed a new bet and explicitly set isWaiting to false
            set({ 
              cashoutTriggered: null,
              isWaiting: false // Always ensure waiting state is cleared on success
            });
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            set({
              errorMessage: 'Invalid response from server',
              isWaiting: false
            });
            return;
          }
        } catch (fetchError) {
          console.error('Fetch error during bet placement:', fetchError);
          set({
            errorMessage: 'Network error while placing bet',
            isWaiting: false // Ensure waiting state is cleared on error
          });
          return;
        }
        
        // Force refresh wallet balance
        if (typeof window !== 'undefined' && (window as any).refreshBalance) {
          (window as any).refreshBalance();
        }
      } catch (error) {
        console.error('Uncaught error in placeBet:', error);
        set({ 
          errorMessage: error instanceof Error ? error.message : 'Error placing bet',
          isWaiting: false
        });
      } finally {
        // Always make sure we exit the waiting state
        set({ isWaiting: false });
      }
    },
    
    cashOut: async () => {
      try {
        const { gameState, cashoutTriggered, currentMultiplier, gameId } = get();
        
        // Validate game state
        if (gameState !== 'running') {
          set({ errorMessage: 'Can only cash out during active game' });
          return;
        }
        
        // Check if already cashed out
        if (cashoutTriggered !== null) {
          return;
        }
        
        // Set cashout triggered UI state immediately
        set({ cashoutTriggered: currentMultiplier });
        
        // Send cashout request to server with detailed logging
        console.log('Sending cashout request to server...');
        const response = await fetch('/api/crash-car/cashout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gameId: gameId || ''
          }),
          credentials: 'include' // Include cookies for session authentication
        });
        
        console.log('Received cashout response:', response.status, response.statusText);
        
        // Handle the response with better error handling
        let data;
        try {
          const responseText = await response.text();
          console.log('Cashout response text:', responseText);
          
          // Try to parse as JSON
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Error parsing cashout response:', parseError);
            data = { message: 'Invalid server response' };
          }
          
          if (!response.ok) {
            // Handle common error cases without showing to user
            const errorMsg = data.message || 'Failed to cash out';
            console.error('Failed to cash out:', errorMsg);
            
            // Only show certain errors to the user
            if (!errorMsg.includes('already cashed out') && 
                !errorMsg.includes('No active bet found')) {
              set({ errorMessage: errorMsg });
            }
            return;
          }
        } catch (responseError) {
          console.error('Error processing cashout response:', responseError);
          set({ errorMessage: 'Error processing server response' });
          return;
        }
        
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