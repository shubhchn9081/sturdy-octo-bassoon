import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CupGameControlsProps {
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  betAmount: number;
  onBetAmountChange: (amount: number) => void;
  onBetAmountSlider: (e: React.ChangeEvent<HTMLInputElement>) => void;
  potentialProfit: number;
  onStart: () => void;
  onReset: () => void;
  isPlaying: boolean;
  gamePhase: string;
  gameResult: { win: boolean; profit: number } | null;
  payoutMultiplier: number;
}

const CupGameControls: React.FC<CupGameControlsProps> = ({
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
  payoutMultiplier,
}) => {
  // Common button style
  const btnStyle = "w-full font-bold transition-all";
  
  // Handle manual bet amount change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1) {
      onBetAmountChange(value);
    } else if (e.target.value === '') {
      onBetAmountChange(1);
    }
  };
  
  // Quick bet amount buttons
  const quickBetButtons = [10, 25, 50, 100].map((amount) => (
    <Button
      key={amount}
      variant="outline"
      size="sm"
      className="flex-1 px-1"
      disabled={isPlaying}
      onClick={() => onBetAmountChange(amount)}
    >
      {amount}
    </Button>
  ));
  
  return (
    <Card className="shadow-lg border-0 bg-slate-900 text-white w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-center">Cup and Ball Controls</CardTitle>
        <CardDescription className="text-slate-400 text-center">
          Choose a difficulty and place your bet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 space-y-4">
        {/* Difficulty selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Difficulty</Label>
          <RadioGroup
            value={difficulty}
            onValueChange={onDifficultyChange}
            className="flex gap-2"
            disabled={isPlaying}
          >
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="easy" id="easy" disabled={isPlaying} />
              <Label
                htmlFor="easy"
                className={`text-sm ${difficulty === 'easy' ? 'text-green-400' : 'text-slate-400'}`}
              >
                Easy
              </Label>
            </div>
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="medium" id="medium" disabled={isPlaying} />
              <Label
                htmlFor="medium"
                className={`text-sm ${difficulty === 'medium' ? 'text-yellow-400' : 'text-slate-400'}`}
              >
                Medium
              </Label>
            </div>
            <div className="flex items-center space-x-1 flex-1">
              <RadioGroupItem value="hard" id="hard" disabled={isPlaying} />
              <Label
                htmlFor="hard"
                className={`text-sm ${difficulty === 'hard' ? 'text-red-400' : 'text-slate-400'}`}
              >
                Hard
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Bet amount input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium text-slate-300">Bet Amount</Label>
            <span className="text-sm font-medium text-slate-400">Multiplier: {payoutMultiplier}x</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              step="1"
              value={betAmount}
              onChange={handleInputChange}
              className="bg-slate-800 border-slate-700 text-white"
              disabled={isPlaying}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onBetAmountChange(Math.max(1, betAmount / 2))}
              disabled={isPlaying}
              className="hover:bg-slate-700"
            >
              ½
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onBetAmountChange(betAmount * 2)}
              disabled={isPlaying}
              className="hover:bg-slate-700"
            >
              2×
            </Button>
          </div>
          <div className="flex gap-1 pt-1">{quickBetButtons}</div>
          
          <div className="pt-2">
            <Slider
              value={[betAmount]}
              min={1}
              max={500}
              step={1}
              disabled={isPlaying}
              onValueChange={(value) => onBetAmountChange(value[0])}
              className="py-1"
            />
          </div>
        </div>
        
        {/* Potential win amount */}
        <div className="bg-slate-800 p-3 rounded-md">
          <div className="flex justify-between">
            <span className="text-slate-400">Potential Profit:</span>
            <span className="font-bold text-green-400">
              {potentialProfit.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Game result display */}
        {gameResult && (
          <div className={`p-3 rounded-md ${gameResult.win ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <div className="text-center font-bold">
              {gameResult.win ? (
                <span className="text-green-400">
                  You won: +{gameResult.profit.toFixed(2)}
                </span>
              ) : (
                <span className="text-red-400">
                  You lost your bet
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="default"
          className={`${btnStyle} bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800`}
          disabled={isPlaying && gamePhase !== 'complete'}
          onClick={onStart}
        >
          {gamePhase === 'complete' ? 'Play Again' : 'Start Game'}
        </Button>
        
        <Button
          variant="outline"
          className={`${btnStyle} border-slate-700 hover:bg-slate-800`}
          disabled={!isPlaying || gamePhase === 'guessing'}
          onClick={onReset}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CupGameControls;