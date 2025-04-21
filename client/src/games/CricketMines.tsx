import React, { useState, useEffect } from 'react';
import { formatCrypto, calculateProfit } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const [gameMode, setGameMode] = useState<GameMode>('manual');
  const [betAmountStr, setBetAmountStr] = useState('10.00');
  const [outCount, setOutCount] = useState(20);
  const [tiles, setTiles] = useState<TileStatus[]>(Array(TOTAL_CELLS).fill('hidden'));
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [currBetId, setCurrBetId] = useState<number | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

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
    // First, replace any commas with periods for internationalization
    const sanitizedValue = value.replace(',', '.');
    
    const regex = /^[0-9]*\.?[0-9]{0,2}$/;
    if (regex.test(sanitizedValue)) {
      setBetAmountStr(sanitizedValue);
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
    if (isPlacingBet) return;
    
    setIsPlacingBet(true);
    
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
    console.log("Placing bet with data:", {
      amount: betAmount,
      gameId: 3, // Cricket Mines game id
      clientSeed: Math.random().toString(36).substring(2, 15),
      options: { outCount },
      currency: 'INR'
    });
    
    placeBet.mutateAsync({
      amount: betAmount,
      gameId: 3, // Cricket Mines game id
      clientSeed: Math.random().toString(36).substring(2, 15),
      options: { outCount },
      currency: 'INR'
    }).then(async (response) => {
      console.log("Bet placed successfully with ID:", response.betId);
      if (!response || !response.betId) {
        throw new Error("Invalid response from server");
      }
      // Store bet ID for future reference
      setCurrBetId(response.betId);
      
    }).catch(error => {
      // Reset game state on error
      setGameState(null);
      console.error("Error placing bet:", error);
      toast({
        title: "Error placing bet",
        description: error.message || "Failed to place bet",
        variant: "destructive"
      });
    }).finally(() => {
      setIsPlacingBet(false);
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
      // Calculate profit for toast notification if we won
      const profit = updatedGameState.isWon ? calculateProfit(updatedGameState.betAmount, updatedGameState.multiplier) : 0;
      
      completeBet.mutateAsync({
        betId: currBetId,
        outcome: { 
          outPositions: updatedGameState.outPositions, 
          revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1),
          win: updatedGameState.isWon,
          multiplier: updatedGameState.multiplier
        }
      }).then(() => {
        // Show appropriate toast based on win/loss
        if (updatedGameState.isWon) {
          toast({
            title: "Win!",
            description: `You won ${formatCrypto(profit)} INR with a ${updatedGameState.multiplier.toFixed(2)}x multiplier!`,
            variant: "default" 
          });
        } else {
          toast({
            title: "Game Over",
            description: "Better luck next time!",
            variant: "destructive" 
          });
        }
      }).catch(error => {
        console.error("Error completing bet:", error);
        toast({
          title: "Error completing bet",
          description: error.message || "Failed to complete bet",
          variant: "destructive"
        });
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
    
    // Calculate profit for toast notification
    const profit = calculateProfit(updatedGameState.betAmount, updatedGameState.multiplier);
    
    // Call the API to complete the bet and credit winnings
    if (currBetId) {
      completeBet.mutateAsync({
        betId: currBetId,
        outcome: { 
          outPositions: updatedGameState.outPositions, 
          revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1),
          win: true,
          multiplier: updatedGameState.multiplier
        }
      }).then(() => {
        // Show success toast and force balance update
        toast({
          title: "Win!",
          description: `You won ${formatCrypto(profit)} INR with a ${updatedGameState.multiplier.toFixed(2)}x multiplier!`,
          variant: "default" 
        });
      }).catch(error => {
        console.error("Error completing bet:", error);
        toast({
          title: "Error completing bet",
          description: error.message || "Failed to complete bet",
          variant: "destructive"
        });
      });
    }
    
    return profit;
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
      // Calculate responsive overlay size based on viewport
      const calculateOverlaySize = () => {
        if (window.innerWidth < 640) {
          return { width: 80, height: 80, fontSize: 16 }; // Mobile
        } else if (window.innerWidth < 768) {
          return { width: 100, height: 100, fontSize: 18 }; // Small tablets
        } else {
          return { width: 120, height: 120, fontSize: 20 }; // Desktop
        }
      };
      
      const { width, height, fontSize } = calculateOverlaySize();
      
      return (
        <div 
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center
                     pointer-events-none z-10`}
        >
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      bg-[#7bfa4c] bg-opacity-20 border-2 border-[#7bfa4c] rounded-md
                      flex flex-col items-center justify-center p-2`}
            style={{
              width: `${width}px`, 
              height: `${height}px`
            }}
          >
            <div className="font-bold text-[#7bfa4c]" style={{ fontSize: `${fontSize}px` }}>
              {gameState.multiplier.toFixed(2)}x
            </div>
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
  const renderGameGrid = () => {
    // Calculate responsive tile sizes based on viewport
    const calculateTileSize = () => {
      // For smaller screens, we want smaller tiles to fit
      if (window.innerWidth < 640) {
        return 48; // 48px tiles for mobile
      } else if (window.innerWidth < 768) {
        return 60; // 60px tiles for small tablets
      } else if (window.innerWidth < 1024) {
        return 72; // 72px tiles for tablets
      } else {
        return 88; // 88px tiles for desktop
      }
    };
    
    const tileSize = calculateTileSize();
    const gapSize = tileSize === 48 ? 4 : (tileSize === 60 ? 6 : 10);
    
    return (
      <div className="relative grid-container grid" style={{ 
        gridTemplateColumns: `repeat(5, ${tileSize}px)`, 
        gridTemplateRows: `repeat(5, ${tileSize}px)`, 
        gap: `${gapSize}px`,
        padding: '10px',
        margin: 'auto',
        marginTop: '10px',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {tiles.map((status, index) => (
          <button
            key={index}
            className={`
              relative rounded-[6px] cursor-pointer tile flex items-center justify-center 
              transition-all duration-200 ease-in
              ${status === 'hidden' ? 'bg-[#2f2f3d] hover:bg-[#3a3a4d] shadow-[inset_0_0_5px_#1e1e2f]' : ''}
              ${status === 'revealed' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
              ${status === 'out' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-explosion' : ''}
              ${status === 'six' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
            `}
            style={{ width: `${tileSize}px`, height: `${tileSize}px` }}
            onClick={() => handleTileClick(index)}
            disabled={!gameState || gameState.isGameOver || gameState.revealed[index]}
          >
            <div className="w-full h-full flex items-center justify-center">
              {getTileContent(index, status)}
            </div>
          </button>
        ))}
        
        {/* Multiplier overlay when game is active */}
        {renderMultiplierOverlay()}
      </div>
    );
  };
  
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
        <div className="w-full h-full flex flex-col p-2 md:p-4">
          {/* Game grid at the top */}
          <div className="grid-wrapper flex flex-col items-center justify-center max-w-full mb-4">
            {renderGameGrid()}
          </div>
          
          {/* Bet controls below the game grid for all screen sizes */}
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-center gap-4 mt-4">
            <div className="w-full md:max-w-md bg-[#1c1c2b] p-3 rounded-[10px]">
              {/* Show collected sixes count and multiplier if game is active */}
              {gameState && !gameState.isGameOver && (
                <div className="mb-4 text-center">
                  <div className="text-sm text-[#546D7A]">
                    Collected sixes: <span className="text-white">{gameState.sixesCollected}</span>
                  </div>
                  {gameState.sixesCollected > 0 && (
                    <div className="text-sm text-[#546D7A]">
                      Current multiplier: <span className="text-[#7bfa4c]">{gameState.multiplier.toFixed(2)}x</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Bet amount input and controls */}
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  type="text"
                  value={betAmountStr}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  className="bg-[#172B3A] border border-[#243442] text-white h-10 text-sm rounded-[6px]"
                  disabled={gameState && !gameState.isGameOver}
                  placeholder="0.00"
                />
                <Button 
                  onClick={handleHalfBet} 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-[#243442] text-white h-10 px-2 rounded-[6px]"
                  disabled={gameState && !gameState.isGameOver}
                >
                  ½
                </Button>
                <Button 
                  onClick={handleDoubleBet} 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-[#243442] text-white h-10 px-2 rounded-[6px]"
                  disabled={gameState && !gameState.isGameOver}
                >
                  2×
                </Button>
              </div>
              
              {/* Bet or Cashout Button */}
              {showCashout ? (
                <Button 
                  className="w-full bg-[#00ff5a] hover:bg-[#00e050] text-black font-bold h-12 rounded-[6px] transition-all duration-200"
                  onClick={cashout}
                >
                  Cashout ({gameState?.multiplier.toFixed(2)}x)
                </Button>
              ) : (
                <Button 
                  className="w-full bg-[#00ff5a] hover:bg-[#00e050] text-black font-bold h-12 rounded-[6px] transition-all duration-200"
                  onClick={startGame}
                  disabled={isPlacingBet || (gameState && !gameState.isGameOver)}
                >
                  {isPlacingBet ? 'Placing Bet...' : 'Bet'}
                </Button>
              )}
              
              {/* Pick Random Tile Button (only shown during active game) */}
              {gameState && !gameState.isGameOver && (
                <Button 
                  className="w-full mt-2 bg-[#172B3A] hover:bg-[#243442] text-white h-10 border border-[#243442] rounded-[6px] transition-all duration-200"
                  onClick={selectRandomTile}
                >
                  Pick random tile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketMinesGame;