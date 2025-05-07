import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Move, Repeat, ArrowBigRight } from 'lucide-react';

interface CupControlsProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (value: 'easy' | 'medium' | 'hard') => void;
  betAmount: number;
  onBetAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBetAmountSlider: (values: number[]) => void;
  potentialProfit: number;
  onStart: () => void;
  onReset: () => void;
  isPlaying: boolean;
  gamePhase: 'initial' | 'shuffling' | 'selecting' | 'revealing' | 'complete';
  gameResult: { win: boolean; profit: number } | null;
  payoutMultiplier: number;
}

const CupControls: React.FC<CupControlsProps> = ({
  difficulty,
  onDifficultyChange,
  betAmount,
  onBetAmountChange,
  onBetAmountSlider,
  potentialProfit,
  onStart,
  onReset,
  isPlaying,
  gamePhase,
  gameResult,
  payoutMultiplier
}) => {
  const difficultyDetails = {
    easy: {
      shuffles: 5,
      speed: 'Slow',
      multiplier: 1.5
    },
    medium: {
      shuffles: 10,
      speed: 'Medium',
      multiplier: 2.0
    },
    hard: {
      shuffles: 15,
      speed: 'Fast',
      multiplier: 3.0
    }
  };

  const selectedDifficulty = difficultyDetails[difficulty];

  // Check if we're on a mobile device
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="relative px-2 py-1 flex flex-col">
      {/* Main title */}
      <h2 className="text-lg md:text-xl font-bold mb-2">Game Controls</h2>
      
      {/* Sticky bottom action button for mobile */}
      {isMobile && (
        <div className="sticky bottom-1 z-50 mt-4 mb-1">
          {!isPlaying ? (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold rounded-lg" 
              onClick={onStart}
            >
              START GAME
            </Button>
          ) : (
            <Button 
              className={`w-full h-14 text-lg font-bold rounded-lg ${
                gamePhase === 'complete' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
              onClick={onReset}
              disabled={gamePhase !== 'complete'}
            >
              {gamePhase === 'complete' ? 'PLAY AGAIN' : 'IN PROGRESS...'}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {/* Quick bet amounts at the top for easier mobile access */}
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Quick Bet</label>
          <div className="grid grid-cols-4 gap-1">
            {[100, 500, 1000, 5000].map(amount => (
              <button
                key={amount}
                className={`text-sm py-2 rounded-md font-medium ${betAmount === amount ? 'bg-blue-600' : 'bg-slate-700'}`}
                onClick={() => onBetAmountSlider([amount])}
                disabled={isPlaying}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector and game info */}
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Difficulty</label>
          <div className="flex gap-2 mb-1">
            {/* Simple dropdown instead of fancy select for mobile */}
            {isMobile ? (
              <select 
                value={difficulty}
                onChange={(e) => onDifficultyChange(e.target.value as 'easy' | 'medium' | 'hard')}
                disabled={isPlaying}
                className="bg-slate-800 rounded-md py-2 px-2 text-sm flex-grow w-full"
              >
                <option value="easy">Easy (1.5x)</option>
                <option value="medium">Medium (2x)</option>
                <option value="hard">Hard (3x)</option>
              </select>
            ) : (
              <Select 
                value={difficulty} 
                onValueChange={(value: 'easy' | 'medium' | 'hard') => onDifficultyChange(value)}
                disabled={isPlaying}
              >
                <SelectTrigger className="w-full h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Mobile optimized game details - grid layout */}
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <Move className="mr-1 h-3 w-3 md:h-4 md:w-4 text-blue-400" />
              <span className="text-xs">Shuffles</span>
            </div>
            <span className="font-medium text-xs">{selectedDifficulty.shuffles}</span>
          </div>
          
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <Repeat className="mr-1 h-3 w-3 md:h-4 md:w-4 text-green-400" />
              <span className="text-xs">Speed</span>
            </div>
            <span className="font-medium text-xs">{selectedDifficulty.speed}</span>
          </div>
          
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <ArrowBigRight className="mr-1 h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
              <span className="text-xs">Payout</span>
            </div>
            <span className="font-medium text-xs">{selectedDifficulty.multiplier}x</span>
          </div>
        </div>

        {/* Bet amount slider and input */}
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Bet Amount</label>
          <div className="flex space-x-2 mb-1">
            <Input
              type="number"
              value={betAmount}
              onChange={onBetAmountChange}
              disabled={isPlaying}
              className="flex-1 h-8 md:h-10 text-xs md:text-sm"
              min={100}
            />
          </div>
          <Slider
            value={[betAmount]}
            min={100}
            max={5000}
            step={100}
            onValueChange={onBetAmountSlider}
            disabled={isPlaying}
            className="my-2"
          />
        </div>

        {/* Condensed payout info */}
        <div className="bg-slate-800 p-2 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Bet: {betAmount.toFixed(0)}</span>
            <span className="text-xs font-medium">x{payoutMultiplier}</span>
            <span className="text-green-400 text-xs font-bold">Win: {potentialProfit.toFixed(0)}</span>
          </div>
        </div>

        {/* Game result display */}
        {gameResult && gamePhase === 'complete' && (
          <div className={`p-2 rounded-md ${gameResult.win ? 'bg-green-800' : 'bg-red-800'}`}>
            <h3 className="text-sm font-bold text-center">{gameResult.win ? 'You Won!' : 'You Lost'}</h3>
            {gameResult.win && (
              <div className="text-center">
                <span className="font-medium text-sm">+{gameResult.profit.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Desktop Play button (mobile button is at the top) */}
        {!isMobile && (
          <div className="flex justify-between space-x-2 mt-3">
            {!isPlaying ? (
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-sm font-medium" 
                onClick={onStart}
              >
                Start Game
              </Button>
            ) : (
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 h-10 text-sm font-medium" 
                onClick={onReset}
                disabled={gamePhase !== 'complete'}
              >
                {gamePhase === 'complete' ? 'Play Again' : 'In Progress...'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CupControls;