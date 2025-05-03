import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

// Define Phaser types without importing the actual library
// This prevents the Phaser library from loading during server-side rendering
type PhaserGame = any;
type PhaserScene = any;

interface PhaserCupAndBallGameProps {
  gamePhase: 'initial' | 'shuffling' | 'selecting' | 'revealing' | 'complete';
  ballPosition: number | null;
  selectedCup: number | null;
  shuffleMoves: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  onCupSelect: (cupIndex: number) => void;
  gameResult: { win: boolean; profit: number } | null;
}

const PhaserCupAndBallGame: React.FC<PhaserCupAndBallGameProps> = ({
  gamePhase,
  ballPosition,
  selectedCup,
  shuffleMoves,
  difficulty,
  onCupSelect,
  gameResult
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<PhaserGame | null>(null);
  const [scene, setScene] = useState<PhaserScene | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // First load Phaser dynamically on the client side
  useEffect(() => {
    if (typeof window === 'undefined' || !gameRef.current || game) return;
    
    // Dynamically import Phaser only in the browser
    const loadPhaser = async () => {
      try {
        const Phaser = (await import('phaser')).default;
        
        // Define our Phaser scene class
        class CupsScene extends Phaser.Scene {
          cups: any[] = [];
          ball: any = null;
          cupPositions = [0, 1, 2];
          isShuffling = false;
          ballPosition: number | null = null;
          canSelect = false;
          onCupSelect: ((cupIndex: number) => void) | null = null;
          
          // Animation settings
          shuffleDuration = 1200; // ms per shuffle move (slower for better visibility)
          bluffFactor = 0.5; // 50% chance of fake movements
          bluffMovements = 5; // Number of fake movements to add to confuse the player
          
          constructor() {
            super('CupsScene');
          }
          
          init(data: any) {
            this.ballPosition = data.ballPosition;
            this.onCupSelect = data.onCupSelect;
            
            // Set animation speed based on difficulty
            if (data.difficulty === 'easy') {
              // Slower for easy difficulty, clearer to follow
              this.shuffleDuration = 1000;
              this.bluffMovements = 2;
            } else if (data.difficulty === 'medium') {
              // Medium speed, moderate bluffing
              this.shuffleDuration = 800;
              this.bluffMovements = 4;
            } else {
              // Faster and more tricky for hard difficulty
              this.shuffleDuration = 600;
              this.bluffMovements = 6;
            }
          }
          
          preload() {
            // Preload any assets
            // We'll create the cups and ball with graphics
          }
          
          create() {
            // Create background
            const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1B3549);
            bg.setOrigin(0, 0);
            
            // Create the three cups
            this.createCups();
            
            // Create ball
            this.createBall();
            
            // Set up event handlers
            this.setupEventHandlers();
          }
          
          createCups() {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            const spacing = 160;
            
            // Create each cup as a container with graphics
            for (let i = 0; i < 3; i++) {
              // Cup container
              const cup = this.add.container(centerX + (i - 1) * spacing, centerY);
              
              // Cup body
              const cupBody = this.add.graphics();
              cupBody.fillStyle(0xAA5500, 1);
              // Draw cup shape (upside-down)
              cupBody.fillRoundedRect(-50, -100, 100, 120, 16);
              cupBody.fillStyle(0x994400, 1);
              // Cup handle
              cupBody.fillRoundedRect(40, -80, 20, 60, 8);
              
              // Cup label (number)
              const label = this.add.text(0, 30, `${i + 1}`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff'
              });
              label.setOrigin(0.5, 0.5);
              
              // Add to container
              cup.add([cupBody, label]);
              
              // Set interactive
              cup.setSize(100, 120);
              cup.setInteractive({ useHandCursor: true });
              
              // Store position data with the cup
              cup.setData('index', i);
              
              this.cups.push(cup);
            }
          }
          
          createBall() {
            // Create the ball
            const ball = this.add.graphics();
            ball.fillStyle(0xFF0000, 1);
            ball.fillCircle(0, 0, 30);
            
            // Position under the correct cup, if ballPosition is set
            if (this.ballPosition !== null) {
              const cup = this.cups[this.ballPosition];
              ball.setPosition(cup.x, cup.y + 80);
            } else {
              ball.setVisible(false);
            }
            
            this.ball = ball;
          }
          
          setupEventHandlers() {
            // Add click handlers to cups
            this.cups.forEach(cup => {
              cup.on('pointerdown', () => {
                if (this.canSelect && this.onCupSelect) {
                  const cupIndex = cup.getData('index');
                  this.onCupSelect(cupIndex);
                }
              });
              
              // Add hover effect
              cup.on('pointerover', () => {
                if (this.canSelect) {
                  this.tweens.add({
                    targets: cup,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                  });
                }
              });
              
              cup.on('pointerout', () => {
                if (this.canSelect) {
                  this.tweens.add({
                    targets: cup,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                  });
                }
              });
            });
          }
          
          // Show the ball under the selected cup
          showInitialBallPosition() {
            if (this.ballPosition === null || this.ball === null) return;
            
            // Position under the correct cup
            const cup = this.cups[this.ballPosition];
            this.ball.setPosition(cup.x, cup.y + 80);
            this.ball.setVisible(true);
            
            // Animate ball appearing
            this.tweens.add({
              targets: this.ball,
              scaleX: { from: 0, to: 1 },
              scaleY: { from: 0, to: 1 },
              duration: 300,
              ease: 'Bounce.Out'
            });
          }
          
          // Hide the ball before shuffling
          hideBall() {
            if (this.ball === null) return;
            
            this.tweens.add({
              targets: this.ball,
              scaleX: 0,
              scaleY: 0,
              duration: 300,
              onComplete: () => {
                if (this.ball) this.ball.setVisible(false);
              }
            });
          }
          
          // Perform the cup shuffle animation
          shuffleCups(moves: number[], onComplete: () => void) {
            if (moves.length === 0) {
              onComplete();
              return;
            }
            
            // Hide the ball first
            this.hideBall();
            
            // Add some random bluff movements to make it harder
            const allMoves = [...moves];
            
            // Add bluff moves based on difficulty
            if (this.bluffFactor > 0) {
              for (let i = 0; i < this.bluffMovements; i++) {
                // Insert random swaps (0, 1, or 2) at random positions
                const randomMove = Math.floor(Math.random() * 3);
                const randomPosition = Math.floor(Math.random() * allMoves.length);
                allMoves.splice(randomPosition, 0, randomMove);
              }
            }
            
            // Start shuffling after a delay
            this.time.delayedCall(500, () => {
              this.isShuffling = true;
              
              // Chain animations for each move
              let delay = 0;
              
              allMoves.forEach((moveType, index) => {
                // Determine which cups to swap based on moveType (0=swap 0-1, 1=swap 1-2, 2=swap 0-2)
                let cup1Index: number, cup2Index: number;
                
                if (moveType === 0) {
                  cup1Index = 0;
                  cup2Index = 1;
                } else if (moveType === 1) {
                  cup1Index = 1;
                  cup2Index = 2;
                } else {
                  cup1Index = 0;
                  cup2Index = 2;
                }
                
                // Get current positions
                const visualIndex1 = this.cupPositions.indexOf(cup1Index);
                const visualIndex2 = this.cupPositions.indexOf(cup2Index);
                
                // Get the actual cup objects
                const cup1 = this.cups[cup1Index];
                const cup2 = this.cups[cup2Index];
                
                // Create a timeline for the smooth swap animation
                this.time.delayedCall(delay, () => {
                  // Create a timeline for each cup swap with enhanced animation
                  
                  // Add a slight shadow effect during movement
                  const shadow1 = this.add.graphics();
                  shadow1.fillStyle(0x000000, 0.2);
                  shadow1.fillEllipse(cup1.x, cup1.y + 100, 90, 30);
                  shadow1.setAlpha(0);
                  
                  const shadow2 = this.add.graphics();
                  shadow2.fillStyle(0x000000, 0.2);
                  shadow2.fillEllipse(cup2.x, cup2.y + 100, 90, 30);
                  shadow2.setAlpha(0);
                  
                  // Fade in shadows
                  this.tweens.add({
                    targets: [shadow1, shadow2],
                    alpha: 0.5,
                    duration: 200
                  });
                  
                  // Movement animation for first cup with more dynamic arc and slight rotation
                  this.tweens.add({
                    targets: cup1,
                    x: cup2.x,
                    y: { value: cup1.y - 50, yoyo: true, ease: 'Sine.Out' },
                    angle: { value: 5, yoyo: true }, // Slight tilt during movement
                    scaleX: { value: 1.05, yoyo: true }, // Slight scale change for dramatic effect
                    duration: this.shuffleDuration,
                    ease: 'Sine.InOut'
                  });
                  
                  // Move shadow with cup
                  this.tweens.add({
                    targets: shadow1,
                    x: cup2.x,
                    duration: this.shuffleDuration,
                    ease: 'Sine.InOut'
                  });
                  
                  // Movement animation for second cup
                  this.tweens.add({
                    targets: cup2,
                    x: cup1.x,
                    y: { value: cup2.y - 50, yoyo: true, ease: 'Sine.Out' },
                    angle: { value: -5, yoyo: true }, // Opposite tilt
                    scaleX: { value: 1.05, yoyo: true },
                    duration: this.shuffleDuration,
                    ease: 'Sine.InOut',
                    onComplete: () => {
                      // Update cup positions array
                      [this.cupPositions[visualIndex1], this.cupPositions[visualIndex2]] = 
                        [this.cupPositions[visualIndex2], this.cupPositions[visualIndex1]];
                      
                      // Remove shadows when animation completes
                      this.tweens.add({
                        targets: [shadow1, shadow2],
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                          shadow1.destroy();
                          shadow2.destroy();
                        }
                      });
                      
                      // Reset any angle changes to avoid accumulation
                      cup1.setAngle(0);
                      cup2.setAngle(0);
                      
                      // If this is the last move, call onComplete
                      if (index === allMoves.length - 1) {
                        this.isShuffling = false;
                        onComplete();
                      }
                    }
                  });
                  
                  // Move shadow with cup
                  this.tweens.add({
                    targets: shadow2,
                    x: cup1.x,
                    duration: this.shuffleDuration,
                    ease: 'Sine.InOut'
                  });
                });
                
                // Increase delay for next move
                delay += this.shuffleDuration + 50;
              });
            });
          }
          
          // Reveal the ball under the cup
          revealBall(cupIndex: number) {
            if (this.ball === null) return;
            
            // Find which cup has the ball
            const cup = this.cups[cupIndex];
            
            // Lift the cup
            this.tweens.add({
              targets: cup,
              y: cup.y - 100,
              duration: 500,
              ease: 'Back.Out'
            });
            
            // Show the ball
            this.ball.setPosition(cup.x, cup.y + 80);
            this.ball.setVisible(true);
            this.ball.setScale(0, 0);
            
            this.tweens.add({
              targets: this.ball,
              scaleX: 1,
              scaleY: 1,
              duration: 300,
              delay: 300,
              ease: 'Back.Out'
            });
          }
          
          // Enable cup selection
          enableSelection() {
            this.canSelect = true;
            
            // Add subtle animation to indicate cups are selectable
            this.cups.forEach(cup => {
              this.tweens.add({
                targets: cup,
                y: { value: cup.y - 10, yoyo: true, repeat: 2 },
                duration: 200,
                ease: 'Sine.InOut'
              });
            });
          }
          
          // Handle when player selects a cup
          selectCup(cupIndex: number) {
            this.canSelect = false;
          }
          
          // Reset all cups to original positions
          resetCups() {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            const spacing = 160;
            
            this.cups.forEach((cup, i) => {
              cup.setPosition(centerX + (i - 1) * spacing, centerY);
              cup.setScale(1, 1);
            });
            
            this.cupPositions = [0, 1, 2];
            
            if (this.ball) {
              this.ball.setVisible(false);
            }
          }
        }
        
        // Create the game instance
        const newGame = new Phaser.Game({
          type: Phaser.AUTO,
          width: 600,
          height: 400,
          parent: gameRef.current,
          backgroundColor: '#1B3549',
          scene: [CupsScene],
          transparent: true
        });
        
        setGame(newGame);
        setScene(newGame.scene.getScene('CupsScene'));
      } catch (err) {
        console.error("Failed to load Phaser:", err);
      }
    };
    
    loadPhaser();
    
    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, []);
  
  // Handle game state changes
  useEffect(() => {
    if (!game || !scene) return;
    
    // Initialize scene with current data
    const initScene = () => {
      scene.scene.restart({
        ballPosition,
        shuffleMoves,
        difficulty,
        onCupSelect
      });
      setIsInitialized(true);
    };
    
    if (!isInitialized) {
      initScene();
    }
  }, [game, scene, isInitialized, ballPosition, shuffleMoves, difficulty, onCupSelect]);
  
  // Handle game phase changes
  useEffect(() => {
    if (!game || !scene || !isInitialized) return;
    
    console.log(`Game phase changed to: ${gamePhase}`);
    
    if (gamePhase === 'initial') {
      console.log("Reset cup positions to initial state: [0, 1, 2]");
      scene.resetCups();
      console.log(`Setting initial ball position to: ${ballPosition}`);
      scene.ballPosition = ballPosition;
      scene.showInitialBallPosition();
    } else if (gamePhase === 'shuffling') {
      console.log(`Starting shuffle with ${shuffleMoves.length} moves: ${shuffleMoves.join(', ')}`);
      scene.shuffleCups(shuffleMoves, () => {
        console.log("Shuffling complete, cup positions:", scene.cupPositions);
        // We don't advance to the next phase here as it's controlled by the parent
      });
    } else if (gamePhase === 'selecting') {
      console.log("Enabling cup selection");
      scene.enableSelection();
    } else if (gamePhase === 'revealing') {
      if (ballPosition !== null) {
        console.log(`Revealing ball under cup at position: ${ballPosition}`);
        scene.revealBall(ballPosition);
      }
    }
  }, [game, scene, isInitialized, gamePhase, ballPosition, shuffleMoves]);
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full min-h-[500px]">
      {/* Game phase text */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg font-bold mb-8 z-10">
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
      
      {/* Phaser game canvas */}
      <div 
        ref={gameRef} 
        className="w-full h-[400px]"
      />
      
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

export default PhaserCupAndBallGame;