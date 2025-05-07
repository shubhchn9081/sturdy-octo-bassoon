import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, InfoIcon, StarIcon, HistoryIcon, VolumeIcon, Volume2Icon, Gamepad2Icon as SlotMachineIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all slot game components
import CosmicSpins from '@/games/slots/CosmicSpins';
import TempleQuest from '@/games/slots/TempleQuest';
import DragonsGold from '@/games/slots/DragonsGold';
import LuckySevens from '@/games/slots/LuckySevens';
import FootballFrenzy from '@/games/slots/FootballFrenzy';

// Map of slot game slugs to their components
const slotGameComponents: Record<string, React.FC> = {
  'cosmic-spins': CosmicSpins,
  'temple-quest': TempleQuest,
  'dragons-gold': DragonsGold,
  'lucky-sevens': LuckySevens,
  'football-frenzy': FootballFrenzy,
};

const SlotGamePage: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const [location, setLocation] = useLocation();
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('game');
  const { toast } = useToast();
  
  // Fetch game details
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/games'],
    retry: 1,
  });
  
  // Find the specific game based on the slug
  const game = Array.isArray(games) ? games.find((g) => g.slug === gameSlug) : null;
  
  // Fetch bet history for this game
  const { data: bets = [], isLoading: betsLoading } = useQuery<any[]>({
    queryKey: ['/api/bets/history', game?.id],
    enabled: !!game?.id,
    retry: 1,
  });
  
  // Get the appropriate game component
  const GameComponent = slotGameComponents[gameSlug];
  
  // Handle back button
  const handleBack = () => {
    setLocation('/slots');
  };
  
  // Handle volume toggle
  const handleVolumeToggle = () => {
    setMuted(!muted);
    toast({
      title: muted ? "Sound enabled" : "Sound muted",
      duration: 2000,
    });
  };
  
  // Handle add to favorites
  const handleAddToFavorites = () => {
    toast({
      title: "Added to favorites",
      description: `${game?.name} has been added to your favorites.`,
      duration: 3000,
    });
  };
  
  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
          <p className="text-slate-400 mb-6">The slot game "{gameSlug}" doesn't exist or hasn't been implemented yet.</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Slots
          </Button>
        </div>
      </div>
    );
  }
  
  if (gamesLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-[#10171e] border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{game?.name || 'Slot Game'}</h1>
              <p className="text-sm text-slate-400">
                RTP: {game?.rtp || 96}% • Max Win: {game?.maxMultiplier || 'x100'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={handleAddToFavorites}
            >
              <StarIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
              onClick={handleVolumeToggle}
            >
              {muted ? <VolumeIcon className="h-5 w-5" /> : <Volume2Icon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-slate-900">
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="history">Bet History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="game" className="mt-0">
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#0a101a]">
              <div className="h-[70vh] md:h-[75vh]">
                <GameComponent />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info" className="mt-0">
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#0a101a] p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <InfoIcon className="mr-2 h-5 w-5 text-blue-400" />
                About {game?.name}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">Game Details</h3>
                  <p className="text-slate-300 mb-4">
                    Experience the thrill of {game?.name}, a captivating slot game with exciting features and big win potential.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-md">
                      <p className="text-slate-400 text-sm">RTP</p>
                      <p className="font-semibold">{game?.rtp || 96}%</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-md">
                      <p className="text-slate-400 text-sm">Min Bet</p>
                      <p className="font-semibold">₹{game?.minBet || 100}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-md">
                      <p className="text-slate-400 text-sm">Max Bet</p>
                      <p className="font-semibold">₹{game?.maxBet || 10000}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-md">
                      <p className="text-slate-400 text-sm">Max Multiplier</p>
                      <p className="font-semibold">{game?.maxMultiplier || 100}x</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-md">
                      <p className="text-slate-400 text-sm">Active Players</p>
                      <p className="font-semibold">{game?.activePlayers || 0}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-md">
                      <p className="text-slate-400 text-sm">Type</p>
                      <p className="font-semibold">{game?.type || 'Slot'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">How to Play</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-300">
                    <li>Set your bet amount using the controls at the bottom</li>
                    <li>Select your lucky symbol for additional win chances</li>
                    <li>Click the Spin button to play</li>
                    <li>Match symbols for winning combinations</li>
                    <li>Three of the same symbol pays out according to the paytable</li>
                    <li>Your lucky symbol appears in any position for an extra win</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">Bonus Features</h3>
                  <p className="text-slate-300 mb-2">
                    This game includes several exciting bonus features:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span className="font-semibold">Lucky Symbol:</span> Choose a symbol that pays additional wins when it appears</li>
                    <li><span className="font-semibold">Auto Spin:</span> Let the game play automatically with your chosen settings</li>
                    <li><span className="font-semibold">Provably Fair:</span> All results are verifiable for complete transparency</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#0a101a] p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <HistoryIcon className="mr-2 h-5 w-5 text-blue-400" />
                Your Bet History
              </h2>
              
              {betsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : bets.length === 0 ? (
                <div className="text-center p-8 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400">No bet history found for this game</p>
                  <p className="text-sm text-slate-500 mt-2">Your recent bets will appear here after you play</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-800 text-left">
                        <th className="pb-3 pr-2 font-semibold text-slate-400">Date</th>
                        <th className="pb-3 px-2 font-semibold text-slate-400">Bet Amount</th>
                        <th className="pb-3 px-2 font-semibold text-slate-400">Multiplier</th>
                        <th className="pb-3 px-2 font-semibold text-slate-400">Profit</th>
                        <th className="pb-3 pl-2 font-semibold text-slate-400">Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bets.map((bet: any, index: number) => (
                        <tr key={index} className="border-b border-slate-800/50">
                          <td className="py-3 pr-2 text-sm">
                            {new Date(bet.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-sm">₹{bet.amount}</td>
                          <td className="py-3 px-2 text-sm">{bet.multiplier}x</td>
                          <td className={`py-3 px-2 text-sm ${bet.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {bet.profit >= 0 ? '+' : ''}{bet.profit}
                          </td>
                          <td className="py-3 pl-2 text-sm">
                            {bet.profit >= 0 ? (
                              <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">Win</span>
                            ) : (
                              <span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded-full">Loss</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SlotGamePage;