import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import LoadingBar from '@/components/games/LoadingBar';
import ScreenTimeCounter from '@/components/games/ScreenTimeCounter';
import { useBalance } from '@/hooks/use-balance';
import { useToast } from '@/hooks/use-toast';

interface Case {
  id: number;
  color: string;
  multiplier: string | null;
  isSelected: boolean;
  isOpened: boolean;
}

const CASE_COLORS = [
  'bg-gradient-to-b from-green-500 to-green-700',
  'bg-gradient-to-b from-blue-500 to-blue-700',
  'bg-gradient-to-b from-purple-500 to-purple-700',
  'bg-gradient-to-b from-yellow-500 to-yellow-700',
  'bg-gradient-to-b from-pink-500 to-pink-700',
  'bg-gradient-to-b from-cyan-500 to-cyan-700',
  'bg-gradient-to-b from-red-500 to-red-700',
  'bg-gradient-to-b from-orange-500 to-orange-700',
];

// Multiplier pools for different difficulty levels with their probability weights
const multiplierPools = {
  Easy: [
    { multiplier: '0.1x', weight: 20 },
    { multiplier: '0.2x', weight: 20 },
    { multiplier: '0.5x', weight: 20 },
    { multiplier: '1x', weight: 15 },
    { multiplier: '1.5x', weight: 10 },
    { multiplier: '2x', weight: 5 },
    { multiplier: '5x', weight: 4 },
    { multiplier: '10x', weight: 3 },
    { multiplier: '15x', weight: 2 },
    { multiplier: '23x', weight: 1 }
  ],
  Medium: [
    { multiplier: '0x', weight: 30 },
    { multiplier: '0.2x', weight: 15 },
    { multiplier: '0.5x', weight: 15 },
    { multiplier: '1x', weight: 10 },
    { multiplier: '3x', weight: 10 },
    { multiplier: '5x', weight: 6 },
    { multiplier: '10x', weight: 5 },
    { multiplier: '25x', weight: 5 },
    { multiplier: '50x', weight: 3 },
    { multiplier: '115x', weight: 1 }
  ],
  Hard: [
    { multiplier: '0x', weight: 50 },
    { multiplier: '0.5x', weight: 15 },
    { multiplier: '2x', weight: 10 },
    { multiplier: '5x', weight: 8 },
    { multiplier: '10x', weight: 6 },
    { multiplier: '50x', weight: 5 },
    { multiplier: '100x', weight: 4 },
    { multiplier: '500x', weight: 1 },
    { multiplier: '1000x', weight: 1 }
  ]
};

const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [revealedMultiplier, setRevealedMultiplier] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [inputBetAmount, setInputBetAmount] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isManualMode, setIsManualMode] = useState(true);
  const [isSlotSpinning, setIsSlotSpinning] = useState(false);
  
  const slotContainerRef = useRef<HTMLDivElement>(null);
  const triangleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    initializeCases();
  }, []);
  
  const initializeCases = () => {
    const initialCases = CASE_COLORS.map((color, index) => ({
      id: index,
      color,
      multiplier: null,
      isSelected: false,
      isOpened: false,
    }));
    
    setCases(initialCases);
    setGameStarted(false);
    setGameEnded(false);
    setSelectedCase(null);
    setRevealedMultiplier(null);
  };
  
  // Function to animate slot-like spinning with true circular infinite loop
  const animateSlotMachine = () => {
    if (!slotContainerRef.current || isSlotSpinning) return;
    
    setIsSlotSpinning(true);
    
    // Access the slot container
    const slotContainer = slotContainerRef.current;
    
    // Clear any previous animations
    gsap.killTweensOf(slotContainer);
    
    // Calculate the width of a single case (including margins)
    const caseWidth = 90; // 80px width + 5px margin on each side
    
    // Calculate the width of a full set of 8 cases
    const singleSetWidth = caseWidth * 8;
    
    // Position at the start of our strip
    gsap.set(slotContainer, { x: 0 });
    
    // Create a circular animation that will be perfectly smooth
    // This is key for the smoothest infinite animation
    
    // First acceleration phase
    gsap.to(slotContainer, {
      x: `-=${caseWidth * 3}`, // Move a few cases to start
      duration: 0.3,
      ease: "power2.in",
      onComplete: startInfiniteLoop
    });
    
    function startInfiniteLoop() {
      // Create the main infinite loop animation
      const infiniteAnimation = gsap.to(slotContainer, {
        x: `-=${singleSetWidth}`, // Move exactly one full set distance
        duration: 0.8, // Speed of the loop - lower = faster
        ease: "none", // Linear movement is essential for smooth loop
        repeat: -1, // Infinite repeats
        onRepeat: resetPosition // This is the key to the perfect loop
      });
      
      // This function is called after each loop iteration
      function resetPosition() {
        // Get current x position
        const x = gsap.getProperty(slotContainer, "x") as number;
        
        // When we've moved one full set width, reset back seamlessly
        // This creates the perfect illusion of infinite movement
        if (x <= -singleSetWidth) {
          // Calculate the exact overflow amount
          const overflow = x % singleSetWidth;
          // Reset position with the overflow amount to make it perfectly seamless
          gsap.set(slotContainer, { x: overflow });
        }
      }
      
      // Stop the animation after a few seconds
      setTimeout(() => {
        // Kill the infinite animation
        infiniteAnimation.kill();
        
        // Get current position
        const currentX = gsap.getProperty(slotContainer, "x") as number;
        
        // Slow down gradually
        gsap.to(slotContainer, {
          x: `-=${singleSetWidth / 2}`, // Continue moving but slow down
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: finalStop
        });
        
        // Make the final stop on a specific case
        function finalStop() {
          // Calculate final stopping position to align with a case
          const finalPosition = Math.round(gsap.getProperty(slotContainer, "x") as number / caseWidth) * caseWidth;
          
          // Make the final stopping animation with slight bounce
          gsap.to(slotContainer, {
            x: finalPosition,
            duration: 0.5,
            ease: "back.out(1.2)",
            onComplete: () => {
              setIsSlotSpinning(false);
            }
          });
        }
      }, 3000); // Run for 3 seconds
    }
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (/^\d*\.?\d*$/.test(value)) {
      setInputBetAmount(value);
      setBetAmount(parseFloat(value) || 0);
    }
  };

  const handleHalfBet = () => {
    const newAmount = (betAmount / 2).toFixed(8);
    setInputBetAmount(newAmount);
    setBetAmount(parseFloat(newAmount));
  };

  const handleDoubleBet = () => {
    const newAmount = (betAmount * 2).toFixed(8);
    setInputBetAmount(newAmount);
    setBetAmount(parseFloat(newAmount));
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  };

  // Function to get a random multiplier based on difficulty and weights
  const getRandomMultiplier = (difficulty: string): string => {
    // Get the multiplier pool for the selected difficulty
    const pool = multiplierPools[difficulty as keyof typeof multiplierPools];
    
    // Calculate the total weight for all multipliers in this difficulty
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    
    // Generate a random number within the total weight range
    const randomWeight = Math.random() * totalWeight;
    
    // Find the multiplier that corresponds to the random weight
    let currentWeight = 0;
    
    for (const item of pool) {
      currentWeight += item.weight;
      
      if (randomWeight <= currentWeight) {
        return item.multiplier;
      }
    }
    
    // Fallback - should never reach here if weights are properly configured
    return pool[0].multiplier;
  };

  const startGame = () => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    // Assign random multipliers to cases based on difficulty
    const newCases = cases.map((caseItem) => {
      // Get a random multiplier using our weighted function
      const multiplier = getRandomMultiplier(difficulty);
      
      return {
        ...caseItem,
        multiplier,
      };
    });
    
    setCases(newCases);
    
    // Run the slot machine animation when game starts
    animateSlotMachine();
    
    // Set game as started after animation completes
    setTimeout(() => {
      setGameStarted(true);
    }, 5000); // Wait for animation to complete - longer to account for the infinite spinning
  };

  const selectCase = (index: number) => {
    if (!gameStarted || gameEnded || cases[index].isOpened) {
      return;
    }

    // Update selected case
    setSelectedCase(index);

    // Show the multiplier with animation
    const updatedCases = cases.map((c, i) => ({
      ...c,
      isSelected: i === index,
      isOpened: i === index
    }));

    setCases(updatedCases);
    setRevealedMultiplier(cases[index].multiplier);
    
    // Animate case opening with GSAP for a slot-machine like effect
    const caseElement = document.getElementById(`case-${index}`);
    if (caseElement) {
      // First shake the case side to side
      gsap.to(caseElement, {
        x: 5,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "elastic.out(1, 0.3)",
        onComplete: () => {
          // Then do a quick zoom in and out
          gsap.to(caseElement, {
            scale: 1.2,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(caseElement, {
                scale: 1,
                duration: 0.2,
                ease: "bounce.out"
              });
            }
          });
        }
      });
    
      // Create a multiplier popup animation that floats up
      const multiplierValue = cases[index].multiplier;
      if (multiplierValue) {
        // Create a dynamic multiplier element
        const multiplierPopup = document.createElement('div');
        multiplierPopup.textContent = `${multiplierValue}`;
        multiplierPopup.className = 
          `absolute text-2xl font-bold z-10 ${
            parseFloat(multiplierValue) > 1 ? 'text-green-500' : 'text-red-500'
          }`;
        multiplierPopup.style.top = '50%';
        multiplierPopup.style.left = '50%';
        multiplierPopup.style.transform = 'translate(-50%, -50%)';
        multiplierPopup.style.pointerEvents = 'none';
        
        // Create a background pill for the multiplier
        const multiplierContainer = document.createElement('div');
        multiplierContainer.className = 'bg-black/40 rounded-full px-4 py-2';
        multiplierContainer.style.position = 'absolute';
        multiplierContainer.style.top = '50%';
        multiplierContainer.style.left = '50%';
        multiplierContainer.style.transform = 'translate(-50%, -50%)';
        multiplierContainer.style.pointerEvents = 'none';
        multiplierContainer.appendChild(multiplierPopup);
        
        // Append the element to the case
        caseElement.style.position = 'relative';
        caseElement.appendChild(multiplierContainer);
        
        // Animate the multiplier floating up and fading out
        gsap.to(multiplierContainer, {
          y: -25,
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
          delay: 1.5, // Wait a bit before fading out
          onComplete: () => {
            multiplierContainer.remove();
          }
        });
      }
    }
    
    // Animate triangle to point to the selected case
    if (triangleRef.current) {
      // Position the triangle at the bottom center of the selected case
      const caseElement = document.getElementById(`case-${index}`);
      if (caseElement) {
        const caseRect = caseElement.getBoundingClientRect();
        const gameAreaRect = document.getElementById('game-area')?.getBoundingClientRect();

        if (gameAreaRect) {
          const relativeLeft = caseRect.left - gameAreaRect.left + (caseRect.width / 2);
          gsap.to(triangleRef.current, {
            x: relativeLeft,
            duration: 0.5,
            ease: "power2.out"
          });
        }
      }
    }

    // End the game
    setGameEnded(true);
  };

  const resetGame = () => {
    initializeCases();
    
    // Reset triangle position
    if (triangleRef.current) {
      gsap.set(triangleRef.current, { x: 0 });
    }
  };

  const toggleMode = (mode: 'manual' | 'auto') => {
    setIsManualMode(mode === 'manual');
  };

  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingBar, setShowLoadingBar] = useState(true);
  
  // Complete loading
  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowLoadingBar(false);
  };

  return (
    <div className="h-full w-full bg-[#0F1923] text-white flex flex-col">
      {/* Loading bar at the top */}
      {showLoadingBar && (
        <LoadingBar 
          duration={3} 
          onComplete={handleLoadingComplete} 
          color="#22c55e" 
        />
      )}
      
      {/* Screen time counter */}
      <div className="absolute top-2 right-4 z-10">
        <ScreenTimeCounter 
          className="text-sm text-gray-400" 
          prefix="Time on page:" 
        />
      </div>
      
      <div className="w-full p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Game controls panel */}
          <div className="w-full bg-[#1A2C38] rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Manual/Auto toggle */}
              <div className="flex rounded-full bg-[#0F1923] overflow-hidden">
                <button 
                  className={cn(
                    "px-6 py-2 text-sm font-medium", 
                    isManualMode ? "bg-[#1A2C38] text-white" : "text-gray-400"
                  )}
                  onClick={() => toggleMode('manual')}
                >
                  Manual
                </button>
                <button 
                  className={cn(
                    "px-6 py-2 text-sm font-medium", 
                    !isManualMode ? "bg-[#1A2C38] text-white" : "text-gray-400"
                  )}
                  onClick={() => toggleMode('auto')}
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Bet amount controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bet Amount</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={inputBetAmount}
                    onChange={handleBetAmountChange}
                    className="w-full bg-[#0F1923] border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <span className="ml-2 text-yellow-500">$0.00</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={handleHalfBet} 
                    className="px-3 py-1 bg-[#0F1923] text-white text-sm rounded"
                  >
                    ½
                  </button>
                  <button 
                    onClick={handleDoubleBet}
                    className="px-3 py-1 bg-[#0F1923] text-white text-sm rounded"
                  >
                    2×
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  className="w-full bg-[#0F1923] border border-gray-700 rounded px-3 py-2 text-white appearance-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick bet options */}
          <div className="flex justify-center gap-2 mb-6">
            {['0.40x', '0.30x', '0.20x'].map((mult) => (
              <button
                key={mult}
                className="rounded-full bg-cyan-500 px-4 py-1 text-sm font-medium"
              >
                {mult}
              </button>
            ))}
          </div>

          {/* Game area */}
          <div id="game-area" className="relative mb-8">
            {/* Improved visible window for cases - only show a few at a time */}
            <div className="w-full mx-auto overflow-hidden bg-[#0F1923] rounded-md border border-gray-800">
              {/* This creates a visible "window" that shows only 5 cases horizontally */}
              <div className="w-full relative h-[110px] overflow-hidden">
                {/* The slot container now holds many more cases for smoother infinite loop */}
                <div ref={slotContainerRef} className="absolute flex transition-none">
                  {/* Generate a long strip of cases for the infinite loop */}
                  {[...Array(24)].map((_, outerIndex) => (
                    cases.map((caseItem, index) => {
                      const uniqueId = outerIndex * cases.length + index;
                      return (
                        <div
                          id={index < 8 ? `case-${index}` : undefined}
                          key={`case-${uniqueId}`}
                          className={cn(
                            "relative w-[80px] h-[80px] mx-[5px] my-[15px] rounded-md cursor-pointer transition-all flex-shrink-0", 
                            caseItem.color,
                            uniqueId % cases.length === selectedCase && "ring-2 ring-cyan-500",
                            !gameStarted && "opacity-70"
                          )}
                          onClick={() => selectCase(uniqueId % cases.length)}
                        >
                          {/* Case lid that slides down when opened */}
                          <div 
                            className={cn(
                              "absolute inset-x-0 top-0 h-1/3 bg-black/20 transition-transform duration-300",
                              uniqueId % cases.length === selectedCase && caseItem.isOpened ? "translate-y-full" : ""
                            )}
                          />
                          
                          {/* Case contents/multiplier */}
                          {uniqueId % cases.length === selectedCase && caseItem.isOpened && caseItem.multiplier && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/40 rounded-full px-4 py-2">
                                <span className="text-white font-bold text-lg">{caseItem.multiplier}</span>
                              </div>
                            </div>
                          )}

                          {/* Briefcase icon when closed */}
                          {!(uniqueId % cases.length === selectedCase && caseItem.isOpened) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="14" x="3" y="6" rx="2" />
                                <path d="M14 6v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            </div>
            
            {/* Triangle pointer centered below the visible window */}
            <div 
              ref={triangleRef} 
              className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 transition-transform"
            >
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-cyan-500" />
            </div>
          </div>
          
          {/* Game controls: Bet and Reset Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            {!gameStarted ? (
              <button 
                onClick={startGame} 
                disabled={betAmount <= 0 || isSlotSpinning}
                className={cn(
                  "px-8 py-3 rounded-md text-white font-medium text-lg",
                  betAmount > 0 && !isSlotSpinning ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 cursor-not-allowed"
                )}
              >
                {isSlotSpinning ? "Spinning..." : "Bet"}
              </button>
            ) : (
              <button 
                onClick={resetGame} 
                className="px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
              >
                New Game
              </button>
            )}
          </div>
          
          {/* Game result with improved visual presentation */}
          {gameEnded && revealedMultiplier && (
            <div className="flex flex-col items-center mb-8 p-4 bg-[#1A2C38] rounded-lg border border-gray-800">
              <h2 className="text-2xl font-bold mb-2">Case Opened!</h2>
              
              {/* Multiplier display */}
              <div className={cn(
                "text-4xl font-bold mb-2",
                parseFloat(revealedMultiplier) > 1 ? "text-green-500" : "text-red-500"
              )}>
                {revealedMultiplier}
              </div>
              
              {/* Win amount */}
              <div className="flex items-center gap-2">
                <span className="text-gray-300">You {parseFloat(revealedMultiplier) > 0 ? "Win" : "Lose"}:</span>
                <span className={cn(
                  "text-2xl font-bold",
                  parseFloat(revealedMultiplier) > 1 ? "text-green-500" : "text-red-500"
                )}>
                  ${(parseFloat(revealedMultiplier) * betAmount).toFixed(2)}
                </span>
              </div>
              
              {/* Show confetti animation for big wins */}
              {parseFloat(revealedMultiplier) >= 5 && (
                <div className="mt-4 text-yellow-400 animate-pulse">
                  🎉 BIG WIN! 🎉
                </div>
              )}
            </div>
          )}
          
          {/* Game stats - dynamically updated based on difficulty */}
          <div className="bg-[#1A2C38] rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Game Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Win Chance</div>
                <div className="text-xl font-medium">
                  {difficulty === "Easy" ? "80%" : 
                   difficulty === "Medium" ? "70%" : "50%"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Max Win</div>
                <div className="text-xl font-medium text-green-500">
                  {difficulty === "Easy" ? "23x" : 
                   difficulty === "Medium" ? "115x" : "1000x"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">House Edge</div>
                <div className="text-xl font-medium text-cyan-400">
                  {difficulty === "Easy" ? "2%" : 
                   difficulty === "Medium" ? "4%" : "6%"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cases;
