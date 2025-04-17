import React from 'react';
import { GAMES } from '@/games';
import GameCard from '@/components/games/GameCard';
import Layout from '@/components/layout/Layout';
import { formatNumber } from '@/lib/utils';

const OriginalsPage = () => {
  // Filter only Stake Originals games
  const originalsGames = GAMES.filter(game => game.type === 'STAKE ORIGINALS');
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Stake Originals</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              multiplier={game.maxMultiplier ? `${formatNumber(game.maxMultiplier)}x` : undefined}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OriginalsPage;