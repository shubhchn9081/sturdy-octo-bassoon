import React, { useState } from 'react';
import { GAMES } from '@/games';
import GameCard from '@/components/games/GameCard';
import { formatNumber } from '@/lib/utils';
import { Search, ListFilter, Grid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type Game = {
  id: number;
  name: string;
  slug: string;
  type: string;
  activePlayers: number;
  rtp: number;
  maxMultiplier: number;
  minBet: number;
  maxBet: number;
  imageUrl: string | null;
};

const OriginalsPage = () => {
  const { data: apiGames = [], isLoading } = useQuery({
    queryKey: ['/api/games']
    // Using default query function from queryClient.ts - no need to specify queryFn
  });
  
  const [viewAll, setViewAll] = useState(false);
  
  // Combine API game data (mainly for imageUrl) with our static game data for other props
  const combinedGames = GAMES.map(game => {
    const apiGame = Array.isArray(apiGames) ? 
      apiGames.find((g: Game) => g.id === game.id) : 
      undefined;
    return {
      ...game,
      imageUrl: apiGame?.imageUrl || null
    };
  });
  
  // Filter only Stake Originals games
  const originalsGames = combinedGames.filter(game => game.type === 'STAKE ORIGINALS');
  
  // Sample player counts to match the screenshot
  const playerCounts = {
    'MINES': 13166,
    'DICE': 7781,
    'PLINKO': 5134,
    'LIMBO': 8092,
    'CRASH': 4411,
    'KENO': 2069,
    'WHEEL': 2226,
    'BLACKJACK': 3503
  };
  
  return (
    <div className="px-8 py-6 bg-[#0F212E]">
      <h1 className="text-2xl font-medium text-white mb-4">Stake Originals</h1>
      
      <div className="w-full flex items-center mb-8">
        <div className="relative flex-grow max-w-[450px]">
          <input 
            type="text" 
            placeholder="Search your game"
            className="w-full h-10 bg-[#172B3A] border-none rounded-sm py-2 px-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#7BFA4C]/20"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#546D7A]">
            <Search className="h-4 w-4" />
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            className="flex items-center gap-1 text-[#546D7A] hover:text-white text-sm"
            onClick={() => setViewAll(!viewAll)}
          >
            {viewAll ? "View Popular" : "View All Providers"}
          </button>
          
          <div className="flex items-center gap-1 ml-4">
            <span className="text-[#546D7A] text-sm mr-1">Sort by</span>
            <div className="bg-[#172B3A] hover:bg-[#243442] text-white py-1 px-3 rounded-sm text-xs flex items-center gap-1 cursor-pointer">
              Popular <span className="ml-1">▼</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {originalsGames.map(game => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            slug={game.slug}
            type={game.type}
            activePlayers={playerCounts[game.name] || Math.floor(Math.random() * 10000)}
            color={game.color}
            iconType={game.iconType}
            multiplier={game.maxMultiplier && game.maxMultiplier < 1000 ? `${formatNumber(game.maxMultiplier)}x` : undefined}
            imageUrl={game.imageUrl}
            showPlayerCount={true}
          />
        ))}
      </div>
    </div>
  );
};

export default OriginalsPage;