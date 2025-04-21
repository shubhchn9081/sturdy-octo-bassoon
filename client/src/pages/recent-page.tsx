import { PageTitle } from "../components/common/PageTitle";
import GameCard from "../components/games/GameCard";
import { useState, useEffect } from "react";
import { Game } from "../types";
import { useQuery } from "@tanstack/react-query";

// This page will display games that the user has recently played
const RecentPage = () => {
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['/api/games'],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (games && Array.isArray(games)) {
      // In a real implementation, we would fetch this from the user's history
      // For now, let's simulate by just showing the first few games from our games list
      const recent = games.slice(0, 12);
      setRecentGames(recent);
    }
  }, [games]);

  return (
    <div className="p-4">
      <PageTitle title="Recently Played" />

      <div className="mt-6">
        {isLoading ? (
          <div className="bg-[#172B3A] p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">Loading...</h3>
          </div>
        ) : error ? (
          <div className="bg-[#172B3A] p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2 text-red-500">Error Loading Games</h3>
            <p className="text-sm text-[#a3bfcd]">
              There was an error loading your recent games.
            </p>
          </div>
        ) : recentGames.length === 0 ? (
          <div className="bg-[#172B3A] p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">No Recent Games</h3>
            <p className="text-sm text-[#a3bfcd]">
              You haven't played any games recently. Start playing to see your history here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-2 gap-y-4 p-1">
            {recentGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                name={game.name}
                slug={game.slug}
                type={game.type}
                activePlayers={game.activePlayers}
                color={game.color || '#0F1923'}
                iconType={game.iconType}
                multiplier={game.maxMultiplier && game.maxMultiplier < 1000 ? `${game.maxMultiplier.toFixed(2)}x` : undefined}
                imageUrl={game.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPage;