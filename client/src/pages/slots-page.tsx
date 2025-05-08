import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  GridIcon, 
  ListIcon,
  ArrowUpDown, 
  Star, 
  Clock, 
  Gamepad2, 
  Rocket, 
  Mountain, 
  Castle, 
  Trophy, 
  Crown, 
  Sparkles 
} from 'lucide-react';

// Type definition for slot games
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

// Theme object with icons
const themes = [
  { id: 'all', name: 'All Games', icon: <Gamepad2 size={18} /> },
  { id: 'space', name: 'Space & Sci-Fi', icon: <Rocket size={18} /> },
  { id: 'adventure', name: 'Adventure', icon: <Mountain size={18} /> },
  { id: 'fantasy', name: 'Fantasy', icon: <Castle size={18} /> },
  { id: 'sports', name: 'Sports', icon: <Trophy size={18} /> },
  { id: 'classic', name: 'Classic', icon: <Crown size={18} /> },
  { id: 'aztec', name: 'Aztec', icon: <Mountain size={18} /> },
  { id: 'celestial', name: 'Celestial', icon: <Sparkles size={18} /> },
  { id: 'seasonal', name: 'Seasonal', icon: <Sparkles size={18} /> }
];

// GameCard component for displaying individual slot games
const SlotCard: React.FC<{ game: SlotGame }> = ({ game }) => {
  const [location, setLocation] = useLocation();
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <motion.div
      className="cursor-pointer relative overflow-hidden"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      onClick={() => setLocation(`/slots/${game.slug}`)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-lg">
        {/* Game image or placeholder */}
        <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {game.imageUrl ? (
            <img 
              src={game.imageUrl} 
              alt={game.name} 
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-5xl">
                {game.theme === 'space' ? '🚀' : 
                 game.theme === 'adventure' ? '🏺' : 
                 game.theme === 'fantasy' ? '🐉' : 
                 game.theme === 'classic' ? '7️⃣' : 
                 game.theme === 'sports' ? '⚽' : 
                 game.theme === 'aztec' ? '🗿' :
                 game.theme === 'celestial' ? '☀️' : '🎰'}
              </div>
            </div>
          )}
          
          {/* Live badge */}
          {game.activePlayers > 1000 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium flex items-center">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75 mr-1.5"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 mr-1"></span>
              LIVE
            </div>
          )}
          
          {/* Theme badge */}
          {game.theme && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-slate-800/80 backdrop-blur-sm border-slate-700 text-xs">
                {game.theme.charAt(0).toUpperCase() + game.theme.slice(1)}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Game info */}
        <div className="p-3">
          <h3 className="font-semibold text-white truncate">{game.name}</h3>
          
          {/* Game details */}
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-400">
              RTP {game.rtp.toFixed(1)}%
            </span>
            <span className="text-green-500 font-medium">
              {game.maxMultiplier}x
            </span>
          </div>
          
          {/* Player count */}
          <div className="mt-2 text-xs text-slate-500">
            {game.activePlayers.toLocaleString()} players
          </div>
        </div>
        
        {/* Play button overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0"
          animate={{ opacity: isHovering ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            Play Now
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ListCard component for list view
const SlotListCard: React.FC<{ game: SlotGame }> = ({ game }) => {
  const [location, setLocation] = useLocation();
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="cursor-pointer"
      onClick={() => setLocation(`/slots/${game.slug}`)}
    >
      <div className="bg-slate-900 rounded-lg overflow-hidden shadow-md p-3 flex items-center">
        {/* Game icon */}
        <div className="h-12 w-12 mr-3 bg-slate-800 rounded-md flex items-center justify-center flex-shrink-0">
          <div className="text-2xl">
            {game.theme === 'space' ? '🚀' : 
             game.theme === 'adventure' ? '🏺' : 
             game.theme === 'fantasy' ? '🐉' : 
             game.theme === 'classic' ? '7️⃣' : 
             game.theme === 'sports' ? '⚽' :
             game.theme === 'aztec' ? '🗿' :
             game.theme === 'celestial' ? '☀️' : '🎰'}
          </div>
        </div>
        
        {/* Game details */}
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-white truncate">{game.name}</h3>
          <div className="flex items-center text-xs text-slate-400 mt-1">
            <span className="mr-2">RTP {game.rtp.toFixed(1)}%</span>
            <span className="text-green-500 font-medium mr-2">{game.maxMultiplier}x</span>
            <span>{game.activePlayers.toLocaleString()} players</span>
          </div>
        </div>
        
        {/* Theme badge */}
        {game.theme && (
          <Badge variant="outline" className="ml-3 bg-slate-800 border-slate-700">
            {game.theme.charAt(0).toUpperCase() + game.theme.slice(1)}
          </Badge>
        )}
        
        {/* Play button */}
        <Button variant="default" size="sm" className="ml-3 bg-blue-600 hover:bg-blue-700">
          Play
        </Button>
      </div>
    </motion.div>
  );
};

// Skeleton loader for games in grid view
const SkeletonCard: React.FC = () => (
  <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
    <Skeleton className="aspect-video w-full bg-slate-800" />
    <div className="p-3">
      <Skeleton className="h-5 w-3/4 bg-slate-800 mb-2" />
      <Skeleton className="h-4 w-1/2 bg-slate-800 mb-1" />
      <Skeleton className="h-3 w-1/3 bg-slate-800" />
    </div>
  </div>
);

// Skeleton loader for games in list view
const SkeletonListCard: React.FC = () => (
  <div className="bg-slate-900 rounded-lg p-3 flex items-center">
    <Skeleton className="h-12 w-12 rounded-md bg-slate-800 mr-3" />
    <div className="flex-grow">
      <Skeleton className="h-5 w-3/4 bg-slate-800 mb-2" />
      <Skeleton className="h-3 w-1/2 bg-slate-800" />
    </div>
    <Skeleton className="h-8 w-16 rounded-md bg-slate-800 ml-3" />
  </div>
);

const SlotsPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recentlyPlayed, setRecentlyPlayed] = useState<SlotGame[]>([]);
  const [favorites, setFavorites] = useState<SlotGame[]>([]);
  
  // Fetch all slot games
  const { data: allGames = [], isLoading } = useQuery({
    queryKey: ['/api/slots/games'],
    staleTime: 60000, // 1 minute
  });
  
  // Log received games data for debugging
  console.log('Received slot games data:', allGames);
  
  // Filter and sort games
  const filteredGames = allGames.filter((game: SlotGame) => {
    // Theme filter
    const themeMatch = selectedTheme === 'all' || game.theme === selectedTheme;
    
    // Search filter
    const searchMatch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return themeMatch && searchMatch;
  });
  
  // Sort games
  const sortedGames = [...filteredGames].sort((a: SlotGame, b: SlotGame) => {
    switch(sortBy) {
      case 'popular':
        return b.activePlayers - a.activePlayers;
      case 'rtp':
        return b.rtp - a.rtp;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'multiplier':
        return b.maxMultiplier - a.maxMultiplier;
      default:
        return 0;
    }
  });
  
  // Mock data for recently played and favorites
  useEffect(() => {
    if (allGames.length > 0) {
      // Simulate recently played games (this would come from user session or API in production)
      setRecentlyPlayed(allGames.slice(0, 4));
      
      // Simulate favorite games (this would come from user preferences in production)
      setFavorites([allGames[0], allGames[2]]);
    }
  }, [allGames]);
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Slot Games</h1>
          <p className="text-slate-400">
            Explore our collection of thrilling slot games with exciting themes and big win potential.
          </p>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6 bg-slate-900">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-700">All Games</TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-blue-700">Recently Played</TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-blue-700">Favorites</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
            {/* Sidebar for filters - hidden on mobile */}
            <div className="hidden md:block space-y-6">
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-1">
                  {themes.map(theme => (
                    <Button
                      key={theme.id}
                      variant={selectedTheme === theme.id ? "default" : "ghost"}
                      className={`w-full justify-start ${selectedTheme === theme.id ? 'bg-blue-700 hover:bg-blue-800' : ''}`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div className="mr-2">{theme.icon}</div>
                      {theme.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="font-medium mb-3">Popular Features</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="mr-2">🎡</div>
                    Free Spins
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="mr-2">💰</div>
                    Jackpot
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="mr-2">⚡</div>
                    Megaways
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="mr-2">🃏</div>
                    Bonus Rounds
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div>
              <TabsContent value="all" className="mt-0">
                {/* Search and filter controls */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 text-slate-500 h-4 w-4" />
                    <Input
                      className="pl-9 bg-slate-900 border-slate-800"
                      placeholder="Search slot games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
                        <div className="flex items-center">
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Sort by" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rtp">Highest RTP</SelectItem>
                        <SelectItem value="multiplier">Max Multiplier</SelectItem>
                        <SelectItem value="name">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex rounded-md overflow-hidden">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-r-none border-r-0 ${viewMode === 'grid' ? 'bg-blue-700' : 'bg-slate-900 border-slate-800'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <GridIcon size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-l-none ${viewMode === 'list' ? 'bg-blue-700' : 'bg-slate-900 border-slate-800'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <ListIcon size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Mobile category filters */}
                <ScrollArea className="md:hidden pb-4 mb-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {themes.map(theme => (
                      <Button
                        key={theme.id}
                        variant={selectedTheme === theme.id ? "default" : "outline"}
                        className={`flex-shrink-0 ${selectedTheme === theme.id ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-900 border-slate-800'}`}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <div className="mr-2">{theme.icon}</div>
                        {theme.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Games grid or list */}
                {isLoading ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SkeletonListCard key={i} />
                      ))}
                    </div>
                  )
                ) : sortedGames.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 rounded-lg">
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-xl font-medium mb-2">No games found</h3>
                    <p className="text-slate-400">
                      No games match your current filters. Try adjusting your search criteria.
                    </p>
                    <Button 
                      variant="default"
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTheme('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sortedGames.map((game: SlotGame) => (
                        <SlotCard key={game.id} game={game} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedGames.map((game: SlotGame) => (
                        <SlotListCard key={game.id} game={game} />
                      ))}
                    </div>
                  )
                )}
              </TabsContent>
              
              {/* Recently played tab */}
              <TabsContent value="recent" className="mt-0">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    <Clock size={18} className="inline mr-2" />
                    Recently Played
                  </h2>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : recentlyPlayed.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 rounded-lg">
                    <div className="text-4xl mb-3">⏰</div>
                    <h3 className="text-xl font-medium mb-2">No recent games</h3>
                    <p className="text-slate-400">
                      You haven't played any slot games recently.
                    </p>
                    <Button 
                      variant="default"
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setLocation('/slots')}
                    >
                      Browse Games
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentlyPlayed.map((game: SlotGame) => (
                      <SlotCard key={game.id} game={game} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Favorites tab */}
              <TabsContent value="favorites" className="mt-0">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    <Star size={18} className="inline mr-2" />
                    Your Favorites
                  </h2>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 rounded-lg">
                    <div className="text-4xl mb-3">⭐</div>
                    <h3 className="text-xl font-medium mb-2">No favorite games</h3>
                    <p className="text-slate-400">
                      You haven't added any slot games to your favorites yet.
                    </p>
                    <Button 
                      variant="default"
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setLocation('/slots')}
                    >
                      Browse Games
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {favorites.map((game: SlotGame) => (
                      <SlotCard key={game.id} game={game} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SlotsPage;