import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
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

const PixiCupAndBallGame: React.FC<CupAndBallGameProps> = ({
  gamePhase,
  ballPosition,
  selectedCup,
  shuffleMoves,
  difficulty,
  onCupSelect,
  gameResult
}) => {
  // Container ref for the Pixi canvas
  const pixiContainer = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for game objects
  const cupsRef = useRef<PIXI.Container[]>([]);
  const ballRef = useRef<PIXI.Graphics | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Cup positions (tracking the actual indices)
  const [cupPositions, setCupPositions] = useState([0, 1, 2]);
  
  // Animation related states
  const [currentAnimationStep, setCurrentAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Generate Cup Graphics
  const createCup = useCallback(() => {
    const cup = new PIXI.Container();
    
    // Cup body - using a graphics object for custom shapes
    const body = new PIXI.Graphics();
    body.beginFill(0x994d00); // Brown cup color
    
    // Cup bottom (trapezoid)
    body.drawPolygon([
      -40, 60,  // bottom left
      40, 60,   // bottom right
      32, 10,   // top right
      -32, 10   // top left
    ]);
    
    // Cup top rim
    const rim = new PIXI.Graphics();
    rim.beginFill(0x7a3d00); // Darker brown for rim
    rim.drawEllipse(0, 10, 32, 8);
    
    // Cup handle
    const handle = new PIXI.Graphics();
    handle.beginFill(0x7a3d00);
    handle.drawPolygon([
      32, 10,   // top
      40, 40,   // middle
      34, 50,   // bottom
      32, 50,   // bottom inner
      36, 40,   // middle inner
      30, 15    // top inner
    ]);
    
    // Shadow under cup
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.3);
    shadow.drawEllipse(0, 65, 38, 8);
    shadow.alpha = 0.5;
    
    // Add all parts to the cup container
    cup.addChild(shadow);
    cup.addChild(body);
    cup.addChild(rim);
    cup.addChild(handle);
    
    // Add cup number
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#ffffff',
    });
    
    // Cup container is interactive to handle clicks
    cup.eventMode = 'static';
    cup.cursor = 'pointer';
    
    return cup;
  }, []);
  
  // Create the ball graphics
  const createBall = useCallback(() => {
    const ball = new PIXI.Graphics();
    ball.beginFill(0xff0000); // Red ball
    ball.drawCircle(0, 0, 20);
    ball.endFill();
    return ball;
  }, []);
  
  // Initialize PIXI Application and setup scene
  useEffect(() => {
    if (!pixiContainer.current || isInitialized) return;
    
    // Create app with forceCanvas to avoid WebGL issues in some environments
    const app = new PIXI.Application({
      width: 800,
      height: 500,
      backgroundColor: 0x123456, // Dark blue background
      antialias: true,
      forceCanvas: true // Use Canvas renderer instead of WebGL to avoid compatibility issues
    });
    
    // Add the canvas to the DOM - ensuring we access it correctly
    if (app.view instanceof HTMLCanvasElement) {
      pixiContainer.current.appendChild(app.view);
      appRef.current = app;
    }
    
    // Create table surface
    const table = new PIXI.Graphics();
    table.beginFill(0x0f2d44); // Dark blue-green for table
    table.drawRect(0, 0, app.screen.width, app.screen.height);
    table.endFill();
    app.stage.addChild(table);
    
    // Create pattern on table (wood grain effect)
    const pattern = new PIXI.Graphics();
    pattern.beginFill(0xffffff, 0.03);
    for (let i = 0; i < app.screen.width; i += 20) {
      pattern.drawRect(i, 0, 10, app.screen.height);
    }
    pattern.endFill();
    pattern.rotation = 0.2;
    app.stage.addChild(pattern);
    
    // Create three cups
    const cups: PIXI.Container[] = [];
    for (let i = 0; i < 3; i++) {
      const cup = createCup();
      cup.position.set(280 + i * 120, 250);
      
      // Add cup number
      const cupNum = new PIXI.Text(String(i + 1), {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 'white',
      });
      cupNum.anchor.set(0.5);
      cupNum.position.set(0, 40);
      cup.addChild(cupNum);
      
      // Make cup interactive for selection
      cup.on('pointerdown', () => {
        if (gamePhase === 'selecting') {
          onCupSelect(i);
        }
      });
      
      // Hover effects
      cup.on('pointerover', () => {
        if (gamePhase === 'selecting') {
          cup.scale.set(1.05, 1.05);
        }
      });
      
      cup.on('pointerout', () => {
        if (gamePhase === 'selecting') {
          cup.scale.set(1, 1);
        }
      });
      
      cups.push(cup);
      app.stage.addChild(cup);
    }
    cupsRef.current = cups;
    
    // Create ball
    const ball = createBall();
    ball.position.set(400, 330); // Position below middle cup initially
    ball.visible = false; // Start hidden
    ballRef.current = ball;
    app.stage.addChild(ball);
    
    setIsInitialized(true);
    
    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      app.destroy(true, true);
      appRef.current = null;
    };
  }, [createBall, createCup, gamePhase, onCupSelect]);
  
  // Handle game phase changes
  useEffect(() => {
    if (!appRef.current || !ballRef.current || !cupsRef.current.length) return;
    
    const cups = cupsRef.current;
    const ball = ballRef.current;
    
    console.log(`Game phase changed to: ${gamePhase}, ballPosition: ${ballPosition}`);
    
    // Reset animation states when phase changes
    setIsAnimating(false);
    setIsShuffling(false);
    
    if (gamePhase === 'initial' && ballPosition !== null) {
      // Reset cup positions and make ball visible under initial cup
      setCupPositions([0, 1, 2]);
      
      // Position cups in starting positions
      cups.forEach((cup, i) => {
        cup.position.x = 280 + i * 120;
        cup.position.y = 250;
        cup.scale.set(1, 1);
        cup.angle = 0;
      });
      
      // Show ball under starting cup
      if (ballPosition >= 0 && ballPosition < 3) {
        ball.visible = true;
        ball.position.x = cups[ballPosition].position.x;
        ball.position.y = cups[ballPosition].position.y + 80;
      }
    }
    else if (gamePhase === 'shuffling') {
      // Hide the ball during shuffling
      ball.visible = false;
      
      // Start shuffling animation
      setIsShuffling(true);
      setCurrentAnimationStep(0);
      
      // Process the shuffling moves
      const finalPositions = [...cupPositions];
      shuffleMoves.forEach(moveType => {
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
        
        // Swap cup positions in our tracker
        const temp = finalPositions[pos1];
        finalPositions[pos1] = finalPositions[pos2];
        finalPositions[pos2] = temp;
      });
      
      // Set the final positions after shuffling
      console.log(`Final cup positions after shuffling: ${finalPositions}`);
      setCupPositions(finalPositions);
    }
    else if (gamePhase === 'selecting') {
      // Make cups interactive for selection
      cups.forEach((cup, i) => {
        cup.eventMode = 'static';
      });
    }
    else if (gamePhase === 'revealing' && ballPosition !== null) {
      // Find which cup position holds the ball
      const ballCupPosition = cupPositions.findIndex(idx => idx === ballPosition);
      if (ballCupPosition !== -1) {
        // Position ball under the correct cup
        ball.position.x = cups[ballCupPosition].position.x;
        ball.position.y = cups[ballCupPosition].position.y + 80;
        
        // Lift up the cup to reveal ball
        const cupWithBall = cups[ballCupPosition];
        cupWithBall.position.y -= 80;
        
        // Show the ball
        ball.visible = true;
      }
    }
    else if (gamePhase === 'complete') {
      // Game is over, just keep final state
    }
  }, [gamePhase, ballPosition, shuffleMoves, cupPositions]);
  
  // Animation loop for shuffling
  useEffect(() => {
    if (!isShuffling || !cupsRef.current.length || !appRef.current) return;
    
    // The cups
    const cups = cupsRef.current;
    
    // Animation duration depends on difficulty
    const shuffleSpeed = 
      difficulty === 'easy' ? 0.6 : 
      difficulty === 'medium' ? 0.8 : 1.0;
    
    // Set up animation
    let lastTime = 0;
    let animationTime = 0;
    const duration = 10000; // 10 seconds for full animation
    
    // Add extra "bluffing" moves for more confusion
    const extraMoveCount = 
      difficulty === 'easy' ? 2 : 
      difficulty === 'medium' ? 5 : 8;
    
    // Create all moves including bluffing moves
    const allMoves = [...shuffleMoves];
    for (let i = 0; i < extraMoveCount; i++) {
      const randomMove = Math.floor(Math.random() * 3);
      const randomPosition = Math.floor(Math.random() * (allMoves.length + 1));
      allMoves.splice(randomPosition, 0, randomMove);
    }
    
    // Animation function
    const animate = (time: number) => {
      if (!isShuffling || !appRef.current) return;
      
      const deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;
      
      // Update animation time
      animationTime += deltaTime * shuffleSpeed;
      
      // Calculate which move we're on
      const totalMoves = allMoves.length;
      const moveProgress = Math.min(animationTime / (duration / 1000), 1);
      const currentMove = Math.floor(moveProgress * totalMoves);
      
      if (currentMove !== currentAnimationStep && currentMove < totalMoves) {
        // We've moved to a new step
        setCurrentAnimationStep(currentMove);
        
        // Determine which cups to swap
        const moveType = allMoves[currentMove];
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
        
        // Animate the swap
        const cup1 = cups[pos1];
        const cup2 = cups[pos2];
        
        const cup1X = cup1.position.x;
        const cup2X = cup2.position.x;
        
        // Swap cup positions with animation
        const swapAnimation = () => {
          let progress = 0;
          const animateCups = () => {
            progress += 0.05;
            
            if (progress <= 1) {
              // Move cups in an arch
              cup1.position.x = cup1X + (cup2X - cup1X) * progress;
              cup2.position.x = cup2X + (cup1X - cup2X) * progress;
              
              // Add a little bounce
              cup1.position.y = 250 - Math.sin(progress * Math.PI) * 30;
              cup2.position.y = 250 - Math.sin(progress * Math.PI) * 30;
              
              // Add rotation effect
              cup1.angle = Math.sin(progress * Math.PI) * 5;
              cup2.angle = -Math.sin(progress * Math.PI) * 5;
              
              requestAnimationFrame(animateCups);
            } else {
              // Animation complete, reset Y position
              cup1.position.y = 250;
              cup2.position.y = 250;
              cup1.angle = 0;
              cup2.angle = 0;
            }
          };
          
          requestAnimationFrame(animateCups);
        };
        
        swapAnimation();
      }
      
      // Apply wiggle to all cups during shuffling
      cups.forEach((cup, index) => {
        // Different frequencies for each cup
        const frequency = 5 + index;
        const amplitude = 2;
        
        // Small wiggle effects
        cup.angle = Math.sin(time / 100 + index * 2) * amplitude;
        
        // Subtle scale breathing
        cup.scale.set(
          1 + Math.sin(time / 200 + index) * 0.03,
          1 + Math.sin(time / 200 + index) * 0.03
        );
      });
      
      // If animation is complete, stop shuffling
      if (moveProgress >= 1) {
        setIsShuffling(false);
        // Reset cups to normal state
        cups.forEach(cup => {
          cup.angle = 0;
          cup.scale.set(1, 1);
        });
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isShuffling, difficulty, shuffleMoves]);
  
  return (
    <div className="flex flex-col items-center space-y-4 h-full">
      {/* Game phase info */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">
          {gamePhase === 'initial' && 'Watch the ball placement...'}
          {gamePhase === 'shuffling' && 'Cups are shuffling...'}
          {gamePhase === 'selecting' && 'Select a cup!'}
          {gamePhase === 'revealing' && 'Revealing...'}
          {gamePhase === 'complete' && gameResult && (
            <div className={`flex items-center justify-center gap-2 ${gameResult.win ? 'text-green-500' : 'text-red-500'}`}>
              {gameResult.win ? (
                <>
                  <CheckCircle className="mr-1" />
                  You won {gameResult.profit.toFixed(2)}!
                </>
              ) : (
                <>
                  <XCircle className="mr-1" />
                  You lost!
                </>
              )}
            </div>
          )}
        </h2>
      </div>
      
      {/* Game canvas container */}
      <div 
        ref={pixiContainer} 
        className="flex-1 w-full h-full rounded-xl shadow-lg overflow-hidden"
      ></div>
      
      {/* Game instructions */}
      <div className="mt-4 text-center text-slate-300">
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

export default PixiCupAndBallGame;