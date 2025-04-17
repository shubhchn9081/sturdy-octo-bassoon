import React, { useState, useEffect } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Button } from '@/components/ui/button';
import { Bomb, Diamond } from 'lucide-react';

const MINE_COUNTS = [3, 5, 10, 15, 20, 24];
const TOTAL_TILES = 25;

type TileStatus = 'hidden' | 'revealed' | 'mine';

const MinesGame = () => {
  const { getGameResult } = useProvablyFair('mines');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [mineCount, setMineCount] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [tiles, setTiles] = useState<TileStatus[]>(Array(TOTAL_TILES).fill('hidden'));
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [revealedPositions, setRevealedPositions] = useState<number[]>([]);
  const [nextMultiplier, setNextMultiplier] = useState(1.00);
  const [profit, setProfit] = useState('0.00000000');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [currBetId, setCurrBetId] = useState<number | null>(null);
  
  // Calculate next multiplier when revealed positions or mine count changes
  useEffect(() => {
    if (revealedPositions.length === 0) {
      setNextMultiplier(1.00);
      return;
    }
    
    // This is a simplified multiplier calculation
    // In a real implementation, this would be more complex
    const safeSquares = TOTAL_TILES - mineCount;
    const revealed = revealedPositions.length;
    const multi = parseFloat(((safeSquares / (safeSquares - revealed)) * 0.97).toFixed(2));
    setNextMultiplier(multi);
    
    // Calculate current profit
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (multi - 1);
    setProfit(formatCrypto(profitValue));
    
  }, [revealedPositions, mineCount, betAmount]);
  
  const handleBetAmountChange = (value: string) => {
    if (gameActive) return;
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    if (gameActive) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount / 2));
  };
  
  const handleDoubleBet = () => {
    if (gameActive) return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount(formatCrypto(amount * 2));
  };
  
  const handleMineCountChange = (value: string) => {
    if (gameActive) return;
    setMineCount(parseInt(value));
  };
  
  const startGame = async () => {
    if (gameActive) return;
    
    // Reset game state
    setTiles(Array(TOTAL_TILES).fill('hidden'));
    setRevealedPositions([]);
    setGameOver(false);
    setWon(false);
    setProfit('0.00000000');
    
    // Generate mine positions using provably fair algorithm
    const mines = getGameResult()(TOTAL_TILES, mineCount) as number[];
    setMinePositions(mines);
    setGameActive(true);
    
    // In a real app, this would call the API to place a bet
    // const response = await placeBet.mutateAsync({
    //   amount: parseFloat(betAmount),
    //   gameId: 2, // Mines game id
    //   clientSeed: 'seed',
    //   options: { mineCount }
    // });
    // setCurrBetId(response.data.betId);
  };
  
  const handleTileClick = (index: number) => {
    if (!gameActive || gameOver || revealedPositions.includes(index)) return;
    
    const newRevealedPositions = [...revealedPositions, index];
    setRevealedPositions(newRevealedPositions);
    
    const newTiles = [...tiles];
    
    // Check if clicked on a mine
    if (minePositions.includes(index)) {
      // Game over - reveal all mines
      minePositions.forEach(pos => {
        newTiles[pos] = 'mine';
      });
      setTiles(newTiles);
      setGameOver(true);
      setWon(false);
      setGameActive(false);
      
      // In a real app, this would call the API to complete the bet
      // completeBet.mutate({
      //   betId: currBetId!,
      //   outcome: { minePositions, revealedPositions: newRevealedPositions, win: false }
      // });
    } else {
      // Reveal gem
      newTiles[index] = 'revealed';
      setTiles(newTiles);
      
      // Check if all non-mine tiles are revealed
      const safeSquares = TOTAL_TILES - mineCount;
      if (newRevealedPositions.length === safeSquares) {
        // Player won by revealing all safe tiles
        setGameOver(true);
        setWon(true);
        setGameActive(false);
        
        // In a real app, this would call the API to complete the bet
        // completeBet.mutate({
        //   betId: currBetId!,
        //   outcome: { minePositions, revealedPositions: newRevealedPositions, win: true }
        // });
      }
    }
  };
  
  const cashout = () => {
    if (!gameActive || gameOver || revealedPositions.length === 0) return;
    
    // Game over with win
    const newTiles = [...tiles];
    minePositions.forEach(pos => {
      newTiles[pos] = 'mine';
    });
    setTiles(newTiles);
    setGameOver(true);
    setWon(true);
    setGameActive(false);
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { minePositions, revealedPositions, win: true }
    // });
  };
  
  // Game visualization panel
  const gamePanel = (
    <div>
      {/* Game result message */}
      {gameOver && (
        <div className={`text-center mb-6 p-3 rounded-lg ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            {won ? 'You Won!' : 'You Lost!'}
          </div>
          {won && <div>{profit} profit</div>}
        </div>
      )}
      
      {/* Mines grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {tiles.map((status, index) => (
          <button
            key={index}
            className={`
              h-14 rounded cursor-pointer flex items-center justify-center transition-colors
              ${status === 'hidden' ? 'bg-panel-bg hover:bg-muted' : ''}
              ${status === 'revealed' ? 'bg-green-500/70 text-white' : ''}
              ${status === 'mine' ? 'bg-red-500/70 text-white' : ''}
            `}
            onClick={() => handleTileClick(index)}
            disabled={!gameActive || gameOver}
          >
            {status === 'mine' && <Bomb className="h-6 w-6" />}
            {status === 'revealed' && <Diamond className="h-6 w-6" />}
          </button>
        ))}
      </div>
      
      {/* Game stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-1 text-xs">Next Multiplier</div>
          <div className="text-foreground font-medium">{nextMultiplier.toFixed(2)}x</div>
        </div>
        <div className="bg-panel-bg p-3 rounded">
          <div className="text-muted-foreground mb-1 text-xs">Profit</div>
          <div className="text-foreground font-medium">{profit}</div>
        </div>
      </div>
      
      {/* Cashout button */}
      {gameActive && revealedPositions.length > 0 && !gameOver && (
        <Button 
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
          onClick={cashout}
        >
          Cashout {nextMultiplier.toFixed(2)}x
        </Button>
      )}
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <GameControls
      betAmount={betAmount}
      onBetAmountChange={handleBetAmountChange}
      onHalfBet={handleHalfBet}
      onDoubleBet={handleDoubleBet}
      onBet={startGame}
      betButtonText={gameActive ? 'Game in Progress' : 'Bet'}
      betButtonDisabled={gameActive}
    >
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Mines</label>
        <Select 
          value={mineCount.toString()} 
          onValueChange={handleMineCountChange}
          disabled={gameActive}
        >
          <SelectTrigger className="w-full bg-panel-bg">
            <SelectValue placeholder="Select mine count" />
          </SelectTrigger>
          <SelectContent>
            {MINE_COUNTS.map((count) => (
              <SelectItem key={count} value={count.toString()}>
                {count}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </GameControls>
  );
  
  return (
    <GameLayout
      title="Mines"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default MinesGame;
