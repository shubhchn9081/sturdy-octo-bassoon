import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls, GameTabs } from '@/components/games/GameLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MULTIPLIER_PRESETS = ['1.11x', '1.50x', '2.00x', '5.00x', '10.00x', '20.00x', '50.00x'];

const LiveBet = ({ username, amount, currencySymbol, hidden = false }: { 
  username: string; 
  amount: number; 
  currencySymbol: string;
  hidden?: boolean;
}) => (
  <div className="bg-panel-bg px-4 py-2 rounded flex items-center">
    <span className="mr-2">{hidden ? 'Hidden' : username}</span>
    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
    <span className="ml-1 text-yellow-400">{currencySymbol}{amount.toLocaleString()}</span>
  </div>
);

const BetRow = ({ username, amount, currencySymbol, hidden = false }: { 
  username: string; 
  amount: number; 
  currencySymbol: string;
  hidden?: boolean;
}) => (
  <div className="flex justify-between items-center p-2 border-b border-border text-xs">
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>{hidden ? 'Hidden' : username}</span>
    </div>
    <div className="flex items-center">
      <span>{formatCrypto(amount)}</span>
      <div className="w-3 h-3 bg-yellow-400 rounded-full ml-1"></div>
    </div>
  </div>
);

const CrashGame = () => {
  const { getGameResult } = useProvablyFair('crash');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [cashoutAt, setCashoutAt] = useState('2.00');
  const [profit, setProfit] = useState('0.00000000');
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'crashed'>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [timer, setTimer] = useState(0);
  const [autoBet, setAutoBet] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [didWin, setDidWin] = useState(false);
  
  const animationRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const gameSpeedRef = useRef<number>(1);
  
  // List of mock bets
  const mockBets = [
    { username: '579', amount: 0.03752883, hidden: false, currencySymbol: '₿' },
    { username: 'User1', amount: 4.92999028, hidden: true, currencySymbol: '₿' },
    { username: 'User2', amount: 159.00000000, hidden: true, currencySymbol: '₿' },
    { username: 'User3', amount: 149.00000000, hidden: true, currencySymbol: '₿' },
    { username: 'User4', amount: 10.00000000, hidden: false, currencySymbol: '₿' },
    { username: 'User5', amount: 10.80000000, hidden: false, currencySymbol: '₿' },
    { username: 'Bahamas', amount: 7.78148, hidden: false, currencySymbol: '₿' },
    { username: 'User6', amount: 82.46715600, hidden: true, currencySymbol: '₿' },
    { username: 'User7', amount: 0.09904568, hidden: false, currencySymbol: '₿' },
    { username: 'User8', amount: 16.00000000, hidden: false, currencySymbol: '₿' },
  ];
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    if (betPlaced && !cashedOut) {
      const amount = parseFloat(betAmount) || 0;
      const profitValue = amount * (currentMultiplier - 1);
      setProfit(formatCrypto(profitValue));
    }
  }, [betAmount, currentMultiplier, betPlaced, cashedOut]);
  
  // Game loop animation
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const updateCrashAnimation = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }
      
      const deltaTime = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;
      
      setTimer(prevTimer => {
        const newTimer = prevTimer + deltaTime * gameSpeedRef.current;
        
        // Calculate multiplier based on timer (exponential growth)
        const newMultiplier = Math.pow(Math.E, 0.1 * newTimer);
        setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));
        
        // Check for cashout
        if (betPlaced && !cashedOut && newMultiplier >= parseFloat(cashoutAt)) {
          handleCashout();
        }
        
        // Check for crash
        if (newMultiplier >= crashPoint) {
          setGameState('crashed');
          return newTimer;
        }
        
        animationRef.current = requestAnimationFrame(updateCrashAnimation);
        return newTimer;
      });
    };
    
    animationRef.current = requestAnimationFrame(updateCrashAnimation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, crashPoint, betPlaced, cashedOut, cashoutAt]);
  
  const startNewGame = () => {
    // Reset game state
    setTimer(0);
    setCurrentMultiplier(1.00);
    setCashedOut(false);
    setBetPlaced(false);
    setDidWin(false);
    lastUpdateTimeRef.current = 0;
    
    // Generate crash point using provably fair algorithm
    const crashResult = getGameResult() as number;
    setCrashPoint(crashResult);
    
    // Start game after countdown
    setTimeout(() => {
      setGameState('playing');
    }, 3000);
  };
  
  const handleBetAmountChange = (value: string) => {
    setBetAmount(value);
  };
  
  const handleCashoutAtChange = (value: string) => {
    setCashoutAt(value);
  };
  
  const handleHalfBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount / 2));
  };
  
  const handleDoubleBet = () => {
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount * 2));
  };
  
  const handleCashoutPresetChange = (value: string) => {
    setCashoutAt(value.replace('x', ''));
  };
  
  const handleTabChange = (tab: string) => {
    setAutoBet(tab === 'auto');
  };
  
  const handleBet = () => {
    if (gameState !== 'waiting') {
      // Prepare bet for next round
      setBetPlaced(true);
      return;
    }
    
    // Place bet for current round
    setBetPlaced(true);
    
    // Start a new game if not already started
    if (gameState === 'waiting') {
      startNewGame();
    }
    
    // In a real app, this would call the API
    // placeBet.mutate({
    //   amount: parseFloat(betAmount),
    //   gameId: 4, // Crash game id
    //   clientSeed: 'seed',
    //   options: { cashoutAt: parseFloat(cashoutAt) }
    // });
  };
  
  const handleCashout = () => {
    if (!betPlaced || cashedOut || gameState !== 'playing') return;
    
    setCashedOut(true);
    setDidWin(true);
    
    // Calculate profit
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (currentMultiplier - 1);
    setProfit(formatCrypto(profitValue));
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { 
    //     crashPoint, 
    //     cashoutAt: currentMultiplier,
    //     win: true 
    //   }
    // });
  };
  
  // When the game crashes
  useEffect(() => {
    if (gameState === 'crashed') {
      // If bet was placed but not cashed out, it's a loss
      if (betPlaced && !cashedOut) {
        setDidWin(false);
      }
      
      // Reset for next round
      setTimeout(() => {
        setGameState('waiting');
        
        // Auto-start next game
        setTimeout(startNewGame, 3000);
      }, 3000);
    }
  }, [gameState, betPlaced, cashedOut]);
  
  // Game visualization panel
  const gamePanel = (
    <div>
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {MULTIPLIER_PRESETS.map((preset) => (
          <Button
            key={preset}
            variant={preset === `${cashoutAt}x` ? "default" : "outline"}
            className={preset === `${cashoutAt}x` ? "bg-accent text-accent-foreground" : ""}
            size="sm"
            onClick={() => handleCashoutPresetChange(preset)}
          >
            {preset}
          </Button>
        ))}
      </div>
      
      <div className="relative h-72 bg-panel-bg rounded-lg border border-border mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {gameState === 'waiting' && (
              <div className="text-4xl font-bold text-foreground">PREPARING...</div>
            )}
            
            {gameState === 'playing' && (
              <div className="text-6xl font-bold text-foreground">
                {currentMultiplier.toFixed(2)}<span className="text-3xl">x</span>
                {betPlaced && !cashedOut && (
                  <div className="mt-2">
                    <Button 
                      size="lg" 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={handleCashout}
                    >
                      Cash Out
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {gameState === 'crashed' && (
              <div className="text-6xl font-bold text-red-500">
                CRASHED AT {crashPoint.toFixed(2)}x
              </div>
            )}
          </div>
        </div>
        
        {/* Chart Visualization (simplified) */}
        {gameState === 'playing' && (
          <div 
            className="absolute bottom-0 left-0 bg-yellow-500 opacity-50" 
            style={{ 
              width: `${Math.min(100, timer / 10 * 100)}%`, 
              height: `${Math.min(100, (currentMultiplier - 1) * 100)}%`,
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%)'
            }}
          ></div>
        )}
        
        {gameState === 'crashed' && (
          <div 
            className="absolute bottom-0 left-0 bg-red-500 opacity-50" 
            style={{ 
              width: `${Math.min(100, timer / 10 * 100)}%`, 
              height: `${Math.min(100, (crashPoint - 1) * 100)}%`,
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%)'
            }}
          ></div>
        )}
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 w-full flex justify-between text-muted-foreground text-xs px-4">
          <div>2s</div>
          <div>4s</div>
          <div>6s</div>
          <div>8s</div>
          <div>Total {timer.toFixed(1)}s</div>
        </div>
      </div>
      
      {/* Result message */}
      {gameState === 'crashed' && betPlaced && (
        <div className={`text-center mb-6 p-3 rounded-lg ${didWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            {didWin ? 'You Won!' : 'You Lost!'}
          </div>
          {didWin && <div>{profit} profit</div>}
        </div>
      )}
      
      {/* Live Bets */}
      <div className="mt-4 flex justify-end space-x-4">
        <LiveBet username="Hidden" amount={50.27} currencySymbol="₺" hidden />
        <LiveBet username="Mpete000" amount={5850.00} currencySymbol="NGN" />
      </div>
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <>
      <GameTabs
        tabs={[
          { id: 'manual', label: 'Manual' },
          { id: 'auto', label: 'Auto' }
        ]}
        activeTab={autoBet ? 'auto' : 'manual'}
        onTabChange={handleTabChange}
      />
      
      <GameControls
        betAmount={betAmount}
        onBetAmountChange={handleBetAmountChange}
        onHalfBet={handleHalfBet}
        onDoubleBet={handleDoubleBet}
        onBet={handleBet}
        betButtonText={gameState !== 'waiting' ? 'Bet (Next Round)' : 'Bet'}
      >
        <div className="mb-4">
          <label className="block text-muted-foreground mb-2">Cashout At</label>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={cashoutAt}
              onChange={(e) => handleCashoutAtChange(e.target.value)}
              className="w-full bg-panel-bg text-foreground"
            />
            <Select defaultValue="2.00">
              <SelectTrigger className="w-12 bg-panel-bg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.50">1.50x</SelectItem>
                <SelectItem value="2.00">2.00x</SelectItem>
                <SelectItem value="5.00">5.00x</SelectItem>
                <SelectItem value="10.00">10.00x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-muted-foreground mb-2">Profit on Win</label>
          <Input
            type="text"
            value={profit}
            readOnly
            className="w-full bg-panel-bg text-foreground"
          />
        </div>
      </GameControls>
      
      {/* Bets List */}
      <div className="bg-panel-bg rounded overflow-y-auto h-48 text-xs mt-4">
        {mockBets.map((bet, idx) => (
          <BetRow
            key={idx}
            username={bet.username}
            amount={bet.amount}
            currencySymbol={bet.currencySymbol}
            hidden={bet.hidden}
          />
        ))}
      </div>
    </>
  );
  
  return (
    <GameLayout
      title="Crash"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default CrashGame;
