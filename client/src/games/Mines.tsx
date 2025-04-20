import React, { useState, useEffect } from 'react';
import { formatCrypto, calculateProfit } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Import SVG components for Gems and Bombs
import { BombImage, DiamondImage, DarkerDiamondImage } from '@/assets/minesSvgComponents';

const MINE_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 25 cells

type TileStatus = 'hidden' | 'revealed' | 'mine' | 'gem' | 'selected';
type GameMode = 'manual' | 'auto';

// Define game state interface based on the new logic
interface GameStateType {
  betAmount: number;
  numberOfMines: number;
  minePositions: number[];
  revealed: boolean[];
  isGameOver: boolean;
  isWon: boolean;
  diamondsCollected: number;
  multiplier: number;
}

const MinesGame = () => {
  const { getGameResult } = useProvablyFair('mines');
  const { balance, placeBet } = useBalance();
  
  const [gameMode, setGameMode] = useState<GameMode>('manual');
  const [betAmountStr, setBetAmountStr] = useState('0.00000001');
  const [mineCount, setMineCount] = useState(20);
  const [tiles, setTiles] = useState<TileStatus[]>(Array(TOTAL_CELLS).fill('hidden'));
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  // New game state with the logic from the provided code
  const [gameState, setGameState] = useState<GameStateType | null>(null);
  
  // Calculate gem count
  const gemCount = TOTAL_CELLS - mineCount;
  
  // Calculate total profit
  const totalProfit = gameState 
    ? calculateProfit(gameState.betAmount, gameState.multiplier) 
    : 0;

  // Show cashout if game is active and we've revealed at least one diamond
  const showCashout = gameState && !gameState.isGameOver && gameState.diamondsCollected > 0;
  
  const handleBetAmountChange = (value: string) => {
    if (gameState && !gameState.isGameOver) return;
    setBetAmountStr(value);
  };
  
  const handleHalfBet = () => {
    if (gameState && !gameState.isGameOver) return;
    const amount = parseFloat(betAmountStr) || 0;
    setBetAmountStr((amount / 2).toFixed(8));
  };
  
  const handleDoubleBet = () => {
    if (gameState && !gameState.isGameOver) return;
    const amount = parseFloat(betAmountStr) || 0;
    setBetAmountStr((amount * 2).toFixed(8));
  };
  
  const handleMineCountChange = (value: string) => {
    if (gameState && !gameState.isGameOver) return;
    setMineCount(parseInt(value));
  };

  // Generate mine positions using provably fair algorithm or fallback
  function generateMinePositions(numberOfMines: number): number[] {
    const result = getGameResult();
    if (typeof result === 'function') {
      // Use provably fair algorithm if available
      return result(TOTAL_CELLS, numberOfMines);
    } else {
      // Fallback to simple random algorithm
      const positions = new Set<number>();
      while (positions.size < numberOfMines) {
        const randomPos = Math.floor(Math.random() * TOTAL_CELLS);
        positions.add(randomPos);
      }
      return [...positions];
    }
  }

  // Calculate multiplier using the provided formula
  function calculateMultiplier(diamonds: number, mines: number): number {
    if (diamonds === 0) return 1;
    const oddsLeft = TOTAL_CELLS - diamonds;
    const mineChance = mines / oddsLeft;
    const safeChance = 1 - mineChance;
    const payout = 1 * Math.pow(1 / safeChance, diamonds);
    return +payout.toFixed(4); // Round to 4 decimal places like Stake
  }
  
  // Start a new game
  const startGame = () => {
    if (gameState && !gameState.isGameOver) return;
    
    const betAmount = parseFloat(betAmountStr) || 0.00000001;
    const minePositions = generateMinePositions(mineCount);
    
    // Create new game state
    const newGameState: GameStateType = {
      betAmount,
      numberOfMines: mineCount,
      minePositions,
      revealed: Array(TOTAL_CELLS).fill(false),
      isGameOver: false,
      isWon: false,
      diamondsCollected: 0,
      multiplier: 1,
    };
    
    setGameState(newGameState);
    setTiles(Array(TOTAL_CELLS).fill('hidden'));
    setSelectedTile(null);
    
    // In a real app, this would call the API to place a bet
    // const response = await placeBet.mutateAsync({
    //   amount: betAmount,
    //   gameId: 2, // Mines game id
    //   clientSeed: 'seed',
    //   options: { mineCount }
    // });
  };
  
  // Reveal a cell
  const revealCell = (cellIndex: number) => {
    if (!gameState || gameState.isGameOver || gameState.revealed[cellIndex]) return;
    
    // Create copy of current game state
    const updatedGameState = { ...gameState };
    updatedGameState.revealed = [...gameState.revealed];
    
    // Mark cell as revealed
    updatedGameState.revealed[cellIndex] = true;
    
    // Check if clicked on a mine
    if (gameState.minePositions.includes(cellIndex)) {
      updatedGameState.isGameOver = true;
      updatedGameState.isWon = false;
      
      // Update tiles display
      const newTiles = [...tiles];
      
      // Reveal all mines
      gameState.minePositions.forEach(pos => {
        newTiles[pos] = 'mine';
      });
      
      // Reveal all gems that weren't clicked
      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (!gameState.minePositions.includes(i) && !updatedGameState.revealed[i]) {
          newTiles[i] = 'gem';
        }
      }
      
      setTiles(newTiles);
    } else {
      // Clicked on a diamond
      updatedGameState.diamondsCollected++;
      updatedGameState.multiplier = calculateMultiplier(
        updatedGameState.diamondsCollected,
        updatedGameState.numberOfMines
      );
      
      // Update tiles display
      const newTiles = [...tiles];
      newTiles[cellIndex] = 'revealed';
      setTiles(newTiles);
      
      // Check if all diamonds are collected
      if (updatedGameState.diamondsCollected === TOTAL_CELLS - updatedGameState.numberOfMines) {
        updatedGameState.isGameOver = true;
        updatedGameState.isWon = true;
      }
    }
    
    setGameState(updatedGameState);
    
    // In a real app, this would call the API to complete the bet
    // if (updatedGameState.isGameOver) {
    //   completeBet.mutate({
    //     betId: currBetId!,
    //     outcome: { 
    //       minePositions: updatedGameState.minePositions, 
    //       revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1),
    //       win: updatedGameState.isWon 
    //     }
    //   });
    // }
  };
  
  // Handle tile click
  const handleTileClick = (index: number) => {
    // If in "random tile" selection mode, just clear the selection
    if (selectedTile !== null) {
      setSelectedTile(null);
    }
    
    revealCell(index);
  };
  
  // Select a random tile
  const selectRandomTile = () => {
    if (!gameState || gameState.isGameOver) return;
    
    // Find all hidden tiles that haven't been revealed yet
    const availableTiles: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (!gameState.revealed[i]) {
        availableTiles.push(i);
      }
    }
    
    if (availableTiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTiles.length);
      setSelectedTile(availableTiles[randomIndex]);
    }
  };
  
  // Cash out and end the game
  const cashout = () => {
    if (!gameState || gameState.isGameOver || gameState.diamondsCollected === 0) return;
    
    // Create copy of current game state
    const updatedGameState = { ...gameState };
    updatedGameState.isGameOver = true;
    updatedGameState.isWon = true;
    
    // Reveal all tiles for visual effect
    const newTiles = [...tiles];
    
    // Reveal all mines
    gameState.minePositions.forEach(pos => {
      newTiles[pos] = 'mine';
    });
    
    // Reveal all gems that weren't clicked
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (!gameState.minePositions.includes(i) && !gameState.revealed[i]) {
        newTiles[i] = 'gem';
      }
    }
    
    setTiles(newTiles);
    setGameState(updatedGameState);
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { 
    //     minePositions: updatedGameState.minePositions, 
    //     revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1),
    //     win: true 
    //   }
    // });
    
    return calculateProfit(updatedGameState.betAmount, updatedGameState.multiplier);
  };

  const renderManualControls = () => (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-[#546D7A] mb-1">Bet Amount</div>
        <div className="mb-1 text-sm px-3 py-2 text-right bg-[#1c1c2b] border border-[#333] rounded-[6px]">$0.00</div>
        <div className="flex items-center space-x-1 mb-2">
          <Input
            type="text"
            value={betAmountStr}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            className="bg-[#1c1c2b] border border-[#333] text-white h-10 text-sm rounded-[6px]"
            disabled={gameState && !gameState.isGameOver}
            style={{ padding: '10px', fontSize: '14px', width: '100%' }}
          />
          <Button 
            onClick={handleHalfBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#333] text-white h-10 px-2 rounded-[6px]"
            disabled={gameState && !gameState.isGameOver}
          >
            ½
          </Button>
          <Button 
            onClick={handleDoubleBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#333] text-white h-10 px-2 rounded-[6px]"
            disabled={gameState && !gameState.isGameOver}
          >
            2×
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-[#546D7A] mb-1">Mines</div>
          <Select 
            value={mineCount.toString()} 
            onValueChange={handleMineCountChange}
            disabled={gameState && !gameState.isGameOver}
          >
            <SelectTrigger className="w-full bg-[#1c1c2b] border border-[#333] text-white h-10 text-sm rounded-[6px]" style={{ padding: '10px', fontSize: '14px' }}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#1c1c2b] border border-[#333] text-white rounded-[6px]">
              {MINE_COUNTS.map((count) => (
                <SelectItem key={count} value={count.toString()} className="hover:bg-[#2f2f3d]">
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="text-xs text-[#546D7A] mb-1">Gems</div>
          <div className="h-10 bg-[#1c1c2b] border border-[#333] rounded-[6px] flex items-center justify-between px-3 text-sm">
            <span>{gemCount}</span>
          </div>
        </div>
      </div>
      
      {/* Total Profit */}
      {gameState && !gameState.isGameOver && gameState.diamondsCollected > 0 ? (
        <div>
          <div className="text-xs text-[#546D7A] mb-1">
            Total profit ({gameState.multiplier.toFixed(2)}x)
          </div>
          <div className="h-10 bg-[#1c1c2b] border border-[#333] rounded-[6px] flex items-center justify-between px-3 text-sm">
            <span>{formatCrypto(totalProfit)}</span>
            <span className="text-amber-400">₿</span>
          </div>
        </div>
      ) : null}
      
      {/* Pick Random Tile Button (only shown during active game) */}
      {gameState && !gameState.isGameOver && (
        <Button 
          className="w-full bg-[#1c1c2b] hover:bg-[#2f2f3d] text-white h-10 border border-[#333] rounded-[6px] transition-all duration-200"
          onClick={selectRandomTile}
        >
          Pick random tile
        </Button>
      )}
      
      {/* Bet or Cashout Button */}
      {showCashout ? (
        <Button 
          className="w-full bg-[#00ff5a] hover:bg-[#00e050] text-black font-bold h-12 rounded-[6px] transition-all duration-200"
          onClick={cashout}
        >
          Cashout
        </Button>
      ) : (
        <Button 
          className="w-full bg-[#00ff5a] hover:bg-[#00e050] text-black font-bold h-12 rounded-[6px] transition-all duration-200"
          onClick={startGame}
          disabled={gameState && !gameState.isGameOver}
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
      return <DiamondImage />;
    } else if (status === 'mine') {
      return <BombImage />;
    } else if (status === 'gem') {
      return <DarkerDiamondImage />;
    } else if (selectedTile === index) {
      return (
        <div className="absolute inset-0 border-2 border-[#7bfa4c] rounded-md animate-pulse"></div>
      );
    }
    return null;
  };
  
  // Custom multiplier overlay display
  const renderMultiplierOverlay = () => {
    if (gameState && !gameState.isGameOver && gameState.diamondsCollected > 0) {
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
              gridRowStart: Math.floor(centerIndex / GRID_SIZE) + 1,
              gridColumnStart: (centerIndex % GRID_SIZE) + 1,
            }}
          >
            <div className="text-xl font-bold text-[#7bfa4c]">{gameState.multiplier.toFixed(2)}x</div>
            <div className="text-sm text-white flex items-center">
              {formatCrypto(gameState.betAmount)}
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
    <div className="relative grid-container grid" style={{ 
      gridTemplateColumns: 'repeat(5, 88px)', 
      gridTemplateRows: 'repeat(5, 88px)', 
      gap: '10px',
      padding: '20px',
      margin: 'auto',
      marginTop: '20px' 
    }}>
      {tiles.map((status, index) => (
        <button
          key={index}
          className={`
            relative w-[88px] h-[88px] rounded-[10px] cursor-pointer tile flex items-center justify-center 
            transition-all duration-200 ease-in
            ${status === 'hidden' ? 'bg-[#2f2f3d] hover:bg-[#3a3a4d] shadow-[inset_0_0_5px_#1e1e2f]' : ''}
            ${status === 'revealed' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
            ${status === 'mine' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-explosion' : ''}
            ${status === 'gem' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
          `}
          onClick={() => handleTileClick(index)}
          disabled={!gameState || gameState.isGameOver || gameState.revealed[index]}
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
    <div className="flex flex-col lg:flex-row w-full bg-[#0F212E] text-white h-[calc(100vh-60px)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Side Panel */}
      <div className="w-full lg:w-[280px] p-2 bg-[#172B3A] border-r border-[#243442]/50">
        <Tabs defaultValue="manual" className="w-full" onValueChange={(v) => setGameMode(v as GameMode)}>
          <TabsList className="w-full grid grid-cols-2 bg-[#0F212E] mb-2 h-8 overflow-hidden rounded-md p-0">
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
            <div className="controls bg-[#1c1c2b] p-3 rounded-[10px]">
              {renderManualControls()}
            </div>
          </TabsContent>
          
          <TabsContent value="auto" className="mt-0">
            <div className="controls bg-[#1c1c2b] p-3 rounded-[10px]">
              {renderAutoControls()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Game Area */}
      <div className="flex-1 overflow-auto">
        <div className="w-full h-full flex items-center justify-center">
          <div className="grid-wrapper flex items-center justify-center">
            {/* Game grid */}
            {renderGameGrid()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;