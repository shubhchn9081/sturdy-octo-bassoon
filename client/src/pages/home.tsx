import React, { useState } from 'react';
import { GAMES } from '@/games';
import GameCard from '@/components/games/GameCard';
import PromotionCard from '@/components/games/PromotionCard';
import CategoryButton from '@/components/games/CategoryButton';
import { 
  Search, 
  Home, 
  Zap, 
  SmilePlus, 
  Dices, 
  Tv2, 
  FileEdit, 
  Sparkles,
  ArrowDownUp
} from 'lucide-react';

const HomePage = () => {
  // Temporary solution until context is fixed
  const gamesList = GAMES;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter games by search query
  const filteredGames = GAMES.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get featured games (first 4)
  const featuredGames = filteredGames.slice(0, 4);
  // Get all games
  const allGames = filteredGames;
  
  // Promotions data
  const promotions = [
    {
      title: 'Rock, Paper, Scissors',
      description: 'New Stake Original!',
      type: 'announcement',
      imageSrc: 'https://images.unsplash.com/photo-1629292777003-2b94cc8dff54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      readMoreUrl: '/promotions/rock-paper-scissors',
      playNowUrl: '/games/rock-paper-scissors',
      playNowText: 'Play Now'
    },
    {
      title: 'Daily Races',
      description: 'Play in our $100,000 Daily Race',
      type: 'promo',
      imageSrc: 'https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      readMoreUrl: '/promotions/daily-races',
      playNowUrl: '/races',
      playNowText: 'Race Now'
    },
    {
      title: 'Conquer the Casino',
      description: 'Win a share in $50,000 every week',
      type: 'promo',
      imageSrc: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      readMoreUrl: '/promotions/conquer-casino',
      playNowUrl: '/games',
      playNowText: 'Play Now'
    }
  ];
  
  return (
    <main className="flex-1">
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

      {/* Featured Section */}
      <div className="mb-8 px-2">
        <div className="flex items-center mb-3 px-2">
          <Zap className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-medium text-white">Featured Novito Originals</h2>
        </div>
        
        {/* Featured Game Cards with proper spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-2 gap-y-2">
          {featuredGames.map((game) => (
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
            />
          ))}
        </div>
      </div>

      {/* All Games Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 px-2">
          <h2 className="text-base md:text-lg font-medium text-white mb-2 md:mb-0">All Novito Originals</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-gray-400 text-xs md:text-sm">Sort by</span>
              <div className="bg-[#172B3A] text-white py-1 px-2 rounded-md text-xs md:text-sm flex items-center">
                Popular <span className="ml-1">▼</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* All Game Cards - Exact grid layout matching Stake.com */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-2 gap-y-4 p-1">
          {allGames.map((game) => (
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
            />
          ))}
        </div>
      </div>
      
      {/* Add this section after all the game sections */}
      <div className="mt-8 pt-8 border-t border-[#172B3A]">
        <div className="text-center">
          <p className="text-sm text-gray-500">© 2025 Stake.com | All Rights Reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <div className="w-6 h-6 rounded-full bg-[#172B3A] flex items-center justify-center">
              <div className="w-3 h-3 bg-[#243442]"></div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#172B3A] flex items-center justify-center">
              <div className="w-3 h-3 bg-[#243442]"></div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#172B3A] flex items-center justify-center">
              <div className="w-3 h-3 bg-[#243442]"></div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#172B3A] flex items-center justify-center">
              <div className="w-3 h-3 bg-[#243442]"></div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#172B3A] flex items-center justify-center">
              <div className="w-3 h-3 bg-[#243442]"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;