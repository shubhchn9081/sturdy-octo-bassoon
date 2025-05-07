import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

// Slot game type from schema
interface SlotGame {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  newRelease: boolean;
  rtp: number;
  maxMultiplier: number;
  minBet: number;
  maxBet: number;
  activePlayers: number;
}

// Default categories for filtering
const CATEGORIES = [
  'All',
  'Featured',
  'New Releases',
  'Space & Sci-Fi',
  'Adventure',
  'Fantasy',
  'Classic',
  'Seasonal',
  'Sports',
  'Luxury'
];

// SlotGameCard component for displaying each slot game
const SlotGameCard: React.FC<{ game: SlotGame }> = ({ game }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all h-full">
        <div className="h-36 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-center bg-cover transition-transform hover:scale-110 duration-500"
            style={{ 
              backgroundImage: `url(${game.imageUrl || 'https://via.placeholder.com/300x200?text=Slot+Game'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {game.featured && (
            <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Star className="w-3 h-3 mr-1" /> Featured
            </div>
          )}
          
          {game.newRelease && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              New
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="text-lg font-bold mb-1 truncate">{game.name}</h3>
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 h-8">{game.description}</p>
          
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>RTP: {game.rtp}%</span>
            <span>Max: {game.maxMultiplier}x</span>
          </div>
          
          <Link href={`/games/${game.slug}`}>
            <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0] text-sm">
              Play Now
            </Button>
          </Link>
          
          <div className="mt-2 text-center text-xs text-gray-500">
            {game.activePlayers} players
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main SlotsPage component
const SlotsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Fetch slot games
  const { data: slotGames, isLoading, error } = useQuery<SlotGame[]>({
    queryKey: ['/api/slots/games'],
    queryFn: async () => {
      // For now, we'll use a placeholder while we build the API
      // This will be replaced with actual API fetching
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Placeholder data for first 5 slot games
      return [
        {
          id: 101,
          name: "Cosmic Spins",
          slug: "cosmic-spins",
          description: "Explore the cosmos and match planets to win stellar prizes in this space-themed adventure",
          imageUrl: "/assets/slots/cosmic-spins.jpg",
          category: "Space & Sci-Fi",
          featured: true,
          newRelease: true,
          rtp: 96.5,
          maxMultiplier: 1000,
          minBet: 0.1,
          maxBet: 100,
          activePlayers: 142
        },
        {
          id: 102,
          name: "Temple Quest",
          slug: "temple-quest",
          description: "Navigate ancient ruins and discover hidden treasures while avoiding deadly traps",
          imageUrl: "/assets/slots/temple-quest.jpg",
          category: "Adventure",
          featured: true,
          newRelease: false,
          rtp: 95.8,
          maxMultiplier: 750,
          minBet: 0.1,
          maxBet: 100,
          activePlayers: 98
        },
        {
          id: 103,
          name: "Dragon's Gold",
          slug: "dragons-gold",
          description: "Face fierce dragons and win their treasured hoards in this fantasy adventure",
          imageUrl: "/assets/slots/dragons-gold.jpg",
          category: "Fantasy",
          featured: false,
          newRelease: true,
          rtp: 97.2,
          maxMultiplier: 888,
          minBet: 0.1,
          maxBet: 100,
          activePlayers: 117
        },
        {
          id: 104,
          name: "Lucky Sevens",
          slug: "lucky-sevens",
          description: "A classic slot experience with a modern twist. Match 7s for incredible multipliers!",
          imageUrl: "/assets/slots/lucky-sevens.jpg",
          category: "Classic",
          featured: false,
          newRelease: false,
          rtp: 94.5,
          maxMultiplier: 777,
          minBet: 0.1,
          maxBet: 100,
          activePlayers: 205
        },
        {
          id: 105,
          name: "Football Frenzy",
          slug: "football-frenzy",
          description: "Score big wins with this soccer-themed slot featuring exciting penalty shootout bonus rounds",
          imageUrl: "/assets/slots/football-frenzy.jpg",
          category: "Sports",
          featured: false,
          newRelease: true,
          rtp: 96.1,
          maxMultiplier: 500,
          minBet: 0.1,
          maxBet: 100,
          activePlayers: 86
        }
      ];
    }
  });
  
  // Filter games based on search query and category
  const filteredGames = slotGames?.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' ||
                            (selectedCategory === 'Featured' && game.featured) ||
                            (selectedCategory === 'New Releases' && game.newRelease) ||
                            game.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle errors
  if (error) {
    toast({
      title: "Error loading slot games",
      description: "Could not load slot games. Please try again later.",
      variant: "destructive"
    });
  }
  
  return (
    <div className="min-h-screen bg-[#0A1821] text-white pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0F212E] to-[#1E3A5F] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Slot Games Collection</h1>
          <p className="text-blue-300 text-xl">Explore our diverse range of exciting slot games</p>
          
          {/* Search and Filter Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search for slot games..."
                className="pl-10 bg-[#0A1821] border-[#243442] text-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              className="bg-[#1375e1] hover:bg-[#1060c0] text-white border-[#1375e1]"
              onClick={() => {
                const featuredSection = document.getElementById('featured-slots');
                if (featuredSection) {
                  window.scrollTo({ top: featuredSection.offsetTop - 100, behavior: 'smooth' });
                }
              }}
            >
              <Trophy className="w-4 h-4 mr-2" /> 
              Featured Slots
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Category Tabs */}
        <Tabs defaultValue="All" className="mb-8">
          <TabsList className="bg-[#0F212E] border border-[#243442] p-1 overflow-x-auto flex flex-nowrap whitespace-nowrap max-w-full scrollbar-hide">
            {CATEGORIES.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setSelectedCategory(category)}
                className="data-[state=active]:bg-[#1375e1] data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-[#1375e1]" />
                <p className="mt-4 text-lg text-gray-300">Loading slot games...</p>
              </div>
            ) : filteredGames?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-300">No slot games found matching your criteria.</p>
                <Button 
                  variant="link" 
                  className="text-[#1375e1] mt-2"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredGames?.map((game) => (
                  <SlotGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Featured Slots Section */}
        <section id="featured-slots" className="mb-12">
          <div className="flex items-center mb-4">
            <Trophy className="text-[#1375e1] mr-2" />
            <h2 className="text-2xl font-bold">Featured Slots</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="bg-[#0F212E] border-[#243442] animate-pulse h-64">
                  <div className="h-36 bg-[#162431]"></div>
                  <CardContent className="p-3">
                    <div className="h-5 bg-[#162431] rounded mb-3"></div>
                    <div className="h-8 bg-[#162431] rounded mb-3"></div>
                    <div className="h-8 bg-[#162431] rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              slotGames?.filter(game => game.featured).map(game => (
                <SlotGameCard key={game.id} game={game} />
              ))
            )}
          </div>
        </section>
        
        {/* New Releases Section */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <div className="bg-emerald-500 h-3 w-3 rounded-full mr-2"></div>
            <h2 className="text-2xl font-bold">New Releases</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-[#0F212E] border-[#243442] animate-pulse h-64">
                  <div className="h-36 bg-[#162431]"></div>
                  <CardContent className="p-3">
                    <div className="h-5 bg-[#162431] rounded mb-3"></div>
                    <div className="h-8 bg-[#162431] rounded mb-3"></div>
                    <div className="h-8 bg-[#162431] rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              slotGames?.filter(game => game.newRelease).map(game => (
                <SlotGameCard key={game.id} game={game} />
              ))
            )}
          </div>
        </section>
        
        {/* All Categories Section */}
        <section>
          <div className="flex items-center mb-4">
            <div className="bg-[#1375e1] h-3 w-3 rounded-full mr-2"></div>
            <h2 className="text-2xl font-bold">All Categories</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.slice(2).map((category) => (
              <Card 
                key={category} 
                className="bg-[#0F212E] border-[#243442] hover:border-[#1375e1] cursor-pointer transition-all"
                onClick={() => {
                  setSelectedCategory(category);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <h3 className="font-bold text-lg">{category}</h3>
                  <div className="bg-[#1375e1] h-8 w-8 rounded-full flex items-center justify-center">
                    {(slotGames ? slotGames.filter(game => 
                      category === 'Featured' ? game.featured : 
                      category === 'New Releases' ? game.newRelease : 
                      game.category === category
                    ).length : 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SlotsPage;