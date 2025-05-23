import React, { useState, useEffect } from 'react';
import { formatCrypto, calculateProfit } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/context/WalletContext';
import { useGameBet } from '@/hooks/use-game-bet';
import { toast } from '@/hooks/use-toast';

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
  const { balance: walletBalance, symbol, formattedBalance } = useWallet();
  const { placeBet: placeGameBet, completeBet: completeGameBet, isProcessingBet } = useGameBet(1); // Mines gameId is 1
  const [currBetId, setCurrBetId] = useState<number | null>(null);
  
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
    
    // Allow empty input for easier editing
    if (value === '') {
      setBetAmountStr('');
      return;
    }
    
    // Only allow valid numeric inputs
    // Replace commas with periods for internationalization
    const sanitizedValue = value.replace(',', '.');
    
    // Only allow numbers with up to 8 decimal places
    const regex = /^[0-9]*\.?[0-9]{0,8}$/;
    if (regex.test(sanitizedValue)) {
      setBetAmountStr(sanitizedValue);
    }
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
      const positions: number[] = [];
      while (positions.length < numberOfMines) {
        const randomPos = Math.floor(Math.random() * TOTAL_CELLS);
        if (!positions.includes(randomPos)) {
          positions.push(randomPos);
        }
      }
      return positions;
    }
  }

  // Calculate multiplier using the shared multiplier table
  function calculateMultiplier(diamonds: number, mines: number): number {
    try {
      // Import multiplier table from shared module
      // First try to use our local simplified table with higher multipliers
      const minesMultiplierTable: Record<number, number[]> = {
        // Values with increased rewards for better gameplay
        1: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.50, 4.00, 4.50, 5.00],
        3: [1.15, 1.30, 1.45, 1.60, 1.80, 2.00, 2.20, 2.40, 2.60, 2.80, 3.00, 3.50],
        5: [1.08, 1.16, 1.24, 1.32, 1.50, 1.70, 1.90, 2.10, 2.30, 2.50, 2.70, 2.90],
        10: [1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.80, 2.00, 2.25, 2.50, 2.75, 3.00],
        15: [1.15, 1.30, 1.45, 1.60, 1.75, 1.90, 2.05, 2.20, 2.35, 2.50, 2.65, 2.80],
        20: [1.20, 1.40, 1.60, 1.80, 2.00, 2.20, 2.40, 2.60, 2.80, 3.00, 3.20, 3.40],
        24: [1.25, 1.50, 1.75, 2.00, 2.50, 3.00, 3.50, 4.00]
      };
      
      // Special handling for beginning of game
      if (diamonds === 0) return 1;
      
      // If we have a multiplier for this mine count
      if (minesMultiplierTable[mines] && diamonds <= minesMultiplierTable[mines].length) {
        return minesMultiplierTable[mines][diamonds - 1];
      }
      
      // Fallback for mine counts not in our table - provide better multipliers
      // Start at 1.1x and increase by 0.1 per diamond for a more rewarding experience
      return 1.1 + (diamonds * 0.1); 
    } catch (error) {
      console.error("Error calculating multiplier:", error);
      // Fallback to a safe value if something goes wrong
      return 1.1 + (diamonds * 0.1);
    }
  }
  
  // Fetch controlled mine positions from the server
  const fetchControlledMinePositions = async (originalMinePositions: number[]): Promise<number[]> => {
    try {
      // Call the game control API to get controlled mine positions
      const response = await fetch('/api/game-control/mines/get-controlled-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: 1, // Mines gameId
          originalMinePositions,
          currentlyRevealed: [] // No positions revealed yet
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching controlled mine positions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.wasModified) {
        console.log('Mine positions were modified by admin control!');
        return data.controlledMinePositions;
      } else {
        return originalMinePositions;
      }
    } catch (error) {
      console.error('Failed to fetch controlled mine positions:', error);
      // Fall back to original positions on error
      return originalMinePositions;
    }
  };

  // Start a new game
  const startGame = async () => {
    if (gameState && !gameState.isGameOver) return;
    
    const betAmount = parseFloat(betAmountStr) || 0.00000001;
    
    // Check if user has enough balance
    if (betAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to place this bet.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Starting Mines game with:", {
      amount: betAmount,
      mineCount,
      totalCells: TOTAL_CELLS
    });
    
    try {
      // Generate initial mine positions
      const initialMinePositions = generateMinePositions(mineCount);
      
      // Fetch controlled mine positions from the server (for admin controls)
      const controlledMinePositions = await fetchControlledMinePositions(initialMinePositions);
      
      // Make sure we use the correct bet amount - must be at least 100 for minimum bet requirement
      const safeBetAmount = Math.max(100, betAmount);
      
      // Generate a client seed for provably fair gameplay
      const clientSeed = Math.random().toString(36).substring(2, 12);
      
      console.log(`🎮 Starting Mines game with bet amount: ${safeBetAmount}, mineCount: ${mineCount}`);
      
      // CRITICAL FIX: Place bet using our unified wallet system with a flat structure
      // The placeGameBet function will sanitize any nested amount fields
      const response = await placeGameBet({
        amount: safeBetAmount,
        gameId: 1,
        clientSeed,
        options: {
          // Only include game-specific options, not the amount
          mineCount,
          totalCells: TOTAL_CELLS
        }
      });
      
      // Store the bet ID from the response
      if (response && typeof response === 'object' && 'betId' in response) {
        setCurrBetId(response.betId as number);
        console.log("Bet placed successfully with ID:", response.betId);
      } else {
        console.error("Invalid response from placeBet:", response);
        throw new Error("Failed to place bet: Invalid response");
      }
      
      // Create new game state with controlled mine positions
      const newGameState: GameStateType = {
        betAmount,
        numberOfMines: mineCount,
        minePositions: controlledMinePositions, // Use controlled positions here
        revealed: Array(TOTAL_CELLS).fill(false),
        isGameOver: false,
        isWon: false,
        diamondsCollected: 0,
        multiplier: 1,
      };
      
      setGameState(newGameState);
      setTiles(Array(TOTAL_CELLS).fill('hidden'));
      setSelectedTile(null);
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Balance Update Failed",
        description: "Failed to update your balance. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Fetch updated controlled mine positions after revealing a cell
  const fetchUpdatedMinePositions = async (minePositions: number[], revealedPositions: boolean[]): Promise<number[]> => {
    try {
      // Convert revealed boolean array to indices of revealed positions
      const revealedIndices = revealedPositions
        .map((revealed, index) => revealed ? index : -1)
        .filter(index => index !== -1);
      
      // Call the game control API to get updated controlled mine positions
      const response = await fetch('/api/game-control/mines/get-controlled-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: 1, // Mines gameId
          originalMinePositions: minePositions,
          currentlyRevealed: revealedIndices
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching updated mine positions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.wasModified) {
        console.log('Mine positions were updated by admin control after reveal!');
        return data.controlledMinePositions;
      } else {
        return minePositions;
      }
    } catch (error) {
      console.error('Failed to fetch updated mine positions:', error);
      // Fall back to original positions on error
      return minePositions;
    }
  };

  // Reveal a cell
  const revealCell = async (cellIndex: number) => {
    if (!gameState || gameState.isGameOver || gameState.revealed[cellIndex]) return;
    
    // Create copy of current game state
    const updatedGameState = { ...gameState };
    updatedGameState.revealed = [...gameState.revealed];
    
    // Mark cell as revealed
    updatedGameState.revealed[cellIndex] = true;
    
    // Fetch updated mine positions from the server after this reveal
    // This allows the server to reposition mines based on admin controls
    updatedGameState.minePositions = await fetchUpdatedMinePositions(
      gameState.minePositions,
      updatedGameState.revealed
    );
    
    // Check if clicked on a mine (using the updated positions)
    if (updatedGameState.minePositions.includes(cellIndex)) {
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
      
      // Complete the bet with loss result if we have a bet ID
      if (currBetId) {
        try {
          await completeGameBet(currBetId, {
            win: false,
            multiplier: 0,
            payout: 0,
            minePositions: updatedGameState.minePositions,
            revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1)
          });
        } catch (error) {
          console.error("Error completing bet on loss:", error);
        }
      }
      
      // Show loss message
      toast({
        title: "Game Over",
        description: "You hit a mine! Better luck next time.",
        variant: "destructive"
      });
      
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
      
      // Check if all diamonds are collected (auto cashout)
      if (updatedGameState.diamondsCollected === TOTAL_CELLS - updatedGameState.numberOfMines) {
        updatedGameState.isGameOver = true;
        updatedGameState.isWon = true;
        
        try {
          // Calculate the profit
          const profit = calculateProfit(updatedGameState.betAmount, updatedGameState.multiplier);
          
          // Complete the bet with the game outcome
          if (currBetId) {
            await completeGameBet(currBetId, {
              win: true,
              multiplier: updatedGameState.multiplier,
              payout: updatedGameState.betAmount * updatedGameState.multiplier,
              minePositions: updatedGameState.minePositions,
              revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1)
            });
          }
          
          toast({
            title: "All Gems Collected!",
            description: `You won ${symbol}${profit.toFixed(2)}!`,
            variant: "default"
          });
        } catch (error) {
          console.error('Error updating balance after all gems collected:', error);
        }
      }
    }
    
    setGameState(updatedGameState);
    
    // In a real app with backend integration:
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
  const cashout = async () => {
    if (!gameState || gameState.isGameOver || gameState.diamondsCollected === 0 || !currBetId) return;
    
    // Create copy of current game state
    const updatedGameState = { ...gameState };
    updatedGameState.isGameOver = true;
    updatedGameState.isWon = true;
    
    // Calculate the profit
    const profit = calculateProfit(updatedGameState.betAmount, updatedGameState.multiplier);
    
    try {
      console.log("Cashing out with:", {
        betId: currBetId,
        win: true,
        multiplier: updatedGameState.multiplier,
        payout: updatedGameState.betAmount * updatedGameState.multiplier
      });
      
      // Complete the bet with the game outcome using the wallet system
      await completeGameBet(currBetId, {
        win: true,
        multiplier: updatedGameState.multiplier,
        payout: updatedGameState.betAmount * updatedGameState.multiplier,
        minePositions: updatedGameState.minePositions,
        revealedPositions: updatedGameState.revealed.map((r, i) => r ? i : -1).filter(i => i !== -1)
      });
      
      // Refresh the wallet balance is handled by the completeBet mutation
      
      toast({
        title: "Win!",
        description: `You won ₹${profit.toFixed(2)}!`,
        variant: "default"
      });
      
      console.log("Cashout successful! Profit:", profit);
      
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
      
      return profit;
    } catch (error) {
      console.error('Error updating balance after cashout:', error);
      toast({
        title: "Cashout Failed",
        description: "Failed to update your balance. Please try again.",
        variant: "destructive"
      });
    }
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
            disabled={!!gameState && !gameState.isGameOver}
            style={{ padding: '10px', fontSize: '14px', width: '100%' }}
          />
          <Button 
            onClick={handleHalfBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#333] text-white h-10 px-2 rounded-[6px]"
            disabled={!!gameState && !gameState.isGameOver}
          >
            ½
          </Button>
          <Button 
            onClick={handleDoubleBet} 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#333] text-white h-10 px-2 rounded-[6px]"
            disabled={!!gameState && !gameState.isGameOver}
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
            disabled={!!gameState && !gameState.isGameOver}
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
            <span className="text-amber-400">₹</span>
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
          disabled={!!gameState && !gameState.isGameOver}
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
    // Calculate icon size as a percentage of the tile size
    const iconSize = Math.max(Math.floor(tileSize * 0.6), 24); // Minimum size 24px
    
    if (status === 'revealed') {
      return <div style={{ width: `${iconSize}px`, height: `${iconSize}px` }}><DiamondImage /></div>;
    } else if (status === 'mine') {
      return <div style={{ width: `${iconSize}px`, height: `${iconSize}px` }}><BombImage /></div>;
    } else if (status === 'gem') {
      return <div style={{ width: `${iconSize}px`, height: `${iconSize}px` }}><DarkerDiamondImage /></div>;
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
      
      // Calculate overlay size based on tile size (proportionally)
      const overlaySize = Math.max(Math.min(tileSize * 2, 128), 80); // Min 80px, max 128px
      
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
              gridRowStart: Math.floor(centerIndex / GRID_SIZE) + 1,
              gridColumnStart: (centerIndex % GRID_SIZE) + 1,
              width: `${overlaySize}px`,
              height: `${overlaySize}px`
            }}
          >
            <div className={`font-bold text-[#7bfa4c] ${overlaySize < 100 ? 'text-lg' : 'text-xl'}`}>
              {gameState.multiplier.toFixed(2)}x
            </div>
            <div className={`text-white flex items-center ${overlaySize < 100 ? 'text-xs' : 'text-sm'}`}>
              {formatCrypto(gameState.betAmount)}
              <span className="text-amber-400 ml-1">₹</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // State for tile size
  const [tileSize, setTileSize] = useState(58); // Default smaller size for mobile
  const gridWrapperRef = React.useRef<HTMLDivElement>(null);
  
  // Effect to handle resize and adjust tile size
  useEffect(() => {
    const calculateTileSize = () => {
      if (!gridWrapperRef.current) return;
      
      // Get container width and determine available space
      const containerWidth = gridWrapperRef.current.clientWidth;
      const isMobile = window.innerWidth < 640; // Check if on small screens
      
      // Calculate optimal tile size based on container width
      // Leave space for grid gap and padding
      const maxGridWidth = containerWidth - 30; // 15px padding on each side
      const gapSize = isMobile ? 6 : 8; // Smaller gap on mobile
      const optimalTileSize = Math.floor((maxGridWidth - (GRID_SIZE - 1) * gapSize) / GRID_SIZE);
      
      // Set minimum tile size to ensure visibility but smaller on mobile
      const minSize = isMobile ? 36 : 40;
      const maxSize = isMobile ? 70 : 88;
      const newTileSize = Math.max(minSize, Math.min(optimalTileSize, maxSize));
      setTileSize(newTileSize);
    };
    
    // Calculate initially
    calculateTileSize();
    
    // Add resize listener
    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, []);
  
  // Render the game grid with positioned tiles
  const renderGameGrid = () => (
    <div className="relative grid-container grid" style={{ 
      gridTemplateColumns: `repeat(5, ${tileSize}px)`, 
      gridTemplateRows: `repeat(5, ${tileSize}px)`, 
      gap: '8px',
      padding: '10px',
      margin: 'auto',
      marginTop: '10px',
      marginBottom: '80px' // Add space at bottom to prevent cutting off on small screens
    }}>
      {tiles.map((status, index) => (
        <button
          key={index}
          className={`
            relative rounded-[10px] cursor-pointer tile flex items-center justify-center 
            transition-all duration-200 ease-in
            ${status === 'hidden' ? 'bg-[#2f2f3d] hover:bg-[#3a3a4d] shadow-[inset_0_0_5px_#1e1e2f]' : ''}
            ${status === 'revealed' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
            ${status === 'mine' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-explosion' : ''}
            ${status === 'gem' ? 'bg-[#2f2f3d] shadow-[inset_0_0_5px_#1e1e2f] animate-revealGem' : ''}
          `}
          style={{
            width: `${tileSize}px`,
            height: `${tileSize}px`
          }}
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
    <div className="flex flex-col w-full bg-[#0F212E] text-white min-h-[calc(100vh-60px)] pb-20 sm:pb-0" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Game Area - On mobile, this appears first */}
      <div className="flex-1 overflow-auto order-first mb-4">
        <div ref={gridWrapperRef} className="flex items-center justify-center w-full h-full pt-4">
          {renderGameGrid()}
        </div>
      </div>
      
      {/* Side Panel - On mobile, this appears second (below) */}
      <div className="w-full p-2 bg-[#172B3A] border-t lg:border-t-0 lg:border-r border-[#243442]/50 order-last lg:order-first lg:w-[280px]">
        <div className="p-4 bg-[#131F29] rounded-[10px]">
          <Tabs defaultValue="manual" className="w-full" onValueChange={(v) => setGameMode(v as GameMode)}>
            <TabsList className="mb-6 grid w-full grid-cols-2 gap-2 bg-transparent">
              <TabsTrigger 
                value="manual" 
                className="bg-[#1c1c2b] hover:bg-[#2f2f3d] data-[state=active]:bg-[#2f2f3d] data-[state=active]:shadow-none rounded-[6px] border border-[#333] data-[state=active]:border-[#4a4a5e]">
                Manual
              </TabsTrigger>
              <TabsTrigger 
                value="auto" 
                className="bg-[#1c1c2b] hover:bg-[#2f2f3d] data-[state=active]:bg-[#2f2f3d] data-[state=active]:shadow-none rounded-[6px] border border-[#333] data-[state=active]:border-[#4a4a5e]">
                Auto
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              {renderManualControls()}
            </TabsContent>
            <TabsContent value="auto">
              {renderAutoControls()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;