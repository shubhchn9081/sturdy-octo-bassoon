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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Game Controls</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <Select 
            value={difficulty} 
            onValueChange={(value: 'easy' | 'medium' | 'hard') => onDifficultyChange(value)}
            disabled={isPlaying}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-slate-800 border-0">
          <CardContent className="pt-4">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Move className="mr-2 h-4 w-4 text-blue-400" />
                <span className="text-sm">Shuffles:</span>
              </div>
              <span className="font-medium">{selectedDifficulty.shuffles}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Repeat className="mr-2 h-4 w-4 text-green-400" />
                <span className="text-sm">Speed:</span>
              </div>
              <span className="font-medium">{selectedDifficulty.speed}</span>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center">
                <ArrowBigRight className="mr-2 h-4 w-4 text-yellow-400" />
                <span className="text-sm">Multiplier:</span>
              </div>
              <span className="font-medium">{selectedDifficulty.multiplier}x</span>
            </div>
          </CardContent>
        </Card>

        <div>
          <label className="block text-sm font-medium mb-1">Bet Amount</label>
          <div className="flex space-x-2 mb-2">
            <Input
              type="number"
              value={betAmount}
              onChange={onBetAmountChange}
              disabled={isPlaying}
              className="flex-1"
            />
          </div>
          <Slider
            value={[betAmount]}
            min={1}
            max={100}
            step={1}
            onValueChange={onBetAmountSlider}
            disabled={isPlaying}
            className="my-4"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Payout Information</label>
          <div className="bg-slate-800 p-3 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Bet Amount:</span>
              <span className="font-medium">{betAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Multiplier:</span>
              <span className="font-medium">{payoutMultiplier}x</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-sm">Potential Profit:</span>
              <span className="text-green-400">{potentialProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {gameResult && gamePhase === 'complete' && (
          <div className={`mt-4 p-3 rounded-md ${gameResult.win ? 'bg-green-800' : 'bg-red-800'}`}>
            <h3 className="font-bold mb-1">{gameResult.win ? 'You Won!' : 'You Lost'}</h3>
            {gameResult.win && (
              <div className="flex justify-between">
                <span>Profit:</span>
                <span className="font-medium">{gameResult.profit.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between space-x-2 mt-6">
          {!isPlaying ? (
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={onStart}
            >
              Start Game
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700" 
              onClick={onReset}
              disabled={gamePhase !== 'complete'}
            >
              {gamePhase === 'complete' ? 'Play Again' : 'In Progress...'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CupControls;