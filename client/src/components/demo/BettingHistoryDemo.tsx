import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';

// Bet type definition
type Bet = {
  id: string;
  game: string;
  amount: number;
  multiplier: number;
  payout: number;
  win: boolean;
  timestamp: Date;
};

// Generate a random bet
const generateRandomBet = (): Bet => {
  const games = ['Crash', 'Dice', 'Roulette', 'Slots', 'Mines'];
  const game = games[Math.floor(Math.random() * games.length)];
  
  const amount = Math.floor(Math.random() * 1000) / 10;
  const win = Math.random() > 0.4;
  const multiplier = win 
    ? (Math.random() * 2 + 1).toFixed(2) 
    : (Math.random() * 0.9).toFixed(2);
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    game,
    amount,
    multiplier: parseFloat(multiplier),
    payout: parseFloat((amount * parseFloat(multiplier)).toFixed(2)),
    win,
    timestamp: new Date()
  };
};

export function BettingHistoryDemo() {
  // State for bet history
  const [bets, setBets] = useState<Bet[]>([
    generateRandomBet(),
    generateRandomBet(),
    generateRandomBet()
  ]);
  
  // Auto-animate hook - this is all we need for the animations!
  const [parent] = useAutoAnimate();
  
  // Add a new random bet
  const addBet = () => {
    const newBet = generateRandomBet();
    setBets([newBet, ...bets]);
  };
  
  // Remove a bet by id
  const removeBet = (id: string) => {
    setBets(bets.filter(bet => bet.id !== id));
  };
  
  // Clear all bets
  const clearBets = () => {
    setBets([]);
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Betting History</CardTitle>
        <CardDescription>Animated betting history with auto-animate</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button onClick={addBet} variant="default" size="sm">
            Place Bet
          </Button>
          <Button onClick={clearBets} variant="destructive" size="sm" disabled={bets.length === 0}>
            Clear All
          </Button>
        </div>
        
        {/* Animated list of bets - magic happens with just the ref={parent} */}
        <ul ref={parent} className="space-y-3">
          {bets.length === 0 ? (
            <li className="text-center py-8 text-muted-foreground">
              No bets yet. Click "Place Bet" to simulate a bet.
            </li>
          ) : (
            bets.map(bet => (
              <li key={bet.id} className="relative">
                <div className={`p-3 rounded-lg border ${
                  bet.win ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 
                  'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{bet.game}</h3>
                      <p className="text-xs text-muted-foreground">{formatTime(bet.timestamp)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`font-mono ${bet.win ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {bet.win ? '+' : '-'}${bet.win ? bet.payout.toFixed(2) : bet.amount.toFixed(2)}
                      </span>
                      <span className="flex items-center text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                        {bet.win ? 
                          <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" /> : 
                          <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                        {bet.multiplier}x
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => removeBet(bet.id)} 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2 opacity-50 hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        All animations are handled by @formkit/auto-animate with minimal code
      </CardFooter>
    </Card>
  );
}