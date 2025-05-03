import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface CupAndBallGameProps {
  gamePhase: 'initial' | 'shuffling' | 'selecting' | 'revealing' | 'complete';
  ballPosition: number | null;
  selectedCup: number | null;
  shuffleMoves: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  onCupSelect: (cupIndex: number) => void;
  gameResult: { win: boolean; profit: number } | null;
}

const CupAndBallGame: React.FC<CupAndBallGameProps> = ({
  gamePhase,
  ballPosition,
  selectedCup,
  shuffleMoves,
  difficulty,
  onCupSelect,
  gameResult
}) => {
  // Reference for cups positions
  const cupsRef = useRef<Array<{ x: number; y: number }>>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]);
  
  // Current positions of cups (0, 1, 2)
  const [cupPositions, setCupPositions] = useState<number[]>([0, 1, 2]);
  
  // Animation speeds based on difficulty
  const animationDurations = {
    easy: 0.5,
    medium: 0.3,
    hard: 0.2
  };
  
  // Reset cup positions when game starts
  useEffect(() => {
    if (gamePhase === 'initial') {
      // Reset cup positions at the start of a new game
      setCupPositions([0, 1, 2]);
      console.log('Reset cup positions to initial state: [0, 1, 2]');
    }
  }, [gamePhase]);

  // Animation sequence for shuffling
  useEffect(() => {
    if (gamePhase === 'shuffling' && shuffleMoves.length > 0) {
      let currentPositions = [...cupPositions];
      let delay = 0;
      
      console.log('Starting shuffling animation with positions:', currentPositions);
      
      // Animate each shuffle move
      shuffleMoves.forEach((moveType, index) => {
        setTimeout(() => {
          // Apply the swap to the current positions array
          let newPositions = [...currentPositions];
          if (moveType === 0) { // Swap cups 0-1
            [newPositions[0], newPositions[1]] = [newPositions[1], newPositions[0]];
            console.log(`Shuffle move ${index}: Swapping cups 0-1, new positions:`, newPositions);
          } else if (moveType === 1) { // Swap cups 1-2
            [newPositions[1], newPositions[2]] = [newPositions[2], newPositions[1]];
            console.log(`Shuffle move ${index}: Swapping cups 1-2, new positions:`, newPositions);
          } else { // Swap cups 0-2
            [newPositions[0], newPositions[2]] = [newPositions[2], newPositions[0]];
            console.log(`Shuffle move ${index}: Swapping cups 0-2, new positions:`, newPositions);
          }
          currentPositions = newPositions;
          setCupPositions([...newPositions]);
        }, delay);
        
        // Increase delay for next animation
        delay += animationDurations[difficulty] * 1000;
      });
    }
  }, [gamePhase, shuffleMoves, difficulty, cupPositions]);
  
  // We need to track two things:
  // 1. The cup's visual position (0, 1, 2 from left to right on screen)
  // 2. The cup's logical index (0, 1, 2 - which originally had the ball)
  
  // Get the cup index (logical cup identifier) from the visual position
  const getCupAtPosition = (position: number) => {
    return cupPositions.indexOf(position);
  };
  
  // Render a cup with animation
  const renderCup = (position: number) => {
    // The cup index is its logical identifier (original position)
    const cupIndex = getCupAtPosition(position);
    
    // Is this the cup the player selected?
    const isSelected = selectedCup === cupIndex;
    
    // In the initial phase, show the ball under its initial position
    // In revealing/complete phases, show the ball under the cup that actually contains it
    let showBall = false;
    
    if (gamePhase === 'initial') {
      // In initial phase, ball is shown under its position number (0, 1, or 2)
      showBall = position === ballPosition;
    } else if (gamePhase === 'revealing' || gamePhase === 'complete') {
      // After shuffling, the ball is under the cup with the matching index
      showBall = cupIndex === ballPosition;
    }
                     
    console.log(`Rendering cup at position ${position}, cupIndex: ${cupIndex}, ballPosition: ${ballPosition}, showBall: ${showBall}`);
    
    const canSelect = gamePhase === 'selecting';
    
    return (
      <div className="flex flex-col items-center">
        <motion.div
          key={`cup-${position}`}
          className={`relative cursor-pointer ${canSelect ? 'hover:opacity-80' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          initial={{ y: 0 }}
          animate={{ 
            // Lift the cup containing the ball when revealing
            y: (gamePhase === 'revealing' || gamePhase === 'complete') && ballPosition === cupIndex ? -80 : 0,
            scale: isSelected ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            if (canSelect) {
              console.log(`Clicked on cup at position ${position} with cupIndex ${cupIndex}`);
              onCupSelect(cupIndex);
            }
          }}
        >
          {/* Cup */}
          <div className="w-32 h-40 relative">
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-orange-700 to-orange-900 rounded-b-lg rounded-t-xl transform-gpu"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-orange-600 rounded-t-xl"></div>
            <div className="absolute right-0 top-12 w-6 h-16 bg-orange-800 rounded-r-full"></div>
          </div>
          
          {/* Number indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
            {position + 1}
          </div>
        </motion.div>
        
        {/* Ball shown when needed */}
        {showBall && (
          <motion.div
            className="w-16 h-16 bg-red-500 rounded-full shadow-lg mt-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full min-h-[500px]">
      {/* Game stage text */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg font-bold mb-8">
        {gamePhase === 'initial' && 'Watch the ball placement...'}
        {gamePhase === 'shuffling' && 'Cups are shuffling...'}
        {gamePhase === 'selecting' && 'Select a cup!'}
        {gamePhase === 'revealing' && 'Revealing...'}
        {gamePhase === 'complete' && gameResult && (
          <div className={`flex items-center ${gameResult.win ? 'text-green-500' : 'text-red-500'}`}>
            {gameResult.win ? (
              <>
                <CheckCircle className="mr-2" />
                You won {gameResult.profit.toFixed(2)}!
              </>
            ) : (
              <>
                <XCircle className="mr-2" />
                You lost!
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Game surface */}
      <div className="relative w-full bg-[#1B3549] rounded-xl p-12 shadow-xl flex-1 flex items-center justify-center">
        <div className="flex space-x-16 justify-center items-end">
          {/* Render the three cups */}
          {renderCup(0)}
          {renderCup(1)}
          {renderCup(2)}
        </div>
        
        {/* Table surface with wood texture */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1B3549] to-[#0F212E] rounded-xl">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuXyEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuXyEpIi8+PC9zdmc+')]"></div>
        </div>
      </div>
      
      {/* Game instructions */}
      <div className="mt-8 text-center text-slate-300">
        <h3 className="font-bold text-lg mb-2">How to Play</h3>
        <p>Watch where the ball is placed, follow the cups as they shuffle, then select the cup you think contains the ball.</p>
        <p className="mt-2">
          <span className="font-bold">Difficulty:</span> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} 
          {difficulty === 'easy' ? ' - 5 shuffles (1.5x payout)' : 
           difficulty === 'medium' ? ' - 10 shuffles (2x payout)' : 
           ' - 15 shuffles (3x payout)'}
        </p>
      </div>
    </div>
  );
};

export default CupAndBallGame;