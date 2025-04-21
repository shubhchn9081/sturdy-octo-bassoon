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

// Function to generate match events for each sport
const generateSportEvents = (sport: string, count: number, isUpcoming: boolean = true): Event[] => {
  const events: Event[] = [];
  const now = Date.now();
  const sportsData = {
    'soccer': {
      leagues: [
        { id: 'premier-league', name: 'Premier League' },
        { id: 'la-liga', name: 'La Liga' },
        { id: 'bundesliga', name: 'Bundesliga' },
        { id: 'serie-a', name: 'Serie A' },
        { id: 'ligue-1', name: 'Ligue 1' },
        { id: 'champions-league', name: 'Champions League' }
      ],
      teams: [
        'Manchester City', 'Liverpool', 'Arsenal', 'Tottenham', 'Chelsea', 'Manchester United',
        'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia',
        'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
        'Juventus', 'Inter Milan', 'AC Milan', 'Napoli', 'Roma',
        'PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille'
      ]
    },
    'basketball': {
      leagues: [
        { id: 'nba', name: 'NBA' },
        { id: 'euroleague', name: 'EuroLeague' },
        { id: 'ncaa', name: 'NCAA' }
      ],
      teams: [
        'Los Angeles Lakers', 'Boston Celtics', 'Golden State Warriors', 'Brooklyn Nets', 'Chicago Bulls',
        'Miami Heat', 'Phoenix Suns', 'Milwaukee Bucks', 'Dallas Mavericks', 'Denver Nuggets',
        'Real Madrid', 'FC Barcelona', 'CSKA Moscow', 'Anadolu Efes', 'Fenerbahçe',
        'Duke Blue Devils', 'Kentucky Wildcats', 'North Carolina Tar Heels', 'UCLA Bruins'
      ]
    },
    'cricket': {
      leagues: [
        { id: 'ipl', name: 'Indian Premier League' },
        { id: 'big-bash', name: 'Big Bash League' },
        { id: 'cpl', name: 'Caribbean Premier League' },
        { id: 'psl', name: 'Pakistan Super League' },
        { id: 'international', name: 'International' }
      ],
      teams: [
        'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore', 'Kolkata Knight Riders', 
        'Delhi Capitals', 'Sunrisers Hyderabad', 'Punjab Kings', 'Rajasthan Royals', 'Gujarat Titans', 
        'Lucknow Super Giants', 'Sydney Sixers', 'Perth Scorchers', 'Brisbane Heat', 
        'Trinbago Knight Riders', 'Guyana Amazon Warriors', 'Lahore Qalandars', 'Karachi Kings',
        'India', 'Australia', 'England', 'New Zealand', 'South Africa', 'Pakistan', 'West Indies'
      ]
    },
    'tennis': {
      leagues: [
        { id: 'grand-slams', name: 'Grand Slams' },
        { id: 'atp-masters', name: 'ATP Masters 1000' },
        { id: 'wta-tour', name: 'WTA Tour' }
      ],
      teams: [
        'Novak Djokovic', 'Rafael Nadal', 'Roger Federer', 'Andy Murray', 'Daniil Medvedev',
        'Alexander Zverev', 'Stefanos Tsitsipas', 'Dominic Thiem', 'Carlos Alcaraz',
        'Ashleigh Barty', 'Naomi Osaka', 'Serena Williams', 'Simona Halep', 'Bianca Andreescu'
      ]
    },
    'american-football': {
      leagues: [
        { id: 'nfl', name: 'NFL' },
        { id: 'ncaaf', name: 'NCAA Football' }
      ],
      teams: [
        'Kansas City Chiefs', 'Tampa Bay Buccaneers', 'Buffalo Bills', 'Green Bay Packers',
        'Dallas Cowboys', 'Los Angeles Rams', 'San Francisco 49ers', 'Baltimore Ravens',
        'Alabama Crimson Tide', 'Georgia Bulldogs', 'Ohio State Buckeyes', 'Clemson Tigers'
      ]
    },
    'baseball': {
      leagues: [
        { id: 'mlb', name: 'MLB' },
        { id: 'npb', name: 'Nippon Professional Baseball' }
      ],
      teams: [
        'New York Yankees', 'Los Angeles Dodgers', 'Boston Red Sox', 'Chicago Cubs',
        'Houston Astros', 'Atlanta Braves', 'San Francisco Giants', 'St. Louis Cardinals',
        'Yomiuri Giants', 'Hanshin Tigers', 'Fukuoka SoftBank Hawks', 'Hiroshima Toyo Carp'
      ]
    },
    'ice-hockey': {
      leagues: [
        { id: 'nhl', name: 'NHL' },
        { id: 'khl', name: 'KHL' }
      ],
      teams: [
        'Tampa Bay Lightning', 'Colorado Avalanche', 'Vegas Golden Knights', 'Boston Bruins',
        'Toronto Maple Leafs', 'Pittsburgh Penguins', 'New York Rangers', 'Washington Capitals',
        'SKA Saint Petersburg', 'CSKA Moscow', 'Dynamo Moscow', 'Metallurg Magnitogorsk'
      ]
    },
    'esports': {
      leagues: [
        { id: 'lol-worlds', name: 'LoL World Championship' },
        { id: 'dota-international', name: 'The International' },
        { id: 'cs-majors', name: 'CS:GO Majors' }
      ],
      teams: [
        'T1', 'DWG KIA', 'G2 Esports', 'Fnatic', 'Cloud9', 'Team Liquid',
        'PSG.LGD', 'OG', 'Team Spirit', 'Evil Geniuses',
        'Natus Vincere', 'Astralis', 'FaZe Clan', 'Vitality'
      ]
    }
  };

  // Special case for IPL Cricket - ensure at least 20 IPL matches if cricket is selected
  if (sport === 'cricket') {
    const iplCount = Math.min(20, count);
    const iplTeams = sportsData.cricket.teams.slice(0, 10); // Just IPL teams
    
    for (let i = 0; i < iplCount; i++) {
      // Create random matchups between IPL teams
      const homeIndex = Math.floor(Math.random() * iplTeams.length);
      let awayIndex = Math.floor(Math.random() * iplTeams.length);
      while (awayIndex === homeIndex) {
        awayIndex = Math.floor(Math.random() * iplTeams.length);
      }
      
      const homeTeam = iplTeams[homeIndex];
      const awayTeam = iplTeams[awayIndex];
      
      // Random time up to 7 days in the future (for upcoming) or random time +/- 3 hours (for live)
      const timeOffset = isUpcoming 
        ? Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        : Math.floor(Math.random() * 6 * 60 * 60 * 1000) - 3 * 60 * 60 * 1000;
      
      const event: Event = {
        id: `event-cricket-ipl-${i}`,
        name: `${homeTeam} vs ${awayTeam}`,
        sportId: sport,
        leagueId: 'ipl',
        leagueName: 'Indian Premier League',
        startTime: new Date(now + timeOffset).toISOString(),
        status: isUpcoming ? 'upcoming' : 'live',
        homeTeam,
        awayTeam,
        homeScore: isUpcoming ? null : Math.floor(Math.random() * 200),
        awayScore: isUpcoming ? null : Math.floor(Math.random() * 180),
        isFeatured: Math.random() > 0.8, // 20% chance of being featured
        markets: [
          {
            id: `market-cricket-ipl-${i}-1`,
            name: 'Match Winner',
            isLocked: false,
            startTime: new Date(now + timeOffset).toISOString(),
            endTime: null,
            outcomes: [
              {
                id: `outcome-cricket-ipl-${i}-1`,
                name: homeTeam,
                odds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              },
              {
                id: `outcome-cricket-ipl-${i}-2`,
                name: awayTeam,
                odds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              }
            ]
          },
          {
            id: `market-cricket-ipl-${i}-2`,
            name: 'Total Runs',
            isLocked: false,
            startTime: new Date(now + timeOffset).toISOString(),
            endTime: null,
            outcomes: [
              {
                id: `outcome-cricket-ipl-${i}-3`,
                name: 'Over 320.5',
                odds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              },
              {
                id: `outcome-cricket-ipl-${i}-4`,
                name: 'Under 320.5',
                odds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              }
            ]
          }
        ]
      };
      
      events.push(event);
    }
  }
  
  // Generate regular events for each sport
  const remainingCount = sport === 'cricket' ? count - events.length : count;
  
  if (remainingCount > 0 && sportsData[sport as keyof typeof sportsData]) {
    const sportLeagues = sportsData[sport as keyof typeof sportsData].leagues;
    const sportTeams = sportsData[sport as keyof typeof sportsData].teams;
    
    for (let i = 0; i < remainingCount; i++) {
      // Select random league
      const league = sportLeagues[Math.floor(Math.random() * sportLeagues.length)];
      
      // Select random teams
      const homeIndex = Math.floor(Math.random() * sportTeams.length);
      let awayIndex = Math.floor(Math.random() * sportTeams.length);
      while (awayIndex === homeIndex) {
        awayIndex = Math.floor(Math.random() * sportTeams.length);
      }
      
      const homeTeam = sportTeams[homeIndex];
      const awayTeam = sportTeams[awayIndex];
      
      // Random time up to 7 days in the future (for upcoming) or random time +/- 3 hours (for live)
      const timeOffset = isUpcoming 
        ? Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
        : Math.floor(Math.random() * 6 * 60 * 60 * 1000) - 3 * 60 * 60 * 1000;
      
      // Generate home/away scores based on the sport
      let homeScore = null;
      let awayScore = null;
      
      if (!isUpcoming) {
        switch(sport) {
          case 'soccer':
            homeScore = Math.floor(Math.random() * 4);
            awayScore = Math.floor(Math.random() * 3);
            break;
          case 'basketball':
            homeScore = Math.floor(Math.random() * 50) + 50;
            awayScore = Math.floor(Math.random() * 50) + 50;
            break;
          case 'cricket':
            homeScore = Math.floor(Math.random() * 200) + 100;
            awayScore = Math.floor(Math.random() * 180) + 100;
            break;
          case 'tennis':
            // Tennis scoring is complex, so we'll just use sets
            homeScore = Math.floor(Math.random() * 3);
            awayScore = Math.floor(Math.random() * 3);
            break;
          case 'american-football':
            homeScore = Math.floor(Math.random() * 30) + 3;
            awayScore = Math.floor(Math.random() * 30) + 3;
            break;
          case 'baseball':
            homeScore = Math.floor(Math.random() * 8);
            awayScore = Math.floor(Math.random() * 8);
            break;
          case 'ice-hockey':
            homeScore = Math.floor(Math.random() * 5);
            awayScore = Math.floor(Math.random() * 5);
            break;
          case 'esports':
            homeScore = Math.floor(Math.random() * 2);
            awayScore = Math.floor(Math.random() * 2);
            break;
          default:
            homeScore = Math.floor(Math.random() * 3);
            awayScore = Math.floor(Math.random() * 3);
        }
      }
      
      const event: Event = {
        id: `event-${sport}-${league.id}-${i}`,
        name: `${homeTeam} vs ${awayTeam}`,
        sportId: sport,
        leagueId: league.id,
        leagueName: league.name,
        startTime: new Date(now + timeOffset).toISOString(),
        status: isUpcoming ? 'upcoming' : 'live',
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        isFeatured: Math.random() > 0.8, // 20% chance of being featured
        markets: [
          {
            id: `market-${sport}-${league.id}-${i}-1`,
            name: 'Match Winner',
            isLocked: false,
            startTime: new Date(now + timeOffset).toISOString(),
            endTime: null,
            outcomes: sport === 'soccer' ? [
              {
                id: `outcome-${sport}-${league.id}-${i}-1`,
                name: homeTeam,
                odds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              },
              {
                id: `outcome-${sport}-${league.id}-${i}-2`,
                name: 'Draw',
                odds: (Math.random() * 2 + 2.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 2.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              },
              {
                id: `outcome-${sport}-${league.id}-${i}-3`,
                name: awayTeam,
                odds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              }
            ] : [
              {
                id: `outcome-${sport}-${league.id}-${i}-1`,
                name: homeTeam,
                odds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              },
              {
                id: `outcome-${sport}-${league.id}-${i}-2`,
                name: awayTeam,
                odds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() * 2 + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              }
            ]
          },
          {
            id: `market-${sport}-${league.id}-${i}-2`,
            name: sport === 'soccer' ? 'Total Goals' : 
                  sport === 'basketball' ? 'Total Points' : 
                  sport === 'cricket' ? 'Total Runs' : 
                  sport === 'tennis' ? 'Total Games' : 
                  sport === 'american-football' ? 'Total Points' :
                  sport === 'baseball' ? 'Total Runs' :
                  sport === 'ice-hockey' ? 'Total Goals' :
                  sport === 'esports' ? 'Total Maps' : 'Total Score',
            isLocked: false,
            startTime: new Date(now + timeOffset).toISOString(),
            endTime: null,
            outcomes: [
              {
                id: `outcome-${sport}-${league.id}-${i}-4`,
                name: sport === 'soccer' ? 'Over 2.5' : 
                      sport === 'basketball' ? 'Over, 195.5' : 
                      sport === 'cricket' ? 'Over 320.5' : 
                      sport === 'tennis' ? 'Over 22.5' : 
                      sport === 'american-football' ? 'Over 45.5' :
                      sport === 'baseball' ? 'Over 8.5' :
                      sport === 'ice-hockey' ? 'Over 5.5' :
                      sport === 'esports' ? 'Over 2.5' : 'Over',
                odds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              },
              {
                id: `outcome-${sport}-${league.id}-${i}-5`,
                name: sport === 'soccer' ? 'Under 2.5' : 
                      sport === 'basketball' ? 'Under, 195.5' : 
                      sport === 'cricket' ? 'Under 320.5' : 
                      sport === 'tennis' ? 'Under 22.5' : 
                      sport === 'american-football' ? 'Under 45.5' :
                      sport === 'baseball' ? 'Under 8.5' :
                      sport === 'ice-hockey' ? 'Under 5.5' :
                      sport === 'esports' ? 'Under 2.5' : 'Under',
                odds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                previousOdds: (Math.random() + 1.5).toFixed(2) as unknown as number,
                probability: Math.random(),
                isLocked: false,
                timestamp: now
              }
            ]
          }
        ]
      };
      
      events.push(event);
    }
  }
  
  return events;
};

// Generate mock events for all sports
const generateMockUpcomingEvents = (): Event[] => {
  const sportsCategories = ['soccer', 'basketball', 'tennis', 'cricket', 'american-football', 'baseball', 'ice-hockey', 'esports'];
  let allEvents: Event[] = [];
  
  // Generate 50 events per sport as requested
  sportsCategories.forEach(sport => {
    // Generate 40 upcoming and 10 live events for each sport
    const upcomingEvents = generateSportEvents(sport, 40, true);
    const liveEvents = generateSportEvents(sport, 10, false);
    allEvents = [...allEvents, ...upcomingEvents, ...liveEvents];
  });
  
  return allEvents;
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