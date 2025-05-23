import { create } from 'zustand';

// Types for our sports betting data
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
  isLocked: boolean;
  startTime: string;
  endTime: string | null;
  outcomes: Outcome[];
};

export type Event = {
  id: string;
  name: string;
  sportId: string;
  leagueId: string;
  leagueName: string;
  startTime: string;
  status: 'live' | 'upcoming' | 'finished';
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  isFeatured: boolean;
  markets: Market[];
};

export type SportCategory = {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  icon?: string;
  events: Event[];
};

export type BetSlipSelection = {
  eventId: string;
  marketId: string;
  outcomeId: string;
  odds: number;
  name: string;
  eventName: string;
  marketName: string;
};

export type BetSlip = {
  selections: BetSlipSelection[];
  stake: number;
  potentialWinnings: number;
};

// Define the shape of our store
interface SportsBettingStore {
  sportsCategories: SportCategory[];
  activeCategory: string | null;
  featuredEvents: Event[];
  liveEvents: Event[];
  trendingEvents: Event[];
  betSlip: BetSlip;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveCategory: (category: string) => void;
  addToBetSlip: (selection: BetSlipSelection) => void;
  removeFromBetSlip: (outcomeId: string) => void;
  clearBetSlip: () => void;
  setStake: (amount: number) => void;
  loadSportsData: () => void;
  updateOdds: (sportId: string, eventId: string, marketId: string, outcomeId: string, newOdds: number) => void;
}

// Generate initial mock sports categories
const generateMockSportsCategories = (): SportCategory[] => {
  return [
    {
      id: 'soccer',
      name: 'Soccer',
      order: 1,
      isActive: true,
      events: []
    },
    {
      id: 'basketball',
      name: 'Basketball',
      order: 2,
      isActive: true,
      events: []
    },
    {
      id: 'tennis',
      name: 'Tennis',
      order: 3,
      isActive: true,
      events: []
    },
    {
      id: 'cricket',
      name: 'Cricket',
      order: 4,
      isActive: true,
      events: []
    },
    {
      id: 'american-football',
      name: 'American Football',
      order: 5,
      isActive: true,
      events: []
    },
    {
      id: 'baseball',
      name: 'Baseball',
      order: 6,
      isActive: true,
      events: []
    },
    {
      id: 'ice-hockey',
      name: 'Ice Hockey',
      order: 7,
      isActive: true,
      events: []
    },
    {
      id: 'esports',
      name: 'Esports',
      order: 8,
      isActive: true,
      events: []
    }
  ];
};

// Generate mock live events
const generateMockLiveEvents = (): Event[] => {
  return [
    {
      id: 'event-1',
      name: 'Real Madrid vs Barcelona',
      sportId: 'soccer',
      leagueId: 'la-liga',
      leagueName: 'LaLiga',
      startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      status: 'live',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: 2,
      awayScore: 1,
      isFeatured: true,
      markets: [
        {
          id: 'market-1',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-1',
              name: 'Real Madrid',
              odds: 1.65,
              previousOdds: 1.75,
              probability: 0.6,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-2',
              name: 'Draw',
              odds: 3.20,
              previousOdds: 3.10,
              probability: 0.25,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-3',
              name: 'Barcelona',
              odds: 5.50,
              previousOdds: 5.00,
              probability: 0.15,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        },
        {
          id: 'market-2',
          name: 'Total Goals',
          isLocked: false,
          startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-4',
              name: 'Over 3.5',
              odds: 1.95,
              previousOdds: 2.10,
              probability: 0.5,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-5',
              name: 'Under 3.5',
              odds: 1.85,
              previousOdds: 1.75,
              probability: 0.5,
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
      startTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 mins ago
      status: 'live',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Boston Celtics',
      homeScore: 45,
      awayScore: 52,
      isFeatured: true,
      markets: [
        {
          id: 'market-3',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-6',
              name: 'Los Angeles Lakers',
              odds: 2.10,
              previousOdds: 1.90,
              probability: 0.48,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-7',
              name: 'Boston Celtics',
              odds: 1.75,
              previousOdds: 1.95,
              probability: 0.52,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        },
        {
          id: 'market-4',
          name: 'Total Points',
          isLocked: false,
          startTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-8',
              name: 'Over 200.5',
              odds: 1.90,
              previousOdds: 1.95,
              probability: 0.5,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-9',
              name: 'Under 200.5',
              odds: 1.90,
              previousOdds: 1.85,
              probability: 0.5,
              isLocked: false,
              timestamp: Date.now()
            }
          ]
        }
      ]
    },
    {
      id: 'event-3',
      name: 'Mumbai Indians vs Chennai Super Kings',
      sportId: 'cricket',
      leagueId: 'ipl',
      leagueName: 'Indian Premier League',
      startTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
      status: 'live',
      homeTeam: 'Mumbai Indians',
      awayTeam: 'Chennai Super Kings',
      homeScore: 156,
      awayScore: 112,
      isFeatured: true,
      markets: [
        {
          id: 'market-5',
          name: 'Match Winner',
          isLocked: false,
          startTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          endTime: null,
          outcomes: [
            {
              id: 'outcome-10',
              name: 'Mumbai Indians',
              odds: 1.30,
              previousOdds: 1.50,
              probability: 0.75,
              isLocked: false,
              timestamp: Date.now()
            },
            {
              id: 'outcome-11',
              name: 'Chennai Super Kings',
              odds: 3.50,
              previousOdds: 2.75,
              probability: 0.25,
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

// Create the actual store with Zustand
export const useSportsBettingStore = create<SportsBettingStore>((set, get) => ({
  sportsCategories: generateMockSportsCategories(),
  activeCategory: 'cricket', // Start with cricket as active category
  featuredEvents: [],
  liveEvents: [],
  trendingEvents: [],
  betSlip: {
    selections: [],
    stake: 0,
    potentialWinnings: 0
  },
  isLoading: true,
  error: null,
  
  // Set the active category
  setActiveCategory: (category) => {
    set({ activeCategory: category });
  },
  
  // Add a selection to the bet slip
  addToBetSlip: (selection) => {
    const { betSlip } = get();
    
    // Check if the selection is already in the bet slip
    const existingIndex = betSlip.selections.findIndex(
      (item) => item.outcomeId === selection.outcomeId
    );
    
    let updatedSelections;
    
    if (existingIndex >= 0) {
      // Remove the selection if it's already in the bet slip
      updatedSelections = betSlip.selections.filter(
        (_, index) => index !== existingIndex
      );
    } else {
      // Add the selection to the bet slip
      updatedSelections = [...betSlip.selections, selection];
    }
    
    // Calculate potential winnings
    const potentialWinnings = calculatePotentialWinnings(updatedSelections, betSlip.stake);
    
    set({
      betSlip: {
        ...betSlip,
        selections: updatedSelections,
        potentialWinnings
      }
    });
  },
  
  // Remove a selection from the bet slip
  removeFromBetSlip: (outcomeId) => {
    const { betSlip } = get();
    
    const updatedSelections = betSlip.selections.filter(
      (selection) => selection.outcomeId !== outcomeId
    );
    
    // Calculate potential winnings
    const potentialWinnings = calculatePotentialWinnings(updatedSelections, betSlip.stake);
    
    set({
      betSlip: {
        ...betSlip,
        selections: updatedSelections,
        potentialWinnings
      }
    });
  },
  
  // Clear all selections from the bet slip
  clearBetSlip: () => {
    set({
      betSlip: {
        selections: [],
        stake: 0,
        potentialWinnings: 0
      }
    });
  },
  
  // Set the stake amount
  setStake: (amount) => {
    const { betSlip } = get();
    
    // Calculate potential winnings
    const potentialWinnings = calculatePotentialWinnings(betSlip.selections, amount);
    
    set({
      betSlip: {
        ...betSlip,
        stake: amount,
        potentialWinnings
      }
    });
  },
  
  // Load initial sports data
  loadSportsData: async () => {
    set({ isLoading: true });
    
    try {
      // In a real app, this would be an API call to get the sports data
      // For now, we'll use the mock data
      
      // Get live events
      const liveEvents = generateMockLiveEvents();
      
      // Get upcoming events
      const upcomingEvents = generateMockUpcomingEvents();
      
      // Get all events
      const allEvents = [...liveEvents, ...upcomingEvents];
      
      // Get featured events
      const featuredEvents = allEvents.filter((event) => event.isFeatured);
      
      // Get trending events (just use random events for now)
      const trendingEvents = allEvents
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      
      // Organize events by sports category
      const { sportsCategories } = get();
      const updatedCategories = sportsCategories.map((category) => {
        return {
          ...category,
          events: allEvents.filter((event) => event.sportId === category.id)
        };
      });
      
      set({
        sportsCategories: updatedCategories,
        featuredEvents,
        liveEvents,
        trendingEvents,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading sports data:', error);
      set({
        isLoading: false,
        error: 'Failed to load sports data. Please try again later.'
      });
    }
  },
  
  // Update odds for a specific outcome
  updateOdds: (sportId, eventId, marketId, outcomeId, newOdds) => {
    const { sportsCategories, betSlip } = get();
    
    // Find the category
    const categoryIndex = sportsCategories.findIndex(
      (category) => category.id === sportId
    );
    
    if (categoryIndex >= 0) {
      const category = sportsCategories[categoryIndex];
      
      // Find the event
      const eventIndex = category.events.findIndex(
        (event) => event.id === eventId
      );
      
      if (eventIndex >= 0) {
        const event = category.events[eventIndex];
        
        // Find the market
        const marketIndex = event.markets.findIndex(
          (market) => market.id === marketId
        );
        
        if (marketIndex >= 0) {
          const market = event.markets[marketIndex];
          
          // Find the outcome
          const outcomeIndex = market.outcomes.findIndex(
            (outcome) => outcome.id === outcomeId
          );
          
          if (outcomeIndex >= 0) {
            const outcome = market.outcomes[outcomeIndex];
            
            // Create a new outcome with updated odds
            const updatedOutcome = {
              ...outcome,
              previousOdds: outcome.odds,
              odds: newOdds,
              timestamp: Date.now()
            };
            
            // Create a new market with the updated outcome
            const updatedMarket = {
              ...market,
              outcomes: [
                ...market.outcomes.slice(0, outcomeIndex),
                updatedOutcome,
                ...market.outcomes.slice(outcomeIndex + 1)
              ]
            };
            
            // Create a new event with the updated market
            const updatedEvent = {
              ...event,
              markets: [
                ...event.markets.slice(0, marketIndex),
                updatedMarket,
                ...event.markets.slice(marketIndex + 1)
              ]
            };
            
            // Create a new category with the updated event
            const updatedCategory = {
              ...category,
              events: [
                ...category.events.slice(0, eventIndex),
                updatedEvent,
                ...category.events.slice(eventIndex + 1)
              ]
            };
            
            // Update the categories
            const updatedCategories = [
              ...sportsCategories.slice(0, categoryIndex),
              updatedCategory,
              ...sportsCategories.slice(categoryIndex + 1)
            ];
            
            // Update the store
            set({ sportsCategories: updatedCategories });
            
            // If the outcome is in the bet slip, update its odds there too
            const selectionIndex = betSlip.selections.findIndex(
              (selection) => selection.outcomeId === outcomeId
            );
            
            if (selectionIndex >= 0) {
              const updatedSelections = [...betSlip.selections];
              updatedSelections[selectionIndex] = {
                ...updatedSelections[selectionIndex],
                odds: newOdds
              };
              
              // Recalculate potential winnings
              const potentialWinnings = calculatePotentialWinnings(
                updatedSelections,
                betSlip.stake
              );
              
              set({
                betSlip: {
                  ...betSlip,
                  selections: updatedSelections,
                  potentialWinnings
                }
              });
            }
          }
        }
      }
    }
  }
}));

// Helper function to calculate potential winnings
function calculatePotentialWinnings(selections: BetSlipSelection[], stake: number): number {
  if (selections.length === 0 || stake <= 0) {
    return 0;
  }
  
  // Calculate the total odds (multiply all odds together)
  const totalOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
  
  // Calculate potential winnings
  return totalOdds * stake;
}