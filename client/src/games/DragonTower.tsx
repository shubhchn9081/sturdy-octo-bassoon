import React, { useState, useEffect } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOWER_CONFIG = {
  Easy: { height: 5, multiplierIncrease: 1.2 },
  Medium: { height: 8, multiplierIncrease: 1.5 },
  Hard: { height: 12, multiplierIncrease: 2.0 }
};

const DragonTowerGame = () => {
  const { getGameResult } = useProvablyFair('dragonTower');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [difficulty, setDifficulty] = useState('Medium');
  const [gameActive, setGameActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [correctPath, setCorrectPath] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [profit, setProfit] = useState('0.00000000');
  
  // Tower configuration based on difficulty
  const towerConfig = TOWER_CONFIG[difficulty as keyof typeof TOWER_CONFIG];
  
  // Update multiplier when level changes
  useEffect(() => {
    if (currentLevel < 0) {
      setCurrentMultiplier(1.00);
      return;
    }
    
    // Calculate multiplier based on level
    const multi = Math.pow(towerConfig.multiplierIncrease, currentLevel + 1);
    setCurrentMultiplier(parseFloat(multi.toFixed(2)));
    
    // Calculate profit
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (multi - 1);
    setProfit(formatCrypto(profitValue));
    
  }, [currentLevel, towerConfig.multiplierIncrease, betAmount]);
  
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
  
  const handleDifficultyChange = (value: string) => {
    if (gameActive) return;
    setDifficulty(value);
  };
  
  const startGame = () => {
    if (gameActive) return;
    
    // Reset game state
    setCurrentLevel(-1);
    setSelectedPath([]);
    setGameOver(false);
    setWon(false);
    setProfit('0.00000000');
    
    // Generate correct path using provably fair algorithm
    const gamePath = Array.from({ length: towerConfig.height }, () => Math.floor(Math.random() * 3));
    setCorrectPath(gamePath);
    
    setGameActive(true);
    setCurrentLevel(0);
    
    // In a real app, this would call the API to place a bet
    // placeBet.mutate({
    //   amount: parseFloat(betAmount),
    //   gameId: 6, // Dragon Tower game id
    //   clientSeed: 'seed',
    //   options: { difficulty }
    // });
  };
  
  const handlePositionSelect = (position: number) => {
    if (!gameActive || gameOver || currentLevel >= towerConfig.height) return;
    
    const newPath = [...selectedPath, position];
    setSelectedPath(newPath);
    
    // Check if correct
    if (position === correctPath[currentLevel]) {
      // Correct path, go to next level
      if (currentLevel === towerConfig.height - 1) {
        // Reached the top, player wins
        setGameOver(true);
        setWon(true);
        setGameActive(false);
      } else {
        // Continue to next level
        setCurrentLevel(currentLevel + 1);
      }
    } else {
      // Wrong position, game over
      setGameOver(true);
      setWon(false);
      setGameActive(false);
    }
  };
  
  const handleCashout = () => {
    if (!gameActive || gameOver || currentLevel <= 0) return;
    
    // Player cashes out with current multiplier
    setGameOver(true);
    setWon(true);
    setGameActive(false);
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { 
    //     path: selectedPath, 
    //     level: currentLevel,
    //     win: true 
    //   }
    // });
  };
  
  // Render tower levels
  const renderTower = () => {
    const tower = [];
    
    for (let level = towerConfig.height - 1; level >= 0; level--) {
      const isCurrentLevel = level === currentLevel;
      const isPastLevel = level < currentLevel;
      const isRevealedWrongPath = gameOver && !won && level === currentLevel;
      
      tower.push(
        <div key={`level-${level}`} className="flex justify-center space-x-4 mb-2">
          {[0, 1, 2].map((position) => {
            const isCorrectPath = correctPath[level] === position;
            const isSelectedPath = selectedPath[level] === position;
            
            return (
              <button
                key={`pos-${level}-${position}`}
                className={`
                  w-16 h-16 rounded-full transition-colors relative
                  ${isCurrentLevel ? 'cursor-pointer' : 'cursor-default'}
                  ${isCurrentLevel ? 'bg-blue-500 hover:bg-blue-400' : 'bg-panel-bg'}
                  ${isPastLevel && isCorrectPath ? 'bg-green-500' : ''}
                  ${isRevealedWrongPath && isCorrectPath ? 'bg-green-500' : ''}
                  ${isRevealedWrongPath && isSelectedPath && !isCorrectPath ? 'bg-red-500' : ''}
                `}
                onClick={() => handlePositionSelect(position)}
                disabled={!isCurrentLevel || gameOver}
              >
                {isPastLevel && isCorrectPath && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {isRevealedWrongPath && isCorrectPath && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {isRevealedWrongPath && isSelectedPath && !isCorrectPath && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }
    
    return tower;
  };
  
  // Game visualization panel
  const gamePanel = (
    <div>
      {/* Tower level indicator */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg">
          Level: {currentLevel + 1} / {towerConfig.height}
        </div>
        <div className="text-lg">
          Multiplier: {currentMultiplier.toFixed(2)}x
        </div>
      </div>
      
      {/* Result message */}
      {gameOver && (
        <div className={`text-center mb-6 p-3 rounded-lg ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            {won ? 'You Won!' : 'Wrong Path! Game Over.'}
          </div>
          {won && <div>{profit} profit</div>}
        </div>
      )}
      
      {/* Tower visualization */}
      <div className="bg-panel-bg p-6 rounded-lg mb-4">
        {renderTower()}
      </div>
      
      {/* Cashout button */}
      {gameActive && currentLevel > 0 && !gameOver && (
        <Button 
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
          onClick={handleCashout}
        >
          Cashout {currentMultiplier.toFixed(2)}x
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
      betButtonText={gameActive ? 'Game in Progress' : 'Start Climbing'}
      betButtonDisabled={gameActive}
    >
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Difficulty</label>
        <Select 
          value={difficulty} 
          onValueChange={handleDifficultyChange}
          disabled={gameActive}
        >
          <SelectTrigger className="w-full bg-panel-bg">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((diff) => (
              <SelectItem key={diff} value={diff}>
                {diff}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <label className="block text-muted-foreground mb-2">Potential Profit</label>
        <Input
          type="text"
          value={profit}
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
    </GameControls>
  );
  
  return (
    <GameLayout
      title="Dragon Tower"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default DragonTowerGame;
