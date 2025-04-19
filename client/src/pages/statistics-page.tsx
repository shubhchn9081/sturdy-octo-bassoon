import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Loader2, AlertCircle, TrendingUp, TrendingDown, Award, PieChart, DollarSign, Clock } from 'lucide-react';
import { Bet, Game } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

// Stats summary card component
const StatCard = ({ title, value, icon, description, trend = null }: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  description?: string,
  trend?: { value: number, isPositive: boolean } | null
}) => (
  <Card className="bg-[#0F212E] border-[#172B3A]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          
          {trend !== null && (
            <div className={`flex items-center mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-xs">{trend.value}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-[#172B3A] rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function StatisticsPage() {
  const { toast } = useToast();
  const [statsData, setStatsData] = useState({
    totalBets: 0,
    winCount: 0,
    lossCount: 0,
    totalWagered: 0,
    totalProfit: 0,
    winRate: 0,
    biggestWin: { amount: 0, game: '' },
    favoriteGame: { name: '', bets: 0 },
    profitByGame: [] as { name: string; profit: number }[],
    betsByDay: [] as { day: string; bets: number }[]
  });
  
  // Fetch bets for statistics
  const { data: bets, isLoading: betsLoading, error: betsError } = useQuery<Bet[]>({
    queryKey: ['/api/bets/history'],
  });
  
  // Fetch games for game names
  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });
  
  // Calculate statistics when bets and games data are available
  useEffect(() => {
    if (!bets || !games) return;
    
    // Calculate basic statistics
    const completedBets = bets.filter(bet => bet.completed);
    const winningBets = completedBets.filter(bet => bet.profit !== null && bet.profit > 0);
    const losingBets = completedBets.filter(bet => bet.profit !== null && bet.profit <= 0);
    
    const totalWagered = completedBets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalProfit = completedBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const winRate = completedBets.length > 0 ? (winningBets.length / completedBets.length) * 100 : 0;
    
    // Find biggest win
    let biggestWin = { amount: 0, game: '' };
    winningBets.forEach(bet => {
      if (bet.profit !== null && bet.profit > biggestWin.amount) {
        const game = games.find(g => g.id === bet.gameId);
        biggestWin = {
          amount: bet.profit,
          game: game ? game.name : 'Unknown Game'
        };
      }
    });
    
    // Find favorite game
    const gameCountMap = new Map<number, number>();
    bets.forEach(bet => {
      gameCountMap.set(bet.gameId, (gameCountMap.get(bet.gameId) || 0) + 1);
    });
    
    let favoriteGameId = 0;
    let favoriteGameBets = 0;
    
    gameCountMap.forEach((count, gameId) => {
      if (count > favoriteGameBets) {
        favoriteGameId = gameId;
        favoriteGameBets = count;
      }
    });
    
    const favoriteGame = {
      name: games.find(g => g.id === favoriteGameId)?.name || 'Unknown Game',
      bets: favoriteGameBets
    };
    
    // Calculate profit by game for pie chart
    const profitByGameMap = new Map<number, number>();
    
    completedBets.forEach(bet => {
      if (bet.profit === null) return;
      profitByGameMap.set(bet.gameId, (profitByGameMap.get(bet.gameId) || 0) + bet.profit);
    });
    
    const profitByGame = Array.from(profitByGameMap.entries()).map(([gameId, profit]) => ({
      name: games.find(g => g.id === gameId)?.name || 'Unknown Game',
      profit: profit
    }));
    
    // Group bets by day for line chart
    const betsByDayMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const day = date.toISOString().split('T')[0];
      betsByDayMap.set(day, 0);
    }
    
    // Count bets by day
    bets.forEach(bet => {
      const day = new Date(bet.createdAt).toISOString().split('T')[0];
      betsByDayMap.set(day, (betsByDayMap.get(day) || 0) + 1);
    });
    
    const betsByDay = Array.from(betsByDayMap.entries())
      .map(([day, bets]) => ({ day, bets }))
      .sort((a, b) => a.day.localeCompare(b.day));
    
    setStatsData({
      totalBets: bets.length,
      winCount: winningBets.length,
      lossCount: losingBets.length,
      totalWagered,
      totalProfit,
      winRate,
      biggestWin,
      favoriteGame,
      profitByGame,
      betsByDay
    });
  }, [bets, games]);

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(8)} BTC`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (betsLoading || gamesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#1375e1]" />
        <p className="mt-4 text-lg text-gray-300">Loading statistics...</p>
      </div>
    );
  }

  if (betsError) {
    toast({
      title: "Error loading statistics",
      description: "Could not load your statistics. Please try again later.",
      variant: "destructive"
    });
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-gray-300">Could not load statistics. Please try again later.</p>
      </div>
    );
  }

  // No bet data yet
  if (bets?.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-[#0F212E] border-[#172B3A]">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-6 w-6 text-[#1375e1]" />
              <div>
                <CardTitle className="text-white text-2xl">Statistics</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your gaming performance and history
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg text-gray-300">No bet data yet</p>
              <p className="text-sm mt-2 text-gray-400">Place some bets to see your statistics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-[#0F212E] border-[#172B3A] mb-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-6 w-6 text-[#1375e1]" />
            <div>
              <CardTitle className="text-white text-2xl">Statistics</CardTitle>
              <CardDescription className="text-gray-400">
                Track your gaming performance and history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Bets"
              value={statsData.totalBets.toString()}
              icon={<Award className="h-6 w-6 text-blue-500" />}
            />
            <StatCard 
              title="Win Rate"
              value={`${statsData.winRate.toFixed(1)}%`}
              icon={<TrendingUp className="h-6 w-6 text-green-500" />}
              description={`${statsData.winCount} wins / ${statsData.lossCount} losses`}
            />
            <StatCard 
              title="Total Wagered"
              value={formatAmount(statsData.totalWagered)}
              icon={<DollarSign className="h-6 w-6 text-yellow-500" />}
            />
            <StatCard 
              title="Total Profit"
              value={formatAmount(statsData.totalProfit)}
              icon={<PieChart className="h-6 w-6 text-purple-500" />}
              trend={{ 
                value: statsData.totalWagered > 0 ? 
                  (statsData.totalProfit / statsData.totalWagered) * 100 : 0, 
                isPositive: statsData.totalProfit >= 0 
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="bg-[#0F212E] border-[#172B3A]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Favorite Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{statsData.favoriteGame.name}</h3>
                    <p className="text-sm text-gray-400">{statsData.favoriteGame.bets} bets placed</p>
                  </div>
                  <div className="p-3 bg-[#172B3A] rounded-full">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0F212E] border-[#172B3A]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Biggest Win</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-green-500">{formatAmount(statsData.biggestWin.amount)}</h3>
                    <p className="text-sm text-gray-400">on {statsData.biggestWin.game}</p>
                  </div>
                  <div className="p-3 bg-[#172B3A] rounded-full">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="profit" className="mt-6">
            <TabsList className="bg-[#172B3A] border-[#243442]">
              <TabsTrigger value="profit" className="data-[state=active]:bg-[#243442]">Profit by Game</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#243442]">Betting Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profit" className="mt-4">
              <Card className="bg-[#0F212E] border-[#172B3A]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Profit Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={statsData.profitByGame}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="profit"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statsData.profitByGame.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip 
                        formatter={(value: number) => formatAmount(value)}
                        labelFormatter={(name) => `Game: ${name}`}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <Card className="bg-[#0F212E] border-[#172B3A]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Betting Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={statsData.betsByDay}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#243442" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#7F8990"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis stroke="#7F8990" />
                      <Tooltip 
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString();
                        }}
                        formatter={(value: number) => [`${value} bets`, "Count"]}
                        contentStyle={{ backgroundColor: '#172B3A', borderColor: '#243442' }}
                      />
                      <Line type="monotone" dataKey="bets" stroke="#1375e1" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}