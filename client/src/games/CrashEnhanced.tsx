import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/UserContext';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import PhaserCrash from './PhaserCrash';

type CrashState = 'waiting' | 'running' | 'crashed';

interface CrashProps {
  gameId: number;
}

function CrashEnhanced({ gameId = 1 }: CrashProps) {
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('10.00');
  const [targetMultiplier, setTargetMultiplier] = useState('2.00');
  const [state, setState] = useState<CrashState>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [hasBet, setHasBet] = useState(false);
  const [difficulty, setDifficulty] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [betHistory, setBetHistory] = useState<Array<{
    username: string;
    amount: number;
    cashout: number | null;
    profit: number | null;
  }>>([]);
  
  // Get provably fair functions
  const { getGameResult } = useProvablyFair();

  // Generate a crash point based on provably fair algorithm
  const generateCrashPoint = () => {
    const outcome = getGameResult();
    // Convert the outcome to a crash point using house edge 5%
    const houseEdge = 0.95;
    const crashPoint = Math.max(1.01, 99 / (outcome * 100) * houseEdge);
    return crashPoint;
  };

  // Handle betting
  const handleBet = () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to place bets",
        variant: "destructive",
      });
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient balance
    if (!user.balance || !user.balance.INR || user.balance.INR < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet",
        variant: "destructive",
      });
      return;
    }

    const target = parseFloat(targetMultiplier);
    if (isNaN(target) || target <= 1) {
      toast({
        title: "Invalid Target",
        description: "Auto cashout must be greater than 1.00x",
        variant: "destructive",
      });
      return;
    }

    // Deduct bet amount from balance
    updateUserBalance('INR', -betAmount);
    
    // Generate new crash point
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    
    // Reset game state
    setHasBet(true);
    setCashoutMultiplier(null);
    setState('waiting');
    
    // Add to bet history
    setBetHistory(prev => [{
      username: user.username,
      amount: betAmount,
      cashout: null,
      profit: null
    }, ...prev.slice(0, 9)]);
    
    toast({
      title: "Bet Placed",
      description: `Bet placed for ${betAmount.toFixed(2)} INR with auto cashout at ${target.toFixed(2)}x`,
    });

    // Start the game if it's not already running
    if (state !== 'running') {
      startGame();
    }
  };

  // Handle manual cashout
  const handleCashout = () => {
    if (!hasBet || state !== 'running' || cashoutMultiplier !== null) {
      return;
    }
    
    const cashout = currentMultiplier;
    const betAmount = parseFloat(amount);
    const profit = betAmount * cashout - betAmount;
    
    // Update balance
    updateUserBalance('INR', betAmount * cashout);
    
    // Update state
    setCashoutMultiplier(cashout);
    
    // Update bet history
    setBetHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length > 0) {
        newHistory[0].cashout = cashout;
        newHistory[0].profit = profit;
      }
      return newHistory;
    });
    
    toast({
      title: "Cashed Out",
      description: `Successfully cashed out at ${cashout.toFixed(2)}x for ${profit.toFixed(2)} INR profit`,
      variant: "default",
    });
  };

  // Start the game
  const startGame = () => {
    setIsPlaying(true);
    setState('running');
    setCurrentMultiplier(1.00);
  };

  // Handle when the game crashes
  const handleCrash = (crashMultiplier: number) => {
    setState('crashed');
    setIsPlaying(false);
    
    setTimeout(() => {
      // If bet exists and user didn't cash out, update history to show loss
      if (hasBet && cashoutMultiplier === null) {
        setBetHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length > 0) {
            newHistory[0].cashout = 0;
            newHistory[0].profit = -parseFloat(amount);
          }
          return newHistory;
        });
        
        toast({
          title: "Game Crashed",
          description: `Game crashed at ${crashMultiplier.toFixed(2)}x. You lost ${parseFloat(amount).toFixed(2)} INR`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Game Crashed",
          description: `Game crashed at ${crashMultiplier.toFixed(2)}x`,
        });
      }
      
      // Reset game state after crash
      setTimeout(() => {
        setState('waiting');
        setHasBet(false);
        setCashoutMultiplier(null);
        setCurrentMultiplier(1.00);
      }, 2000);
    }, 1000);
  };

  // Handle multiplier updates from the game
  const handleTick = (multiplier: number) => {
    setCurrentMultiplier(multiplier);
    
    // Check if we should auto cashout
    if (hasBet && cashoutMultiplier === null && multiplier >= parseFloat(targetMultiplier)) {
      handleCashout();
    }
  };

  // Format the multiplier for display
  const formatMultiplier = (value: number) => {
    if (value < 10) {
      return value.toFixed(2);
    } else if (value < 100) {
      return value.toFixed(1);
    } else {
      return Math.floor(value).toString();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Game Display */}
      <div className="lg:col-span-2">
        <Card className="bg-[#172B3A] border-[#243442] text-white overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="flex justify-between items-center">
              <span>Crash</span>
              {state === 'running' && (
                <span className={`text-2xl font-bold ${
                  currentMultiplier >= 2 ? currentMultiplier >= 5 ? 'text-red-500' : 'text-yellow-500' : 'text-blue-500'
                }`}>
                  {formatMultiplier(currentMultiplier)}x
                </span>
              )}
              {state === 'crashed' && crashPoint && (
                <span className="text-2xl font-bold text-red-500">
                  {formatMultiplier(crashPoint)}x
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Game visualization */}
            <div className="relative w-full h-[400px] overflow-hidden">
              <PhaserCrash 
                onCrash={handleCrash}
                onTick={handleTick}
                startPoint={crashPoint ?? undefined}
                isPlaying={isPlaying}
                difficulty={difficulty}
              />
              
              {state === 'waiting' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    className="bg-[#1375e1] hover:bg-[#1060c0] text-white px-6 py-3 text-lg"
                    onClick={startGame}
                  >
                    Start Game
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <div className="lg:col-span-1">
        <Card className="bg-[#172B3A] border-[#243442] text-white h-full">
          <CardHeader>
            <CardTitle>Place Bet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bet amount */}
              <div>
                <label className="block text-sm font-medium mb-1">Bet Amount (INR)</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#0F212E] border-[#243442]"
                    disabled={state === 'running' && hasBet}
                  />
                  <div className="grid grid-cols-3 gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmount((parseFloat(amount) / 2).toFixed(2))}
                      className="border-[#243442] text-[#7F8990]"
                      disabled={state === 'running' && hasBet}
                    >
                      ½
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmount((parseFloat(amount) * 2).toFixed(2))}
                      className="border-[#243442] text-[#7F8990]"
                      disabled={state === 'running' && hasBet}
                    >
                      2×
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAmount(user?.balance?.INR ? user.balance.INR.toFixed(2) : '0.00')}
                      className="border-[#243442] text-[#7F8990]"
                      disabled={state === 'running' && hasBet}
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Auto cashout */}
              <div>
                <label className="block text-sm font-medium mb-1">Auto Cashout at</label>
                <div className="flex">
                  <Input
                    type="text"
                    value={targetMultiplier}
                    onChange={(e) => setTargetMultiplier(e.target.value)}
                    className="bg-[#0F212E] border-[#243442]"
                    disabled={state === 'running' && hasBet}
                  />
                  <span className="flex items-center ml-2 text-[#7F8990]">×</span>
                </div>
              </div>
              
              {/* Place bet button */}
              {(!hasBet || state === 'waiting') && (
                <Button
                  className="w-full bg-[#20b26c] hover:bg-[#1a9b5c] mb-2"
                  onClick={handleBet}
                  disabled={state === 'running' && hasBet}
                >
                  Place Bet
                </Button>
              )}
              
              {/* Cashout button */}
              {hasBet && state === 'running' && cashoutMultiplier === null && (
                <Button
                  className={`w-full bg-[#ff9500] hover:bg-[#e78800] mb-2 relative overflow-hidden`}
                  onClick={handleCashout}
                >
                  <div className="relative z-10">
                    Cashout {formatMultiplier(currentMultiplier)}×
                  </div>
                  <div 
                    className="absolute inset-0 bg-[#e78800]"
                    style={{
                      width: `${Math.min(100, (currentMultiplier / parseFloat(targetMultiplier)) * 100)}%`,
                      transition: 'width 0.1s linear'
                    }}
                  />
                </Button>
              )}
              
              {/* Cashout result */}
              {cashoutMultiplier !== null && (
                <div className="p-3 bg-[#20b26c20] border border-[#20b26c] rounded-md text-center mb-2">
                  <p className="text-[#20b26c] font-semibold">
                    Cashed out at {formatMultiplier(cashoutMultiplier)}×
                  </p>
                  <p className="text-[#7F8990]">
                    Profit: {((parseFloat(amount) * cashoutMultiplier) - parseFloat(amount)).toFixed(2)} INR
                  </p>
                </div>
              )}
              
              {/* Previous bets */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Bet History</h3>
                <div className="bg-[#0F212E] rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#243442]">
                        <th className="p-2 text-left text-[#7F8990]">User</th>
                        <th className="p-2 text-right text-[#7F8990]">Bet</th>
                        <th className="p-2 text-right text-[#7F8990]">Cashout</th>
                        <th className="p-2 text-right text-[#7F8990]">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {betHistory.length > 0 ? (
                        betHistory.map((bet, index) => (
                          <tr key={index} className="border-b border-[#243442] last:border-0">
                            <td className="p-2 text-left">{bet.username}</td>
                            <td className="p-2 text-right">{bet.amount.toFixed(2)}</td>
                            <td className="p-2 text-right">
                              {bet.cashout === null ? (
                                <span className="text-yellow-500">Active</span>
                              ) : bet.cashout === 0 ? (
                                <span className="text-red-500">Bust</span>
                              ) : (
                                <span className="text-green-500">{bet.cashout.toFixed(2)}×</span>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              {bet.profit === null ? (
                                "-"
                              ) : bet.profit < 0 ? (
                                <span className="text-red-500">{bet.profit.toFixed(2)}</span>
                              ) : (
                                <span className="text-green-500">+{bet.profit.toFixed(2)}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-2 text-center text-[#7F8990]">
                            No bets yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CrashEnhanced;