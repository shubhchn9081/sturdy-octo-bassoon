import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchIcon, FilterIcon, StarIcon, HistoryIcon, TrendingUpIcon, Gamepad2Icon as SlotMachineIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Define slot game types
interface SlotGame {
  id: number;
  name: string;
  slug: string;
  type: string;
  theme?: string;
  imageUrl?: string | null;
  rtp: number;
  activePlayers: number;
  minBet: number;
  maxBet: number;
  maxMultiplier: number;
}

// Slot game categories
const categories = [
  { id: 'all', name: 'All Slots' },
  { id: 'space', name: 'Space & Sci-Fi' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'classic', name: 'Classic' },
  { id: 'sports', name: 'Sports' },
  { id: 'seasonal', name: 'Seasonal' },
  { id: 'luxury', name: 'Luxury' },
];

// SlotCard component for individual slot game display
const SlotCard: React.FC<{ game: SlotGame }> = ({ game }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Function to determine theme-based gradient background
  const getThemeGradient = (theme?: string): string => {
    switch (theme?.toLowerCase()) {
      case 'space':
        return 'from-blue-900 via-indigo-800 to-purple-900';
      case 'adventure':
        return 'from-amber-700 via-orange-600 to-yellow-700';
      case 'fantasy':
        return 'from-emerald-800 via-teal-700 to-cyan-800';
      case 'classic':
        return 'from-red-800 via-rose-700 to-pink-800';
      case 'sports':
        return 'from-green-800 via-emerald-700 to-teal-800';
      case 'seasonal':
        return 'from-blue-700 via-cyan-600 to-sky-700';
      case 'luxury':
        return 'from-amber-900 via-yellow-800 to-orange-900';
      default:
        return 'from-gray-800 via-slate-700 to-gray-900';
    }
  };

  // Determine if the game is played frequently
  const isPopular = game.activePlayers > 5000;
  // Determine if the game has a high RTP (Return to Player)
  const isHighRTP = game.rtp > 97;

  const handlePlayNow = () => {
    // Navigate to the specific slot game page
    setLocation(`/slots/${game.slug}`);
  };

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Added to favorites",
      description: `${game.name} has been added to your favorites.`,
      duration: 3000,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full flex flex-col overflow-hidden border border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 bg-slate-900">
        <div 
          className={`relative h-40 overflow-hidden ${game.imageUrl ? '' : 'bg-gradient-to-br ' + getThemeGradient(game.theme)}`}
        >
          {game.imageUrl ? (
            <img 
              src={game.imageUrl} 
              alt={game.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <SlotMachineIcon size={64} className="text-white/70" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isPopular && (
              <Badge className="bg-amber-600 hover:bg-amber-700">
                <TrendingUpIcon size={14} className="mr-1" /> Popular
              </Badge>
            )}
            {isHighRTP && (
              <Badge className="bg-green-600 hover:bg-green-700">
                High RTP
              </Badge>
            )}
          </div>
        </div>
        
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-white">{game.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-amber-400 hover:text-amber-300 hover:bg-slate-800"
              onClick={handleAddToFavorites}
            >
              <StarIcon size={16} />
            </Button>
          </div>
          <CardDescription className="text-xs text-slate-400">
            {game.type} • RTP {game.rtp}% • Max {game.maxMultiplier}x
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-2 px-4 text-sm text-slate-300 flex-grow">
          <div className="flex items-center justify-between mb-1">
            <span>Min bet:</span>
            <span className="font-semibold">₹{game.minBet}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Max bet:</span>
            <span className="font-semibold">₹{game.maxBet}</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-3">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={handlePlayNow}
          >
            Play Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Main SlotsPage component
const SlotsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const { toast } = useToast();

  // Fetch all slot games
  const { data: allGames = [], isLoading, error } = useQuery({
    queryKey: ['/api/slots/games'],
    retry: 1,
  });

  // Filter the games based on search, category, and sort options
  const filteredGames = React.useMemo(() => {
    if (!Array.isArray(allGames)) return [];

    let filtered = [...allGames] as SlotGame[];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.theme?.toLowerCase() === selectedCategory);
    }

    // Apply sorting
    switch (sortOption) {
      case 'popular':
        filtered.sort((a, b) => b.activePlayers - a.activePlayers);
        break;
      case 'newest':
        // For now, sort by ID (assuming higher ID = newer)
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'a-z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'highest-rtp':
        filtered.sort((a, b) => b.rtp - a.rtp);
        break;
      default:
        // No sorting
        break;
    }

    return filtered;
  }, [allGames, searchQuery, selectedCategory, sortOption]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-center items-center">
        <h2 className="text-xl text-red-500 mb-4">Error loading slot games</h2>
        <p className="text-slate-400">{(error as Error).message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Slot Games</h1>
            <p className="text-slate-400 mt-1">Explore our collection of immersive slot games</p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="bg-slate-900 border-slate-700 hover:bg-slate-800">
              <StarIcon size={16} className="mr-2" />
              Favorites
            </Button>
            <Button variant="outline" className="bg-slate-900 border-slate-700 hover:bg-slate-800">
              <HistoryIcon size={16} className="mr-2" />
              Recently Played
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search slot games..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 bg-slate-900 border-slate-700 focus:border-blue-500"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-slate-900 border-slate-700 hover:bg-slate-800">
                <FilterIcon size={16} className="mr-2" />
                Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-700 text-white">
              <DropdownMenuItem onClick={() => handleSortChange('popular')} className={sortOption === 'popular' ? 'bg-slate-800' : ''}>
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('newest')} className={sortOption === 'newest' ? 'bg-slate-800' : ''}>
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('highest-rtp')} className={sortOption === 'highest-rtp' ? 'bg-slate-800' : ''}>
                Highest RTP
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('a-z')} className={sortOption === 'a-z' ? 'bg-slate-800' : ''}>
                A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('z-a')} className={sortOption === 'z-a' ? 'bg-slate-800' : ''}>
                Z-A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={handleCategoryChange}>
          <TabsList className="bg-slate-900 p-1 overflow-x-auto flex flex-nowrap overflow-y-hidden custom-scrollbar" style={{ maxWidth: '100%' }}>
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="whitespace-nowrap min-w-fit px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Tab content - we'll handle this with a single content block for all categories */}
          <TabsContent value={selectedCategory} className="mt-6">
            {filteredGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-slate-900 p-4 rounded-full mb-4">
                  <SlotMachineIcon size={48} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Slots Found</h3>
                <p className="text-slate-400 text-center max-w-md">
                  {searchQuery 
                    ? `No results matching "${searchQuery}". Try a different search term.` 
                    : `No slot games found in the "${categories.find(c => c.id === selectedCategory)?.name}" category.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredGames.map(game => (
                  <SlotCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SlotsPage;