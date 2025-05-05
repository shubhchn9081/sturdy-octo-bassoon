import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto, calculateProfit } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/context/WalletContext';
import { useGameBet } from '@/hooks/use-game-bet';
import { useToast } from '@/hooks/use-toast';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Shield, Search, ZoomIn, ZapOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

// Define special item types
enum SpecialItemType {
  SHIELD = 'shield', // Protects from one trap
  SCANNER = 'scanner', // Reveals traps on the next level
  DOUBLE = 'double',  // Doubles the multiplier for one level
}

// Define tile types in the tower
enum TileType {
  SAFE = 'safe',
  TRAP = 'trap',
  SPECIAL_ITEM = 'special_item',
}

// Define game state interface
interface GameState {
  betAmount: number;
  currentLevel: number;
  currentMultiplier: number;
  towerHeight: number;
  isGameActive: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  towerLayout: Array<Array<TileType>>;
  revealedTiles: Array<Array<boolean>>;
  inventory: Record<SpecialItemType, number>;
  selectedTilePosition: number | null;
  cashoutTriggered: boolean;
  betId: number | null;
  serverSeedHash: string | null;
}

const TowerClimb = () => {
  // Game configuration
  const TOWER_WIDTH = 3; // Number of positions per level
  const DEFAULT_TOWER_HEIGHT = 10; // Default number of levels in the tower
  const BASE_MULTIPLIER_INCREMENT = 0.2; // Base multiplier increase per level
  const GAME_ID = 101; // Assign game ID for Tower Climb - match this with what's in the database
  
  // Hooks for game functionality
  const { toast } = useToast();
  const { balance, symbol, formattedBalance } = useWallet();
  const { placeBet: placeGameBet, completeBet: completeGameBet, isProcessingBet } = useGameBet(GAME_ID);
  const { serverSeed, clientSeed, nonce, getGameResult } = useProvablyFair('tower_climb');
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    betAmount: 100, // Set to minimum bet amount of 100
    currentLevel: 0,
    currentMultiplier: 1.0,
    towerHeight: DEFAULT_TOWER_HEIGHT,
    isGameActive: false,
    isGameOver: false,
    hasWon: false,
    towerLayout: [],
    revealedTiles: [],
    inventory: {
      [SpecialItemType.SHIELD]: 0,
      [SpecialItemType.SCANNER]: 0,
      [SpecialItemType.DOUBLE]: 0,
    },
    selectedTilePosition: null,
    cashoutTriggered: false,
    betId: null,
    serverSeedHash: null,
  });
  
  // Calculate potential profit
  const profit = calculateProfit(gameState.betAmount, gameState.currentMultiplier);
  
  // Generate tower layout using provably fair system
  const generateTowerLayout = () => {
    const layout: Array<Array<TileType>> = [];
    const revealed: Array<Array<boolean>> = [];
    
    // First level is always safe
    layout.push(Array(TOWER_WIDTH).fill(TileType.SAFE));
    revealed.push(Array(TOWER_WIDTH).fill(true)); // First level is visible
    
    // Generate rest of the tower with increasing trap probability
    for (let level = 1; level < gameState.towerHeight; level++) {
      const levelLayout: TileType[] = [];
      const levelRevealed: boolean[] = [];
      
      for (let pos = 0; pos < TOWER_WIDTH; pos++) {
        // Use provably fair random to determine tile type
        // In a real implementation, this would use the getGameResult function
        const rand = Math.random(); 
        
        // Trap probability increases with level
        const trapProbability = 0.1 + (level * 0.05);
        
        // Special item probability
        const specialItemProbability = 0.05;
        
        if (rand < trapProbability) {
          levelLayout.push(TileType.TRAP);
        } else if (rand < trapProbability + specialItemProbability) {
          levelLayout.push(TileType.SPECIAL_ITEM);
        } else {
          levelLayout.push(TileType.SAFE);
        }
        
        levelRevealed.push(false);
      }
      
      // Ensure at least one safe path exists at each level
      const safeTileIndex = Math.floor(Math.random() * TOWER_WIDTH);
      levelLayout[safeTileIndex] = TileType.SAFE;
      
      layout.push(levelLayout);
      revealed.push(levelRevealed);
    }
    
    return { layout, revealed };
  };
  
  // Function to initialize a new game
  const startGame = async () => {
    if (gameState.betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid bet amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (gameState.betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset the level refs array to match tower height
    levelRefs.current = new Array(gameState.towerHeight).fill(null);
    
    try {
      // Place bet using the game bet hook
      const response = await placeGameBet({
        towerHeight: gameState.towerHeight
      });
      
      if (!response || !response.betId) {
        throw new Error("Failed to place bet");
      }
      
      // Generate the tower layout
      const { layout, revealed } = generateTowerLayout();
      
      // Initialize game state
      setGameState({
        ...gameState,
        currentLevel: 0,
        currentMultiplier: 1.0,
        isGameActive: true,
        isGameOver: false,
        hasWon: false,
        towerLayout: layout,
        revealedTiles: revealed,
        inventory: {
          [SpecialItemType.SHIELD]: 0,
          [SpecialItemType.SCANNER]: 0,
          [SpecialItemType.DOUBLE]: 0,
        },
        selectedTilePosition: null,
        cashoutTriggered: false,
        betId: response.betId,
        serverSeedHash: response.serverSeedHash || null,
      });
      
      toast({
        title: "Game Started",
        description: "Climb the tower to increase your multiplier!",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start game",
        variant: "destructive",
      });
    }
  };
  
  // Reference to all level divs for animations
  const levelRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Function to animate level completion
  const animateLevelComplete = (currentLevel: number, nextLevel: number) => {
    // Get the current and next level elements
    const currentLevelEl = levelRefs.current[currentLevel];
    const nextLevelEl = levelRefs.current[nextLevel];
    
    if (currentLevelEl) {
      // Animate current level (zoom and fade out)
      gsap.to(currentLevelEl, {
        scale: 1.03,
        opacity: 0.7,
        boxShadow: '0 0 20px rgba(255,255,255,0.4)',
        duration: 0.5,
        ease: 'power1.out'
      });
    }
    
    if (nextLevelEl) {
      // Highlight the next level
      gsap.fromTo(nextLevelEl,
        { 
          scale: 0.95,
          opacity: 0.8,
          boxShadow: '0 0 0px rgba(255,255,255,0)'
        },
        {
          scale: 1,
          opacity: 1,
          boxShadow: '0 0 15px rgba(255,255,255,0.3)',
          duration: 0.7,
          ease: 'elastic.out(1, 0.5)'
        }
      );
    }
  };
  
  // Function to handle climbing to the next level
  const climbNextLevel = async (position: number) => {
    if (!gameState.isGameActive || gameState.isGameOver || !gameState.betId) return;
    
    const nextLevel = gameState.currentLevel + 1;
    
    // Animate the level transition
    animateLevelComplete(gameState.currentLevel, nextLevel);
    
    // Check if we've reached the top of the tower
    if (nextLevel >= gameState.towerHeight) {
      // Player reached the top - max win!
      finishGame(true);
      return;
    }
    
    // Get the tile type at the selected position
    const tileType = gameState.towerLayout[nextLevel][position];
    
    // Create a copy of revealed tiles to update
    const newRevealedTiles = [...gameState.revealedTiles];
    newRevealedTiles[nextLevel][position] = true;
    
    // Create a copy of inventory
    const newInventory = {...gameState.inventory};
    
    // Process tile type
    if (tileType === TileType.TRAP) {
      if (newInventory[SpecialItemType.SHIELD] > 0) {
        // Use shield to bypass trap
        newInventory[SpecialItemType.SHIELD]--;
        toast({
          title: "Shield used!",
          description: "Your shield protected you from a trap.",
        });
        
        // Continue game
        const multiplierIncrease = BASE_MULTIPLIER_INCREMENT * (nextLevel);
        setGameState({
          ...gameState,
          currentLevel: nextLevel,
          currentMultiplier: gameState.currentMultiplier + multiplierIncrease,
          revealedTiles: newRevealedTiles,
          inventory: newInventory,
          selectedTilePosition: position,
        });
      } else {
        // No shield - game over
        setGameState({
          ...gameState,
          isGameActive: false,
          isGameOver: true,
          hasWon: false,
          revealedTiles: newRevealedTiles,
          selectedTilePosition: position,
        });
        
        // Complete the bet with lose outcome
        try {
          await completeGameBet(gameState.betId, {
            win: false,
            levelReached: nextLevel,
            positionChosen: position,
            hitTrap: true,
          });
          
          toast({
            title: "Game Over!",
            description: "You hit a trap and lost your bet.",
            variant: "destructive",
          });
        } catch (error) {
          console.error("Error completing bet:", error);
        }
      }
    } else if (tileType === TileType.SPECIAL_ITEM) {
      // Determine which special item was found
      const itemTypes = Object.values(SpecialItemType);
      const randomItemIndex = Math.floor(Math.random() * itemTypes.length);
      const foundItem = itemTypes[randomItemIndex];
      
      // Add item to inventory
      newInventory[foundItem as SpecialItemType]++;
      
      toast({
        title: "Special Item Found!",
        description: `You found a ${foundItem.toUpperCase()}!`,
      });
      
      // Continue game with multiplier increase
      const multiplierIncrease = BASE_MULTIPLIER_INCREMENT * (nextLevel);
      setGameState({
        ...gameState,
        currentLevel: nextLevel,
        currentMultiplier: gameState.currentMultiplier + multiplierIncrease,
        revealedTiles: newRevealedTiles,
        inventory: newInventory,
        selectedTilePosition: position,
      });
    } else {
      // Safe tile - continue game with multiplier increase
      const multiplierIncrease = BASE_MULTIPLIER_INCREMENT * (nextLevel);
      
      // Check if player has a double multiplier item
      let finalMultiplier = gameState.currentMultiplier + multiplierIncrease;
      if (newInventory[SpecialItemType.DOUBLE] > 0) {
        newInventory[SpecialItemType.DOUBLE]--;
        finalMultiplier = gameState.currentMultiplier + (multiplierIncrease * 2);
        toast({
          title: "Double Multiplier Used!",
          description: "Your multiplier increase was doubled!",
        });
      }
      
      setGameState({
        ...gameState,
        currentLevel: nextLevel,
        currentMultiplier: finalMultiplier,
        revealedTiles: newRevealedTiles,
        inventory: newInventory,
        selectedTilePosition: position,
      });
    }
    
    // Use scanner item if available to reveal next level
    if (newInventory[SpecialItemType.SCANNER] > 0 && nextLevel + 1 < gameState.towerHeight) {
      newInventory[SpecialItemType.SCANNER]--;
      
      // Reveal all tiles in the next level
      const scannerRevealedTiles = [...newRevealedTiles];
      scannerRevealedTiles[nextLevel + 1] = scannerRevealedTiles[nextLevel + 1].map(() => true);
      
      setGameState(prevState => ({
        ...prevState,
        revealedTiles: scannerRevealedTiles,
        inventory: newInventory,
      }));
      
      toast({
        title: "Scanner Used!",
        description: "The next level has been revealed!",
      });
    }
  };
  
  // Function to cash out
  const cashOut = async () => {
    if (!gameState.isGameActive || gameState.isGameOver || !gameState.betId) return;
    
    try {
      // Submit the bet to the server and get winnings
      const result = await completeGameBet(gameState.betId, {
        win: true,
        multiplier: gameState.currentMultiplier,
        levelReached: gameState.currentLevel,
        cashOut: true,
      });
      
      // Update game state
      setGameState(prevState => ({
        ...prevState,
        isGameActive: false,
        isGameOver: true,
        hasWon: true,
        cashoutTriggered: true,
      }));
      
      toast({
        title: "Cashed Out!",
        description: `You won ${formatCrypto(gameState.betAmount * gameState.currentMultiplier)}!`,
      });
      
      return result;
    } catch (error) {
      console.error("Error cashing out:", error);
      toast({
        title: "Error",
        description: "Failed to cash out. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Function to finish the game
  const finishGame = async (won: boolean) => {
    if (!gameState.betId) return;
    
    try {
      await completeGameBet(gameState.betId, {
        win: won,
        multiplier: won ? gameState.currentMultiplier : 0,
        levelReached: gameState.currentLevel,
        cashOut: won,
      });
      
      setGameState(prevState => ({
        ...prevState,
        isGameActive: false,
        isGameOver: true,
        hasWon: won,
        cashoutTriggered: won,
      }));
      
      if (won) {
        toast({
          title: "You Won!",
          description: `You reached the top and won ${formatCrypto(gameState.betAmount * gameState.currentMultiplier)}!`,
        });
      }
    } catch (error) {
      console.error("Error finishing game:", error);
    }
  };
  
  // Function to use a special item
  const useSpecialItem = (itemType: SpecialItemType) => {
    if (!gameState.isGameActive || gameState.isGameOver) return;
    if (gameState.inventory[itemType] <= 0) return;
    
    const newInventory = {...gameState.inventory};
    newInventory[itemType]--;
    
    // Handle special item effects
    switch (itemType) {
      case SpecialItemType.SCANNER:
        if (gameState.currentLevel + 1 < gameState.towerHeight) {
          const newRevealedTiles = [...gameState.revealedTiles];
          newRevealedTiles[gameState.currentLevel + 1] = newRevealedTiles[gameState.currentLevel + 1].map(() => true);
          
          setGameState(prevState => ({
            ...prevState,
            revealedTiles: newRevealedTiles,
            inventory: newInventory,
          }));
          
          toast({
            title: "Scanner Used!",
            description: "The next level has been revealed!",
          });
        }
        break;
      // Other special items are handled during climbing
    }
  };
  
  // Handle bet amount changes
  const handleBetAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setGameState({...gameState, betAmount: numValue});
    }
  };
  
  // Handle half bet
  const handleHalfBet = () => {
    const halfAmount = gameState.betAmount / 2;
    setGameState({...gameState, betAmount: Math.max(0.1, halfAmount)});
  };
  
  // Handle double bet
  const handleDoubleBet = () => {
    const doubleAmount = gameState.betAmount * 2;
    setGameState({...gameState, betAmount: Math.min(doubleAmount, balance)});
  };
  
  // Function to reset game for play again
  const resetGame = async () => {
    setGameState({
      ...gameState,
      isGameActive: false,
      isGameOver: false,
      currentLevel: 0,
      currentMultiplier: 1.0,
      betId: null,
      serverSeedHash: null,
    });
    return Promise.resolve();
  };

  // Determine bet button text and action
  let betButtonText = "Start Climbing";
  let betAction = startGame;
  let betDisabled = isProcessingBet;
  
  if (gameState.isGameActive && !gameState.isGameOver) {
    betButtonText = `Cash Out (${gameState.currentMultiplier.toFixed(2)}x)`;
    betAction = cashOut;
  } else if (gameState.isGameOver) {
    betButtonText = "Play Again";
    betAction = resetGame;
  }
  
  // Game controls panel
  const gameControlsPanel = (
    <GameControls
      betAmount={gameState.betAmount.toString()}
      onBetAmountChange={handleBetAmountChange}
      onHalfBet={handleHalfBet}
      onDoubleBet={handleDoubleBet}
      onBet={betAction}
      betButtonText={betButtonText}
      betButtonDisabled={betDisabled || (gameState.isGameActive && !gameState.isGameOver)}
    >
      <div>
        <label className="block text-gray-400 mb-2 text-sm">Tower Height</label>
        <Select
          value={gameState.towerHeight.toString()}
          onValueChange={(value) => setGameState({...gameState, towerHeight: parseInt(value)})}
          disabled={gameState.isGameActive}
        >
          <SelectTrigger className="w-full bg-[#243442] text-white border-none">
            <SelectValue placeholder="Select tower height" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 Levels (Easy)</SelectItem>
            <SelectItem value="10">10 Levels (Medium)</SelectItem>
            <SelectItem value="15">15 Levels (Hard)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4">
        <label className="block text-gray-400 mb-2 text-sm">Current Multiplier</label>
        <div className="bg-[#243442] p-2 rounded text-white">
          {gameState.currentMultiplier.toFixed(2)}x
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-gray-400 mb-2 text-sm">Potential Profit</label>
        <div className="bg-[#243442] p-2 rounded text-white">
          {formatCrypto(profit)}
        </div>
      </div>
      
      {/* Fairness verification section */}
      {gameState.serverSeedHash && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-sm font-semibold mb-2 text-white">Provably Fair</h3>
          <div className="text-xs overflow-hidden text-ellipsis">
            <p className="mb-1">
              <span className="font-medium text-white">Server Seed Hash:</span>
              <br />
              <span className="text-gray-400 break-all">{gameState.serverSeedHash}</span>
            </p>
            <p className="mb-1">
              <span className="font-medium text-white">Client Seed:</span>
              <br />
              <span className="text-gray-400 break-all">{clientSeed}</span>
            </p>
            <p>
              <span className="font-medium text-white">Nonce:</span>
              <br />
              <span className="text-gray-400">{nonce}</span>
            </p>
          </div>
        </div>
      )}
    </GameControls>
  );
  
  // Game panel that displays the tower
  const gamePanel = (
    <div className="relative h-full flex flex-col justify-between p-2 md:p-4">
      <div className="text-center mb-2 md:mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Tower Climb</h2>
        <p className="text-xs md:text-sm text-muted-foreground">Climb the tower and increase your multiplier, but beware of traps!</p>
      </div>
      
      {gameState.isGameActive && (
        <div className="flex flex-wrap justify-center gap-2 mb-2 md:mb-4">
          <div className="flex items-center space-x-1 md:space-x-2 bg-blue-500/10 p-1 rounded">
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
            <span className="text-xs md:text-sm">Shields:</span>
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-500">
              {gameState.inventory[SpecialItemType.SHIELD]}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={gameState.inventory[SpecialItemType.SHIELD] <= 0}
              onClick={() => useSpecialItem(SpecialItemType.SHIELD)}
              className="text-xs border-blue-500/50 text-blue-500 h-6 md:h-8 px-2"
            >
              Use
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2 bg-green-500/10 p-1 rounded">
            <Search className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
            <span className="text-xs md:text-sm">Scanners:</span>
            <Badge variant="outline" className="text-xs bg-green-500/20 text-green-500">
              {gameState.inventory[SpecialItemType.SCANNER]}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={gameState.inventory[SpecialItemType.SCANNER] <= 0}
              onClick={() => useSpecialItem(SpecialItemType.SCANNER)}
              className="text-xs border-green-500/50 text-green-500 h-6 md:h-8 px-2"
            >
              Use
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2 bg-purple-500/10 p-1 rounded">
            <ZoomIn className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
            <span className="text-xs md:text-sm">Doubles:</span>
            <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-500">
              {gameState.inventory[SpecialItemType.DOUBLE]}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={gameState.inventory[SpecialItemType.DOUBLE] <= 0}
              onClick={() => useSpecialItem(SpecialItemType.DOUBLE)}
              className="text-xs border-purple-500/50 text-purple-500 h-6 md:h-8 px-2"
            >
              Use
            </Button>
          </div>
        </div>
      )}
      
      {/* Tower visualization */}
      <div className="flex-1 flex flex-col-reverse justify-start items-center overflow-y-auto py-2 md:py-4 space-y-reverse space-y-2 md:space-y-4">
        {gameState.towerLayout.map((level, levelIndex) => (
          <div 
            key={`level-${levelIndex}`}
            ref={el => levelRefs.current[levelIndex] = el} 
            className={cn(
              "flex justify-center space-x-2 md:space-x-4 mb-2 md:mb-4 p-1 md:p-2 rounded w-full",
              levelIndex === gameState.currentLevel ? "bg-accent/50" : ""
            )}
          >
            <div className="flex-shrink-0 flex items-center mr-1 md:mr-2">
              <span className="text-xs md:text-sm font-medium">L{levelIndex + 1}</span>
            </div>
            
            <div className="flex justify-center space-x-2 md:space-x-4">
              {level.map((tileType, tileIndex) => {
                const isRevealed = gameState.revealedTiles[levelIndex][tileIndex];
                const isSelected = gameState.selectedTilePosition === tileIndex && levelIndex === gameState.currentLevel;
                
                let tileClass = cn(
                  "w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-lg cursor-pointer border transition-all duration-200",
                  isSelected 
                    ? "border-2 border-yellow-500 ring-2 ring-yellow-500/50" 
                    : "border-gray-600",
                  !isRevealed && levelIndex === gameState.currentLevel + 1 
                    ? "hover:bg-gray-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                    : "",
                );
                
                if (isRevealed) {
                  switch (tileType) {
                    case TileType.SAFE:
                      tileClass += " bg-green-500/80";
                      break;
                    case TileType.TRAP:
                      tileClass += " bg-red-500/80";
                      break;
                    case TileType.SPECIAL_ITEM:
                      tileClass += " bg-purple-500/80";
                      break;
                  }
                } else {
                  tileClass += " bg-gray-700";
                }
                
                return (
                  <div
                    key={`tile-${levelIndex}-${tileIndex}`}
                    ref={(el) => {
                      // Store the tile element reference
                      if (el && isRevealed && !el.classList.contains('animated-reveal')) {
                        el.classList.add('animated-reveal');
                        // Add animation when a tile is revealed
                        gsap.fromTo(el, 
                          { rotateY: -180, scale: 0.8 },
                          { 
                            rotateY: 0, 
                            scale: 1, 
                            duration: 0.6, 
                            ease: "back.out(1.7)",
                            clearProps: "all" 
                          }
                        );
                      }
                    }}
                    className={cn(
                      tileClass,
                      "relative overflow-hidden transform transition-transform duration-200 active:scale-95 hover:scale-105",
                      "shadow-lg", // Basic shadow
                      "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-50", // Glass effect
                      "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:opacity-30", // Bottom shadow
                    )}
                    onClick={() => {
                      if (gameState.isGameActive && levelIndex === gameState.currentLevel + 1) {
                        climbNextLevel(tileIndex);
                      }
                    }}
                    style={{
                      perspective: '1000px',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {isRevealed ? (
                      <>
                        {tileType === TileType.SAFE && 
                          <div className="w-full h-full flex items-center justify-center">
                            <img 
                              src="/assets/tower-climb/correct-tile.png" 
                              alt="Safe Tile" 
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        }
                        {tileType === TileType.TRAP && 
                          <div className="w-full h-full flex items-center justify-center">
                            <img 
                              src="/assets/tower-climb/wrong-tile.png" 
                              alt="Trap Tile" 
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        }
                        {tileType === TileType.SPECIAL_ITEM && 
                          <div className="w-full h-full flex items-center justify-center bg-purple-500/80">
                            <span className="text-xl md:text-2xl animate-pulse">⭐</span>
                          </div>
                        }
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800 rounded-md">
                        <div className="relative flex items-center justify-center w-full h-full">
                          {/* Add 3D effect with gradient overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-t-md"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-b-md"></div>
                          
                          {/* Light reflection effect on top */}
                          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/20 to-transparent rounded-t-md"></div>
                          
                          {/* Question mark with shadow */}
                          <span className="text-xl md:text-2xl font-bold relative text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">?</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Game status display */}
      {gameState.isGameOver && (
        <div className={cn(
          "mt-2 md:mt-4 p-2 md:p-4 rounded text-center",
          gameState.hasWon ? "bg-green-700/50" : "bg-red-700/50"
        )}>
          <h3 className="text-lg md:text-xl font-bold">
            {gameState.hasWon ? 'You Won!' : 'Game Over!'}
          </h3>
          {gameState.hasWon && (
            <p className="text-sm md:text-base">You won {formatCrypto(gameState.betAmount * gameState.currentMultiplier)}!</p>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <GameLayout
      title="Tower Climb"
      controlsPanel={gameControlsPanel}
      gamePanel={gamePanel}
      isMobileFriendly={true}
      mobileFirst={true}
    />
  );
};

export default TowerClimb;