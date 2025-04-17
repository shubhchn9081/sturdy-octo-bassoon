import React, { useState, useEffect } from 'react';
import { formatCrypto, calculateProfit } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Import SVG components for Gems and Bombs
import { DiamondSVG, DarkerDiamondSVG } from '@/assets/images/diamond';
import { BombSVG } from '@/assets/images/bomb';

const MINE_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const TOTAL_TILES = 25;
const GRID_ROWS = 5;
const GRID_COLS = 5;

type TileStatus = 'hidden' | 'revealed' | 'mine' | 'gem' | 'selected';
type GameMode = 'manual' | 'auto';
type GameState = 'idle' | 'active' | 'won' | 'lost';

const MinesGame = () => {
  const { getGameResult } = useProvablyFair('mines');
  const { balance, placeBet } = useBalance();
  
  const [gameMode, setGameMode] = useState<GameMode>('manual');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [mineCount, setMineCount] = useState(20);
  const [gemCount, setGemCount] = useState(5);
  const [tiles, setTiles] = useState<TileStatus[]>(Array(TOTAL_TILES).fill('hidden'));
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [revealedPositions, setRevealedPositions] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1.00);
  const [totalProfit, setTotalProfit] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [showCashout, setShowCashout] = useState(false);
  
  // Update gem count when mine count changes
  useEffect(() => {
    setGemCount(TOTAL_TILES - mineCount);
  }, [mineCount]);
  
  // Calculate multiplier when revealed positions or mine count changes
  useEffect(() => {
    if (revealedPositions.length === 0) {
      setMultiplier(1.00);
      setTotalProfit(0);
      return;
    }
    
    // Calculate multiplier based on revealed safe tiles
    const safeSquares = TOTAL_TILES - mineCount;
    const revealed = revealedPositions.length;
    
    // This formula is approximate - real Stake.com may use a different one
    const multi = parseFloat(((safeSquares / (safeSquares - revealed)) * 0.97).toFixed(2));
    setMultiplier(multi);
    
    // Calculate total profit
    const amount = parseFloat(betAmount) || 0;
    const profit = calculateProfit(amount, multi);
    setTotalProfit(profit);
    
    // Show cashout if we've revealed at least one gem
    setShowCashout(gameState === 'active' && revealed > 0);
    
  }, [revealedPositions, mineCount, betAmount, gameState]);
  
  const handleBetAmountChange = (value: string) => {
    if (gameState === 'active') return;
    setBetAmount(value);
  };
  
  const handleHalfBet = () => {
    if (gameState === 'active') return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount((amount / 2).toFixed(8));
  };
  
  const handleDoubleBet = () => {
    if (gameState === 'active') return;
    const amount = parseFloat(betAmount) || 0;
    setBetAmount((amount * 2).toFixed(8));
  };
  
  const handleMineCountChange = (value: string) => {
    if (gameState === 'active') return;
    setMineCount(parseInt(value));
  };
  
  const placeBetAndStart = async () => {
    if (gameState === 'active') return;
    
    // Reset game state
    setTiles(Array(TOTAL_TILES).fill('hidden'));
    setRevealedPositions([]);
    setSelectedTile(null);
    setGameState('active');
    
    // Generate mine positions using provably fair algorithm
    const result = getGameResult();
    if (typeof result === 'function') {
      // Generate random mine positions using provably fair algorithm
      const mines = result(TOTAL_TILES, mineCount);
      setMinePositions(mines);
    } else {
      // Fallback to a simple random algorithm if getGameResult doesn't return a function
      const mines: number[] = [];
      while (mines.length < mineCount) {
        const mine = Math.floor(Math.random() * TOTAL_TILES);
        if (!mines.includes(mine)) {
          mines.push(mine);
        }
      }
      setMinePositions(mines);
    }
    
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
    // If game not active or already clicked, do nothing
    if (gameState !== 'active' || revealedPositions.includes(index)) return;
    
    // If in "random tile" selection mode, just select the tile
    if (selectedTile !== null) {
      setSelectedTile(null); // Clear selection
    }
    
    const newRevealedPositions = [...revealedPositions, index];
    setRevealedPositions(newRevealedPositions);
    
    const newTiles = [...tiles];
    
    // Check if clicked on a mine
    if (minePositions.includes(index)) {
      // Game over - reveal all mines
      minePositions.forEach(pos => {
        newTiles[pos] = 'mine';
      });
      // Also reveal all safe tiles
      for (let i = 0; i < TOTAL_TILES; i++) {
        if (!minePositions.includes(i) && !revealedPositions.includes(i)) {
          newTiles[i] = 'gem';
        }
      }
      setTiles(newTiles);
      setGameState('lost');
      
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
        setGameState('won');
        
        // In a real app, this would call the API to complete the bet
        // completeBet.mutate({
        //   betId: currBetId!,
        //   outcome: { minePositions, revealedPositions: newRevealedPositions, win: true }
        // });
      }
    }
  };
  
  const selectRandomTile = () => {
    if (gameState !== 'active') return;
    
    // Find all hidden tiles that haven't been revealed yet
    const availableTiles: number[] = [];
    for (let i = 0; i < TOTAL_TILES; i++) {
      if (!revealedPositions.includes(i)) {
        availableTiles.push(i);
      }
    }
    
    if (availableTiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTiles.length);
      setSelectedTile(availableTiles[randomIndex]);
    }
  };
  
  const cashout = () => {
    if (gameState !== 'active' || revealedPositions.length === 0) return;
    
    // Reveal all tiles for visual effect
    const newTiles = [...tiles];
    
    // Reveal all mines
    minePositions.forEach(pos => {
      newTiles[pos] = 'mine';
    });
    
    // Reveal all gems
    for (let i = 0; i < TOTAL_TILES; i++) {
      if (!minePositions.includes(i) && !revealedPositions.includes(i)) {
        newTiles[i] = 'gem';
      }
    }
    
    setTiles(newTiles);
    setGameState('won');
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { minePositions, revealedPositions, win: true }
    // });
  };

  const renderManualControls = () => (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Bet Amount</div>
        <div className="flex items-center space-x-1 mb-2">
          <Input
            type="text"
            value={betAmount}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            className="bg-[#243442] border-none text-white h-8 text-sm"
            disabled={gameState === 'active'}
          />
          <Button 
            onClick={handleHalfBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#243442] text-white h-8 px-2"
            disabled={gameState === 'active'}
          >
            ½
          </Button>
          <Button 
            onClick={handleDoubleBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#243442] text-white h-8 px-2"
            disabled={gameState === 'active'}
          >
            2×
          </Button>
        </div>
        
        <div className="text-xs text-right text-gray-400 mt-1">$0.00</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Mines</div>
          <Select 
            value={mineCount.toString()} 
            onValueChange={handleMineCountChange}
            disabled={gameState === 'active'}
          >
            <SelectTrigger className="w-full bg-[#243442] border-none text-white h-8 text-sm">
              <SelectValue placeholder="Select" />
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
        
        <div>
          <div className="text-xs text-muted-foreground mb-1">Gems</div>
          <div className="h-8 bg-[#243442] rounded flex items-center justify-between px-3 text-sm">
            <span>{gemCount}</span>
          </div>
        </div>
      </div>
      
      {/* Total Profit */}
      {gameState === 'active' && revealedPositions.length > 0 ? (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Total profit ({multiplier.toFixed(2)}x)</div>
          <div className="h-8 bg-[#243442] rounded flex items-center justify-between px-3 text-sm">
            <span>{formatCrypto(totalProfit)}</span>
            <span className="text-amber-400">₿</span>
          </div>
        </div>
      ) : null}
      
      {/* Pick Random Tile Button (only shown during active game) */}
      {gameState === 'active' && (
        <Button 
          className="w-full bg-[#243442] hover:bg-[#2a3c4c] text-white h-10"
          onClick={selectRandomTile}
        >
          Pick random tile
        </Button>
      )}
      
      {/* Bet or Cashout Button */}
      {showCashout ? (
        <Button 
          className="w-full bg-[#7bfa4c] hover:bg-[#6ae43d] text-black font-semibold h-12"
          onClick={cashout}
        >
          Cashout
        </Button>
      ) : (
        <Button 
          className="w-full bg-[#7bfa4c] hover:bg-[#6ae43d] text-black font-semibold h-12"
          onClick={placeBetAndStart}
          disabled={gameState === 'active'}
        >
          Bet
        </Button>
      )}
    </div>
  );

  const renderAutoControls = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Auto mode is coming soon</div>
    </div>
  );
  
  const getTileContent = (index: number, status: TileStatus) => {
    if (status === 'revealed') {
      return <DiamondSVG />;
    } else if (status === 'mine') {
      return <BombSVG />;
    } else if (status === 'gem') {
      return <DarkerDiamondSVG />;
    } else if (selectedTile === index) {
      return (
        <div className="absolute inset-0 border-2 border-[#7bfa4c] rounded-md animate-pulse"></div>
      );
    }
    return null;
  };
  
  // Custom multiplier overlay display
  const renderMultiplierOverlay = () => {
    if (gameState === 'active' && revealedPositions.length > 0) {
      const centerIndex = 12; // Middle of the 5x5 grid
      return (
        <div 
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center
                     pointer-events-none z-10`}
        >
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      bg-[#7bfa4c] bg-opacity-20 border-2 border-[#7bfa4c] rounded-md
                      flex flex-col items-center justify-center p-4 w-32 h-32`}
            style={{
              gridRowStart: Math.floor(centerIndex / 5) + 1,
              gridColumnStart: (centerIndex % 5) + 1,
            }}
          >
            <div className="text-xl font-bold text-[#7bfa4c]">{multiplier.toFixed(2)}x</div>
            <div className="text-sm text-white flex items-center">
              {formatCrypto(parseFloat(betAmount) || 0)}
              <span className="text-amber-400 ml-1">₿</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Render the game grid with positioned tiles
  const renderGameGrid = () => (
    <div className="relative grid grid-cols-5 gap-2">
      {tiles.map((status, index) => (
        <button
          key={index}
          className={`
            relative h-[70px] w-full rounded-md cursor-pointer flex items-center justify-center transition-colors
            ${status === 'hidden' ? 'bg-[#1a2c38] hover:bg-[#223543]' : ''}
            ${status === 'revealed' ? 'bg-[#1a2c38]' : ''}
            ${status === 'mine' ? 'bg-[#1a2c38]' : ''}
            ${status === 'gem' ? 'bg-[#1a2c38]' : ''}
          `}
          onClick={() => handleTileClick(index)}
          disabled={gameState !== 'active' || revealedPositions.includes(index)}
        >
          {getTileContent(index, status)}
        </button>
      ))}
      
      {/* Multiplier overlay when game is active */}
      {renderMultiplierOverlay()}
    </div>
  );
  
  // Main render
  return (
    <div className="flex flex-col lg:flex-row w-full bg-[#0F212E] text-white h-[calc(100vh-60px)]">
      {/* Side Panel */}
      <div className="w-full lg:w-[320px] p-4 bg-[#172B3A] border-r border-[#243442]/50">
        <Tabs defaultValue="manual" className="w-full" onValueChange={(v) => setGameMode(v as GameMode)}>
          <TabsList className="w-full grid grid-cols-2 bg-[#0F212E] mb-4 h-9 overflow-hidden rounded-md p-0">
            <TabsTrigger 
              value="manual" 
              className="h-full rounded-none data-[state=active]:bg-[#172B3A] data-[state=active]:text-white"
            >
              Manual
            </TabsTrigger>
            <TabsTrigger 
              value="auto" 
              className="h-full rounded-none data-[state=active]:bg-[#172B3A] data-[state=active]:text-white"
            >
              Auto
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-0">
            {renderManualControls()}
          </TabsContent>
          
          <TabsContent value="auto" className="mt-0">
            {renderAutoControls()}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Game Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="mx-auto max-w-3xl">
          {/* Game grid */}
          {renderGameGrid()}
        </div>
      </div>
    </div>
  );
};

export default MinesGame;