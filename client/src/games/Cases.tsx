import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import LoadingBar from '../components/games/LoadingBar';
import ScreenTimeCounter from '../components/games/ScreenTimeCounter';

// Case colors
const CASE_COLORS = [
  'bg-green-500',  // Green
  'bg-blue-400',   // Blue light
  'bg-blue-600',   // Blue dark
  'bg-purple-500', // Purple
  'bg-gray-400',   // Gray light
  'bg-gray-600',   // Gray dark
  'bg-cyan-400',   // Cyan
];

// Possible multipliers for the cases
const MULTIPLIERS = ['0.20x', '0.30x', '0.40x', '1.50x', '3.00x', '5.00x'];

const CasesGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState<number>(0);
  const [inputBetAmount, setInputBetAmount] = useState<string>('0.00000000');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [cases, setCases] = useState<Array<{color: string, multiplier: string | null, isSelected: boolean, isOpened: boolean}>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [revealedMultiplier, setRevealedMultiplier] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(true);

  // Reference for animation
  const triangleRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // References for slot animations
  const slotContainerRef = useRef<HTMLDivElement>(null);
  const [isSlotSpinning, setIsSlotSpinning] = useState(false);
  
  // Initialize random cases
  useEffect(() => {
    initializeCases();
  }, []);

  const initializeCases = () => {
    const numberOfCases = 8; // We'll display 8 cases in a row
    const shuffledColors = [...CASE_COLORS].sort(() => Math.random() - 0.5);
    
    // Create cases with random colors
    let newCases = Array(numberOfCases).fill(null).map((_, index) => ({
      color: shuffledColors[index % shuffledColors.length],
      multiplier: null,
      isSelected: false,
      isOpened: false
    }));

    setCases(newCases);
    setGameStarted(false);
    setGameEnded(false);
    setSelectedCase(null);
    setRevealedMultiplier(null);
  };
  
  // Function to animate slot-like spinning with true infinite loop until stop
  const animateSlotMachine = () => {
    if (!slotContainerRef.current || isSlotSpinning) return;
    
    setIsSlotSpinning(true);
    
    // Access the slot container
    const slotContainer = slotContainerRef.current;
    
    // Clear any previous animations
    gsap.killTweensOf(slotContainer);
    
    // Reset position
    gsap.set(slotContainer, { x: 0 });
    
    // Calculate the total width - we only need to move half of it since we have duplicated items
    const totalWidth = slotContainer.scrollWidth / 2;
    
    // Initial quick spin - accelerate
    gsap.to(slotContainer, {
      x: `-=${totalWidth * 0.2}`, // Start with a quick movement
      duration: 0.3,
      ease: "power2.in",
      onComplete: startInfiniteLoop
    });
    
    // Function to handle the true infinite loop
    function startInfiniteLoop() {
      // Main infinite loop animation - will continue until manually stopped
      const infiniteLoop = gsap.to(slotContainer, {
        x: `-=${totalWidth}`, // Move one full cycle
        duration: 0.8, // Duration controls the speed - faster for more exciting effect
        ease: "none", // Linear movement for smooth continuous scrolling
        repeat: -1, // -1 means infinite loop
        modifiers: {
          // This creates the infinite loop effect
          x: gsap.utils.unitize(x => {
            return parseFloat(x) % totalWidth; // Keep looping back
          })
        }
      });
      
      // Wait for some spins and then stop gradually
      setTimeout(() => {
        // Get current position to ensure smooth transition
        const currentX = gsap.getProperty(slotContainer, "x");
        
        // Kill the infinite animation
        gsap.killTweensOf(slotContainer);
        
        // Calculate a random stopping point - makes it more unpredictable
        const caseWidth = totalWidth / 8; // 8 cases total
        const randomStopPoint = Math.floor(Math.random() * 8) * caseWidth;
        
        // First slow down gradually
        gsap.to(slotContainer, {
          x: `-=${totalWidth * 1.5}`, // Continue moving but slower
          duration: 1.2,
          ease: "power1.inOut",
          onComplete: () => {
            // Now make the final stop at exact case position
            gsap.to(slotContainer, {
              x: -randomStopPoint, // Stop at a specific case position
              duration: 0.8,
              ease: "power3.out", // Ease out for natural slowdown
              onComplete: () => {
                setIsSlotSpinning(false);
              }
            });
          }
        });
      }, 3000); // Run for 3 seconds before starting to slow down
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

  const startGame = () => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    // Assign random multipliers to cases
    const shuffledMultipliers = [...MULTIPLIERS].sort(() => Math.random() - 0.5);
    
    const newCases = cases.map((caseItem, index) => ({
      ...caseItem,
      multiplier: shuffledMultipliers[index % shuffledMultipliers.length],
    }));
    
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
          <div id="game-area" className="relative mb-8 overflow-hidden">
            {/* Created a wrapper for the slot animation with overflow hidden */}
            <div className="w-full overflow-hidden">
              {/* Slot container with double width for continuous scroll effect */}
              <div ref={slotContainerRef} className="flex w-[200%] transition-transform">
                {/* First set of cases (visible initially) */}
                <div className="grid grid-cols-8 gap-2 w-1/2">
                  {cases.map((caseItem, index) => (
                    <div
                      id={`case-${index}`}
                      key={`first-${index}`}
                      className={cn(
                        "relative aspect-square rounded-md cursor-pointer transition-all flex flex-col overflow-hidden", 
                        caseItem.color,
                        caseItem.isSelected && "ring-2 ring-cyan-500",
                        !gameStarted && "opacity-70"
                      )}
                      onClick={() => selectCase(index)}
                    >
                      {/* Case lid that slides down when opened */}
                      <div 
                        className={cn(
                          "absolute inset-x-0 top-0 h-1/3 bg-black/20 transition-transform duration-300",
                          caseItem.isOpened ? "translate-y-full" : ""
                        )}
                      />
                      
                      {/* Case contents/multiplier */}
                      {caseItem.isOpened && caseItem.multiplier && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/40 rounded-full px-4 py-2">
                            <span className="text-white font-bold text-lg">{caseItem.multiplier}</span>
                          </div>
                        </div>
                      )}

                      {/* Briefcase icon when closed */}
                      {!caseItem.isOpened && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="14" x="3" y="6" rx="2" />
                            <path d="M14 6v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Second set of cases (duplicated for infinite scrolling) */}
                <div className="grid grid-cols-8 gap-2 w-1/2">
                  {cases.map((caseItem, index) => (
                    <div
                      key={`second-${index}`}
                      className={cn(
                        "relative aspect-square rounded-md cursor-pointer transition-all flex flex-col overflow-hidden", 
                        caseItem.color,
                        caseItem.isSelected && "ring-2 ring-cyan-500",
                        !gameStarted && "opacity-70"
                      )}
                      onClick={() => selectCase(index)}
                    >
                      {/* Case lid that slides down when opened */}
                      <div 
                        className={cn(
                          "absolute inset-x-0 top-0 h-1/3 bg-black/20 transition-transform duration-300",
                          caseItem.isOpened ? "translate-y-full" : ""
                        )}
                      />
                      
                      {/* Case contents/multiplier */}
                      {caseItem.isOpened && caseItem.multiplier && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/40 rounded-full px-4 py-2">
                            <span className="text-white font-bold text-lg">{caseItem.multiplier}</span>
                          </div>
                        </div>
                      )}

                      {/* Briefcase icon when closed */}
                      {!caseItem.isOpened && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="14" x="3" y="6" rx="2" />
                            <path d="M14 6v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Triangle pointer - enhanced visibility */}
            <div 
              ref={triangleRef}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform transition-transform" 
            >
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-cyan-500"></div>
                <div className="w-1 h-30 bg-cyan-500 rounded-full opacity-70"></div>
              </div>
            </div>
          </div>

          {/* Color selector */}
          <div className="flex justify-center gap-2 mb-6">
            {CASE_COLORS.map((color, index) => (
              <button
                key={index}
                className={`w-6 h-6 rounded-full ${color}`}
              />
            ))}
          </div>

          {/* Game action buttons */}
          <div className="flex justify-center">
            {!gameStarted ? (
              <button
                className="bg-green-500 text-white px-12 py-3 rounded-md font-medium text-lg"
                onClick={startGame}
              >
                Bet
              </button>
            ) : (
              gameEnded && (
                <button
                  className="bg-blue-500 text-white px-12 py-3 rounded-md font-medium text-lg"
                  onClick={resetGame}
                >
                  New Game
                </button>
              )
            )}
          </div>

          {/* Results display */}
          {revealedMultiplier && (
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold">
                {parseFloat(revealedMultiplier) > 1 ? (
                  <span className="text-green-500">You won {revealedMultiplier}!</span>
                ) : (
                  <span className="text-red-500">You lost with {revealedMultiplier}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Game information/fairness */}
      <div className="mt-auto p-4 flex justify-between items-center border-t border-gray-800">
        <button className="text-sm text-gray-400">
          <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Stats
        </button>
        
        <span className="text-sm text-gray-400">
          Stake
        </span>
        
        <button className="text-sm text-gray-400">
          Fairness
        </button>
      </div>
    </div>
  );
};

export default CasesGame;