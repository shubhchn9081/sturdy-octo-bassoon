import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface PhaserCrashProps {
  onCrash?: (value: number) => void;
  onTick?: (value: number) => void;
  startPoint?: number;
  isPlaying?: boolean;
  difficulty?: number; // 1-100 scale where 1 is hard, 100 is easy
}

class CrashGame extends Phaser.Scene {
  private curve!: Phaser.Curves.Spline;
  private points: Phaser.Math.Vector2[] = [];
  private graphics!: Phaser.GameObjects.Graphics;
  private player!: Phaser.GameObjects.Sprite;
  private multiplierText!: Phaser.GameObjects.Text;
  private crashed: boolean = false;
  private currentMultiplier: number = 1.0;
  private targetCrashPoint: number = 2.0;
  private onCrashCallback?: (value: number) => void;
  private onTickCallback?: (value: number) => void;
  private isPlaying: boolean = false;
  private difficulty: number = 50; // Default medium difficulty
  private maxHeight: number = 0;
  private rocketParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private explosionParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private particlesManager!: any; // Using any to avoid specific type issues
  private isRed: boolean = false; // Track if we're in the "danger" color state
  private interpolationPoint: number = 0;
  private lastTime: number = 0;

  constructor() {
    super('CrashGame');
  }

  init(data: any) {
    this.targetCrashPoint = data.startPoint || (1 + Math.random() * 10); // Default random crash point if not provided
    this.onCrashCallback = data.onCrash;
    this.onTickCallback = data.onTick;
    this.isPlaying = data.isPlaying ?? false;
    this.difficulty = data.difficulty ?? 50;
    this.crashed = false;
    this.currentMultiplier = 1.0;
    this.interpolationPoint = 0;
    
    // Adjust crash point based on difficulty (1-100)
    // Lower difficulty means lower crash points on average
    if (this.difficulty < 50) {
      const adjustmentFactor = (50 - this.difficulty) / 50; // 0 to 1
      this.targetCrashPoint = Math.max(1.01, this.targetCrashPoint * (1 - adjustmentFactor * 0.5));
    }
    // Higher difficulty means higher crash points on average
    else if (this.difficulty > 50) {
      const adjustmentFactor = (this.difficulty - 50) / 50; // 0 to 1
      this.targetCrashPoint = this.targetCrashPoint * (1 + adjustmentFactor * 0.5);
    }
  }

  preload() {
    try {
      // Create a simple color fill as fallback
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x1375e1, 1);
      graphics.fillTriangle(0, 20, 10, 0, 20, 20);
      graphics.generateTexture('rocket-fallback', 32, 32);
      
      // Try to load the rocket sprite, but we'll use fallback if it fails
      this.load.spritesheet('rocket', '/assets/rocket-sprite.png', { 
        frameWidth: 64, 
        frameHeight: 64 
      });
    } catch (error) {
      console.log('Error in preload:', error);
    }
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.maxHeight = height - 100;

    // Initialize graphics for drawing the curve
    this.graphics = this.add.graphics();
    
    // Create gradient background
    const background = this.add.graphics();
    background.fillGradientStyle(
      0x172B3A, 0x172B3A, 
      0x0F212E, 0x0F212E, 
      1
    );
    background.fillRect(0, 0, width, height);

    // Create grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x243442, 0.3);
    
    // Vertical grid lines
    for (let x = 0; x < width; x += 50) {
      grid.beginPath();
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
      grid.closePath();
      grid.strokePath();
    }
    
    // Horizontal grid lines
    for (let y = 0; y < height; y += 50) {
      grid.beginPath();
      grid.moveTo(0, y);
      grid.lineTo(width, y);
      grid.closePath();
      grid.strokePath();
    }

    // Initialize the curve with starting points
    this.points = [];
    
    // Add base points for the curve
    this.points.push(new Phaser.Math.Vector2(0, height - 50));
    this.points.push(new Phaser.Math.Vector2(50, height - 60));
    this.points.push(new Phaser.Math.Vector2(100, height - 70));
    this.points.push(new Phaser.Math.Vector2(150, height - 80));
    
    this.curve = new Phaser.Curves.Spline(this.points);

    // Initialize multiplier text
    this.multiplierText = this.add.text(width / 2, 50, '1.00x', { 
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { blur: 5, color: '#1375e1', fill: true }
    });
    this.multiplierText.setOrigin(0.5);

    // Try to create the player sprite
    try {
      this.player = this.add.sprite(0, 0, 'rocket');
      this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('rocket', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
      this.player.play('fly');
    } catch (e) {
      // If sprite loading failed, create a triangle as the player
      this.player = this.add.triangle(0, 0, 0, 20, 10, 0, 20, 20, 0x1375e1) as unknown as Phaser.GameObjects.Sprite;
    }
    
    this.player.setScale(0.7);

    // Create particle emitter for rocket thrust
    this.particlesManager = this.add.particles(0, 0);
    
    // Rocket flames
    this.rocketParticles = this.particlesManager.createEmitter({
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      frequency: 20
    });
    
    // Explosion particles for when the rocket crashes
    this.explosionParticles = this.particlesManager.createEmitter({
      speed: { min: 100, max: 200 },
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      lifespan: 800,
      frequency: 0
    });
    
    this.explosionParticles.stop();
    
    // Start playing if needed
    if (this.isPlaying) {
      this.startGame();
    }
  }

  startGame() {
    this.isPlaying = true;
    this.crashed = false;
    this.currentMultiplier = 1.0;
    this.interpolationPoint = 0;
    this.lastTime = 0;
    
    // Reset curve
    this.points = [];
    this.points.push(new Phaser.Math.Vector2(0, this.maxHeight));
    this.points.push(new Phaser.Math.Vector2(50, this.maxHeight - 10));
    this.points.push(new Phaser.Math.Vector2(100, this.maxHeight - 20));
    this.points.push(new Phaser.Math.Vector2(150, this.maxHeight - 30));
    
    this.curve = new Phaser.Curves.Spline(this.points);
    
    // Reset player position
    const initialPoint = this.curve.getPoint(0);
    this.player.setPosition(initialPoint.x, initialPoint.y);
    this.player.setRotation(0);
    
    // Reset particles
    this.rocketParticles.start();
    this.explosionParticles.stop();
    
    // Reset multiplier text
    this.multiplierText.setText('1.00x');
    this.multiplierText.setColor('#ffffff');
  }

  updateCurve() {
    if (!this.isPlaying || this.crashed) return;

    // Add new point to extend the curve
    const lastPoint = this.points[this.points.length - 1];
    const newX = lastPoint.x + 20; // Move forward by 20px each update
    
    // Calculate new Y based on a curve that gets steeper as multiplier increases
    const curveHeightFactor = Math.min(0.5, Math.log(this.currentMultiplier) / 10);
    const newY = Math.max(50, lastPoint.y - 10 - (curveHeightFactor * 30));
    
    this.points.push(new Phaser.Math.Vector2(newX, newY));
    
    // Remove points that are off-screen to the left
    while (this.points.length > 0 && this.points[0].x < -100) {
      this.points.shift();
    }
    
    // Recreate the curve with the updated points
    this.curve = new Phaser.Curves.Spline(this.points);
  }

  crash() {
    if (this.crashed) return;
    
    this.crashed = true;
    this.isPlaying = false;
    
    // Animate the crash
    this.rocketParticles.stop();
    this.explosionParticles.setPosition(this.player.x, this.player.y);
    this.explosionParticles.explode(30);
    
    // Make the text red to indicate crash
    this.multiplierText.setColor('#ff0000');
    
    // Notify callback
    if (this.onCrashCallback) {
      this.onCrashCallback(this.currentMultiplier);
    }
    
    // Flash the screen red
    const flashGraphics = this.add.graphics();
    flashGraphics.fillStyle(0xff0000, 0.3);
    flashGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
    
    this.tweens.add({
      targets: flashGraphics,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flashGraphics.destroy();
      }
    });
    
    // Make the rocket "fall" off the curve
    this.tweens.add({
      targets: this.player,
      y: this.scale.height + 100,
      rotation: 2,
      duration: 1000,
      ease: 'Cubic.easeIn'
    });
  }

  update(time: number, delta: number) {
    if (!this.isPlaying && !this.crashed) return;

    // Calculate time difference
    if (this.lastTime === 0) {
      this.lastTime = time;
    }
    const dt = time - this.lastTime;
    this.lastTime = time;
    
    // Update the multiplier based on time
    if (this.isPlaying && !this.crashed) {
      // Exponential growth of multiplier
      // The base growth rate is adjusted by difficulty
      const growthRate = 0.0004 * (1 + ((this.difficulty - 50) / 100));
      this.currentMultiplier += this.currentMultiplier * growthRate * dt;
      
      // Format the multiplier for display
      const multiplierStr = this.currentMultiplier.toFixed(2) + 'x';
      this.multiplierText.setText(multiplierStr);
      
      // Notify tick callback
      if (this.onTickCallback) {
        this.onTickCallback(this.currentMultiplier);
      }
      
      // Check if we've reached the crash point
      if (this.currentMultiplier >= this.targetCrashPoint) {
        this.crash();
      }
      
      // Change text color based on multiplier for visual feedback
      if (this.currentMultiplier > 5 && !this.isRed) {
        this.isRed = true;
        this.multiplierText.setColor('#ff9500');
      } else if (this.currentMultiplier > 10 && this.isRed) {
        this.multiplierText.setColor('#ff0000');
      }
    }
    
    // Extend the curve
    this.updateCurve();
    
    // Draw the curve
    this.graphics.clear();
    
    // Draw curve with gradient color based on multiplier
    const colorStop1 = 0x1375e1; // Blue
    const colorStop2 = 0xff9500; // Orange
    const colorStop3 = 0xff0000; // Red
    
    let curveColor;
    if (this.currentMultiplier < 2) {
      curveColor = colorStop1;
    } else if (this.currentMultiplier < 5) {
      // Interpolate between blue and orange
      const t = (this.currentMultiplier - 2) / 3;
      curveColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(colorStop1),
        Phaser.Display.Color.ValueToColor(colorStop2),
        100,
        Math.floor(t * 100)
      );
      curveColor = Phaser.Display.Color.GetColor(curveColor.r, curveColor.g, curveColor.b);
    } else {
      // Interpolate between orange and red
      const t = Math.min(1, (this.currentMultiplier - 5) / 5);
      curveColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(colorStop2),
        Phaser.Display.Color.ValueToColor(colorStop3),
        100,
        Math.floor(t * 100)
      );
      curveColor = Phaser.Display.Color.GetColor(curveColor.r, curveColor.g, curveColor.b);
    }
    
    // Draw curve with glow effect
    this.graphics.lineStyle(4, curveColor, 1);
    this.curve.draw(this.graphics);
    
    // Add glow effect
    this.graphics.lineStyle(8, curveColor, 0.3);
    this.curve.draw(this.graphics);
    
    // Move the player along the curve
    if (this.isPlaying) {
      this.interpolationPoint += 0.001 * dt;
      if (this.interpolationPoint > 1) this.interpolationPoint = 1;
    }
    
    // Get position from curve
    let position = this.curve.getPoint(Math.min(0.98, this.interpolationPoint));
    if (!position) {
      // Use any to bypass type checking
      position = { x: 0, y: this.maxHeight } as any;
    }
    
    if (position && !this.crashed) {
      // Calculate the direction to face (tangent to the curve)
      const nextPosition = this.curve.getPoint(Math.min(0.99, this.interpolationPoint + 0.01));
      
      if (nextPosition) {
        const angle = Math.atan2(nextPosition.y - position.y, nextPosition.x - position.x);
        this.player.setPosition(position.x, position.y);
        this.player.setRotation(angle);
        
        // Update particle emitter position and angle
        this.rocketParticles.setPosition(position.x - Math.cos(angle) * 15, position.y - Math.sin(angle) * 15);
        this.rocketParticles.setAngle(Phaser.Math.RadToDeg(angle) + 180);
      }
    }
    
    // Move camera to follow the player
    const startScrollX = this.scale.width / 3;
    if (position && position.x > startScrollX) {
      this.cameras.main.scrollX = position.x - startScrollX;
    }
  }
}

const PhaserCrash: React.FC<PhaserCrashProps> = ({ 
  onCrash, 
  onTick, 
  startPoint, 
  isPlaying = false,
  difficulty = 50
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!gameContainerRef.current) return;
    
    // Initialize Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: 400,
      parent: gameContainerRef.current,
      backgroundColor: '#172B3A',
      scene: [CrashGame],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    
    gameRef.current = new Phaser.Game(config);
    
    // Initialize scene with props
    const crashGame = gameRef.current.scene.getScene('CrashGame') as CrashGame;
    if (crashGame) {
      crashGame.scene.restart({
        onCrash,
        onTick,
        startPoint,
        isPlaying,
        difficulty
      });
    }
    
    // Clean up function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Initialize just once

  // Update game when props change
  useEffect(() => {
    if (!gameRef.current) return;
    
    const crashGame = gameRef.current.scene.getScene('CrashGame') as CrashGame;
    if (crashGame) {
      crashGame.scene.restart({
        onCrash,
        onTick,
        startPoint,
        isPlaying,
        difficulty
      });
    }
  }, [onCrash, onTick, startPoint, isPlaying, difficulty]);

  return (
    <div 
      ref={gameContainerRef} 
      className="w-full rounded-lg overflow-hidden bg-[#172B3A] shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default PhaserCrash;