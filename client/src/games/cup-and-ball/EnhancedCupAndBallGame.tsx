import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Enhanced Cup and Ball Game with improved animations based on the specifications
const EnhancedCupAndBallGame: React.FC<CupAndBallGameProps> = ({
  gamePhase,
  ballPosition,
  selectedCup,
  shuffleMoves,
  difficulty,
  onCupSelect,
  gameResult
}) => {
  // Main game state
  const [cupPositions, setCupPositions] = useState<number[]>([0, 1, 2]);
  const [gameContainerVisible, setGameContainerVisible] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const [ballVisible, setBallVisible] = useState<boolean>(false);
  const [initialBallPlacementDone, setInitialBallPlacementDone] = useState<boolean>(false);
  
  // Animation states
  const [animatingCups, setAnimatingCups] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [shuffleSequence, setShuffleSequence] = useState<{ type: number, pos1: number, pos2: number }[]>([]);
  const [isPreShufflePhase, setIsPreShufflePhase] = useState<boolean>(false);
  const [isShuffleSlowdown, setIsShuffleSlowdown] = useState<boolean>(false);
  const [isPostShuffleSettlement, setIsPostShuffleSettlement] = useState<boolean>(false);
  const [isSelectionPhase, setIsSelectionPhase] = useState<boolean>(false);
  const [isRevealPhase, setIsRevealPhase] = useState<boolean>(false);
  
  // Cup animation properties
  const [cupAnimations, setCupAnimations] = useState<{ x: number, y: number, rotate: number, scale: number, opacity?: number }[]>([
    { x: 0, y: 0, rotate: 0, scale: 0.9 },
    { x: 0, y: 0, rotate: 0, scale: 0.9 },
    { x: 0, y: 0, rotate: 0, scale: 0.9 }
  ]);
  
  // Cup reveal order for the reveal phase
  const [cupRevealOrder, setCupRevealOrder] = useState<number[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState<number>(0);
  
  // Text message shown during game phases
  const [gameMessage, setGameMessage] = useState<string>('');
  
  // Timing configurations based on difficulty
  const difficultyTimings = {
    easy: {
      swapDuration: 550,
      pauseBetweenSwaps: 200,
      shuffleSlowdownFactor: 1.5,
    },
    medium: {
      swapDuration: 450,
      pauseBetweenSwaps: 120,
      shuffleSlowdownFactor: 1.3,
    },
    hard: {
      swapDuration: 350,
      pauseBetweenSwaps: 50,
      shuffleSlowdownFactor: 1.2,
    }
  };
  
  // Animation frames for continuous animations
  const animationFrameRef = useRef<number | null>(null);
  
  // Calculate base positions for cups - mobile responsive
  const getCupBasePosition = (index: number) => {
    // For mobile screens, cups are closer together
    const basePositions = window.innerWidth < 768 ? 
      [-85, 0, 85] : // Mobile spacing
      [-120, 0, 120]; // Desktop spacing
    
    return basePositions[index];
  };
  
  // 1. Game Interface Initialization (0-500ms)
  useEffect(() => {
    if (gamePhase === 'initial') {
      // Reset all animation states
      setGameContainerVisible(false);
      setControlsVisible(false);
      setBallVisible(false);
      setInitialBallPlacementDone(false);
      setAnimatingCups(false);
      setIsPreShufflePhase(false);
      setIsShuffleSlowdown(false);
      setIsPostShuffleSettlement(false);
      setIsSelectionPhase(false);
      setIsRevealPhase(false);
      setCupRevealOrder([]);
      setCurrentRevealIndex(0);
      setGameMessage('');
      
      // Fade in game container with a subtle bounce effect for cups
      setTimeout(() => {
        setGameContainerVisible(true);
        
        // Initialize cup animations with slight scale effect
        setCupAnimations([
          { x: getCupBasePosition(0), y: 0, rotate: 0, scale: 0.9 },
          { x: getCupBasePosition(1), y: 0, rotate: 0, scale: 0.9 },
          { x: getCupBasePosition(2), y: 0, rotate: 0, scale: 0.9 }
        ]);
        
        // Animate cups to full size with spring effect
        setTimeout(() => {
          setCupAnimations(cups => 
            cups.map(cup => ({ ...cup, scale: 1.0 }))
          );
          
          // Reset cup positions to initial state
          setCupPositions([0, 1, 2]);
          console.log("Reset cup positions to initial state: [0, 1, 2]");
        }, 100);
      }, 300);
      
      // 2. Controls Animation (500-800ms)
      setTimeout(() => {
        setControlsVisible(true);
        setGameMessage('Place your bet...');
      }, 500);
    }
  }, [gamePhase]);
  
  // 3. Ball Introduction Animation (after initial phase starts)
  useEffect(() => {
    if (gamePhase === 'initial' && gameContainerVisible && ballPosition !== null && !ballVisible) {
      // Delay ball appearance for dramatic effect
      setTimeout(() => {
        setBallVisible(true);
        setGameMessage('Watch the ball...');
      }, 800);
    }
  }, [gamePhase, gameContainerVisible, ballPosition, ballVisible]);
  
  // 4. Initial Ball Placement Animation
  useEffect(() => {
    if (gamePhase === 'initial' && ballVisible && ballPosition !== null && !initialBallPlacementDone) {
      // After ball is visible, show initial placement under a cup
      setTimeout(() => {
        // Raise the selected cup
        setCupAnimations(cups => 
          cups.map((cup, index) => 
            index === ballPosition 
              ? { ...cup, y: -20 } 
              : cup
          )
        );
        
        // Lower the cup after a short delay to "hide" the ball
        setTimeout(() => {
          setCupAnimations(cups => 
            cups.map((cup, index) => 
              index === ballPosition 
                ? { ...cup, y: 0 } 
                : cup
            )
          );
          setInitialBallPlacementDone(true);
          setGameMessage('Ball hidden under cup...');
        }, 600);
      }, 1000);
    }
  }, [gamePhase, ballVisible, ballPosition, initialBallPlacementDone]);
  
  // 5. Pre-Shuffle Anticipation and Prepare Shuffle Sequence
  useEffect(() => {
    if (gamePhase === 'shuffling' && initialBallPlacementDone && !isPreShufflePhase) {
      setIsPreShufflePhase(true);
      setGameMessage('Shuffling begins...');
      
      // Create subtle pulsating effect on all cups
      const animations = cupAnimations.map(cup => ({
        ...cup,
        scale: 1.03 // Slight scale increase for anticipation
      }));
      setCupAnimations(animations);
      
      console.log("Starting cup shuffling simulation");
      
      // Prepare for shuffle animation
      setTimeout(() => {
        // Reset scale after pulsation
        setCupAnimations(cups => 
          cups.map(cup => ({ ...cup, scale: 1.0 }))
        );
        
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
        setAnimationStep(0);
        
        // Begin the shuffle animation sequence
        setAnimatingCups(true);
      }, 500); // 500ms for pre-shuffle anticipation
    }
  }, [gamePhase, initialBallPlacementDone, isPreShufflePhase, shuffleMoves, difficulty, cupAnimations]);
  
  // 6. Cup Shuffling Animation
  useEffect(() => {
    if (animatingCups && shuffleSequence.length > 0) {
      const timings = difficultyTimings[difficulty];
      let currentPositions = [...cupPositions];
      
      // Process the animation sequence
      const animateShuffles = async () => {
        // Animate each move in sequence
        for (let i = 0; i < shuffleSequence.length; i++) {
          // Update which step of animation we're on
          setAnimationStep(i);
          setGameMessage('Watch carefully...');
          
          // Get the current move
          const move = shuffleSequence[i];
          
          // Are we in the slowdown phase? (last 2-3 moves)
          const isInSlowdownPhase = i >= shuffleSequence.length - 3;
          if (isInSlowdownPhase && !isShuffleSlowdown) {
            setIsShuffleSlowdown(true);
          }
          
          // Calculate swap duration for this move
          const swapDuration = isInSlowdownPhase ? 
            timings.swapDuration * timings.shuffleSlowdownFactor : 
            timings.swapDuration;
            
          // Pause between swaps - varies by difficulty
          const pauseDuration = isInSlowdownPhase ?
            timings.pauseBetweenSwaps * 2 : // Longer pause during slowdown phase
            timings.pauseBetweenSwaps;
            
          // Start the swap animation
          const pos1 = move.pos1;
          const pos2 = move.pos2;
          
          // 1. Cups rise slightly
          setCupAnimations(cups => 
            cups.map((cup, index) => 
              index === pos1 || index === pos2
                ? { ...cup, y: -15 }
                : cup
            )
          );
          
          // Wait for cups to rise
          await new Promise(resolve => setTimeout(resolve, swapDuration / 3));
          
          // 2. Cups move horizontally to swap positions
          const tempX = cupAnimations[pos1].x;
          setCupAnimations(cups => 
            cups.map((cup, index) => {
              if (index === pos1) {
                return { ...cup, x: cups[pos2].x };
              } else if (index === pos2) {
                return { ...cup, x: tempX };
              }
              return cup;
            })
          );
          
          // Wait for horizontal movement
          await new Promise(resolve => setTimeout(resolve, swapDuration / 3));
          
          // 3. Cups lower back to original vertical position
          setCupAnimations(cups => 
            cups.map((cup, index) => 
              index === pos1 || index === pos2
                ? { ...cup, y: 0 }
                : cup
            )
          );
          
          // Swap cup positions in the tracking array
          const temp = currentPositions[pos1];
          currentPositions[pos1] = currentPositions[pos2];
          currentPositions[pos2] = temp;
          setCupPositions([...currentPositions]);
          
          // Wait for cups to lower + pause between swaps
          await new Promise(resolve => setTimeout(resolve, swapDuration / 3 + pauseDuration));
        }
        
        // Animation complete - settle cups
        setAnimatingCups(false);
        setIsShuffleSlowdown(false);
        setIsPostShuffleSettlement(true);
        setGameMessage('Cups have been shuffled!');
        
        // Final "settling" animation for cups
        setCupAnimations(cups => 
          cups.map(cup => ({ 
            ...cup, 
            scale: 1.05, // Slight bounce effect
            y: -5
          }))
        );
        
        // Return to normal after settling bounce
        setTimeout(() => {
          setCupAnimations(cups => 
            cups.map((cup, index) => ({ 
              ...cup, 
              scale: 1.0,
              y: 0,
              // Spread cups out slightly for easier selection
              x: getCupBasePosition(index) * 1.1
            }))
          );
          
          // Move to selection phase
          setIsPostShuffleSettlement(false);
          setIsSelectionPhase(true);
          setGameMessage('Select a cup!');
          
          console.log("Final cup positions after shuffling:", currentPositions);
        }, 500);
      };
      
      animateShuffles();
    }
  }, [animatingCups, shuffleSequence, cupPositions, difficulty]);
  
  // Handle continuous animations during shuffling with requestAnimationFrame
  useEffect(() => {
    if (gamePhase === 'shuffling' && !isSelectionPhase) {
      // Function for continuous animation updates
      const updateContinuousAnimations = () => {
        const now = Date.now();
        
        // Only apply subtle continuous animations if not in the middle of a shuffle movement
        if (!animatingCups || isPreShufflePhase) {
          setCupAnimations(prevAnimations => 
            prevAnimations.map((anim, i) => {
              // Each cup gets a slightly different animation pattern
              const wobbleSpeed = 150 + (i * 50);
              const rotateSpeed = 250 + (i * 70);
              
              return {
                ...anim,
                // Apply very subtle position changes during non-shuffle phases
                y: anim.y + Math.sin(now / wobbleSpeed) * 0.2,
                rotate: isPreShufflePhase ? Math.sin(now / rotateSpeed) * 1 : anim.rotate
              };
            })
          );
        }
        
        animationFrameRef.current = requestAnimationFrame(updateContinuousAnimations);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateContinuousAnimations);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gamePhase, animatingCups, isPreShufflePhase, isSelectionPhase]);
  
  // Cup selection phase animation (user selects a cup)
  useEffect(() => {
    if (gamePhase === 'selecting' && !isRevealPhase) {
      // Apply subtle hover effect to all cups
      setCupAnimations(cups => 
        cups.map(cup => ({
          ...cup,
          y: 0,
          rotate: 0,
          scale: 1.0
        }))
      );
    }
  }, [gamePhase, isRevealPhase]);
  
  // Handle cup selection animation
  const handleCupSelect = (position: number) => {
    console.log(`Cup clicked at position: ${position}, gamePhase: ${gamePhase}, isSelectionPhase: ${isSelectionPhase}`);
    
    // Get the cup index from the current positions array
    const cupIndex = cupPositions[position];
    
    // Make sure we're in the selection phase
    if (gamePhase === 'selecting') {
      console.log(`Selecting cup at position ${position} with index ${cupIndex}`);
      
      // Show selection animation
      setCupAnimations(cups => 
        cups.map((cup, index) => 
          index === position
            ? { ...cup, scale: 0.95 } // Press down effect
            : { ...cup, opacity: 0.7 } // Dim other cups
        )
      );
      
      // Reset scale after animation
      setTimeout(() => {
        setCupAnimations(cups => 
          cups.map((cup, index) => 
            index === position
              ? { ...cup, scale: 1.0 }
              : cup
          )
        );
        
        // Call the provided selection handler with the cup index
        console.log(`Calling onCupSelect with cupIndex: ${cupIndex}`);
        onCupSelect(cupIndex);
      }, 200);
    }
  };
  
  // Handle the reveal phase animations
  useEffect(() => {
    if (gamePhase === 'revealing' && !isRevealPhase && ballPosition !== null) {
      setIsRevealPhase(true);
      setGameMessage('Revealing...');
      
      // Pre-reveal anticipation pause
      setTimeout(() => {
        // Determine reveal order:
        // 1. A non-selected cup without the ball
        // 2. Another non-selected cup without the ball (if exists)
        // 3. Final cup (either selected or containing ball)
        const revealOrder: number[] = [];
        
        // Map cup positions to figure out which cups to reveal and when
        const cupContents = cupPositions.map((cupIndex, position) => ({
          position,
          cupIndex,
          containsBall: cupIndex === ballPosition,
          isSelected: cupIndex === selectedCup
        }));
        
        // First, add cups that don't have the ball and weren't selected
        const nonBallNonSelectedCups = cupContents.filter(
          cup => !cup.containsBall && !cup.isSelected
        );
        
        // Add these cups first to build anticipation
        nonBallNonSelectedCups.forEach(cup => revealOrder.push(cup.position));
        
        // Finally add the cup with the ball or the selected cup (if they're different)
        const finalCup = cupContents.find(
          cup => !revealOrder.includes(cup.position)
        );
        
        if (finalCup) {
          revealOrder.push(finalCup.position);
        }
        
        setCupRevealOrder(revealOrder);
        
        // Start the sequential reveal
        revealNextCup(revealOrder, 0);
      }, 1000); // 1 second pre-reveal anticipation
    }
  }, [gamePhase, isRevealPhase, ballPosition, selectedCup, cupPositions]);
  
  // Function to reveal cups one by one
  const revealNextCup = useCallback((revealOrder: number[], index: number) => {
    if (index >= revealOrder.length) return;
    
    setCurrentRevealIndex(index);
    const cupPosition = revealOrder[index];
    const cupIndex = cupPositions[cupPosition];
    const containsBall = cupIndex === ballPosition;
    const isSelected = cupIndex === selectedCup;
    
    // Cup rises with slight rotation
    setCupAnimations(cups => 
      cups.map((cup, i) => 
        i === cupPosition
          ? { ...cup, y: -60, rotate: 10 }
          : cup
      )
    );
    
    // If this is the last cup or contains the ball, keep it raised
    const isLastCup = index === revealOrder.length - 1;
    
    if (!isLastCup && !containsBall) {
      // Lower non-important cups after showing they're empty
      setTimeout(() => {
        setCupAnimations(cups => 
          cups.map((cup, i) => 
            i === cupPosition
              ? { ...cup, y: 0, rotate: 0 }
              : cup
          )
        );
        
        // Move to next cup
        setTimeout(() => {
          revealNextCup(revealOrder, index + 1);
        }, 200);
      }, 800);
    } else {
      // This is an important cup (has ball or is last)
      // Keep it raised and show the result
      
      // For the final reveal, show win/loss results
      if (isLastCup) {
        setTimeout(() => {
          // Show game result message
          setGameMessage(gameResult && gameResult.win ? 'You Won!' : 'Better luck next time!');
          
          // Apply special effects to the ball if it's a win
          if (gameResult && gameResult.win) {
            // Win animations happen in the render function
          }
        }, 500);
      } else {
        // Move to next cup after a pause
        setTimeout(() => {
          revealNextCup(revealOrder, index + 1);
        }, 800);
      }
    }
  }, [ballPosition, selectedCup, cupPositions, gameResult]);
  
  // Render a cup with its contents
  const renderCup = (position: number) => {
    // The cup index is the value at the position in the positions array
    const cupIndex = cupPositions[position];
    
    // Is this the cup the player selected?
    const isSelected = selectedCup === cupIndex;
    
    // Determine when to show the ball
    let showBall = false;
    
    if (gamePhase === 'initial' && ballVisible) {
      // Initial phase - show ball during the placement animation
      if (position === ballPosition && 
          (!initialBallPlacementDone || (cupAnimations[position] && cupAnimations[position].y < 0))) {
        showBall = true;
      }
    } else if ((gamePhase === 'revealing' || gamePhase === 'complete')) {
      // After revealing - show ball under the correct cup if it's raised
      const isCupRevealed = cupAnimations[position] && cupAnimations[position].y < -20;
      if (cupIndex === ballPosition && isCupRevealed) {
        showBall = true;
      }
    }
    
    // Handle selection interactivity
    const canSelect = gamePhase === 'selecting' && isSelectionPhase;
    
    // Get animation properties for this cup
    const animation = cupAnimations[position] || { x: 0, y: 0, rotate: 0, scale: 1 };
    
    // Determine if this cup is in the current reveal step
    const isBeingRevealed = isRevealPhase && 
                          cupRevealOrder[currentRevealIndex] === position;
    
    // Calculate if this is a winning cup (for special effects)
    const isWinningCup = gameResult?.win && cupIndex === ballPosition && 
                       (gamePhase === 'revealing' || gamePhase === 'complete');
                       
    // Calculate x-position based on current layout
    const baseX = getCupBasePosition(position);
    const finalX = animation.x !== undefined ? animation.x : baseX;
    
    return (
      // Simple selection wrapper
      <div className={`flex flex-col items-center relative ${canSelect ? 'cursor-pointer' : ''}`}>
        {/* Transparent selection overlay for better hitbox and debugging */}
        {canSelect && (
          <div 
            className="absolute z-50 bg-blue-500 bg-opacity-10 hover:bg-opacity-30 rounded-lg"
            style={{ 
              width: '100px',
              height: '120px',
              top: '-20px',
              left: '-40px',
              cursor: 'pointer'
            }}
            onClick={() => {
              console.log(`Cup overlay clicked position: ${position}`);
              // Call the parent component's handler with the cup index
              onCupSelect(cupIndex);
            }}
          >
            {/* Invisible but taking up space for click target */}
          </div>
        )}
      
        <motion.div
          key={`cup-${position}-${cupIndex}`}
          className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          initial={{ x: baseX, y: 0, scale: 0.9, rotate: 0 }}
          animate={{ 
            // Position and animation properties
            x: finalX,
            y: animation.y || 0,
            rotate: animation.rotate || 0,
            scale: animation.scale || 1,
            filter: isWinningCup ? 'drop-shadow(0 0 8px gold)' : undefined,
            opacity: canSelect ? 1 : animation.opacity || 1, // Make sure cups are fully visible during selection
          }}
          transition={{ 
            type: isBeingRevealed ? 'spring' : 'tween',
            stiffness: 250,
            damping: 15,
            duration: isBeingRevealed ? 0.5 : 0.3
          }}
          whileHover={canSelect ? { scale: 1.05, y: -5 } : {}}
        >
          {/* Cup - mobile optimized sizes */}
          <div className="w-20 h-24 md:w-28 md:h-36 relative">
            {/* Cup body with gradient */}
            <div className="absolute bottom-0 w-full h-20 md:h-28 bg-gradient-to-b from-orange-600 to-orange-900 rounded-b-lg rounded-t-xl transform-gpu shadow-lg"></div>
            
            {/* Cup rim */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 md:w-14 h-4 md:h-6 bg-orange-500 rounded-t-xl"></div>
            
            {/* Cup handle */}
            <div className="absolute right-0 top-8 w-3 md:w-4 h-10 md:h-12 bg-orange-700 rounded-r-full"></div>
            
            {/* Cup shadow - more pronounced */}
            <div 
              className="absolute -bottom-2 left-1/2 w-16 md:w-20 h-3 bg-black opacity-30 rounded-full blur-md" 
              style={{ transform: 'translateX(-50%)' }}
            />
            
            {/* Cup highlights for 3D effect */}
            <div className="absolute bottom-3 left-2 w-0.5 h-12 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-3 right-2 w-0.5 h-12 bg-black opacity-10 rounded-full"></div>
          </div>
          
          {/* No number indicators as requested */}
        </motion.div>
        
        {/* Ball shown when needed - with animations based on game state */}
        <AnimatePresence>
          {showBall && (
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 top-[80%] md:top-[85%] z-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: isWinningCup ? [1, 1.1, 1] : 1,
                y: isWinningCup ? [0, -5, 0] : 0,
                rotate: isWinningCup ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 15,
                duration: 0.4,
                repeat: isWinningCup ? Infinity : 0,
                repeatType: "reverse",
                repeatDelay: 0.5
              }}
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full shadow-lg ${isWinningCup ? 'bg-yellow-500' : 'bg-red-500'}`}>
                {/* Ball highlight for 3D effect */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
                
                {/* Win effect particles */}
                {isWinningCup && (
                  <div className="absolute inset-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute w-1 h-1 md:w-2 md:h-2 bg-yellow-300 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: Math.cos(i * Math.PI / 4) * 30,
                          y: Math.sin(i * Math.PI / 4) * 30,
                          opacity: [1, 0],
                          scale: [0, 1.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          repeatType: "loop"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  // Render appropriate game messages based on phase
  const renderGameMessage = () => {
    if (gameMessage) {
      return gameMessage;
    }
    
    if (gamePhase === 'initial') {
      return 'Watch the ball placement...';
    } else if (gamePhase === 'shuffling') {
      return 'Cups are shuffling...';
    } else if (gamePhase === 'selecting') {
      return 'Select a cup!';
    } else if (gamePhase === 'revealing') {
      return 'Revealing...';
    } else if (gamePhase === 'complete' && gameResult) {
      return gameResult.win ? `You won ${gameResult.profit.toFixed(2)}!` : 'Better luck next time!';
    }
    
    return '';
  };
  
  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center h-full w-full max-w-md mx-auto px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: gameContainerVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Game phase text with animations */}
      <motion.div 
        className="text-center my-2 h-8 relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <p className="text-base md:text-lg font-bold">
          {gamePhase === 'complete' && gameResult ? (
            <motion.span 
              className={`inline-flex items-center ${gameResult.win ? 'text-green-500' : 'text-red-500'}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {gameResult.win ? (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  You won {gameResult.profit.toFixed(2)}!
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-4 w-4" />
                  You lost!
                </>
              )}
            </motion.span>
          ) : (
            renderGameMessage()
          )}
        </p>
      </motion.div>
      
      {/* Game surface with improved animation effects */}
      <motion.div 
        className="relative w-full bg-[#1B3549] rounded-lg p-4 md:p-8 shadow-xl flex-1 flex items-center justify-center min-h-[300px] md:min-h-[400px]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
      >
        <div className="flex justify-center items-end gap-2 md:gap-8 w-full relative">
          {/* Selection indicator and buttons */}
          {gamePhase === 'selecting' && (
            <>
              <div className="absolute -top-10 left-0 right-0 text-center text-white bg-blue-500 bg-opacity-70 py-1 px-4 rounded-full text-sm animate-pulse">
                Click a cup to select!
              </div>
              
              {/* Triple button selection alternative for mobile */}
              <div className="absolute -bottom-14 left-0 right-0 flex justify-center space-x-4">
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                  onClick={() => onCupSelect(cupPositions[0])}
                >
                  Cup 1
                </button>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                  onClick={() => onCupSelect(cupPositions[1])}
                >
                  Cup 2
                </button>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                  onClick={() => onCupSelect(cupPositions[2])}
                >
                  Cup 3
                </button>
              </div>
            </>
          )}
          
          {/* Render the three cups */}
          {renderCup(0)}
          {renderCup(1)}
          {renderCup(2)}
        </div>
        
        {/* Table surface with improved texture and lighting */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1B3549] to-[#0F212E] rounded-lg overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuXyEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuXyEpIi8+PC9zdmc+')]"></div>
          
          {/* Spotlight effect */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black opacity-30"></div>
        </div>
        
        {/* Overlay for phase transitions */}
        <AnimatePresence>
          {isPreShufflePhase && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="text-lg md:text-xl font-bold text-white bg-black/30 px-6 py-2 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                Get Ready
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Game instructions - with motion effects */}
      <motion.div 
        className="mt-3 text-center text-slate-300 text-sm md:text-base px-2 max-w-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <h3 className="font-bold mb-1">How to Play</h3>
        <p className="text-xs md:text-sm">Watch where the ball is placed, follow the cups as they shuffle, then select the cup with the ball.</p>
        <p className="mt-1 text-xs md:text-sm">
          <span className="font-bold">Difficulty:</span> {difficulty} ({difficulty === 'easy' ? '5 shuffles, 1.5x payout' : difficulty === 'medium' ? '10 shuffles, 2x payout' : '15 shuffles, 3x payout'})
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedCupAndBallGame;