import React, { useState } from 'react';
import { GAMES } from '@/games';
import GameCard from '@/components/games/GameCard';
import PromotionCard from '@/components/games/PromotionCard';
import CategoryButton from '@/components/games/CategoryButton';
import Layout from '@/components/layout/Layout';
import { 
  Search, 
  Home, 
  Zap, 
  SmilePlus, 
  Dices, 
  Tv2, 
  FileEdit, 
  Sparkles
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
    <Layout>
      <main className="flex-1 p-6">
        {/* Promotions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {promotions.map((promo, index) => (
            <PromotionCard
              key={index}
              title={promo.title}
              description={promo.description}
              type={promo.type as 'announcement' | 'promo'}
              imageSrc={promo.imageSrc}
              readMoreUrl={promo.readMoreUrl}
              playNowUrl={promo.playNowUrl}
              playNowText={promo.playNowText}
            />
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <input 
            type="text" 
            placeholder="Search your game" 
            className="w-full bg-secondary rounded-lg py-3 px-10 text-white border border-border focus:outline-none focus:border-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-5 w-5 text-muted-foreground absolute left-3 top-3.5" />
        </div>

        {/* Game Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <CategoryButton href="/" icon={Home} active>
            Lobby
          </CategoryButton>
          <CategoryButton href="/originals" icon={Zap}>
            Stake Originals
          </CategoryButton>
          <CategoryButton href="/slots" icon={SmilePlus}>
            Slots
          </CategoryButton>
          <CategoryButton href="/live-casino" icon={Dices}>
            Live Casino
          </CategoryButton>
          <CategoryButton href="/game-shows" icon={Tv2}>
            Game Shows
          </CategoryButton>
          <CategoryButton href="/exclusives" icon={FileEdit}>
            Stake Exclusives
          </CategoryButton>
          <CategoryButton href="/new-releases" icon={Sparkles}>
            New Releases
          </CategoryButton>
        </div>

        {/* Originals Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-white mr-2" />
              <h2 className="text-xl font-bold text-white">Stake Originals</h2>
            </div>
          </div>
          
          {/* Game Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
              />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default HomePage;