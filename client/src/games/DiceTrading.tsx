import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Percent, Plus, Minus, Users } from 'lucide-react';

// Game ID
const GAME_ID = 200;

// Sample initial chart data
const sampleChartData = Array.from({ length: 10 }, (_, i) => ({
  round: i + 1,
  value: Math.floor(Math.random() * 100)
}));

// Simplified DiceTrading Component
const DiceTrading = () => {
  const { toast } = useToast();
  const { balance, symbol, refreshBalance } = useWallet();
  
  // Game state - start with a smaller bet to avoid balance issues
  const [betAmount, setBetAmount] = useState(1);
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
  
  // Chart data
  const [chartData, setChartData] = useState(sampleChartData);
  
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
  
  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.addEventListener('open', () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ 
        action: 'subscribe', 
        topic: 'dice-trading'
      }));
    });
    
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.topic === 'dice-trading') {
          if (data.payload.type === 'bet-result') {
            const betResult = data.payload;
            
            // Add to recent bets
            setRecentBets(prev => [betResult, ...prev].slice(0, 10));
            
            // Add to chart data
            const newPoint = { round: chartData.length + 1, value: betResult.result };
            setChartData(prev => [...prev, newPoint]);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.addEventListener('close', () => {
      console.log('WebSocket disconnected');
    });
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);
  
  // Update calculations when ranges change
  useEffect(() => {
    const newRangeSize = maxRange - minRange;
    setRangeSize(newRangeSize);
    
    // Calculate multiplier based on range size
    const newMultiplier = parseFloat((100 / newRangeSize).toFixed(2));
    setMultiplier(newMultiplier);
    
    // Win chance is the range size percentage
    setWinChance(newRangeSize);
    
    // Calculate potential win
    setPotentialWin(parseFloat((betAmount * newMultiplier).toFixed(2)));
  }, [minRange, maxRange, betAmount]);
  
  // Increment/decrement bet amount
  const handleIncrementBet = () => {
    setBetAmount(prev => prev + 1);
  };
  
  const handleDecrementBet = () => {
    if (betAmount > 1) {
      setBetAmount(prev => prev - 1);
    }
  };
  
  // Handle changes to bet amount
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };
  
  // Handle min range slider change
  const handleMinRangeChange = (newValue: number) => {
    const validMin = Math.min(newValue, maxRange - 1);
    setMinRange(validMin);
  };
  
  // Handle max range slider change
  const handleMaxRangeChange = (newValue: number) => {
    const validMax = Math.max(newValue, minRange + 1);
    setMaxRange(validMax);
  };
  
  // Place a bet via API
  const placeBet = async () => {
    if (isRolling) return;
    
    try {
      setIsRolling(true);
      setWon(null);
      
      const clientSeed = Math.random().toString(36).substring(2, 15);
      
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
        console.log("API error response:", errorData);
        throw new Error(errorData.message || 'Failed to place bet');
      }
      
      const data = await response.json();
      
      // Update state with results
      const diceResult = data.bet.outcome.result;
      const playerWon = data.bet.outcome.win;
      const betProfit = data.bet.profit;
      
      setResult(diceResult);
      setWon(playerWon);
      setProfit(betProfit);
      
      // Add result to chart data
      const newPoint = { round: chartData.length + 1, value: diceResult };
      setChartData(prev => [...prev, newPoint]);
      
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
      
      // Refresh balance
      refreshBalance();
      
    } catch (error) {
      console.error('Error in dice trading game:', error);
      toast({
        title: "Error placing bet",
        description: error instanceof Error ? error.message : "An error occurred while placing your bet",
        variant: "destructive"
      });
    } finally {
      setIsRolling(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-col w-full h-full bg-[#0E1C27] p-2 md:p-4 max-w-[100vw] overflow-hidden">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-1 rounded">
            <TrendingUp size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">DICE TRADING</h1>
        </div>
        <div className="text-white font-medium flex items-center">
          <div className="bg-[#172B3A] p-1 px-2 rounded text-sm">Scalping</div>
        </div>
      </div>
      
      {/* Chart and Controls Section */}
      <div className="flex flex-col gap-4">
        {/* Chart Area with Line Graph */}
        <div className="bg-[#172B3A] rounded-lg p-2 md:p-4 h-[40vh] md:h-[50vh]">
          <div className="h-full w-full bg-[#0F212E] rounded-lg p-2 md:p-4 relative">
            {/* Y-axis markers on the left side */}
            <div className="absolute left-0 top-0 h-full pl-2 flex flex-col justify-between py-4 z-10 text-xs">
              <span className="text-blue-400">100</span>
              <span className="text-blue-400">90</span>
              <span className="text-blue-400">80</span>
              <span className="text-blue-400">70</span>
              <span className="text-blue-400">60</span>
              <span className="text-blue-400">50</span>
              <span className="text-blue-400">40</span>
              <span className="text-blue-400">30</span>
              <span className="text-blue-400">20</span>
              <span className="text-blue-400">10</span>
              <span className="text-blue-400">0</span>
            </div>
          
            {/* Chart display for historical results */}
            <div className="w-full h-full pl-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="round" 
                    stroke="#3B82F6" 
                    tick={{ fill: '#3B82F6' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#3B82F6" 
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#172B3A', 
                      borderColor: '#3B82F6',
                      color: 'white'
                    }}
                    labelStyle={{ color: 'white' }}
                  />
                  
                  {/* Range area */}
                  <ReferenceLine 
                    y={minRange} 
                    stroke="#3B82F6" 
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine 
                    y={maxRange} 
                    stroke="#3B82F6" 
                    strokeDasharray="3 3"
                  />
                  
                  {/* Result line */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: 'white', stroke: '#22c55e', r: 4 }}
                    activeDot={{ fill: '#FFFFFF', stroke: '#22c55e', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Range indicator circles - Fixed on left side (only 2 circles) */}
            <div className="absolute left-3 top-0 h-full flex flex-col justify-between py-8">
              <div 
                className="w-8 h-8 rounded-full border-4 border-blue-400 bg-transparent cursor-pointer"
                onClick={() => handleMaxRangeChange(90)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMaxRangeChange(90);
                }}
              ></div>
              <div 
                className="w-8 h-8 rounded-full border-4 border-blue-400 bg-transparent cursor-pointer"
                onClick={() => handleMinRangeChange(10)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMinRangeChange(10);
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Risk and Stats Section */}
        <div className="bg-[#172B3A] rounded-lg p-3">
          <div className="flex justify-between items-center mb-4">
            {/* Risk meter */}
            <div className="flex flex-col">
              <div className="mb-1 relative w-32 h-6 bg-[#0F212E] rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: `${winChance}%` }}></div>
                <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center text-xs text-white font-medium">Risk</div>
              </div>
            </div>
            
            {/* Multiplier and Payout */}
            <div className="text-right">
              <div className="text-green-400 font-bold text-xl">{multiplier.toFixed(2)}x</div>
              <div className="text-sm text-white">Multiplier</div>
            </div>

            <div className="text-right">
              <div className="text-green-400 font-bold text-xl">${potentialWin.toFixed(2)}</div>
              <div className="text-sm text-white">Possible Payout</div>
            </div>
          </div>
          
          {/* Roll Between Range */}
          <div className="mb-4">
            <div className="text-sm text-white mb-1">Roll Between</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[#0F212E] p-2 rounded text-center text-white font-medium">
                {minRange}
              </div>
              <div className="bg-[#0F212E] p-2 rounded text-center text-white font-medium">
                {Math.floor(minRange + (maxRange - minRange) / 3)}
              </div>
              <div className="text-center text-white font-medium p-2">&</div>
              <div className="bg-[#0F212E] p-2 rounded text-center text-white font-medium">
                {maxRange}
              </div>
            </div>
          </div>
          
          {/* Bet Amount Controls */}
          <div className="relative mb-4">
            <div className="text-sm text-white mb-2">Bet Amount</div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setBetAmount(1)}
                className="bg-[#0F212E] text-white py-2 px-3 rounded-md text-xs"
              >
                min
              </button>
              
              <button 
                onClick={handleDecrementBet}
                className="bg-[#0F212E] text-white py-2 px-4 rounded-l-md hover:bg-blue-700 transition-colors"
              >
                <Minus size={16} />
              </button>
              
              <div className="flex-1 bg-[#0F212E] py-2 text-center text-white font-medium border-l border-r border-[#172B3A]">
                ${betAmount}
              </div>
              
              <button 
                onClick={handleIncrementBet}
                className="bg-[#0F212E] text-white py-2 px-4 rounded-r-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
              </button>
              
              <button 
                onClick={() => setBetAmount(100)}
                className="bg-[#0F212E] text-white py-2 px-3 rounded-md text-xs"
              >
                max
              </button>
            </div>
          </div>
          
          {/* Place Bet Button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-md transition-colors text-lg font-bold"
            disabled={isRolling}
            onClick={placeBet}
          >
            {isRolling ? 'Rolling...' : 'Place bet'}
          </Button>
        </div>
        
        {/* Game Stats */}
        <div className="bg-[#172B3A] rounded-lg p-3 hidden md:block">
          <div className="grid grid-cols-2 gap-4">
            {/* Current Roll / Result */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Current Roll</span>
              {result !== null && (
                <span className={`text-xl font-bold ${won ? 'text-green-500' : 'text-red-500'}`}>
                  {result}
                </span>
              )}
            </div>
            
            {/* Range display */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Range</span>
              <span className="text-white font-semibold">{minRange} - {maxRange}</span>
            </div>
            
            {/* Range size */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Range Size</span>
              <span className="text-white font-semibold">{rangeSize}%</span>
            </div>
            
            {/* Win chance */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Win Chance</span>
              <span className="text-white font-semibold">{winChance}%</span>
            </div>
          </div>
        </div>
        
        {/* Recent activity - Only shown on larger screens */}
        <div className="bg-[#172B3A] rounded-lg p-3 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-blue-400" />
            <span className="text-white font-semibold">Recent Activity</span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {recentBets.map((bet, index) => (
              <div key={index} className="bg-[#0F212E] p-2 rounded-md text-sm flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-gray-300 mr-2">{bet.username}</span>
                  <span className="text-gray-400 text-xs">({bet.minRange}-{bet.maxRange})</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 font-medium ${bet.win ? 'text-green-500' : 'text-red-500'}`}>
                    {bet.result}
                  </span>
                  <span className={`text-xs font-semibold ${bet.win ? 'text-green-500' : 'text-red-500'}`}>
                    {bet.win ? `+${bet.profit.toFixed(2)}` : `-${bet.amount.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
            
            {recentBets.length === 0 && (
              <div className="text-center py-2 text-gray-400 text-sm">
                No recent bets
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer - game info */}
      <div className="mt-auto pt-2 text-center text-xs text-gray-500">
        <div>Turbo Games · Trading Dice</div>
        <div>{new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default DiceTrading;