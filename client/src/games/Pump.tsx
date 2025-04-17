import React, { useState, useEffect, useRef } from 'react';
import { formatCrypto } from '@/lib/utils';
import GameLayout, { GameControls } from '@/components/games/GameLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useBalance } from '@/hooks/use-balance';
import { motion } from 'framer-motion';

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
const MULTIPLIER_PRESETS = ['1.00x', '1.23x', '1.55x', '1.98x', '2.56x', '3.36x', '4.48x'];

const PumpGame = () => {
  const { getGameResult } = useProvablyFair('pump');
  const { balance, placeBet } = useBalance();
  
  const [betAmount, setBetAmount] = useState('0.00000001');
  const [difficulty, setDifficulty] = useState('Medium');
  const [gameActive, setGameActive] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [targetMultiplier, setTargetMultiplier] = useState(1.23);
  const [maxMultiplier, setMaxMultiplier] = useState(0);
  const [balloonSize, setBalloonSize] = useState(100);
  const [profit, setProfit] = useState('0.00000000');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('1.23x');
  
  const animationRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    const amount = parseFloat(betAmount) || 0;
    const profitValue = amount * (currentMultiplier - 1);
    setProfit(formatCrypto(profitValue));
  }, [betAmount, currentMultiplier]);
  
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
  
  const handlePresetChange = (preset: string) => {
    if (gameActive) return;
    setSelectedPreset(preset);
    setTargetMultiplier(parseFloat(preset.replace('x', '')));
  };
  
  // Animation loop for pumping
  useEffect(() => {
    if (!gameActive) return;
    
    const updatePumpAnimation = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }
      
      const deltaTime = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;
      
      // Increase multiplier based on difficulty (slower increase for harder difficulty)
      let multiplierIncrease;
      switch (difficulty) {
        case 'Easy':
          multiplierIncrease = 0.3 * deltaTime;
          break;
        case 'Hard':
          multiplierIncrease = 0.1 * deltaTime;
          break;
        default: // Medium
          multiplierIncrease = 0.2 * deltaTime;
      }
      
      setCurrentMultiplier(prev => {
        const newMultiplier = prev + multiplierIncrease;
        
        // Increase balloon size
        setBalloonSize(100 + (newMultiplier - 1) * 50);
        
        // Check if balloon pops (reached max multiplier)
        if (newMultiplier >= maxMultiplier) {
          setGameActive(false);
          setGameOver(true);
          setWon(false);
          return prev;
        }
        
        // Check if target reached for auto cashout
        if (targetMultiplier > 0 && newMultiplier >= targetMultiplier) {
          handleCashout();
          return targetMultiplier;
        }
        
        animationRef.current = requestAnimationFrame(updatePumpAnimation);
        return parseFloat(newMultiplier.toFixed(2));
      });
    };
    
    animationRef.current = requestAnimationFrame(updatePumpAnimation);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, difficulty, maxMultiplier, targetMultiplier]);
  
  const startPumping = () => {
    if (gameActive) return;
    
    // Reset game state
    setGameOver(false);
    setWon(false);
    setCurrentMultiplier(1.00);
    setBalloonSize(100);
    lastUpdateTimeRef.current = 0;
    
    // Generate max multiplier using provably fair algorithm
    // Difficulty affects the max
    let difficultyModifier;
    switch (difficulty) {
      case 'Easy':
        difficultyModifier = 5;
        break;
      case 'Hard':
        difficultyModifier = 1.5;
        break;
      default: // Medium
        difficultyModifier = 3;
    }
    
    // In real implementation, this would use the provably fair algorithm
    const randomMax = 1 + Math.random() * 10 * difficultyModifier;
    setMaxMultiplier(randomMax);
    
    // Start pumping
    setGameActive(true);
    
    // In a real app, this would call the API to place a bet
    // placeBet.mutate({
    //   amount: parseFloat(betAmount),
    //   gameId: 8, // Pump game id
    //   clientSeed: 'seed',
    //   options: { difficulty }
    // });
  };
  
  const handleCashout = () => {
    if (!gameActive || gameOver) return;
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Set game as won
    setGameActive(false);
    setGameOver(true);
    setWon(true);
    
    // In a real app, this would call the API to complete the bet
    // completeBet.mutate({
    //   betId: currBetId!,
    //   outcome: { 
    //     maxMultiplier, 
    //     cashoutAt: currentMultiplier,
    //     difficulty,
    //     win: true 
    //   }
    // });
  };
  
  // Game visualization panel
  const gamePanel = (
    <div>
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {MULTIPLIER_PRESETS.map((preset) => (
          <Button
            key={preset}
            variant={preset === selectedPreset ? "default" : "outline"}
            className={preset === selectedPreset ? "bg-accent text-accent-foreground" : ""}
            size="sm"
            onClick={() => handlePresetChange(preset)}
            disabled={gameActive}
          >
            {preset}
          </Button>
        ))}
      </div>
      
      <div className="flex items-center justify-center h-64 relative mb-8">
        {/* Balloon */}
        {gameOver && !won ? (
          // Popped balloon
          <motion.div
            initial={{ scale: balloonSize / 100 }}
            animate={{ scale: [balloonSize / 100, 0.1], opacity: [1, 0] }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-32 h-32 bg-red-500 rounded-full relative">
              <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-white rounded-full opacity-30"></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-white font-bold text-xl">POPPED!</div>
              </div>
            </div>
            <div className="w-4 h-12 bg-gray-700 mx-auto -mt-1"></div>
            <div className="w-12 h-2 bg-gray-600 mx-auto rounded-full mt-2"></div>
          </motion.div>
        ) : (
          // Normal or winning balloon
          <motion.div
            animate={{ scale: balloonSize / 100 }}
            transition={{ type: "spring", damping: 10 }}
            className="relative"
          >
            <div className="w-32 h-32 bg-red-500 rounded-full relative">
              <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-white rounded-full opacity-30"></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-white font-bold text-2xl">{currentMultiplier.toFixed(2)}x</div>
              </div>
            </div>
            <div className="w-4 h-12 bg-gray-700 mx-auto -mt-1"></div>
            <div className="w-12 h-2 bg-gray-600 mx-auto rounded-full mt-2"></div>
          </motion.div>
        )}
      </div>
      
      {/* Result message */}
      {gameOver && (
        <div className={`text-center mb-6 p-3 rounded-lg ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className="text-2xl font-bold">
            {won ? `Cashed out at ${currentMultiplier.toFixed(2)}x!` : 'Balloon popped!'}
          </div>
          {won && <div>{profit} profit</div>}
        </div>
      )}
      
      {/* Progress Dots */}
      <div className="flex justify-center space-x-2 mt-4">
        <div className={`w-2 h-2 rounded-full ${currentMultiplier < 1.5 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
        <div className={`w-2 h-2 rounded-full ${currentMultiplier >= 1.5 && currentMultiplier < 2.5 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
        <div className={`w-2 h-2 rounded-full ${currentMultiplier >= 2.5 && currentMultiplier < 4 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
        <div className={`w-2 h-2 rounded-full ${currentMultiplier >= 4 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
      </div>
    </div>
  );
  
  // Game controls panel
  const controlsPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-muted-foreground mb-2">Bet Amount</label>
        <div className="relative">
          <Input
            type="text"
            value={betAmount}
            onChange={(e) => handleBetAmountChange(e.target.value)}
            className="w-full bg-panel-bg text-foreground pr-20"
            disabled={gameActive}
          />
          <div className="absolute right-0 top-0 flex h-full">
            <Button 
              variant="ghost" 
              className="h-full rounded-none border-l border-border px-3"
              onClick={handleHalfBet}
              disabled={gameActive}
            >
              ½
            </Button>
            <Button 
              variant="ghost" 
              className="h-full rounded-none border-l border-border px-3"
              onClick={handleDoubleBet}
              disabled={gameActive}
            >
              2×
            </Button>
          </div>
        </div>
      </div>
      
      <div>
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
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-muted-foreground mb-2">Total profit ({currentMultiplier.toFixed(2)}x)</label>
        <Input
          type="text"
          value={profit}
          readOnly
          className="w-full bg-panel-bg text-foreground"
        />
      </div>
      
      <Button 
        className="w-full bg-secondary text-secondary-foreground font-semibold py-3"
        onClick={startPumping}
        disabled={gameActive}
      >
        Pump
      </Button>
      
      <Button 
        className="w-full bg-accent text-accent-foreground font-semibold py-3"
        onClick={handleCashout}
        disabled={!gameActive || gameOver}
      >
        Cashout
      </Button>
    </div>
  );
  
  return (
    <GameLayout
      title="Pump"
      controlsPanel={controlsPanel}
      gamePanel={gamePanel}
    />
  );
};

export default PumpGame;
