import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GAMES } from '@/games';
import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, Users } from 'lucide-react';

const CasinoPage = () => {
  const { data: apiGames = [], isLoading } = useQuery({
    queryKey: ['/api/games']
  });
  
  // Combine API game data with our static game data for other props
  const combinedGames = GAMES.map(game => {
    const apiGame = Array.isArray(apiGames) ? 
      apiGames.find((g: any) => g.id === game.id) : 
      undefined;
    return {
      ...game,
      imageUrl: apiGame?.imageUrl || null
    };
  });
  
  return (
    <div className="min-h-screen bg-[#0E1821] text-white py-4 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Stake Originals</h1>
        <p className="text-sm text-gray-400">Play our exclusive casino games</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {combinedGames.map((game) => (
          <Link key={game.id} href={`/games/${game.slug}`}>
            <Card className="bg-[#172B3A] border-[#243442] hover:bg-[#1F3244] transition-colors cursor-pointer overflow-hidden h-full">
              <div className="aspect-square relative overflow-hidden">
                {game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center", game.color)}>
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">{game.name}</h3>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{game.activePlayers.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CasinoPage;