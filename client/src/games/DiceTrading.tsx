import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useWallet } from '@/context/WalletContext';
// Direct API call approach - no need for useGameBet
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Globe, TrendingUp, TrendingDown, Timer, DollarSign, Percent, Plus, Minus, Users } from 'lucide-react';

// Game ID based on registration in games/index.ts
const GAME_ID = 200; // We'll add this to the games index

// DiceTrading Component
const DiceTrading = () => {
  // Hooks for game functionality
  const { getGameResult } = useProvablyFair('dice-trading');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Wallet/Balance
  const { balance: walletBalance, symbol, formattedBalance, refreshBalance } = useWallet();
  
  // Direct API approach for betting
  
  // Game state
  const [betAmount, setBetAmount] = useState(10.00);
  const [minRange, setMinRange] = useState(40);
  const [maxRange, setMaxRange] = useState(60);
  const [rangeSize, setRangeSize] = useState(20);
  const [multiplier, setMultiplier] = useState(5.0);
  const [winChance, setWinChance] = useState(20.0);
  const [potentialWin, setPotentialWin] = useState(50.0);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [profit, setProfit] = useState(0);
  
  // Recent activity
  const [recentBets, setRecentBets] = useState<Array<{
    username: string;
    amount: number;
    result: number;
    minRange: number;
    maxRange: number;
    win: boolean;
    profit: number;
    timestamp: number;
  }>>([]);
  
  // WebSocket reference
  const socketRef = useRef<WebSocket | null>(null);
  
  // Chart data
  const [chartData, setChartData] = useState<Array<{ round: number; value: number }>>([]);
  const [animatingLine, setAnimatingLine] = useState(false);
  const [displayedData, setDisplayedData] = useState<Array<{ round: number; value: number }>>([]);
  
  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      // Subscribe to dice-trading topic
      socket.send(JSON.stringify({ 
        action: 'subscribe', 
        topic: 'dice-trading'
      }));
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Only process dice-trading messages
        if (data.topic === 'dice-trading') {
          // Handle bet result updates
          if (data.payload.type === 'bet-result') {
            const betResult = data.payload;
            
            // Add to recent bets
            setRecentBets(prev => {
              const newBets = [betResult, ...prev].slice(0, 10);
              return newBets;
            });
            
            // Add to chart data if not already there
            const nextRound = chartData.length + 1;
            const newDataPoint = { round: nextRound, value: betResult.result };
            
            // Check if this is a new point before adding
            const pointExists = chartData.some(point => 
              point.round === nextRound && point.value === betResult.result);
              
            if (!pointExists) {
              animateChart(newDataPoint);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Connection closed
    socket.addEventListener('close', () => {
      console.log('WebSocket disconnected');
    });
    
    // Connection error
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);
  
  // Update range size, multiplier, and win chance when min/max changes
  useEffect(() => {
    const newRangeSize = maxRange - minRange;
    setRangeSize(newRangeSize);
    
    // Calculate multiplier based on range size (as percentage of 0-100)
    const newMultiplier = parseFloat((100 / newRangeSize).toFixed(2));
    setMultiplier(newMultiplier);
    
    // Win chance is simply the range size percentage
    setWinChance(newRangeSize);
    
    // Calculate potential win
    setPotentialWin(parseFloat((betAmount * newMultiplier).toFixed(2)));
  }, [minRange, maxRange, betAmount]);
  
  // Increment/decrement bet amount
  const handleIncrementBet = () => {
    setBetAmount(prev => parseFloat((prev + 1).toFixed(2)));
  };
  
  const handleDecrementBet = () => {
    if (betAmount > 1) {
      setBetAmount(prev => parseFloat((prev - 1).toFixed(2)));
    }
  };
  
  // Handle changes to bet amount
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };
  
  // Handle min range slider change
  const handleMinRangeChange = (newValue: number) => {
    // Ensure min doesn't exceed max - 1
    const validMin = Math.min(newValue, maxRange - 1);
    setMinRange(validMin);
  };
  
  // Handle max range slider change
  const handleMaxRangeChange = (newValue: number) => {
    // Ensure max doesn't go below min + 1
    const validMax = Math.max(newValue, minRange + 1);
    setMaxRange(validMax);
  };
  
  // Animate the chart data to show new point
  const animateChart = (newPoint: { round: number; value: number }) => {
    setAnimatingLine(true);
    
    // Add the new point to permanent data
    setChartData(prev => [...prev, newPoint]);
    
    // Reset displayed data to not include the new point
    setDisplayedData(chartData);
    
    // Animate by adding the new point after a delay
    setTimeout(() => {
      setDisplayedData(prev => [...prev, newPoint]);
      setAnimatingLine(false);
    }, 500);
  };
  
  // Handle placing a bet
  const handlePlaceBet = async () => {
    if (isRolling) return;
    
    try {
      setIsRolling(true);
      setWon(null);
      
      // Generate client seed for provably fair verification
      const clientSeed = Math.random().toString(36).substring(2, 15);
      
      // Place bet via API
      const response = await fetch('/api/dice-trading/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: betAmount,
          minRange,
          maxRange,
          clientSeed
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bet');
      }
      
      const data = await response.json();
      
      // Get the result from server response
      const diceResult = data.bet.outcome.result;
      setResult(diceResult);
      
      // Get win state from server response
      const playerWon = data.bet.outcome.win;
      setWon(playerWon);
      
      // Calculate profit from server response
      const betProfit = data.bet.profit;
      setProfit(betProfit);
      
      // Add result to chart
      const nextRound = chartData.length + 1;
      const newDataPoint = { round: nextRound, value: diceResult };
      animateChart(newDataPoint);
      
      // Show toast notification
      if (playerWon) {
        toast({
          title: "You Won!",
          description: `You won ${betProfit.toFixed(2)} ${symbol}!`,
          variant: "default",
        });
      } else {
        toast({
          title: "You Lost",
          description: `The dice rolled ${diceResult}, which is outside your range (${minRange}-${maxRange})`,
          variant: "destructive",
        });
      }
      
      // Refresh the balance to update UI
      refreshBalance();
      
    } catch (error) {
      console.error('Error in dice trading game:', error);
      toast({
        title: "Error placing bet",
        description: "An error occurred while placing your bet",
        variant: "destructive"
      });
    } finally {
      setIsRolling(false);
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full min-h-screen bg-[#0E1C27] p-4">
      {/* Left section: Chart and Vertical Slider */}
      <div className="flex flex-1 bg-[#172B3A] rounded-lg relative overflow-hidden">
        {/* Vertical Y-axis slider */}
        <div className="w-24 h-full px-4 py-6 flex flex-col justify-between bg-[#0F212E]">
          <div className="h-full relative flex flex-col items-center">
            {/* Vertical scale */}
            <div className="absolute inset-0 flex flex-col justify-between items-end py-4">
              <span className="text-xs text-gray-400">100</span>
              <span className="text-xs text-gray-400">75</span>
              <span className="text-xs text-gray-400">50</span>
              <span className="text-xs text-gray-400">25</span>
              <span className="text-xs text-gray-400">0</span>
            </div>
            
            {/* Range display - custom vertical implementation */}
            <div className="w-8 h-full mx-auto relative">
              {/* Background track */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-gray-700 rounded-full"></div>
              
              {/* Selected range */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 w-2 bg-primary rounded-full" 
                style={{ 
                  top: `${100 - maxRange}%`, 
                  height: `${maxRange - minRange}%` 
                }}
              ></div>
              
              {/* Max handle */}
              <button
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full transform -translate-y-1/2 cursor-grab hover:scale-110 transition-transform"
                style={{ top: `${100 - maxRange}%` }}
                onMouseDown={() => {
                  const handleDrag = (e: MouseEvent) => {
                    const container = e.currentTarget as HTMLElement;
                    const rect = container.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const percentage = 100 - Math.max(0, Math.min(100, (y / rect.height) * 100));
                    handleMaxRangeChange(Math.round(percentage));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleDrag);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              ></button>
              
              {/* Min handle */}
              <button
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full transform -translate-y-1/2 cursor-grab hover:scale-110 transition-transform"
                style={{ top: `${100 - minRange}%` }}
                onMouseDown={() => {
                  const handleDrag = (e: MouseEvent) => {
                    const container = e.currentTarget as HTMLElement;
                    const rect = container.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const percentage = 100 - Math.max(0, Math.min(100, (y / rect.height) * 100));
                    handleMinRangeChange(Math.round(percentage));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleDrag);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              ></button>
            </div>
          </div>
        </div>
        
        {/* Chart area */}
        <div className="flex-1 h-full p-4">
          <div className="h-full w-full bg-[#0F212E] rounded-lg p-4">
            <div className="text-lg font-semibold mb-2 text-white">Dice Results</div>
            
            {/* Chart display for historical results */}
            <div className="w-full h-[calc(100%-40px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={displayedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="round" 
                    stroke="#888888" 
                    tick={{ fill: '#888888' }}
                    axisLine={{ stroke: '#888888' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#888888" 
                    tick={{ fill: '#888888' }}
                    axisLine={{ stroke: '#888888' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#172B3A', 
                      borderColor: '#3B82F6',
                      color: 'white'
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  
                  {/* Selected range area */}
                  <ReferenceLine 
                    y={minRange} 
                    stroke="#3B82F6" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: `Min: ${minRange}`, 
                      fill: '#3B82F6',
                      position: 'left'
                    }} 
                  />
                  <ReferenceLine 
                    y={maxRange} 
                    stroke="#3B82F6" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: `Max: ${maxRange}`, 
                      fill: '#3B82F6',
                      position: 'left'
                    }} 
                  />
                  
                  {/* Result line */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3B82F6" }}
                    activeDot={{ r: 6, fill: "#3B82F6" }}
                    isAnimationActive={animatingLine}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section: Game controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Game info panel */}
        <Card className="bg-[#172B3A] border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold text-white">Dice Trading</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-500">Online</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Range Size:</span>
                <span className="text-sm text-white font-semibold">{rangeSize}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Win Chance:</span>
                <span className="text-sm text-white font-semibold">{winChance.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Multiplier:</span>
                <span className="text-sm text-white font-semibold">{multiplier.toFixed(2)}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent activity panel */}
        <Card className="bg-[#172B3A] border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold text-white">Recent Activity</span>
              </div>
            </div>
            
            {recentBets.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-2">
                No recent bets yet
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentBets.map((bet, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-md ${bet.win ? 'bg-green-900/30' : 'bg-red-900/30'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-300">{bet.username}</span>
                      <span 
                        className={`text-xs font-bold ${bet.win ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {bet.win ? '+' : ''}{bet.profit.toFixed(2)} {symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Range: {bet.minRange}-{bet.maxRange}</span>
                      <span>Result: {bet.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Betting controls */}
        <Card className="bg-[#172B3A] border-none shadow-md">
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Selected Range:</span>
                <span className="text-sm text-white font-semibold">{minRange} - {maxRange}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#0F212E] p-2 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Min</div>
                  <div className="text-lg font-bold text-white">{minRange}</div>
                </div>
                <div className="bg-[#0F212E] p-2 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Max</div>
                  <div className="text-lg font-bold text-white">{maxRange}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Amount</span>
                    <span className="text-sm text-gray-400">Balance: {formattedBalance}</span>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-r-none border-gray-700"
                      onClick={handleDecrementBet}
                      disabled={isRolling}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={handleBetAmountChange}
                      className="h-9 border-l-0 border-r-0 rounded-none text-center bg-[#0F212E] border-gray-700"
                      disabled={isRolling}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-l-none border-gray-700"
                      onClick={handleIncrementBet}
                      disabled={isRolling}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Potential Win</span>
                    <span className="text-sm text-green-500">{potentialWin.toFixed(2)} {symbol}</span>
                  </div>
                  <div className="p-2 bg-[#0F212E] rounded-lg flex justify-between items-center">
                    <span className="text-white">{multiplier.toFixed(2)}x</span>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3 text-blue-500" />
                      <span className="text-white">{winChance.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={handlePlaceBet}
                  disabled={isRolling}
                >
                  {isRolling ? 'Rolling...' : 'Place Bet'}
                </Button>
              </div>
            </div>
            
            {/* Result display */}
            {result !== null && (
              <div className={`mt-4 p-3 rounded-lg ${won ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{won ? 'You Won!' : 'You Lost'}</span>
                  <span className={`text-sm font-bold ${won ? 'text-green-500' : 'text-red-500'}`}>
                    {won ? `+${profit.toFixed(2)}` : profit.toFixed(2)} {symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Dice Result:</span>
                  <span className="text-sm font-semibold">{result}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Your Range:</span>
                  <span className="text-sm font-semibold">{minRange} - {maxRange}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Last results panel */}
        <Card className="bg-[#172B3A] border-none shadow-md">
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-2 text-white">Last Results</div>
            <div className="grid grid-cols-5 gap-1">
              {chartData.slice(-10).reverse().map((data, index) => (
                <div
                  key={index}
                  className={`text-center p-1 rounded text-xs font-semibold
                    ${data.value >= minRange && data.value <= maxRange ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                >
                  {data.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiceTrading;