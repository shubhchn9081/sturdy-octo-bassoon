import React from 'react';
import { motion } from 'framer-motion';
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

const BasicCupAndBallGame: React.FC<CupAndBallGameProps> = ({
  gamePhase,
  ballPosition,
  selectedCup,
  shuffleMoves,
  difficulty,
  onCupSelect,
  gameResult
}) => {
  // Track cup positions - starts at [0, 1, 2] and changes with shuffling
  const [cupPositions, setCupPositions] = React.useState([0, 1, 2]);

  // For cup animation during shuffling
  const [animatingCups, setAnimatingCups] = React.useState<boolean>(false);
  const [animationStep, setAnimationStep] = React.useState<number>(0);
  const [shuffleSequence, setShuffleSequence] = React.useState<{ type: number, pos1: number, pos2: number }[]>([]);
  const [cupAnimations, setCupAnimations] = React.useState<{ x: number, y: number, rotate: number }[]>([
    { x: 0, y: 0, rotate: 0 },
    { x: 0, y: 0, rotate: 0 },
    { x: 0, y: 0, rotate: 0 }
  ]);
  
  // Base positions for cups (for animation calculations)
  const cupBasePositions = [-170, 0, 170];
  
  // Visual animation logic - updated every frame for smoother animations
  React.useEffect(() => {
    let animationFrame: number;
    
    if (gamePhase === 'shuffling' && animatingCups) {
      // Continuously update visual animations based on current state
      const updateVisuals = () => {
        const now = Date.now();
        const animations = [...cupAnimations];
        
        // Apply oscillation effects to all cups
        for (let i = 0; i < 3; i++) {
          if (gamePhase === 'shuffling') {
            // Slight vertical bounce
            animations[i].y = Math.sin(now / (200 + i * 50)) * 6;
            
            // Subtle rotation
            animations[i].rotate = Math.sin(now / (300 + i * 70)) * 3;
          }
        }
        
        setCupAnimations(animations);
        animationFrame = requestAnimationFrame(updateVisuals);
      };
      
      animationFrame = requestAnimationFrame(updateVisuals);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [gamePhase, animatingCups, cupAnimations]);

  // When shuffleMoves change, prepare for animation
  React.useEffect(() => {
    if (gamePhase === 'shuffling' && shuffleMoves.length > 0) {
      console.log("Starting cup shuffling simulation");
      
      // Reset positions at start
      setCupPositions([0, 1, 2]);
      setAnimationStep(0);
      
      // Add some extra "bluffing" moves for more confusion
      const extraMoveCount = 
        difficulty === 'easy' ? 3 : 
        difficulty === 'medium' ? 5 : 8;
      
      // Create all moves including bluffing moves
      const allMoves = [...shuffleMoves];
      for (let i = 0; i < extraMoveCount; i++) {
        const randomMove = Math.floor(Math.random() * 3);
        const randomPosition = Math.floor(Math.random() * (allMoves.length + 1));
        allMoves.splice(randomPosition, 0, randomMove);
      }
      
      // Create sequence of cup swaps from the moves
      const sequence = allMoves.map(moveType => {
        let pos1, pos2;
        
        if (moveType === 0) {
          pos1 = 0;
          pos2 = 1;
        } else if (moveType === 1) {
          pos1 = 1;
          pos2 = 2;
        } else {
          pos1 = 0;
          pos2 = 2;
        }
        
        return { type: moveType, pos1, pos2 };
      });
      
      setShuffleSequence(sequence);
      
      // Start animation sequence
      setAnimatingCups(true);
      
      // Process the animation sequence
      const animateShuffles = async () => {
        let currentPositions = [...cupPositions];
        
        // Animate each move in sequence
        for (let i = 0; i < sequence.length; i++) {
          // Wait a bit before each move
          const move = sequence[i];
          
          // Update visual state to show which cups are moving
          setAnimationStep(i);
          
          // Swap cup positions
          const temp = currentPositions[move.pos1];
          currentPositions[move.pos1] = currentPositions[move.pos2];
          currentPositions[move.pos2] = temp;
          
          // Duration varies by difficulty
          const duration = difficulty === 'easy' ? 550 : 
                          difficulty === 'medium' ? 400 : 300;
          
          // Wait for animation to complete
          await new Promise(resolve => setTimeout(() => {
            setCupPositions([...currentPositions]);
            resolve(null);
          }, duration));
        }
        
        // Animation complete
        setAnimatingCups(false);
        console.log("Final cup positions after shuffling:", currentPositions);
      };
      
      animateShuffles();
    }
  }, [gamePhase, shuffleMoves, difficulty]);

  // Reset cup positions when game phase changes to initial
  React.useEffect(() => {
    if (gamePhase === 'initial') {
      console.log("Reset cup positions to initial state: [0, 1, 2]");
      setCupPositions([0, 1, 2]);
    }
  }, [gamePhase]);

  // Calculate cup positions for animation
  const getCupAnimationPosition = (position: number, moveType: number, progress: number) => {
    // Default cup positions on X-axis (0, 1, 2)
    const basePositions = [0, 1, 2];
    
    // No animation if not shuffling
    if (gamePhase !== 'shuffling' || !animatingCups) {
      return basePositions[position];
    }
    
    // During animation, we need to interpolate between positions
    let startPos = position;
    let endPos = position;
    
    // Determine which cups are moving based on moveType
    if (moveType === 0 && (position === 0 || position === 1)) {
      // Swapping cups 0 and 1
      endPos = position === 0 ? 1 : 0;
    } else if (moveType === 1 && (position === 1 || position === 2)) {
      // Swapping cups 1 and 2
      endPos = position === 1 ? 2 : 1;
    } else if (moveType === 2 && (position === 0 || position === 2)) {
      // Swapping cups 0 and 2
      endPos = position === 0 ? 2 : 0;
    }
    
    // Interpolate between start and end positions
    return startPos + (endPos - startPos) * progress;
  };

  // Render a cup with its contents
  const renderCup = (position: number) => {
    // The cup index is the value at the position in the positions array
    const cupIndex = cupPositions[position];
    
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
    
    // Determine if this cup is involved in the current shuffle move
    let isAnimatingThisCup = false;
    let swapPartner = -1;
    
    if (gamePhase === 'shuffling' && animatingCups && shuffleSequence.length > 0) {
      // Get the current move in the sequence
      const currentMoveIndex = Math.min(animationStep, shuffleSequence.length - 1);
      
      // Make sure we have a valid move at this index
      if (currentMoveIndex >= 0 && currentMoveIndex < shuffleSequence.length) {
        const currentMove = shuffleSequence[currentMoveIndex];
        
        // Check if this cup is involved in the current move
        if (position === currentMove.pos1) {
          isAnimatingThisCup = true;
          swapPartner = currentMove.pos2;
        } else if (position === currentMove.pos2) {
          isAnimatingThisCup = true;
          swapPartner = currentMove.pos1;
        }
      }
    }
    
    // Calculate base x-position for each cup position
    const baseX = position === 0 ? -170 : position === 1 ? 0 : 170;
    
    // Handle selection interactivity
    const canSelect = gamePhase === 'selecting';
    
    // Get animation properties for this cup
    const animation = cupAnimations[position];
    
    return (
      <div className="flex flex-col items-center">
        <motion.div
          key={`cup-${position}-${cupIndex}`}
          className={`relative cursor-pointer ${canSelect ? 'hover:opacity-80' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          initial={{ x: baseX, y: 0, scale: 1, rotate: 0 }}
          animate={{ 
            // Position cups horizontally
            x: baseX,
            
            // Vertical position - lift when revealing or bounce during shuffling
            y: (gamePhase === 'revealing' || gamePhase === 'complete') && 
               ballPosition === cupIndex ? -80 : // Lift to reveal ball
               gamePhase === 'shuffling' ? 
                  (isAnimatingThisCup ? 
                   Math.sin(Date.now() / 200) * 15 : // Bigger bounce for active cups
                   animation.y) : // Regular animation for others
               0, // Default - no vertical offset
            
            // Scale effect
            scale: isSelected ? 1.05 : // Highlight selected cup
                  gamePhase === 'shuffling' ? 
                    (isAnimatingThisCup ? 
                     1 + Math.sin(Date.now() / 250) * 0.08 : // Larger scale pulse for active cups
                     1 + Math.sin(Date.now() / 300) * 0.03) : // Subtle scale for others
                  1, // Default - normal scale
            
            // Rotation animation
            rotate: gamePhase === 'shuffling' ? 
                     (isAnimatingThisCup ? 
                      Math.sin(Date.now() / 200) * 8 : // More rotation for active cups
                      animation.rotate) : // Use calculated rotations
                    0, // Default - no rotation
          }}
          transition={{ 
            type: gamePhase === 'shuffling' && isAnimatingThisCup ? 'spring' : 'tween',
            stiffness: 200,
            damping: 15,
            duration: 0.4
          }}
          onClick={() => {
            if (canSelect) {
              console.log(`Clicked on cup at position ${position} with cupIndex ${cupIndex}`);
              onCupSelect(cupIndex);
            }
          }}
        >
          {/* Cup */}
          <div className="w-32 h-40 relative">
            {/* Cup body with gradient */}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-orange-600 to-orange-900 rounded-b-lg rounded-t-xl transform-gpu shadow-lg"></div>
            
            {/* Cup rim */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-orange-500 rounded-t-xl"></div>
            
            {/* Cup handle */}
            <div className="absolute right-0 top-12 w-6 h-16 bg-orange-700 rounded-r-full"></div>
            
            {/* Cup shadow - more pronounced */}
            <div 
              className="absolute -bottom-4 left-1/2 w-28 h-5 bg-black opacity-30 rounded-full blur-md" 
              style={{ transform: 'translateX(-50%)' }}
            />
            
            {/* Cup highlights for 3D effect */}
            <div className="absolute bottom-4 left-2 w-1 h-20 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-4 right-2 w-1 h-20 bg-black opacity-10 rounded-full"></div>
          </div>
          
          {/* Number indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ring-1 ring-slate-500">
            {position + 1}
          </div>
        </motion.div>
        
        {/* Ball shown when needed */}
        {showBall && (
          <motion.div
            className="w-16 h-16 bg-red-500 rounded-full shadow-lg mt-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1 
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 15,
              duration: 0.4 
            }}
          >
            {/* Ball highlight for 3D effect */}
            <div className="absolute top-3 left-3 w-4 h-4 bg-white opacity-30 rounded-full"></div>
          </motion.div>
        )}
      </div>
    );
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full min-h-[500px]">
      {/* Game phase text */}
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

export default BasicCupAndBallGame;