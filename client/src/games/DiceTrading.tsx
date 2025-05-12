import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Percent, Plus, Minus, Users } from 'lucide-react';

// Define keyframes for blinking animation with improved pulse effect
const blinkAnimation = `
  @keyframes blink {
    0% { opacity: 1; r: 5; }
    50% { opacity: 0.4; r: 7; }
    100% { opacity: 1; r: 5; }
  }
  
  @keyframes pulse {
    0% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0.5; transform: scale(1); }
  }
  
  @keyframes glow {
    0% { filter: drop-shadow(0 0 3px rgba(34, 197, 94, 0.8)); }
    50% { filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6)); }
    100% { filter: drop-shadow(0 0 3px rgba(34, 197, 94, 0.8)); }
  }
`;

// Custom dot component with blinking animation for the latest point
interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  dataLength?: number;
  stroke?: string;
  strokeWidth?: number;
  r?: number;
  fill?: string;
}

const BlinkingDot = (props: DotProps) => {
  const { cx, cy, index, dataLength, stroke = "#22c55e", fill = "white" } = props;
  const isLatestDot = index === dataLength! - 1;
  
  if (isLatestDot) {
    // Enhanced blinking dot for latest point with glow effect
    return (
      <>
        {/* Outer glow - larger */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={16} 
          fill="rgba(34, 197, 94, 0.15)" 
          style={{
            animation: 'pulse 2.5s infinite ease-in-out',
          }}
        />
        
        {/* Middle glow - larger */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={11} 
          fill="rgba(34, 197, 94, 0.35)" 
          style={{
            animation: 'pulse 1.8s infinite ease-in-out',
          }}
        />
        
        {/* Inner dot - larger */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={7.5} 
          fill={fill} 
          stroke={stroke} 
          strokeWidth={3}
          style={{
            animation: 'glow 1.5s infinite ease-in-out',
            filter: 'drop-shadow(0 0 8px #22c55e)'
          }}
        />
      </>
    );
  }
  
  // Regular dots for all other points - larger
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={6} 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={2.5}
      filter="drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))"
    />
  );
};

// Game ID
const GAME_ID = 200;

// Sample initial chart data - create pattern similar to the provided screenshot
const sampleChartData = [
  { round: 1, value: 60 },  // Start at 60
  { round: 2, value: 42 },  // Drop
  { round: 3, value: 70 },  // Sharp rise
  { round: 4, value: 40 },  // Sharp drop
  { round: 5, value: 45 },  // Small rise
  { round: 6, value: 85 },  // Big spike
  { round: 7, value: 45 },  // Sharp drop
  { round: 8, value: 80 },  // Sharp rise
  { round: 9, value: 35 },  // Sharp drop
  { round: 10, value: 55 }, // Mid rise
  { round: 11, value: 43 }, // Drop
  { round: 12, value: 77 }  // End with rise
];

// Simplified DiceTrading Component
const DiceTrading = () => {
  // Add the blinking animation to the document
  useEffect(() => {
    // Add the blinking animation style to the head
    const styleEl = document.createElement('style');
    styleEl.innerHTML = blinkAnimation;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  const { toast } = useToast();
  const { balance, symbol, refreshBalance } = useWallet();
  
  // Game state - start with minimum bet amount of 100 INR
  const [betAmount, setBetAmount] = useState(100);
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
  
  // Refs for interactive elements
  const sliderRef = useRef<HTMLDivElement>(null);
  
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
    setBetAmount(prev => prev + 100);
  };
  
  const handleDecrementBet = () => {
    if (betAmount > 100) {
      setBetAmount(prev => Math.max(100, prev - 100));
    }
  };
  
  // Handle changes to bet amount
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 100) {
      setBetAmount(value);
    } else if (e.target.value === '') {
      // Allow empty input for easier editing but enforce 100 minimum on blur
      setBetAmount(100);
    }
  };
  
  // Handle min range slider change
  const handleMinRangeChange = (newValue: number) => {
    // Ensure the new value is within valid bounds
    const boundedValue = Math.max(0, Math.min(newValue, maxRange - 1));
    setMinRange(boundedValue);
  };
  
  // Handle max range slider change
  const handleMaxRangeChange = (newValue: number) => {
    // Ensure the new value is within valid bounds
    const boundedValue = Math.min(100, Math.max(newValue, minRange + 1));
    setMaxRange(boundedValue);
  };
  
  // Handle vertical slider drag for mobile and desktop
  const handleSliderDrag = (event: React.MouseEvent | React.TouchEvent, sliderRef: React.RefObject<HTMLDivElement>, isMin: boolean) => {
    event.preventDefault();
    
    const sliderElement = sliderRef.current;
    if (!sliderElement) return;
    
    const sliderRect = sliderElement.getBoundingClientRect();
    const sliderHeight = sliderRect.height;
    
    const handleMove = (clientY: number) => {
      // Calculate percentage based on position within slider
      const relativeY = clientY - sliderRect.top;
      const percentage = 100 - Math.max(0, Math.min(100, (relativeY / sliderHeight) * 100));
      
      if (isMin) {
        handleMinRangeChange(Math.round(percentage));
      } else {
        handleMaxRangeChange(Math.round(percentage));
      }
    };
    
    // Initial calculation
    if ('touches' in event) {
      // Touch event
      handleMove(event.touches[0].clientY);
      
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientY);
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      // Mouse event
      handleMove(event.clientY);
      
      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientY);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  // Place a bet via API
  const placeBet = async () => {
    if (isRolling) return;
    
    // Check if user has enough balance
    if (betAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${betAmount.toFixed(2)} to place this bet. Your current balance is ₹${balance.toFixed(2)}.`,
        variant: "destructive"
      });
      return;
    }
    
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
          clientSeed,
          currency: 'INR' // Explicitly define currency as INR
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
          description: `You won ₹${betProfit.toFixed(2)}!`,
          variant: "default",
        });
      } else {
        toast({
          title: "You Lost",
          description: `The dice rolled ${diceResult}, which is outside your range (${minRange}-${maxRange})`,
          variant: "destructive",
        });
      }
      
      // Immediately refresh balance to show the updated wallet amount
      refreshBalance();
      
      // Add to recent bets if not already there
      const newBet = {
        username: "You",
        minRange: minRange,
        maxRange: maxRange,
        result: diceResult,
        win: playerWon,
        amount: betAmount,
        profit: betProfit,
        timestamp: new Date().toISOString()
      };
      
      setRecentBets(prev => [newBet, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Error in dice trading game:', error);
      toast({
        title: "Error placing bet",
        description: error instanceof Error ? error.message : "An error occurred while placing your bet",
        variant: "destructive"
      });
    } finally {
      setIsRolling(false);
      
      // Refresh balance again after bet is complete
      setTimeout(() => refreshBalance(), 500);
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
      
      {/* Chart and Controls Section - Make chart stand out more */}
      <div className="flex flex-col gap-4">
        {/* Chart Area with Line Graph - Adjusted for bigger chart with smaller container */}
        <div className="bg-[#172B3A] rounded-lg p-1 md:p-2 h-[50vh] md:h-[55vh] shadow-xl border-2 border-blue-500/30 relative overflow-hidden">
          {/* Glow effect behind chart */}
          <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
          {/* Subtle animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 animate-pulse"></div>
          
          <div className="h-full w-full bg-[#0F212E] rounded-lg p-0 md:p-1 relative flex overflow-hidden">
            {/* Advanced trading background with bull image */}
            <div className="absolute inset-0 z-0">
              {/* Horizontal grid lines */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={`h-line-${i}`} 
                  className="absolute w-full h-px bg-blue-300 opacity-10" 
                  style={{ top: `${(i + 1) * 10}%` }}
                ></div>
              ))}
              
              {/* Vertical grid lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={`v-line-${i}`} 
                  className="absolute h-full w-px bg-blue-300 opacity-10" 
                  style={{ left: `${(i + 1) * 8}%` }}
                ></div>
              ))}

              {/* Premium bull image in the background */}
              <div 
                className="absolute right-5 bottom-5 w-60 h-60 opacity-25"
                style={{
                  backgroundImage: 'url("/static/assets/bullbg_Dice Trading.png")',
                  backgroundSize: 'contain',
                  backgroundPosition: 'bottom right',
                  backgroundRepeat: 'no-repeat',
                  filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
                  transform: 'rotate(-5deg)',
                }}
              />
            </div>
            
            {/* Left side - Interactive slider with draggable circles - made narrower */}
            <div className="w-8 h-full flex flex-col relative z-20" ref={sliderRef}>
              {/* Slider track */}
              <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-700 rounded-full"></div>
              
              {/* Selected range */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-blue-400 rounded-full" 
                style={{ 
                  top: `${100 - maxRange}%`, 
                  height: `${maxRange - minRange}%` 
                }}
              ></div>
              
              {/* Max handle - Top circle (upper bound) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center z-20"
                style={{ top: `${100 - maxRange}%` }}
              >
                <div 
                  className="w-12 h-12 rounded-full border-4 border-blue-400 flex items-center justify-center cursor-grab active:cursor-grabbing relative touch-none bg-[#0F212E]/80 shadow-lg"
                  onMouseDown={(e) => handleSliderDrag(e, sliderRef, false)}
                  onTouchStart={(e) => handleSliderDrag(e, sliderRef, false)}
                >
                  <span className="text-blue-400 text-sm font-semibold">{maxRange}</span>
                </div>
                {/* Outside value label matching screenshot */}
                <div className="absolute -left-7 whitespace-nowrap flex items-center">
                  <span className="text-blue-400 text-sm font-bold">{maxRange}</span>
                </div>
              </div>
              
              {/* Min handle - Bottom circle (lower bound) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center z-20"
                style={{ top: `${100 - minRange}%` }}
              >
                <div 
                  className="w-12 h-12 rounded-full border-4 border-blue-400 flex items-center justify-center cursor-grab active:cursor-grabbing relative touch-none bg-[#0F212E]/80 shadow-lg"
                  onMouseDown={(e) => handleSliderDrag(e, sliderRef, true)}
                  onTouchStart={(e) => handleSliderDrag(e, sliderRef, true)}
                >
                  <span className="text-blue-400 text-sm font-semibold">{minRange}</span>
                </div>
                {/* Outside value label matching screenshot */}
                <div className="absolute -left-7 whitespace-nowrap flex items-center">
                  <span className="text-blue-400 text-sm font-bold">{minRange}</span>
                </div>
              </div>
              
              {/* Vertical number labels */}
              <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-xs font-medium text-blue-400 pointer-events-none">
                <div>100</div>
                <div>80</div>
                <div>60</div>
                <div>40</div>
                <div>20</div>
                <div>0</div>
              </div>
            </div>
          
            {/* Chart display for historical results */}
            <div className="flex-1 h-full pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  {/* Background grid */}
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  
                  {/* X-axis - Hidden numbers */}
                  <XAxis 
                    dataKey="round" 
                    stroke="#3B82F6" 
                    tick={false} 
                    tickLine={{ stroke: '#3B82F6' }}
                    axisLine={{ stroke: '#3B82F6', strokeWidth: 1 }}
                    padding={{ left: 5, right: 5 }}
                  />
                  
                  {/* Y-axis - Hide ticks but keep domain */}
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#3B82F6" 
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  
                  {/* Tooltip styling */}
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#172B3A', 
                      borderColor: '#3B82F6',
                      color: 'white',
                      padding: '8px',
                      borderRadius: '4px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value) => [`${value}`, 'Value']}
                    labelFormatter={(value) => `Round ${value}`}
                  />
                  
                  {/* Top and bottom range indicators with color filling */}
                  <ReferenceLine 
                    y={minRange} 
                    stroke="#3B82F6" 
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    label={{
                      value: `${minRange}`,
                      position: 'left',
                      fill: '#3B82F6',
                      fontSize: 11
                    }}
                  />
                  <ReferenceLine 
                    y={maxRange} 
                    stroke="#3B82F6" 
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    label={{
                      value: `${maxRange}`,
                      position: 'left',
                      fill: '#3B82F6',
                      fontSize: 11
                    }}
                  />
                  
                  {/* Colored area between min and max range */}
                  <defs>
                    <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  
                  {/* Area that represents the betting range */}
                  <rect
                    x={0}
                    y={100 - maxRange + '%'}
                    width="100%"
                    height={(maxRange - minRange) + '%'}
                    fill="url(#rangeGradient)"
                  />
                  
                  {/* Horizontal reference lines at 40 and 60 to match screenshot */}
                  <ReferenceLine
                    y={40}
                    stroke="#3B82F6"
                    strokeDasharray="3 3"
                    label={{
                      value: "40",
                      position: "left",
                      fill: "#3B82F6",
                      fontSize: 13
                    }}
                  />
                  
                  <ReferenceLine
                    y={60}
                    stroke="#3B82F6"
                    strokeDasharray="3 3"
                    label={{
                      value: "60",
                      position: "left",
                      fill: "#3B82F6",
                      fontSize: 13
                    }}
                  />
                  
                  {/* Result line with steeper curve - enhanced style with thicker line */}
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={5}
                    dot={false}
                    activeDot={{ fill: '#FFFFFF', stroke: '#22c55e', strokeWidth: 3, r: 7 }}
                    connectNulls={true}
                    animationDuration={300}
                    isAnimationActive={true}
                    // Adding stronger drop shadow to line
                    filter="drop-shadow(0px 0px 6px rgba(34, 197, 94, 0.6))"
                  />
                  
                  {/* Second line with custom blinking dots only */}
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke="none"
                    dot={(props) => <BlinkingDot {...props} dataLength={chartData.length} />}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk and Stats Section */}
        <div className="bg-[#172B3A] rounded-lg p-3">
          <div className="flex justify-between items-center mb-4">
            {/* Risk meter - inverse of winChance (smaller window = higher risk) */}
            <div className="flex flex-col">
              <div className="mb-1 relative w-32 h-6 bg-[#0F212E] rounded-full overflow-hidden">
                {/* Calculate risk level based on range size */}
                {(() => {
                  const riskLevel = Math.min(100, Math.max(0, 100 - rangeSize));
                  
                  return (
                    <>
                      {/* Risk background with vibrant green for high risk */}
                      <div 
                        className="absolute left-0 top-0 h-full" 
                        style={{ 
                          width: `${riskLevel}%`,
                          background: riskLevel > 70 
                            ? 'linear-gradient(to right, #ef4444, #dc2626)' // Red for very high risk (above 70%)
                            : riskLevel > 50 
                              ? 'linear-gradient(to right, #22c55e, #16a34a)' // Green for high risk (50-70%)
                              : riskLevel > 25 
                                ? 'linear-gradient(to right, #2563eb, #3b82f6)' // Blue for medium risk (25-50%) 
                                : 'linear-gradient(to right, #6b7280, #9ca3af)' // Gray for low risk (0-25%)
                        }}
                      ></div>
                      
                      {/* Risk label with dynamic text */}
                      <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center text-xs text-white font-medium">
                        Risk: {Math.round(riskLevel)}%
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* Multiplier and Payout */}
            <div className="text-right">
              <div className="text-green-400 font-bold text-xl">{multiplier.toFixed(2)}x</div>
              <div className="text-sm text-white">Multiplier</div>
            </div>

            <div className="text-right">
              <div className="text-green-400 font-bold text-xl">₹{potentialWin.toFixed(2)}</div>
              <div className="text-sm text-white">Possible Payout</div>
            </div>
          </div>
          
          {/* Roll Between Range */}
          <div className="mb-4">
            <div className="text-sm text-white mb-1">Roll Between</div>
            <div className="grid grid-cols-4 gap-2">
              <div 
                className="bg-[#0F212E] p-2 rounded text-center text-white font-medium cursor-pointer hover:bg-[#1E3A4A] transition-colors"
                onClick={() => handleMinRangeChange(Math.max(0, minRange - 5))}
              >
                {minRange}
              </div>
              <div 
                className="bg-[#0F212E] p-2 rounded text-center text-white font-medium cursor-pointer hover:bg-[#1E3A4A] transition-colors"
                onClick={() => {
                  // Adjust min/max ranges to middle values
                  const midpoint = Math.floor((minRange + maxRange) / 2);
                  const range = 10;
                  handleMinRangeChange(midpoint - range);
                  handleMaxRangeChange(midpoint + range);
                }}
              >
                {Math.floor((minRange + maxRange) / 2)}
              </div>
              <div className="text-center text-white font-medium p-2">&</div>
              <div 
                className="bg-[#0F212E] p-2 rounded text-center text-white font-medium cursor-pointer hover:bg-[#1E3A4A] transition-colors"
                onClick={() => handleMaxRangeChange(Math.min(100, maxRange + 5))}
              >
                {maxRange}
              </div>
            </div>
          </div>
          
          {/* Bet Amount Controls */}
          <div className="relative mb-4">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-white">Bet Amount</div>
              <div className="text-sm text-gray-400">Balance: ₹{balance.toFixed(2)}</div>
            </div>
            
            {/* Editable bet amount with INR currency */}
            <div className="flex items-center gap-2 mb-3">
              <button 
                onClick={() => setBetAmount(Math.max(100, betAmount / 2))}
                className="bg-[#0F212E] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isRolling}
              >
                <Minus size={16} />
              </button>
              
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 100) {
                      setBetAmount(value);
                    } else if (e.target.value === '') {
                      setBetAmount(100);
                    }
                  }}
                  onBlur={() => {
                    if (betAmount < 100) setBetAmount(100);
                  }}
                  min="100"
                  step="100"
                  disabled={isRolling}
                  className="w-full bg-[#0F212E] py-2 text-center text-white font-medium"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</div>
              </div>
              
              <button 
                onClick={() => setBetAmount(betAmount * 2)}
                className="bg-[#0F212E] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isRolling}
              >
                <Plus size={16} />
              </button>
            </div>
            
            {/* Quick bet amount options */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[100, 500, 1000, 5000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`py-2 px-3 rounded-md text-sm transition-colors ${
                    betAmount === amount 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#0F212E] text-white hover:bg-[#1E3A4A]'
                  }`}
                  disabled={isRolling}
                >
                  {amount}
                </button>
              ))}
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
                    {bet.win ? `+₹${bet.profit.toFixed(2)}` : `-₹${bet.amount.toFixed(2)}`}
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