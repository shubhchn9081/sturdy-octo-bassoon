import React, { useEffect, Suspense, lazy } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Star, StarOff, Share2, TrendingUp, AlertTriangle, HelpCircle, BarChart4 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Dynamic imports for slot games
const CosmicSpins = lazy(() => import('@/games/slots/CosmicSpins'));
const TempleQuest = lazy(() => import('@/games/slots/TempleQuest'));
const LuckySevens = lazy(() => import('@/games/slots/LuckySevens'));
const DragonsGold = lazy(() => import('@/games/slots/DragonsGold'));
const FootballFrenzy = lazy(() => import('@/games/slots/FootballFrenzy'));

// Map of game slugs to components
const gameComponentMap: Record<string, React.ComponentType<any>> = {
  'cosmic-spins': CosmicSpins,
  'temple-quest': TempleQuest,
  'lucky-sevens': LuckySevens,
  'dragons-gold': DragonsGold,
  'football-frenzy': FootballFrenzy
};

// Map of slug to gameId to match API expectations
const gameIdMap: Record<string, number> = {
  'cosmic-spins': 101,
  'temple-quest': 102,
  'lucky-sevens': 103,
  'dragons-gold': 104,
  'football-frenzy': 105
};

const SlotGamePage: React.FC = () => {
  const [match, params] = useRoute<{ gameSlug: string }>('/slots/:gameSlug');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const gameSlug = params?.gameSlug;
  const gameId = gameIdMap[gameSlug ?? ''] || 0;
  
  // Fetch game details
  const { 
    data: game, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/slots/games', gameId],
    enabled: !!gameId,
    retry: 1
  });
  
  // Fetch bet history for the game
  const {
    data: betHistory = [],
    isLoading: isLoadingHistory
  } = useQuery({
    queryKey: ['/api/slots/history', gameId],
    enabled: !!gameId,
    retry: 1
  });
  
  useEffect(() => {
    // Check if the game slug is valid
    if (!match || !gameComponentMap[gameSlug ?? '']) {
      setLocation('/slots');
      toast({
        title: "Game not found",
        description: "The requested slot game doesn't exist.",
        variant: "destructive"
      });
    }
  }, [match, gameSlug, setLocation, toast]);
  
  const handleBack = () => {
    setLocation('/slots');
  };
  
  const handleToggleFavorite = () => {
    if (!game) return;
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${game.name} has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
      duration: 3000
    });
  };
  
  const handleShareGame = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.name || 'Awesome Slot Game',
        text: game?.description || 'Check out this amazing slot game!',
        url: window.location.href
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Game link has been copied to clipboard.",
        duration: 3000
      });
    }
  };
  
  // Mock favorited status (could be fetched from API in a real implementation)
  const isFavorite = false;
  
  // If game is not found
  if (!match || !gameComponentMap[gameSlug ?? '']) {
    return null; // Redirect handled in useEffect
  }
  
  // Render game component based on slug
  const GameComponent = gameComponentMap[gameSlug ?? ''];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="bg-slate-900 border-slate-800 hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
            </Button>
            
            {isLoading ? (
              <Skeleton className="h-8 w-60 bg-slate-800" />
            ) : (
              <h1 className="text-2xl font-bold">{game?.name || gameSlug}</h1>
            )}
            
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleFavorite}
                className="bg-slate-900 border-slate-800 hover:bg-slate-800"
              >
                {isFavorite ? <StarOff size={18} /> : <Star size={18} />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareGame}
                className="bg-slate-900 border-slate-800 hover:bg-slate-800"
              >
                <Share2 size={18} />
              </Button>
            </div>
          </div>
          
          {!isLoading && game && (
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge variant="secondary">{game.type}</Badge>
              {game.theme && <Badge variant="outline">{game.theme}</Badge>}
              <Badge variant="outline" className="bg-green-900/50 text-green-400 border-green-700">
                RTP {game.rtp?.toFixed(2)}%
              </Badge>
              <Badge variant="outline" className="bg-blue-900/50 text-blue-400 border-blue-700">
                Max Win {game.maxMultiplier}x
              </Badge>
              <Badge variant="outline" className="bg-slate-900 border-slate-800">
                <TrendingUp size={14} className="mr-1" /> 
                {game.activePlayers?.toLocaleString()} playing
              </Badge>
            </div>
          )}
          
          {isLoading && (
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-7 w-20 bg-slate-800" />
              <Skeleton className="h-7 w-24 bg-slate-800" />
              <Skeleton className="h-7 w-28 bg-slate-800" />
            </div>
          )}
        </div>
        
        {/* Main game area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Game container */}
          <div className="md:col-span-8 lg:col-span-9 bg-slate-900 rounded-xl overflow-hidden shadow-xl">
            <div className="w-full aspect-video relative">
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }>
                <GameComponent />
              </Suspense>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <Tabs defaultValue="bet-history" className="w-full">
              <TabsList className="w-full bg-slate-900 p-1">
                <TabsTrigger value="bet-history" className="flex-1">History</TabsTrigger>
                <TabsTrigger value="game-info" className="flex-1">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bet-history" className="mt-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Your Bet History</h3>
                  
                  {isLoadingHistory ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full bg-slate-800" />
                      ))}
                    </div>
                  ) : betHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <BarChart4 size={36} className="mx-auto mb-2 opacity-50" />
                      <p>No bet history yet</p>
                      <p className="text-sm">Play to see your results here</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-800">
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Mult</TableHead>
                            <TableHead className="text-slate-400">Profit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {betHistory.map((bet: any) => (
                            <TableRow key={bet.id} className="border-slate-800">
                              <TableCell>{formatCurrency(bet.amount)}</TableCell>
                              <TableCell>{bet.multiplier}x</TableCell>
                              <TableCell className={bet.profit > 0 ? 'text-green-500' : 'text-red-500'}>
                                {bet.profit > 0 ? '+' : ''}{formatCurrency(bet.profit)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="game-info" className="mt-4">
                <div className="bg-slate-900 rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Game Info</h3>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-slate-800" />
                        <Skeleton className="h-4 w-full bg-slate-800" />
                        <Skeleton className="h-4 w-3/4 bg-slate-800" />
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">{game?.description || 'A thrilling slot machine game with exciting features and big win potential.'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Game Details</h4>
                    
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full bg-slate-800" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Provider:</span>
                          <span>Stake Originals</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">RTP:</span>
                          <span>{game?.rtp?.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Min Bet:</span>
                          <span>{formatCurrency(game?.minBet || 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Max Bet:</span>
                          <span>{formatCurrency(game?.maxBet || 10000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Max Win:</span>
                          <span>{game?.maxMultiplier}x</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <HelpCircle size={16} />
                      <h4 className="font-medium">Help & Support</h4>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      Having issues with this game? Our support team is available 24/7 to help.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full bg-slate-800 border-slate-700"
                      onClick={() => setLocation('/support')}
                    >
                      Contact Support
                    </Button>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertTriangle size={16} />
                      <h4 className="font-medium">Responsible Gaming</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Please gamble responsibly. Gambling can be addictive and may result in financial loss.
                      Play within your limits and take breaks when needed.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Recommended games */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Similar Games You Might Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
                onClick={() => {
                  const slugs = Object.keys(gameComponentMap);
                  const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
                  if (randomSlug !== gameSlug) {
                    setLocation(`/slots/${randomSlug}`);
                  }
                }}
              >
                <div className="bg-slate-900 rounded-lg overflow-hidden shadow-md">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    {isLoading ? (
                      <Skeleton className="w-full h-full bg-slate-800" />
                    ) : (
                      <div className="text-3xl">{["🎰", "🎮", "🎯", "🎲", "🎪"][i]}</div>
                    )}
                  </div>
                  <div className="p-2">
                    {isLoading ? (
                      <Skeleton className="h-5 w-full bg-slate-800 mb-1" />
                    ) : (
                      <h3 className="font-medium text-sm truncate">
                        {["Imperial Riches", "Golden Colts", "Wild Swarm", "Gem Drop", "Jungle Spirit"][i]}
                      </h3>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">RTP 96.1%</span>
                      <span className="text-green-500">5x</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotGamePage;