import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define the types
export type GameState = 'waiting' | 'countdown' | 'running' | 'crashed';
export type BetStatus = 'active' | 'won' | 'lost';
export type AtmosphereStage = 'ground' | 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere' | 'space';

export interface Bet {
  id: number;
  username: string;
  amount: number;
  isPlayer: boolean;
  status: BetStatus;
  cashoutMultiplier?: number;
  isHidden?: boolean;
}

export interface HistoryItem {
  value: number;
  timestamp: number;
}

// Define the store state
interface RocketLaunchStore {
  // Game state
  gameState: GameState;
  currentMultiplier: number;
  crashMultiplier: number | null;
  countdown: number | null;
  dataPoints: { x: number; y: number; multiplier: number }[];
  atmosphereStage: AtmosphereStage;
  rocketPosition: { x: number; y: number };
  fuelLevel: number;
  weatherCondition: 'clear' | 'turbulent' | 'storm';
  
  // Betting state
  betAmount: number;
  autoCashoutValue: number | null;
  activeBets: Bet[];
  gameHistory: HistoryItem[];
  hasPlacedBet: boolean;
  hasCashedOut: boolean;
  
  // Actions
  placeBet: () => void;
  cashOut: () => void;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number | null) => void;
  resetGame: () => void;
  
  // Game loop control
  startGame: () => void;
  endGame: (crashPoint: number) => void;
}

// Helper function to generate a crash point using a similar algorithm to Stake
const generateCrashPoint = (): number => {
  // This generates a crash point with a house edge of approximately 5%
  // Formula: 99 / (1 - R) where R is a random number from 0 to 1
  const houseEdge = 0.95; // 5% house edge
  const r = Math.random();
  
  // Ensure r is not too close to 1 to avoid infinity
  const safeR = Math.min(r, 0.99);
  
  // Apply the formula
  let crashPoint = houseEdge / (1.0 - safeR);
  
  // Round to 2 decimal places
  crashPoint = Math.floor(crashPoint * 100) / 100;
  
  // Ensure crash point is at least 1.0
  return Math.max(1.0, crashPoint);
};

// Create the Zustand store
export const useRocketLaunchStore = create<RocketLaunchStore>()(
  devtools(
    (set, get) => {
      // Refs for game intervals
      let gameInterval: number | null = null;
      let countdownInterval: number | null = null;
      
      // AI player names
      const aiPlayerNames = [
        "AstroNova", "CosmicVoyager", "StarGazer", "LunarRover", 
        "OrbitRider", "NebulaSeeker", "GalaxyJumper", "SolarSailor",
        "VoyagerOne", "ApolloEleven", "MarsWalker", "CometChaser"
      ];
      
      // Calculate atmosphere stage based on multiplier
      const getAtmosphereStage = (multiplier: number): AtmosphereStage => {
        if (multiplier < 1.5) return 'ground';
        if (multiplier < 2.0) return 'troposphere';
        if (multiplier < 3.0) return 'stratosphere';
        if (multiplier < 5.0) return 'mesosphere';
        if (multiplier < 10.0) return 'thermosphere';
        if (multiplier < 20.0) return 'exosphere';
        return 'space';
      };
      
      // Create initial bets for AI players
      const createInitialBets = (): Bet[] => {
        return Array.from({ length: 15 }, (_, i) => ({
          id: i,
          username: aiPlayerNames[Math.floor(Math.random() * aiPlayerNames.length)],
          amount: parseFloat((Math.random() * 100 + 10).toFixed(2)),
          isPlayer: false,
          status: 'active',
          isHidden: Math.random() > 0.7
        }));
      };
      
      return {
        // Initial state
        gameState: 'waiting',
        currentMultiplier: 1.0,
        crashMultiplier: null,
        countdown: null,
        dataPoints: [],
        atmosphereStage: 'ground',
        rocketPosition: { x: 50, y: 80 },
        fuelLevel: 1.0,
        weatherCondition: 'clear',
        
        betAmount: 10,
        autoCashoutValue: null,
        activeBets: createInitialBets(),
        gameHistory: [],
        hasPlacedBet: false,
        hasCashedOut: false,
        
        // Function to place a bet
        placeBet: () => {
          const { gameState, hasPlacedBet, betAmount } = get();
          
          if (gameState !== 'waiting' || hasPlacedBet || betAmount <= 0) return;
          
          // Add player bet to active bets
          set(state => ({
            hasPlacedBet: true,
            activeBets: [
              ...state.activeBets,
              {
                id: state.activeBets.length,
                username: 'You',
                amount: state.betAmount,
                isPlayer: true,
                status: 'active'
              }
            ]
          }));
        },
        
        // Function to cash out
        cashOut: () => {
          const { gameState, hasPlacedBet, hasCashedOut, currentMultiplier, activeBets } = get();
          
          if (gameState !== 'running' || !hasPlacedBet || hasCashedOut) return;
          
          // Find player bet and update its status
          const updatedBets = activeBets.map(bet => {
            if (bet.isPlayer && bet.status === 'active') {
              return {
                ...bet,
                status: 'won' as BetStatus,
                cashoutMultiplier: currentMultiplier
              };
            }
            return bet;
          });
          
          set({
            hasCashedOut: true,
            activeBets: updatedBets
          });
          
          // Play cashout sound effect
          try {
            const cashoutSound = new Audio('/sounds/cashout.mp3');
            cashoutSound.play();
          } catch (error) {
            console.error('Failed to play cashout sound:', error);
          }
        },
        
        // Update bet amount
        setBetAmount: (amount: number) => {
          if (get().gameState === 'waiting' && !get().hasPlacedBet) {
            set({ betAmount: amount });
          }
        },
        
        // Update auto cashout value
        setAutoCashoutValue: (value: number | null) => {
          set({ autoCashoutValue: value });
        },
        
        // Reset the game for a new round
        resetGame: () => {
          // Clear any existing intervals
          if (gameInterval) {
            window.clearInterval(gameInterval);
            gameInterval = null;
          }
          
          if (countdownInterval) {
            window.clearInterval(countdownInterval);
            countdownInterval = null;
          }
          
          // Reset to initial waiting state
          set({
            gameState: 'waiting',
            currentMultiplier: 1.0,
            crashMultiplier: null,
            hasPlacedBet: false,
            hasCashedOut: false,
            dataPoints: [],
            atmosphereStage: 'ground',
            rocketPosition: { x: 50, y: 80 },
            fuelLevel: 1.0,
            weatherCondition: ['clear', 'turbulent', 'storm'][Math.floor(Math.random() * 3)] as 'clear' | 'turbulent' | 'storm',
            activeBets: createInitialBets()
          });
          
          // Start countdown for next game
          const countdownSeconds = 5;
          set({ countdown: countdownSeconds });
          
          countdownInterval = window.setInterval(() => {
            const currentCount = get().countdown;
            
            if (currentCount === null || currentCount <= 1) {
              window.clearInterval(countdownInterval!);
              set({ countdown: null });
              
              // Start the game
              get().startGame();
            } else {
              set({ countdown: currentCount - 1 });
            }
          }, 1000);
        },
        
        // Start the rocket launch
        startGame: () => {
          set({
            gameState: 'running',
            currentMultiplier: 1.0,
            dataPoints: [{ x: 0, y: 0, multiplier: 1.0 }]
          });
          
          // Generate crash point with weather condition affecting volatility
          let crashPoint = generateCrashPoint();
          
          // Weather affects the crash point range
          const { weatherCondition } = get();
          if (weatherCondition === 'turbulent') {
            // More volatility - higher chance of early crash but also higher peaks
            crashPoint = crashPoint * (Math.random() < 0.5 ? 0.7 : 1.3);
          } else if (weatherCondition === 'storm') {
            // Even more volatility
            crashPoint = crashPoint * (Math.random() < 0.6 ? 0.5 : 1.5);
          }
          
          // Occasionally add random boosters that extend flight
          const hasRandomBooster = Math.random() < 0.15;
          if (hasRandomBooster) {
            crashPoint *= 1.2; // Boosters extend flight by 20%
          }
          
          let startTime = Date.now();
          let lastAiCashoutMultiplier = 1.2; // Starting point for AI cashouts
          let elapsedMs = 0;
          
          console.log(`Game started! Crash point will be: ${crashPoint}x`);
          
          // Game loop
          gameInterval = window.setInterval(() => {
            // Calculate elapsed time and new multiplier
            elapsedMs = Date.now() - startTime;
            const elapsed = elapsedMs / 1000; // seconds
            
            // Using a similar formula to Stake Crash
            // Adjusted to make the growth slower at the beginning and faster later
            const baseMultiplier = 1.0;
            
            // Get current weather condition
            const { weatherCondition } = get();
            
            // Weather affects the growth rate
            let growthRate = 0.06; // Default for clear weather
            if (weatherCondition === 'turbulent') {
              growthRate = 0.08; // Faster in turbulence
            } else if (weatherCondition === 'storm') {
              growthRate = 0.1; // Even faster in storm
            }
            
            // Calculate new multiplier
            let newMultiplier = baseMultiplier * Math.exp(growthRate * elapsed);
            
            // Round to 2 decimal places for display
            newMultiplier = Math.floor(newMultiplier * 100) / 100;
            newMultiplier = Math.max(1.0, newMultiplier); // Ensure minimum of 1.0
            
            // Calculate fuel level (decreases as multiplier increases)
            const newFuelLevel = Math.max(0, 1.0 - (newMultiplier - 1.0) / crashPoint);
            
            // Determine atmosphere stage
            const newAtmosphereStage = getAtmosphereStage(newMultiplier);
            
            // Update rocket position - rises slower initially, then faster
            const newRocketPosition = {
              x: 50, // Horizontal position is fixed
              y: Math.max(5, 80 - (Math.pow(newMultiplier - 1, 1.2) * 10)) // Rocket rises as multiplier increases
            };
            
            // Get active bets and auto-cashout value
            const { activeBets, autoCashoutValue } = get();
            
            // Check for auto cashout
            let updatedBets = [...activeBets];
            if (autoCashoutValue && newMultiplier >= autoCashoutValue && !get().hasCashedOut) {
              get().cashOut();
            }
            
            // Process AI cashouts
            if (newMultiplier > lastAiCashoutMultiplier) {
              updatedBets = activeBets.map(bet => {
                // Only process active AI bets
                if (!bet.isPlayer && bet.status === 'active') {
                  // Higher chance to cash out at higher multipliers
                  const cashoutChance = 0.05 + (newMultiplier - lastAiCashoutMultiplier) / 20;
                  
                  if (Math.random() < cashoutChance) {
                    return {
                      ...bet,
                      status: 'won',
                      cashoutMultiplier: newMultiplier
                    };
                  }
                }
                return bet;
              });
              
              lastAiCashoutMultiplier = newMultiplier;
            }
            
            // Add new data point for graph
            const newDataPoints = [
              ...get().dataPoints,
              { 
                x: elapsed, 
                y: newMultiplier - 1, 
                multiplier: newMultiplier 
              }
            ];
            
            // Check if crash point reached
            if (newMultiplier >= crashPoint) {
              // Game over - rocket crashed
              get().endGame(newMultiplier);
            } else {
              // Update game state
              set({
                currentMultiplier: newMultiplier,
                dataPoints: newDataPoints,
                activeBets: updatedBets,
                atmosphereStage: newAtmosphereStage,
                rocketPosition: newRocketPosition,
                fuelLevel: newFuelLevel
              });
            }
          }, 100); // Update 10 times per second
        },
        
        // End the game
        endGame: (crashPoint: number) => {
          if (gameInterval) {
            window.clearInterval(gameInterval);
            gameInterval = null;
          }
          
          const { activeBets, gameHistory } = get();
          
          // Update any remaining active bets as lost
          const updatedBets = activeBets.map(bet => {
            if (bet.status === 'active') {
              return { ...bet, status: 'lost' };
            }
            return bet;
          });
          
          // Create history item for this round
          const historyItem: HistoryItem = {
            value: crashPoint,
            timestamp: Date.now()
          };
          
          // Update game state
          set({
            gameState: 'crashed',
            activeBets: updatedBets,
            crashMultiplier: crashPoint,
            gameHistory: [historyItem, ...gameHistory.slice(0, 19)] // Keep last 20 rounds
          });
          
          // Play crash sound effect
          try {
            const crashSound = new Audio('/sounds/explosion.mp3');
            crashSound.play();
          } catch (error) {
            console.error('Failed to play crash sound:', error);
          }
          
          // Reset game after delay
          setTimeout(() => {
            get().resetGame();
          }, 3000);
        }
      };
    },
    { name: 'rocket-launch-store' }
  )
);

// Helper hook
export function useRocketLaunch() {
  const store = useRocketLaunchStore();
  
  // Initialize the game on first load
  React.useEffect(() => {
    if (store.gameState === 'waiting' && store.dataPoints.length === 0) {
      store.resetGame();
    }
  }, [store]);
  
  return store;
}

// Export store
export default useRocketLaunchStore;