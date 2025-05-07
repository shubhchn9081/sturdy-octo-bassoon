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

  return (
    <div className="space-y-3 px-2 py-1">
      <h2 className="text-lg md:text-xl font-bold">Game Controls</h2>
      
      <div className="space-y-3">
        {/* Quick bet buttons first for mobile */}
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Quick Bet</label>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {[100, 500, 1000, 5000].map(amount => (
              <button
                key={amount}
                className={`text-xs md:text-sm py-1 px-2 rounded-md ${betAmount === amount ? 'bg-blue-600' : 'bg-slate-700'}`}
                onClick={() => onBetAmountSlider([amount])}
                disabled={isPlaying}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1">Difficulty</label>
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
        </div>

        {/* Mobile optimized game details - grid layout */}
        <div className="grid grid-cols-3 gap-1 mt-1">
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <Move className="mr-1 h-3 w-3 md:h-4 md:w-4 text-blue-400" />
              <span className="text-xs md:text-sm">Shuffles</span>
            </div>
            <span className="font-medium text-xs md:text-sm">{selectedDifficulty.shuffles}</span>
          </div>
          
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <Repeat className="mr-1 h-3 w-3 md:h-4 md:w-4 text-green-400" />
              <span className="text-xs md:text-sm">Speed</span>
            </div>
            <span className="font-medium text-xs md:text-sm">{selectedDifficulty.speed}</span>
          </div>
          
          <div className="bg-slate-800 rounded-md p-2 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <ArrowBigRight className="mr-1 h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
              <span className="text-xs md:text-sm">Payout</span>
            </div>
            <span className="font-medium text-xs md:text-sm">{selectedDifficulty.multiplier}x</span>
          </div>
        </div>

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

        <div className="mt-2">
          <label className="block text-xs md:text-sm font-medium mb-1">Payout Information</label>
          <div className="bg-slate-800 p-2 rounded-md">
            <div className="flex justify-between mb-1">
              <span className="text-xs md:text-sm">Bet Amount:</span>
              <span className="font-medium text-xs md:text-sm">{betAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-xs md:text-sm">Multiplier:</span>
              <span className="font-medium text-xs md:text-sm">{payoutMultiplier}x</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-xs md:text-sm">Potential Profit:</span>
              <span className="text-green-400 text-xs md:text-sm">{potentialProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {gameResult && gamePhase === 'complete' && (
          <div className={`mt-2 p-2 rounded-md ${gameResult.win ? 'bg-green-800' : 'bg-red-800'}`}>
            <h3 className="text-xs md:text-sm font-bold mb-1">{gameResult.win ? 'You Won!' : 'You Lost'}</h3>
            {gameResult.win && (
              <div className="flex justify-between">
                <span className="text-xs md:text-sm">Profit:</span>
                <span className="font-medium text-xs md:text-sm">{gameResult.profit.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Play button - always visible and prominent */}
        <div className="flex justify-between space-x-2 mt-3">
          {!isPlaying ? (
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 md:h-10 text-base md:text-sm font-bold" 
              onClick={onStart}
            >
              START GAME
            </Button>
          ) : (
            <Button 
              className={`flex-1 h-12 md:h-10 text-base md:text-sm font-bold ${
                gamePhase === 'complete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600'
              }`}
              onClick={onReset}
              disabled={gamePhase !== 'complete'}
            >
              {gamePhase === 'complete' ? 'PLAY AGAIN' : 'IN PROGRESS...'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CupControls;