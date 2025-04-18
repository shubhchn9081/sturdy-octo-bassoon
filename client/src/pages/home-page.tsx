import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Game } from '@shared/schema';

const HomePage = () => {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="min-h-screen bg-[#0A1823] text-white">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="mr-2">🔥</span> Trending Games
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#3498db]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {games && games.length > 0 ? (
              games.map((game) => (
                <Card key={game.id} className="bg-[#142634] border-[#243442] overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl">
                  <div className="aspect-[5/4] relative">
                    <img
                      src={game.imageUrl || '/images/game-placeholder.svg'}
                      alt={game.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm text-white truncate">{game.name}</CardTitle>
                    <CardDescription className="text-xs text-gray-400">
                      {game.type === 'stake_original' ? 'Stake Original' : game.type}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                <p>No games available yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;