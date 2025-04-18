import React, { useEffect, useState } from 'react';
import { GAMES } from '@/games';
import GameCard from '@/components/games/GameCard';
import Layout from '@/components/layout/Layout';
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
  
  // Get featured games (first 4 games)
  const featuredGames = originalsGames.slice(0, 4);
  // Get remaining games
  const remainingGames = originalsGames.slice(4);
  
  return (
    <Layout>
      <div className="container mx-auto px-6 py-6">
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search your game"
            className="w-full bg-[#172B3A] border-none rounded-md py-3 px-10 text-white focus:outline-none"
          />
          <div className="absolute left-3 top-3.5 text-[#546D7A]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-gradient-to-br from-[#57FBA2] to-[#39AD6E] text-black p-2 rounded-md">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-medium text-white">Featured Stake Originals</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {featuredGames.map(game => (
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
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-white">All Stake Originals</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-white">
              <ListFilter className="h-4 w-4" />
              <span className="text-sm">Sort by</span>
            </div>
            <div className="bg-[#172B3A] text-white py-1 px-3 rounded-md text-sm flex items-center gap-1">
              Popular <span className="ml-1">▼</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {remainingGames.map(game => (
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
    </Layout>
  );
};

export default OriginalsPage;