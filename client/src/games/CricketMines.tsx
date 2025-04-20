import React, { useState, useEffect } from 'react';
import { formatCrypto, calculateProfit } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Import SVG components for Cricket (Six and Out)
import { OutImage, SixImage, DarkerSixImage } from '@/assets/cricketMinesSvgComponents';

const OUT_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 25 cells

type TileStatus = 'hidden' | 'revealed' | 'out' | 'six' | 'selected';
type GameMode = 'manual' | 'auto';

// Define game state interface based on the new logic
interface GameStateType {
  betAmount: number;
  numberOfOuts: number;
  outPositions: number[];
  revealed: boolean[];
  isGameOver: boolean;
  isWon: boolean;
  sixesCollected: number;
  multiplier: number;
}

const CricketMinesGame = () => {
  const { getGameResult } = useProvablyFair('cricket-mines');
  const { rawBalance, placeBet, completeBet } = useBalance('INR');
  
  const [gameMode, setGameMode] = useState<GameMode>('manual');
  const [betAmountStr, setBetAmountStr] = useState('10.00');
  const [outCount, setOutCount] = useState(20);
  const [tiles, setTiles] = useState<TileStatus[]>(Array(TOTAL_CELLS).fill('hidden'));
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [currBetId, setCurrBetId] = useState<number | null>(null);

  // New game state with the logic from the provided code
  const [gameState, setGameState] = useState<GameStateType | null>(null);
  
  // Calculate sixes count
  const sixCount = TOTAL_CELLS - outCount;
  
  // Calculate total profit
  const totalProfit = gameState 
    ? calculateProfit(gameState.betAmount, gameState.multiplier) 
    : 0;

  // Show cashout if game is active and we've revealed at least one six
  const showCashout = gameState && !gameState.isGameOver && gameState.sixesCollected > 0;
  
  const handleBetAmountChange = (value: string) => {
    if (gameState && !gameState.isGameOver) return;
    
    // Allow empty input for easier editing
    if (value === '') {
      setBetAmountStr('');
      return;
    }
    
    // Only allow valid numeric inputs with up to 2 decimal places for INR
    const regex = /^[0-9]*\.?[0-9]{0,2}$/;
    if (regex.test(value)) {
      setBetAmountStr(value);
    }
  };
  
  const handleHalfBet = () => {
    if (gameState && !gameState.isGameOver) return;
    const amount = parseFloat(betAmountStr) || 0;
    // For INR we only need 2 decimal places
    setBetAmountStr((amount / 2).toFixed(2));
  };
  
  const handleDoubleBet = () => {
    if (gameState && !gameState.isGameOver) return;
    const amount = parseFloat(betAmountStr) || 0;
    // For INR we only need 2 decimal places
    setBetAmountStr((amount * 2).toFixed(2));
  };
  
  const handleOutCountChange = (value: string) => {
    if (gameState && !gameState.isGameOver) return;
    setOutCount(parseInt(value));
  };

  // Generate out positions using provably fair algorithm or fallback
  function generateOutPositions(numberOfOuts: number): number[] {
    const result = getGameResult();
    if (typeof result === 'function') {
      // Use provably fair algorithm if available
      return result(TOTAL_CELLS, numberOfOuts);
    } else {
      // Fallback to simple random algorithm
      const positions = new Set<number>();
      while (positions.size < numberOfOuts) {
        const randomPos = Math.floor(Math.random() * TOTAL_CELLS);
        positions.add(randomPos);
      }
      return [...positions];
    }
  }

  // Calculate multiplier using the provided formula
  function calculateMultiplier(sixes: number, outs: number): number {
    if (sixes === 0) return 1;
    const oddsLeft = TOTAL_CELLS - sixes;
    const outChance = outs / oddsLeft;
    const safeChance = 1 - outChance;
    const payout = 1 * Math.pow(1 / safeChance, sixes);
    return +payout.toFixed(4); // Round to 4 decimal places like Stake
  }
  
  // Start a new game
  const startGame = () => {
    if (gameState && !gameState.isGameOver) return;
    
    const betAmount = parseFloat(betAmountStr) || 0.00000001;
    const outPositions = generateOutPositions(outCount);
    
    // Create new game state
    const newGameState: GameStateType = {
      betAmount,
      numberOfOuts: outCount,
      outPositions,
      revealed: Array(TOTAL_CELLS).fill(false),
      isGameOver: false,
      isWon: false,
      sixesCollected: 0,
      multiplier: 1,
    };
    
    setGameState(newGameState);
    setTiles(Array(TOTAL_CELLS).fill('hidden'));
    setSelectedTile(null);
    
    // Call the API to place a bet and deduct balance
    placeBet.mutate({
      amount: betAmount,
      gameId: 2, // Cricket Mines game id
      clientSeed: 'seed',
      options: { outCount },
      currency: 'INR'
    }, {
      onSuccess: (response) => {
        // Store bet ID for future reference
        setCurrBetId(response.id);
      },
      onError: (error) => {
        // Reset game state on error
        setGameState(null);
        console.error("Error placing bet:", error);
      }
    });
  };
  
  // Reveal a cell
  const revealCell = (cellIndex: number) => {
    if (!gameState || gameState.isGameOver || gameState.revealed[cellIndex]) return;
    
    // Create copy of current game state
    const updatedGameState = { ...gameState };
    updatedGameState.revealed = [...gameState.revealed];
    
    // Mark cell as revealed
    updatedGameState.revealed[cellIndex] = true;
    
    // Check if clicked on an out
    if (gameState.outPositions.includes(cellIndex)) {
      updatedGameState.isGameOver = true;
      updatedGameState.isWon = false;
      
      // Update tiles display
      const newTiles = [...tiles];
      
      // Reveal all outs
      gameState.outPositions.forEach(pos => {
        newTiles[pos] = 'out';
      });
      
      // Reveal all sixes that weren't clicked
      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (!gameState.outPositions.includes(i) && !updatedGameState.revealed[i]) {
          newTiles[i] = 'six';
        }
      }
      
      setTiles(newTiles);
    } else {
      // Clicked on a six
      updatedGameState.sixesCollected++;
      updatedGameState.multiplier = calculateMultiplier(
        updatedGameState.sixesCollected,
        updatedGameState.numberOfOuts
      );
      
      // Update tiles display
      const newTiles = [...tiles];
      newTiles[cellIndex] = 'revealed';
      setTiles(newTiles);
      
      // Check if all sixes are collected
      if (updatedGameState.sixesCollected === TOTAL_CELLS - updatedGameState.numberOfOuts) {
        updatedGameState.isGameOver = true;
        updatedGameState.isWon = true;
      }
    }
    
    setGameState(updatedGameState);
    
    // Call the API to complete the bet if the game is over
    if (updatedGameState.isGameOver && currBetId) {
      completeBet.mutate({
        betId: currBetId,
        outcome: { 
          outPositions: updatedGameState.outPositions, 
          revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1),
          win: updatedGameState.isWon,
          multiplier: updatedGameState.multiplier
        }
      });
    }
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
    if (!gameState || gameState.isGameOver || gameState.sixesCollected === 0) return;
    
    // Create copy of current game state
    const updatedGameState = { ...gameState };
    updatedGameState.isGameOver = true;
    updatedGameState.isWon = true;
    
    // Reveal all tiles for visual effect
    const newTiles = [...tiles];
    
    // Reveal all outs
    gameState.outPositions.forEach(pos => {
      newTiles[pos] = 'out';
    });
    
    // Reveal all sixes that weren't clicked
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (!gameState.outPositions.includes(i) && !gameState.revealed[i]) {
        newTiles[i] = 'six';
      }
    }
    
    setTiles(newTiles);
    setGameState(updatedGameState);
    
    // Call the API to complete the bet and credit winnings
    if (currBetId) {
      completeBet.mutate({
        betId: currBetId,
        outcome: { 
          outPositions: updatedGameState.outPositions, 
          revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1),
          win: true,
          multiplier: updatedGameState.multiplier
        }
      });
    }
    
    return calculateProfit(updatedGameState.betAmount, updatedGameState.multiplier);
  };

  const renderManualControls = () => (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-[#546D7A] mb-1">Bet Amount</div>
        <div className="flex items-center space-x-1 mb-2">
          <Input
            type="text"
            value={betAmountStr}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            className="bg-[#1c1c2b] border border-[#333] text-white h-10 text-sm rounded-[6px]"
            disabled={gameState && !gameState.isGameOver}
            placeholder="0.00"
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
          <div className="text-xs text-[#546D7A] mb-1">Outs</div>
          <Select 
            value={outCount.toString()} 
            onValueChange={handleOutCountChange}
            disabled={gameState && !gameState.isGameOver}
          >
            <SelectTrigger className="w-full bg-[#1c1c2b] border border-[#333] text-white h-10 text-sm rounded-[6px]" style={{ padding: '10px', fontSize: '14px' }}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#1c1c2b] border border-[#333] text-white rounded-[6px]">
              {OUT_COUNTS.map((count) => (
                <SelectItem key={count} value={count.toString()} className="hover:bg-[#2f2f3d]">
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="text-xs text-[#546D7A] mb-1">Sixes</div>
          <div className="h-10 bg-[#1c1c2b] border border-[#333] rounded-[6px] flex items-center justify-between px-3 text-sm">
            <span>{sixCount}</span>
          </div>
        </div>
      </div>
      
      {/* Total Profit */}
      {gameState && !gameState.isGameOver && gameState.sixesCollected > 0 ? (
        <div>
          <div className="text-xs text-[#546D7A] mb-1">
            Total profit ({gameState.multiplier.toFixed(2)}x)
          </div>
          <div className="h-10 bg-[#1c1c2b] border border-[#333] rounded-[6px] flex items-center justify-between px-3 text-sm">
            <span>{formatCrypto(totalProfit)}</span>
            <span className="text-green-400">₹</span>
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
      return <SixImage />;
    } else if (status === 'out') {
      return <OutImage />;
    } else if (status === 'six') {
      return <DarkerSixImage />;
    } else if (selectedTile === index) {
      return (
        <div className="absolute inset-0 border-2 border-[#7bfa4c] rounded-md animate-pulse"></div>
      );
    }
    return null;
  };
  
  // Custom multiplier overlay display
  const renderMultiplierOverlay = () => {
    if (gameState && !gameState.isGameOver && gameState.sixesCollected > 0) {
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
              <span className="text-green-400 ml-1">₹</span>
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
            ${status === 'out' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-explosion' : ''}
            ${status === 'six' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
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
      <div className="w-full lg:w-[280px] p-4 bg-[#172B3A] border-r border-[#243442]/50">
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
            <div className="controls bg-[#1c1c2b] p-5 rounded-[10px]">
              {renderManualControls()}
            </div>
          </TabsContent>
          
          <TabsContent value="auto" className="mt-0">
            <div className="controls bg-[#1c1c2b] p-5 rounded-[10px]">
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

export default CricketMinesGame;