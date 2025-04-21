import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GAMES } from '@/games';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Sparkles, Users, Search, Zap } from 'lucide-react';
import GameCard from '@/components/games/GameCard';

const CasinoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: apiGames = [], isLoading } = useQuery({
    queryKey: ['/api/games']
  });
  
  // Filter games by search query
  const filteredGames = GAMES.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-[#0E1821] text-white py-4 px-4">
      {/* Search Bar */}
      <div className="relative mb-3 px-2">
        <input 
          type="text" 
          placeholder="Search your game" 
          className="w-full bg-[#172B3A] rounded-lg py-2 px-9 text-sm md:text-base text-white border-none focus:outline-none focus:ring-1 focus:ring-[#0F212E]/80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400 absolute left-4 top-3" />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-3 px-2">
          <Zap className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-medium text-white">Stake Originals</h2>
        </div>
        
        {/* Game Grid - Optimized for mobile */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-4 p-1">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              slug={game.slug}
              type={game.type}
              activePlayers={game.activePlayers}
              color={game.color}
              iconType={game.iconType}
              multiplier={game.maxMultiplier && game.maxMultiplier < 1000 ? `${game.maxMultiplier.toFixed(2)}x` : undefined}
              imageUrl={apiGames.find((g: any) => g.id === game.id)?.imageUrl || null}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CasinoPage;