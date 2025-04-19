import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Clock, Zap, ChevronUp, ChevronDown } from 'lucide-react';

type Game = {
  id: string;
  name: string;
  type: 'crash' | 'dice' | 'slots' | 'roulette' | 'blackjack' | 'mines';
  players: number;
  minBet: number;
  maxBet: number;
  multiplier?: number;
  hot: boolean;
  new: boolean;
};

const initialGames: Game[] = [
  { id: '1', name: 'Crash', type: 'crash', players: 324, minBet: 0.1, maxBet: 1000, multiplier: 1.5, hot: true, new: false },
  { id: '2', name: 'Dice Roll', type: 'dice', players: 156, minBet: 0.5, maxBet: 500, hot: false, new: true },
  { id: '3', name: 'Classic Slots', type: 'slots', players: 89, minBet: 1, maxBet: 250, hot: false, new: false },
  { id: '4', name: 'European Roulette', type: 'roulette', players: 211, minBet: 1, maxBet: 1000, hot: true, new: false },
  { id: '5', name: 'Blackjack VIP', type: 'blackjack', players: 45, minBet: 10, maxBet: 5000, hot: false, new: false },
  { id: '6', name: 'Mines', type: 'mines', players: 178, minBet: 0.1, maxBet: 100, hot: true, new: true },
];

type SortOption = 'name' | 'players' | 'minBet';
type SortDirection = 'asc' | 'desc';

export function GameLobbyAnimate() {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('players');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Auto-animate parent ref
  const [parent] = useAutoAnimate();
  
  // Filter games based on search term
  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort games
  const sortedGames = [...filteredGames].sort((a, b) => {
    let comparison = 0;
    
    if (sortOption === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortOption === 'players') {
      comparison = a.players - b.players;
    } else if (sortOption === 'minBet') {
      comparison = a.minBet - b.minBet;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle sort click
  const handleSort = (option: SortOption) => {
    if (sortOption === option) {
      // Toggle direction if same option
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New option, set to desc by default
      setSortOption(option);
      setSortDirection('desc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (option: SortOption) => {
    if (sortOption !== option) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Game Lobby</CardTitle>
        <CardDescription>Browse available games with smooth animations</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Search and filter bar */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search games..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 py-2 px-3 bg-muted/50 rounded-md mb-2 text-sm font-medium">
          <div className="col-span-5 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('name')}>
            Game {getSortIcon('name')}
          </div>
          <div className="col-span-3 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('players')}>
            Players {getSortIcon('players')}
          </div>
          <div className="col-span-4 flex items-center gap-1 cursor-pointer" onClick={() => handleSort('minBet')}>
            Bet Range {getSortIcon('minBet')}
          </div>
        </div>
        
        {/* Game List with auto-animate */}
        <ul ref={parent} className="space-y-2">
          {sortedGames.length === 0 ? (
            <li className="text-center py-8 text-muted-foreground">
              No games found matching your search.
            </li>
          ) : (
            sortedGames.map((game) => (
              <li key={game.id} className="grid grid-cols-12 gap-4 p-3 border border-border rounded-md hover:bg-accent/10 transition-colors">
                <div className="col-span-5 flex items-center">
                  <div className="mr-2 flex flex-col items-start">
                    <span className="font-medium">{game.name}</span>
                    <div className="flex gap-1 mt-1">
                      {game.hot && (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                          <Zap className="h-2.5 w-2.5 mr-0.5" /> Hot
                        </Badge>
                      )}
                      {game.new && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-3 flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span>{game.players}</span>
                </div>
                
                <div className="col-span-4 flex items-center text-sm">
                  <span className="text-muted-foreground">
                    ${game.minBet.toFixed(1)} - ${game.maxBet}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}