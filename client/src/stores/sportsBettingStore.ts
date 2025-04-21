import { create } from 'zustand';

export type Outcome = {
  id: string;
  name: string;
  odds: number;
  previousOdds: number | null;
  probability: number;
  isLocked: boolean;
  timestamp: number;
};

export type Market = {
  id: string;
  name: string;
  outcomes: Outcome[];
  isLocked: boolean;
  startTime: string;
  endTime: string | null;
};

export type Event = {
  id: string;
  name: string;
  sportId: string;
  leagueId: string;
  leagueName: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'ended';
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  markets: Market[];
  isFeatured: boolean;
};

export type SportCategory = {
  id: string;
  name: string;
  iconName: string;
  events: Event[];
  isActive: boolean;
};

export type BetSelection = {
  eventId: string;
  marketId: string;
  outcomeId: string;
  odds: number;
  name: string;
  eventName: string;
  marketName: string;
};

export type BetSlip = {
  selections: BetSelection[];
  stake: number;
  potentialWinnings: number;
};

export type SportsBettingState = {
  sportsCategories: SportCategory[];
  activeCategory: string | null;
  betSlip: BetSlip;
  isLoading: boolean;
  error: string | null;
  featuredEvents: Event[];
  liveEvents: Event[];
  trendingEvents: Event[];
  // Actions
  setActiveCategory: (categoryId: string) => void;
  updateOdds: (sportId: string, eventId: string, marketId: string, outcomeId: string, newOdds: number) => void;
  addToBetSlip: (selection: BetSelection) => void;
  removeFromBetSlip: (outcomeId: string) => void;
  clearBetSlip: () => void;
  setStake: (amount: number) => void;
  loadSportsData: () => Promise<void>;
};

// Mock data for initial state with realistic sports events
const initialSportsCategories: SportCategory[] = [
  {
    id: 'soccer',
    name: 'Soccer',
    iconName: 'soccer-ball',
    isActive: true,
    events: []
  },
  {
    id: 'basketball',
    name: 'Basketball',
    iconName: 'basketball',
    isActive: false,
    events: []
  },
  {
    id: 'tennis',
    name: 'Tennis',
    iconName: 'tennis',
    isActive: false,
    events: []
  },
  {
    id: 'cricket',
    name: 'Cricket',
    iconName: 'cricket',
    isActive: false,
    events: []
  },
  {
    id: 'american-football',
    name: 'American Football',
    iconName: 'american-football',
    isActive: false,
    events: []
  },
  {
    id: 'baseball',
    name: 'Baseball',
    iconName: 'baseball',
    isActive: false,
    events: []
  },
  {
    id: 'ice-hockey',
    name: 'Ice Hockey',
    iconName: 'hockey',
    isActive: false,
    events: []
  },
  {
    id: 'esports',
    name: 'Esports',
    iconName: 'gamepad',
    isActive: false,
    events: []
  }
];

// Generate mock live events with realistic data
const generateMockLiveEvents = (): Event[] => {
  return [
    {
      id: 'event-1',
      name: 'Bayern Munich vs Real Madrid',
      sportId: 'soccer',
      leagueId: 'champions-league',
      leagueName: 'UEFA Champions League',
      startTime: new Date().toISOString(),
      status: 'live',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Real Madrid',
      homeScore: 1,
      awayScore: 2,
      isFeatured: true,
      markets: [
        {
          id: 'market-1',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date().toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-1',
              name: 'Bayern Munich',
              odds: 3.25,
              previousOdds: 3.10,
              probability: 0.31,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-2',
              name: 'Draw',
              odds: 3.50,
              previousOdds: 3.60,
              probability: 0.28,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-3',
              name: 'Real Madrid',
              odds: 2.20,
              previousOdds: 2.35,
              probability: 0.41,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        },
        {
          id: 'market-2',
          name: 'Total Goals',
          isLocked: false,
          startTime: new Date().toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-4',
              name: 'Over 2.5',
              odds: 1.85,
              previousOdds: 1.90,
              probability: 0.54,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-5',
              name: 'Under 2.5',
              odds: 1.95,
              previousOdds: 1.85,
              probability: 0.46,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        }
      ]
    },
    {
      id: 'event-2',
      name: 'Los Angeles Lakers vs Boston Celtics',
      sportId: 'basketball',
      leagueId: 'nba',
      leagueName: 'NBA',
      startTime: new Date().toISOString(),
      status: 'live',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Boston Celtics',
      homeScore: 89,
      awayScore: 95,
      isFeatured: true,
      markets: [
        {
          id: 'market-3',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date().toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-6',
              name: 'Los Angeles Lakers',
              odds: 2.50,
              previousOdds: 2.35,
              probability: 0.40,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-7',
              name: 'Boston Celtics',
              odds: 1.55,
              previousOdds: 1.65,
              probability: 0.60,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        },
        {
          id: 'market-4',
          name: 'Total Points',
          isLocked: false,
          startTime: new Date().toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-8',
              name: 'Over 215.5',
              odds: 1.90,
              previousOdds: 1.95,
              probability: 0.52,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-9',
              name: 'Under 215.5',
              odds: 1.90,
              previousOdds: 1.85,
              probability: 0.48,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        }
      ]
    },
    {
      id: 'event-3',
      name: 'Novak Djokovic vs Rafael Nadal',
      sportId: 'tennis',
      leagueId: 'atp-masters',
      leagueName: 'ATP Masters 1000',
      startTime: new Date().toISOString(),
      status: 'live',
      homeTeam: 'Novak Djokovic',
      awayTeam: 'Rafael Nadal',
      homeScore: 1,
      awayScore: 1,
      isFeatured: true,
      markets: [
        {
          id: 'market-5',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date().toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-10',
              name: 'Novak Djokovic',
              odds: 1.85,
              previousOdds: 1.75,
              probability: 0.54,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-11',
              name: 'Rafael Nadal',
              odds: 1.95,
              previousOdds: 2.05,
              probability: 0.46,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        }
      ]
    }
  ];
};

// Generate mock upcoming events
const generateMockUpcomingEvents = (): Event[] => {
  return [
    {
      id: 'event-4',
      name: 'Manchester City vs Liverpool',
      sportId: 'soccer',
      leagueId: 'premier-league',
      leagueName: 'Premier League',
      startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'upcoming',
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      homeScore: null,
      awayScore: null,
      isFeatured: true,
      markets: [
        {
          id: 'market-6',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-12',
              name: 'Manchester City',
              odds: 1.85,
              previousOdds: 1.90,
              probability: 0.54,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-13',
              name: 'Draw',
              odds: 3.60,
              previousOdds: 3.50,
              probability: 0.28,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-14',
              name: 'Liverpool',
              odds: 4.25,
              previousOdds: 4.35,
              probability: 0.18,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        }
      ]
    },
    {
      id: 'event-5',
      name: 'Arsenal vs Tottenham',
      sportId: 'soccer',
      leagueId: 'premier-league',
      leagueName: 'Premier League',
      startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      status: 'upcoming',
      homeTeam: 'Arsenal',
      awayTeam: 'Tottenham',
      homeScore: null,
      awayScore: null,
      isFeatured: false,
      markets: [
        {
          id: 'market-7',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date(Date.now() + 172800000).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-15',
              name: 'Arsenal',
              odds: 2.15,
              previousOdds: 2.20,
              probability: 0.47,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-16',
              name: 'Draw',
              odds: 3.40,
              previousOdds: 3.35,
              probability: 0.29,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-17',
              name: 'Tottenham',
              odds: 3.25,
              previousOdds: 3.30,
              probability: 0.24,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        }
      ]
    }
  ];
};

// Mock events data
const mockLiveEvents = generateMockLiveEvents();
const mockUpcomingEvents = generateMockUpcomingEvents();

// Combine all events
const allEvents = [...mockLiveEvents, ...mockUpcomingEvents];

// Distribute events to sports categories
const categoriesWithEvents = initialSportsCategories.map(category => {
  const categoryEvents = allEvents.filter(event => event.sportId === category.id);
  return {
    ...category,
    events: categoryEvents
  };
});

// Initial state for the bet slip
const initialBetSlip: BetSlip = {
  selections: [],
  stake: 0,
  potentialWinnings: 0
};

// Create and export the store
export const useSportsBettingStore = create<SportsBettingState>((set, get) => ({
  sportsCategories: categoriesWithEvents,
  activeCategory: 'soccer',
  betSlip: initialBetSlip,
  isLoading: false,
  error: null,
  featuredEvents: allEvents.filter(event => event.isFeatured),
  liveEvents: mockLiveEvents,
  trendingEvents: allEvents.slice(0, 3),

  // Set active category
  setActiveCategory: (categoryId: string) => {
    set(state => ({
      ...state,
      activeCategory: categoryId,
      sportsCategories: state.sportsCategories.map(category => ({
        ...category,
        isActive: category.id === categoryId
      }))
    }));
  },

  // Update odds for a specific outcome
  updateOdds: (sportId: string, eventId: string, marketId: string, outcomeId: string, newOdds: number) => {
    set(state => {
      // Create a deep copy of sportsCategories to avoid mutation
      const updatedCategories = state.sportsCategories.map(category => {
        if (category.id !== sportId) return category;

        const updatedEvents = category.events.map(event => {
          if (event.id !== eventId) return event;

          const updatedMarkets = event.markets.map(market => {
            if (market.id !== marketId) return market;

            const updatedOutcomes = market.outcomes.map(outcome => {
              if (outcome.id !== outcomeId) return outcome;

              return {
                ...outcome,
                previousOdds: outcome.odds,
                odds: newOdds,
                timestamp: Date.now()
              };
            });

            return { ...market, outcomes: updatedOutcomes };
          });

          return { ...event, markets: updatedMarkets };
        });

        return { ...category, events: updatedEvents };
      });

      // Also update the betSlip if the outcome is in the selections
      const updatedBetSlip = { ...state.betSlip };
      const selectionIndex = updatedBetSlip.selections.findIndex(s => s.outcomeId === outcomeId);
      
      if (selectionIndex !== -1) {
        updatedBetSlip.selections[selectionIndex] = {
          ...updatedBetSlip.selections[selectionIndex],
          odds: newOdds
        };
        
        // Recalculate potential winnings
        const totalOdds = updatedBetSlip.selections.reduce((acc, s) => acc * s.odds, 1);
        updatedBetSlip.potentialWinnings = updatedBetSlip.stake * totalOdds;
      }

      // Update featured and live events lists
      const allEvents = updatedCategories.flatMap(c => c.events);
      const featuredEvents = allEvents.filter(e => e.isFeatured);
      const liveEvents = allEvents.filter(e => e.status === 'live');

      return {
        ...state,
        sportsCategories: updatedCategories,
        betSlip: updatedBetSlip,
        featuredEvents,
        liveEvents
      };
    });
  },

  // Add selection to bet slip
  addToBetSlip: (selection: BetSelection) => {
    set(state => {
      // Check if selection already exists
      const existingIndex = state.betSlip.selections.findIndex(
        s => s.outcomeId === selection.outcomeId
      );

      let newSelections = [...state.betSlip.selections];
      
      if (existingIndex !== -1) {
        // Replace existing selection with updated odds
        newSelections[existingIndex] = selection;
      } else {
        // Add new selection
        newSelections = [...newSelections, selection];
      }

      // Calculate potential winnings
      const totalOdds = newSelections.reduce((acc, s) => acc * s.odds, 1);
      const potentialWinnings = state.betSlip.stake * totalOdds;

      return {
        ...state,
        betSlip: {
          ...state.betSlip,
          selections: newSelections,
          potentialWinnings
        }
      };
    });
  },

  // Remove selection from bet slip
  removeFromBetSlip: (outcomeId: string) => {
    set(state => {
      const newSelections = state.betSlip.selections.filter(
        s => s.outcomeId !== outcomeId
      );

      // Calculate potential winnings
      const totalOdds = newSelections.reduce((acc, s) => acc * s.odds, 1);
      const potentialWinnings = state.betSlip.stake * totalOdds;

      return {
        ...state,
        betSlip: {
          ...state.betSlip,
          selections: newSelections,
          potentialWinnings
        }
      };
    });
  },

  // Clear bet slip
  clearBetSlip: () => {
    set(state => ({
      ...state,
      betSlip: initialBetSlip
    }));
  },

  // Set stake amount
  setStake: (amount: number) => {
    set(state => {
      const totalOdds = state.betSlip.selections.reduce((acc, s) => acc * s.odds, 1);
      const potentialWinnings = amount * totalOdds;

      return {
        ...state,
        betSlip: {
          ...state.betSlip,
          stake: amount,
          potentialWinnings
        }
      };
    });
  },

  // Load sports data (simulated API call)
  loadSportsData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set state with mock data (in a real app, this would be data from the API)
      set({
        isLoading: false,
        sportsCategories: categoriesWithEvents,
        featuredEvents: allEvents.filter(event => event.isFeatured),
        liveEvents: mockLiveEvents,
        trendingEvents: allEvents.slice(0, 3)
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  }
}));