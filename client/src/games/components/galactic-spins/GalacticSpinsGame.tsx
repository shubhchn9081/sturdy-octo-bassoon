import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SlotSymbol } from '@shared/schema';

interface GalacticSpinsGameProps {
  reels: SlotSymbol[][];
  isSpinning: boolean;
  spinResults: any;
  onSpin: () => void;
  soundEnabled: boolean;
}

const GalacticSpinsGame: React.FC<GalacticSpinsGameProps> = ({
  reels,
  isSpinning,
  spinResults,
  onSpin,
  soundEnabled
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const reelContainersRef = useRef<PIXI.Container[]>([]);
  const symbolsRef = useRef<PIXI.Sprite[][]>([]);
  const [initialized, setInitialized] = useState(false);
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  
  // Symbol mapping for visual representation
  const symbolConfig = {
    'planet': { color: 0x6A95EA, label: 'P' },
    'star': { color: 0xFFF177, label: 'S' },
    'rocket': { color: 0xFF5533, label: 'R' },
    'alien': { color: 0x9EFF6E, label: 'A' },
    'asteroid': { color: 0xAA8866, label: 'As' },
    'comet': { color: 0xFFAA33, label: 'C' },
    'galaxy': { color: 0xE97EFF, label: 'G' },
    'blackhole': { color: 0x333333, label: 'B' },
    'wild': { color: 0xBF5DCF, label: 'W' }
  };

  // Initialize the game
  useEffect(() => {
    if (!gameRef.current || initialized) return;

    // Create Pixi Application
    const app = new PIXI.Application({
      width: 720,
      height: 400,
      backgroundColor: 0x0A0F24,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    gameRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;

    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x121628);
    background.drawRect(0, 0, app.screen.width, app.screen.height);
    background.endFill();
    app.stage.addChild(background);

    // Add starfield background
    createStarfield(app);

    // Add game title
    const title = new PIXI.Text('GALACTIC SPINS', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x44CCFF,
      align: 'center',
      fontWeight: 'bold'
    });
    title.x = app.screen.width / 2 - title.width / 2;
    title.y = 10;
    app.stage.addChild(title);

    // Create reels container
    const reelsContainer = new PIXI.Container();
    reelsContainer.x = 60;
    reelsContainer.y = 70;
    app.stage.addChild(reelsContainer);

    // Setup reels
    const reelWidth = 120;
    const reelHeight = 280;
    const symbolHeight = reelHeight / 3;
    const reelContainers: PIXI.Container[] = [];
    const symbols: PIXI.Sprite[][] = [];

    for (let i = 0; i < 5; i++) {
      // Create reel background
      const reelBg = new PIXI.Graphics();
      reelBg.beginFill(0x161B36);
      reelBg.drawRoundedRect(i * (reelWidth + 10), 0, reelWidth, reelHeight, 8);
      reelBg.endFill();
      reelsContainer.addChild(reelBg);

      // Create reel container
      const reel = new PIXI.Container();
      reel.x = i * (reelWidth + 10);
      reel.y = 0;
      reelsContainer.addChild(reel);
      reelContainers.push(reel);

      // Add mask to reel
      const mask = new PIXI.Graphics();
      mask.beginFill(0xFFFFFF);
      mask.drawRoundedRect(0, 0, reelWidth, reelHeight, 8);
      mask.endFill();
      reel.addChild(mask);
      reel.mask = mask;

      // Add symbols to reel
      const reelSymbols: PIXI.Sprite[] = [];
      for (let j = 0; j < 3; j++) {
        const symbol = createSymbolSprite(reels[i][j]);
        symbol.x = reelWidth / 2 - symbol.width / 2;
        symbol.y = j * symbolHeight + symbolHeight / 2 - symbol.height / 2;
        reel.addChild(symbol);
        reelSymbols.push(symbol);
      }
      symbols.push(reelSymbols);
    }

    reelContainersRef.current = reelContainers;
    symbolsRef.current = symbols;

    // Create spin button
    const spinButton = new PIXI.Graphics();
    spinButton.beginFill(0x44CCFF);
    spinButton.drawRoundedRect(app.screen.width / 2 - 60, app.screen.height - 60, 120, 40, 20);
    spinButton.endFill();
    spinButton.interactive = true;
    spinButton.cursor = 'pointer';
    spinButton.on('pointerdown', onSpin);
    app.stage.addChild(spinButton);

    // Add spin text
    const spinText = new PIXI.Text('SPIN', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xFFFFFF,
      align: 'center',
      fontWeight: 'bold'
    });
    spinText.x = app.screen.width / 2 - spinText.width / 2;
    spinText.y = app.screen.height - 60 + (40 - spinText.height) / 2;
    app.stage.addChild(spinText);

    // Load sounds
    loadSounds();

    setInitialized(true);

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, [initialized]);

  // Handle spin animation
  useEffect(() => {
    if (!initialized || !appRef.current) return;

    if (isSpinning) {
      startSpinAnimation();
    } else if (spinResults) {
      stopSpinAnimation();
    }
  }, [isSpinning, spinResults, initialized]);

  // Create a starfield background
  const createStarfield = (app: PIXI.Application) => {
    const starfield = new PIXI.Container();
    app.stage.addChild(starfield);

    // Create stars
    for (let i = 0; i < 100; i++) {
      const star = new PIXI.Graphics();
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.5 + 0.5;
      
      star.beginFill(0xFFFFFF, alpha);
      star.drawCircle(0, 0, size);
      star.endFill();
      
      star.x = Math.random() * app.screen.width;
      star.y = Math.random() * app.screen.height;
      
      starfield.addChild(star);
      
      // Animate stars
      gsap.to(star, {
        alpha: Math.random() * 0.5 + 0.1,
        duration: 1 + Math.random() * 3,
        repeat: -1,
        yoyo: true
      });
    }
  };

  // Create a symbol sprite based on the symbol type
  const createSymbolSprite = (symbolType: SlotSymbol): PIXI.Sprite => {
    const config = symbolConfig[symbolType];
    const container = new PIXI.Container();
    
    // Background circle
    const bg = new PIXI.Graphics();
    bg.beginFill(config.color);
    bg.drawCircle(0, 0, 40);
    bg.endFill();
    container.addChild(bg);
    
    // Symbol text
    const text = new PIXI.Text(config.label, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center',
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    container.addChild(text);
    
    // Convert container to sprite
    const texture = appRef.current!.renderer.generateTexture(container);
    const sprite = new PIXI.Sprite(texture);
    
    return sprite;
  };

  // Start the spin animation
  const startSpinAnimation = () => {
    if (!appRef.current) return;
    
    playSound('reelStart');
    
    reelContainersRef.current.forEach((reel, i) => {
      // Add some random delay between reels
      const delay = i * 0.2;
      
      gsap.to(reel, {
        y: 3000, // Move down a lot to create illusion of spinning
        duration: 2 + delay,
        ease: "power1.inOut"
      });
      
      // Simulate multiple symbols passing by with clones
      for (let j = 1; j <= 10; j++) {
        const offsetY = j * 300;
        
        symbolsRef.current[i].forEach((symbol, k) => {
          const clone = symbol.clone();
          clone.y += offsetY;
          reel.addChild(clone);
          
          gsap.to(clone, {
            y: clone.y + 3000,
            duration: 2 + delay,
            ease: "power1.inOut",
            onComplete: () => {
              clone.destroy();
            }
          });
        });
      }
    });
  };

  // Stop the spin animation and show results
  const stopSpinAnimation = () => {
    if (!appRef.current || !spinResults) return;
    
    playSound('reelStop');
    
    // Reset positions
    reelContainersRef.current.forEach((reel, i) => {
      gsap.killTweensOf(reel);
      reel.y = 0;
      
      // Remove all children except the original 3 symbols
      while (reel.children.length > 4) { // 3 symbols + 1 mask
        const lastChild = reel.children[reel.children.length - 1];
        if (lastChild !== reel.mask) {
          reel.removeChild(lastChild);
          lastChild.destroy();
        }
      }
      
      // Update symbols
      symbolsRef.current[i].forEach((symbol, j) => {
        const newSymbol = createSymbolSprite(spinResults.reels[i][j]);
        newSymbol.x = symbol.x;
        newSymbol.y = symbol.y;
        
        // Replace old symbol with new one
        const parent = symbol.parent;
        const index = parent.children.indexOf(symbol);
        parent.addChildAt(newSymbol, index);
        parent.removeChild(symbol);
        symbol.destroy();
        
        symbolsRef.current[i][j] = newSymbol;
        
        // Highlight winning symbols with glow effect if applicable
        if (spinResults.win && spinResults.winningLines.length > 0) {
          const isWinningSymbol = spinResults.winningLines.some((line: number) => 
            (i === 0 && j === line % 3) || 
            (i > 0 && spinResults.reels[i][j] === spinResults.reels[0][line % 3])
          );
          
          if (isWinningSymbol) {
            gsap.to(newSymbol, {
              alpha: 0.7,
              duration: 0.5,
              repeat: 5,
              yoyo: true,
              onComplete: () => {
                gsap.to(newSymbol, { alpha: 1, duration: 0.5 });
              }
            });
            
            // Add glow filter
            const glowFilter = new PIXI.filters.GlowFilter({ 
              distance: 15, 
              outerStrength: 2,
              innerStrength: 1,
              color: 0xFFFF00
            });
            newSymbol.filters = [glowFilter];
            
            setTimeout(() => {
              newSymbol.filters = [];
            }, 5000);
          }
        }
      });
    });
    
    // Show win animation if player won
    if (spinResults.win) {
      playSound('win');
      showWinAnimation(spinResults.winAmount);
    }
    
    // Show bonus animation if triggered
    if (spinResults.bonusTriggered) {
      playSound('bonus');
      showBonusAnimation();
    }
    
    // Show expanding wilds if any
    if (spinResults.expandingWilds.length > 0) {
      playSound('wild');
      showExpandingWildsAnimation(spinResults.expandingWilds);
    }
  };

  // Show win animation
  const showWinAnimation = (amount: number) => {
    if (!appRef.current) return;
    
    // Create win text
    const winText = new PIXI.Text(`WIN!\n${amount.toFixed(2)}`, {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFD700,
      align: 'center',
      fontWeight: 'bold'
    });
    
    winText.anchor.set(0.5);
    winText.x = appRef.current.screen.width / 2;
    winText.y = appRef.current.screen.height / 2;
    winText.alpha = 0;
    
    appRef.current.stage.addChild(winText);
    
    // Animate win text
    gsap.to(winText, {
      alpha: 1,
      scale: 1.5,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        winText.destroy();
      }
    });
    
    // Add particles
    showParticles(appRef.current.screen.width / 2, appRef.current.screen.height / 2, 0xFFD700);
  };

  // Show bonus round animation
  const showBonusAnimation = () => {
    if (!appRef.current) return;
    
    // Create bonus text
    const bonusText = new PIXI.Text('BONUS ROUND!', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFF5533,
      align: 'center',
      fontWeight: 'bold'
    });
    
    bonusText.anchor.set(0.5);
    bonusText.x = appRef.current.screen.width / 2;
    bonusText.y = appRef.current.screen.height / 2;
    bonusText.alpha = 0;
    
    appRef.current.stage.addChild(bonusText);
    
    // Animate bonus text
    gsap.to(bonusText, {
      alpha: 1,
      scale: 1.5,
      duration: 0.7,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        bonusText.destroy();
      }
    });
    
    // Add particles
    showParticles(appRef.current.screen.width / 2, appRef.current.screen.height / 2, 0xFF5533);
  };

  // Show expanding wilds animation
  const showExpandingWildsAnimation = (wildReels: number[]) => {
    if (!appRef.current) return;
    
    wildReels.forEach(reelIndex => {
      const reel = reelContainersRef.current[reelIndex];
      
      // Create wild overlay
      const wildOverlay = new PIXI.Graphics();
      wildOverlay.beginFill(0xBF5DCF, 0.5);
      wildOverlay.drawRoundedRect(0, 0, 120, 280, 8);
      wildOverlay.endFill();
      
      reel.addChild(wildOverlay);
      
      // Add wild text
      const wildText = new PIXI.Text('WILD', {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0xFFFFFF,
        align: 'center',
        fontWeight: 'bold'
      });
      
      wildText.anchor.set(0.5);
      wildText.x = 120 / 2;
      wildText.y = 280 / 2;
      wildText.rotation = -Math.PI / 4;
      
      reel.addChild(wildText);
      
      // Animate
      gsap.from(wildOverlay, {
        alpha: 0,
        height: 0,
        y: 280 / 2,
        duration: 0.5
      });
      
      gsap.from(wildText, {
        alpha: 0,
        scale: 0,
        rotation: Math.PI * 2,
        duration: 0.7
      });
      
      // Remove after a few seconds
      setTimeout(() => {
        gsap.to([wildOverlay, wildText], {
          alpha: 0,
          duration: 0.5,
          onComplete: () => {
            wildOverlay.destroy();
            wildText.destroy();
          }
        });
      }, 4000);
    });
  };

  // Show particles effect
  const showParticles = (x: number, y: number, color: number) => {
    if (!appRef.current) return;
    
    const particlesContainer = new PIXI.Container();
    appRef.current.stage.addChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(color);
      particle.drawCircle(0, 0, Math.random() * 4 + 2);
      particle.endFill();
      
      particle.x = x;
      particle.y = y;
      particlesContainer.addChild(particle);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      
      gsap.to(particle, {
        x: x + Math.cos(angle) * 200 * Math.random(),
        y: y + Math.sin(angle) * 200 * Math.random(),
        alpha: 0,
        duration: Math.random() * 2 + 1,
        ease: "power3.out",
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // Cleanup container after all particles are gone
    setTimeout(() => {
      particlesContainer.destroy();
    }, 3000);
  };

  // Load sounds
  const loadSounds = () => {
    if (!soundEnabled) return;
    
    const sounds = {
      'reelStart': new Audio('/sounds/reel-start.mp3'),
      'reelStop': new Audio('/sounds/reel-stop.mp3'),
      'win': new Audio('/sounds/win.mp3'),
      'bonus': new Audio('/sounds/bonus.mp3'),
      'wild': new Audio('/sounds/wild.mp3')
    };
    
    // Preload sounds
    Object.values(sounds).forEach(sound => {
      sound.load();
    });
    
    soundsRef.current = sounds;
  };

  // Play a sound
  const playSound = (soundName: string) => {
    if (!soundEnabled || !soundsRef.current[soundName]) return;
    
    try {
      soundsRef.current[soundName].currentTime = 0;
      soundsRef.current[soundName].play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return (
    <div 
      ref={gameRef} 
      className="w-full h-[400px] flex items-center justify-center"
    >
      <div className="text-center">
        {!initialized && <p>Loading game...</p>}
      </div>
    </div>
  );
};

export default GalacticSpinsGame;