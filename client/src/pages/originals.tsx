import React, { useEffect, useState } from 'react';
import { GAMES } from '@/games';
import GameCard from '@/components/games/GameCard';
import { formatNumber } from '@/lib/utils';
import { ListFilter, Trophy, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
  
  return (
    <div className="mx-auto px-4 py-2 bg-[#0E1821]">
      <div className="relative mb-4">
        <input 
          type="text" 
          placeholder="Search your game"
          className="w-full bg-[#0F212E] border-none rounded py-2 px-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#57FBA2]"
        />
        <div className="absolute left-3 top-2.5 text-[#546D7A]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-br from-[#57FBA2] to-[#39AD6E] text-black p-1.5 rounded">
          <Zap className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-medium text-white">Stake Originals</h2>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-400">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="text-[10px]">Sort by</span>
          </div>
          <div className="bg-[#0F212E] text-white py-0.5 px-2 rounded text-[10px] flex items-center gap-1">
            Popular <span className="ml-1 text-[8px]">▼</span>
          </div>
        </div>
      </div>
      
      <div className="game-grid">
        {originalsGames.map(game => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            slug={game.slug}
            type={game.type}
            activePlayers={game.activePlayers}
            color={game.color}
            iconType={game.iconType}
            multiplier={game.maxMultiplier && game.maxMultiplier < 1000 ? `${formatNumber(game.maxMultiplier)}x` : undefined}
            imageUrl={game.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default OriginalsPage;