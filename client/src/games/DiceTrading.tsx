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
    <div className="flex flex-col lg:flex-row gap-4 w-full min-h-screen bg-[#0E1C27] p-4">
      {/* Left section: Chart and Vertical Slider */}
      <div className="flex flex-1 bg-[#172B3A] rounded-lg">
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
            <div className="w-10 h-full mx-auto relative">
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
              <div
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full transform -translate-y-1/2 cursor-grab hover:scale-110 transition-transform"
                style={{ top: `${100 - maxRange}%` }}
                onMouseDown={(event) => {
                  const sliderTrack = event.currentTarget.parentElement;
                  if (!sliderTrack) return;
                  
                  const rect = sliderTrack.getBoundingClientRect();
                  
                  const handleDrag = (e: MouseEvent) => {
                    const y = e.clientY - rect.top;
                    const percentage = 100 - Math.max(0, Math.min(100, (y / rect.height) * 100));
                    handleMaxRangeChange(Math.round(percentage));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  // Initial calculation
                  handleDrag(event.nativeEvent);
                  
                  document.addEventListener('mousemove', handleDrag);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              ></div>
              
              {/* Min handle */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-primary rounded-full transform -translate-y-1/2 cursor-grab hover:scale-110 transition-transform"
                style={{ top: `${100 - minRange}%` }}
                onMouseDown={(event) => {
                  const sliderTrack = event.currentTarget.parentElement;
                  if (!sliderTrack) return;
                  
                  const rect = sliderTrack.getBoundingClientRect();
                  
                  const handleDrag = (e: MouseEvent) => {
                    const y = e.clientY - rect.top;
                    const percentage = 100 - Math.max(0, Math.min(100, (y / rect.height) * 100));
                    handleMinRangeChange(Math.round(percentage));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  // Initial calculation
                  handleDrag(event.nativeEvent);
                  
                  document.addEventListener('mousemove', handleDrag);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Chart area */}
        <div className="flex-1 h-full p-4">
          <div className="h-full w-full bg-[#0F212E] rounded-lg p-4">
            <div className="text-lg font-semibold mb-2 text-white">Dice Trading Results</div>
            
            {/* Chart display for historical results */}
            <div className="w-full h-[calc(100%-40px)]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="round" 
                    stroke="#888888" 
                    tick={{ fill: '#888888' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#888888" 
                    tick={{ fill: '#888888' }}
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
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    activeDot={{ fill: '#FFFFFF', stroke: '#F59E0B', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right section: Betting panel and stats */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Current result display */}
        <Card className="bg-[#172B3A] border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-[#0F212E] p-4 flex justify-between items-center">
              <span className="text-gray-300">Current Roll</span>
              {result !== null && (
                <span className={`text-2xl font-bold ${won ? 'text-green-500' : 'text-red-500'}`}>
                  {result}
                </span>
              )}
            </div>
            
            <div className="p-4 space-y-4">
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
              
              {/* Multiplier */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Multiplier</span>
                <span className="text-white font-semibold">×{multiplier.toFixed(2)}</span>
              </div>
              
              {/* Win chance */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Win Chance</span>
                <span className="text-white font-semibold">{winChance}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Betting controls */}
        <Card className="bg-[#172B3A] border-0">
          <CardContent className="p-4 space-y-4">
            {/* Bet amount input */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Bet Amount</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDecrementBet}
                  className="bg-[#0F212E] text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  className="bg-[#0F212E] border-[#0F212E] text-white"
                />
                <button 
                  onClick={handleIncrementBet}
                  className="bg-[#0F212E] text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            {/* Potential win display */}
            <div className="bg-[#0F212E] p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Potential Win</span>
                <span className="text-white font-semibold">{potentialWin.toFixed(2)} {symbol}</span>
              </div>
            </div>
            
            {/* Place bet button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
              disabled={isRolling}
              onClick={placeBet}
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Recent activity */}
        <Card className="bg-[#172B3A] border-0 flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-gray-400" />
              <span className="text-white font-semibold">Recent Activity</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {recentBets.map((bet, index) => (
                <div key={index} className="bg-[#0F212E] p-2 rounded-md text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">{bet.username}</span>
                    <span className={`font-semibold ${bet.win ? 'text-green-500' : 'text-red-500'}`}>
                      {bet.result}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400">Range: {bet.minRange}-{bet.maxRange}</span>
                    <span className={`font-semibold ${bet.win ? 'text-green-500' : 'text-red-500'}`}>
                      {bet.win ? `+${bet.profit.toFixed(2)}` : `-${bet.amount.toFixed(2)}`} {symbol}
                    </span>
                  </div>
                </div>
              ))}
              
              {recentBets.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  No recent bets
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiceTrading;