import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashGame } from './useCrashStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Area, ResponsiveContainer } from 'recharts';

// Multiplier quick-select levels for matching existing tabs
const MULTIPLIER_QUICKTABS = [
  { value: 1.71, label: '1.71x', color: 'bg-[#5BE12C]' },
  { value: 1.97, label: '1.97x', color: 'bg-[#5BE12C]' },
  { value: 5.25, label: '5.25x', color: 'bg-[#5BE12C]' },
  { value: 1.37, label: '1.37x', color: 'bg-[#5BE12C]' },
  { value: 8.34, label: '8.34x', color: 'bg-[#5BE12C]' },
  { value: 1.03, label: '1.03x', color: 'bg-[#5BE12C]' }
];

// Multiplier markers for chart
const MULTIPLIER_MARKERS = [1.0, 1.3, 1.5, 1.8, 2.0, 2.3];

// Physics constants for the curve simulation
const GRAVITY = 0.02;  // Gravity factor (lower = more flat)
const INITIAL_VELOCITY = { x: 5, y: 0.1 }; // Initial velocity vector (higher x = more horizontal)
const CURVE_FACTOR = 0.1; // Factor for curve bending (lower = flatter curve)

const CrashRecharts: React.FC = () => {
  // Game state from store
  const {
    gameState,
    currentMultiplier,
    crashPoint,
    countdown,
    hasPlacedBet,
    hasCashedOut,
    betAmount,
    autoCashoutValue,
    activeBets,
    
    placeBet,
    cashOut,
    setBetAmount,
    setAutoCashoutValue,
    initialize,
  } = useCrashGame();
  
  // Chart data state
  const [chartData, setChartData] = useState<{ x: number, y: number, multiplier: number }[]>([]);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [simulationTime, setSimulationTime] = useState(0);
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });
  const [velocityVector, setVelocityVector] = useState({ ...INITIAL_VELOCITY });
  
  // Physics-based animation
  useEffect(() => {
    // Reset chart when game state changes
    if (gameState === 'waiting') {
      setChartData([]);
      setSimulationTime(0);
      setParticlePosition({ x: 0, y: 0 });
      setVelocityVector({ ...INITIAL_VELOCITY });
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        setAnimationFrame(null);
      }
    }
    
    // Only run animation in 'running' state
    if (gameState !== 'running') {
      return;
    }
    
    // Animation frame function
    const animate = () => {
      // Time step
      const timeStep = 0.05;
      const newTime = simulationTime + timeStep;
      
      // Apply quadratic curve physics for a more natural-looking curve
      const quadraticY = CURVE_FACTOR * Math.pow(particlePosition.x, 0.8);
      
      // Update position based on physics
      const newPosition = {
        x: particlePosition.x + velocityVector.x * timeStep,
        y: quadraticY
      };
      
      // Calculate multiplier based on x position
      const newMultiplier = 1 + (newPosition.x * 0.02);
      
      // Add data point to chart
      setChartData(prev => [
        ...prev, 
        { 
          x: newPosition.x * 10, // Scale x for better visualization
          y: newPosition.y * 5,  // Scale y for better visualization
          multiplier: newMultiplier
        }
      ]);
      
      // Update state
      setSimulationTime(newTime);
      setParticlePosition(newPosition);
      
      // Increase x velocity slightly for accelerating curve
      setVelocityVector(prev => ({
        ...prev,
        x: prev.x + timeStep * 0.01 // Very slight acceleration
      }));
      
      // Continue animation
      const frame = requestAnimationFrame(animate);
      setAnimationFrame(frame);
      
      // Check if we've reached the crash point
      if (newMultiplier >= crashPoint) {
        cancelAnimationFrame(frame);
      }
    };
    
    // Start animation
    const frame = requestAnimationFrame(animate);
    setAnimationFrame(frame);
    
    // Cleanup
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [gameState, simulationTime, particlePosition, velocityVector, crashPoint]);
  
  // Initialize game on component mount
  useEffect(() => {
    if (gameState === 'waiting' && chartData.length === 0) {
      initialize();
    }
  }, []);
  
  // Calculate profit on win
  const calculateProfit = () => {
    if (!hasPlacedBet || !autoCashoutValue) return 0;
    return betAmount * (autoCashoutValue || 0);
  };
  
  // Format for display
  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };
  
  // Custom dot for chart - the glowing circle at the end of the line
  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
    
    if (index === chartData.length - 1) {
      return (
        <g>
          {/* Glow effect with radial gradient */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main circle */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={15} 
            fill="white" 
            stroke="white"
            strokeWidth={3}
            filter="url(#glow)"
          />
        </g>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col h-full w-full bg-[#0F212E] text-white overflow-hidden">
      <div className="flex flex-row w-full h-screen">
        {/* Game Controls */}
        <div className="flex flex-col w-[260px] p-4 bg-[#11232F]">
          {/* Game Mode Toggle */}
          <div className="flex rounded-md overflow-hidden mb-4">
            <button 
              className={`flex-1 py-2 text-center bg-[#0F212E]`}
            >
              Manual
            </button>
            <button 
              className={`flex-1 py-2 text-center bg-[#11232F]`}
            >
              Auto
            </button>
          </div>
          
          {/* Bet Amount */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Bet Amount</label>
            <div className="flex items-center mb-2">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={hasPlacedBet || gameState === 'running'}
              />
              <span className="ml-2">$0.00</span>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-1">
              <button className="bg-[#0F212E] px-2 py-1 rounded text-xs">½</button>
              <button className="bg-[#0F212E] px-2 py-1 rounded text-xs">2×</button>
            </div>
          </div>
          
          {/* Cashout At */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Cashout At</label>
            <div className="relative mb-2">
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={autoCashoutValue || 2.00}
                onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
                disabled={hasPlacedBet && !hasCashedOut && gameState === 'running'}
              />
              <div className="absolute right-2 top-2 flex">
                <button 
                  className="bg-transparent px-1"
                  onClick={() => setAutoCashoutValue(Math.max(1.01, (autoCashoutValue || 2.00) - 0.01))}
                >
                  ▼
                </button>
                <button 
                  className="bg-transparent px-1"
                  onClick={() => setAutoCashoutValue((autoCashoutValue || 2.00) + 0.01)}
                >
                  ▲
                </button>
              </div>
            </div>
          </div>
          
          {/* Profit on Win */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Profit on Win</label>
            <div className="flex items-center mb-4">
              <input 
                type="number" 
                className="w-full bg-[#0F212E] border-none rounded p-2 text-white"
                value={calculateProfit()}
                readOnly
              />
              <span className="ml-2">$0.00</span>
            </div>
          </div>
          
          {/* Bet Button */}
          <div className="mb-4">
            {gameState === 'running' && hasPlacedBet && !hasCashedOut ? (
              <Button 
                className="w-full py-4 text-lg bg-[#FF6B00] hover:bg-[#FF8F3F] rounded-md"
                onClick={cashOut}
              >
                Cash Out @ {currentMultiplier.toFixed(2)}x
              </Button>
            ) : (
              <Button 
                className={`w-full py-4 text-lg ${
                  gameState === 'waiting' 
                    ? 'bg-[#5BE12C] hover:bg-[#4CC124] text-black'
                    : 'bg-[#34505E] text-gray-300 cursor-not-allowed'
                } rounded-md`}
                onClick={placeBet}
                disabled={gameState !== 'waiting' || hasPlacedBet}
              >
                {gameState === 'waiting' 
                  ? (hasPlacedBet ? 'Bet Placed' : 'Bet (Next Round)') 
                  : 'Waiting...'}
              </Button>
            )}
          </div>
          
          {/* Active Bets */}
          <div className="bg-[#0F212E] p-3 rounded">
            <h3 className="text-sm font-semibold mb-2">Active Bets</h3>
            <div className="h-[150px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left pb-1">User</th>
                    <th className="text-right pb-1">Bet</th>
                    <th className="text-right pb-1">Mult</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBets
                    .filter(bet => !bet.isHidden)
                    .map((bet, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-1">{bet.username}</td>
                      <td className="text-right py-1">{formatAmount(bet.amount)}</td>
                      <td className="text-right py-1">
                        {bet.status === 'won' ? (
                          <span className="text-green-500">{bet.cashoutMultiplier?.toFixed(2)}x</span>
                        ) : bet.status === 'lost' ? (
                          <span className="text-red-500">BUST</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Game Area */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Game Chart */}
          <div className="relative mb-4 bg-[#0E1C27] rounded-lg overflow-hidden w-full h-full min-h-[720px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {gameState === 'waiting' && (
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{countdown}s</div>
                  <div className="text-xl">Next Round Starting...</div>
                </div>
              )}
              
              {gameState === 'crashed' && (
                <div className="text-center">
                  <div className="text-6xl font-bold text-red-500 mb-2">CRASHED</div>
                  <div className="text-xl">@ {currentMultiplier.toFixed(2)}x</div>
                </div>
              )}
            </div>
            
            <div className="w-full h-[800px] relative">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    
                    {/* Reference lines for multiplier levels */}
                    {MULTIPLIER_MARKERS.map((mult, idx) => (
                      <ReferenceLine 
                        key={idx}
                        y={(mult - 1) * 5} // Scale to match data points
                        stroke="rgba(255,255,255,0.2)"
                        strokeDasharray="3 3"
                        label={{ 
                          value: `${mult.toFixed(1)}x`, 
                          position: 'right',
                          fill: 'white',
                          fontSize: 12
                        }}
                      />
                    ))}
                    
                    {/* X Axis (time) */}
                    <XAxis 
                      dataKey="x" 
                      type="number"
                      domain={[0, 'dataMax']}
                      hide 
                    />
                    
                    {/* Y Axis (multiplier) */}
                    <YAxis
                      type="number"
                      domain={[0, 'dataMax']}
                      hide
                    />
                    
                    {/* Area under the curve */}
                    <defs>
                      <linearGradient id="colorMultiplier" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9d02" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ff9d02" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="none"
                      fillOpacity={1}
                      fill="url(#colorMultiplier)"
                    />
                    
                    {/* Main curve line with glow effect */}
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#ffffff"
                      strokeWidth={15}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                      style={{ filter: 'url(#glow)' }}
                    />
                    
                    {/* End point dot */}
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="none"
                      dot={<CustomDot />}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Current multiplier display */}
            {gameState === 'running' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-9xl font-bold text-white">{currentMultiplier.toFixed(2)}x</div>
              </div>
            )}
            
            {/* Starting in display */}
            {gameState === 'waiting' && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#11232F] bg-opacity-80 px-16 py-3 rounded-md text-center text-xl">
                  Starting in
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Multiplier Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 -mx-1 px-1">
            {MULTIPLIER_QUICKTABS.map((level, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded-md ${level.color} text-black text-xs font-semibold`}
                onClick={() => setAutoCashoutValue(level.value)}
              >
                {level.label}
              </button>
            ))}
          </div>
          
          {/* Recent Games */}
          <div className="bg-[#11232F] p-3 rounded">
            <h3 className="text-sm font-semibold mb-2">Recent Games</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[2.31, 1.02, 4.56, 1.68, 10.21, 1.08, 3.45, 7.89, 1.54, 2.01].map((value, i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold ${
                    value < 1.2 ? 'bg-[#FF3B3B]' : 
                    value < 2 ? 'bg-[#FF6B00]' :
                    value < 5 ? 'bg-[#FFC107]' : 'bg-[#5BE12C]'
                  } ${value < 2 ? 'text-white' : 'text-black'}`}
                >
                  {value.toFixed(2)}x
                </div>
              ))}
            </div>
            
            <div className="flex justify-end text-xs text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Network Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashRecharts;