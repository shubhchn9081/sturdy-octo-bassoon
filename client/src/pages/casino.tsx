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
        <div className="mb-4">
          {/* New arrival highlight */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 p-3 mb-4 rounded-lg border border-indigo-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-indigo-600 p-1.5 rounded-md mr-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">NEW ARRIVAL</h3>
                  <p className="text-indigo-300 text-sm">Try our newest game: Tower Climb</p>
                </div>
              </div>
              <div>
                <button 
                  onClick={() => window.location.href = '/games/tower-climb'}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-3 px-2">
            <Zap className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-xl font-medium text-white">Novito Originals</h2>
          </div>
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