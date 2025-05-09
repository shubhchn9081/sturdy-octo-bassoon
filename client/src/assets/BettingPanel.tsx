import { useState, useEffect } from "react";
import { useCrashGame } from "../../lib/stores/useCrashGame.tsx";
import { useWallet } from "../../lib/stores/useWallet.tsx";
import { cn } from "../../lib/utils";

// Add proper type for the store
type CrashGameStore = {
  gameState: string;
  placeBet: () => void;
  cashOut: () => void;
  betAmount: number;
  autoCashoutValue: number | null;
  setBetAmount: (amount: number) => void;
  setAutoCashoutValue: (value: number) => void;
  isWaiting: boolean;
  errorMessage: string | null;
  clearError: () => void;
  cashoutTriggered: number | null;
  currentMultiplier: number;
};

export const BettingPanel = () => {
  // Type-cast the store to help TypeScript understand the shape
  const crashGame = useCrashGame() as unknown as CrashGameStore;
  
  const {
    gameState,
    placeBet,
    cashOut,
    betAmount,
    autoCashoutValue,
    setBetAmount,
    setAutoCashoutValue,
    isWaiting,
    errorMessage,
    clearError,
    cashoutTriggered,
    currentMultiplier,
  } = crashGame;

  const [isAutoBetEnabled, setIsAutoBetEnabled] = useState(false);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(!!autoCashoutValue);
  const [betAmountPresets] = useState([100, 200, 500, 1000]);
  const [activeBetPanel, setActiveBetPanel] = useState(0); // 0 for single bet, 1 for double bet
  const [buttonAnimating, setButtonAnimating] = useState(false); // For place bet button animation

  // When autoCashoutValue changes, update the toggle
  useEffect(() => {
    setAutoCashoutEnabled(!!autoCashoutValue);
  }, [autoCashoutValue]);

  useEffect(() => {
    if (gameState === "inactive" && isAutoBetEnabled && !isWaiting && !cashoutTriggered) {
      // Auto bet for next round
      setTimeout(() => {
        placeBet();
      }, 1000);
    }
  }, [gameState, isAutoBetEnabled, isWaiting, cashoutTriggered, placeBet]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);

  // Toggle auto cashout and set/clear value
  const handleAutoCashoutToggle = () => {
    if (autoCashoutEnabled) {
      setAutoCashoutValue(0); // Clear the value
      setAutoCashoutEnabled(false);
    } else {
      setAutoCashoutValue(2.0); // Set a default value
      setAutoCashoutEnabled(true);
    }
  };

  // Increment/decrement bet amount with minimum of 100rs
  const adjustBetAmount = (amount: number) => {
    const newAmount = Math.max(100, betAmount + amount);
    setBetAmount(newAmount);
  };
  
  // Get wallet data
  const wallet = useWallet().wallet;

  // Handle place bet with animation
  const handlePlaceBet = () => {
    // Clear any existing error first
    clearError();
    
    // Validation 1: Check minimum bet amount
    if (betAmount < 100) {
      // Create a new error with the minimum bet requirement
      // Clear any existing error first
      clearError();
      
      // Set the error message with slight delay for UX
      setTimeout(() => {
        // Create a new error message
        // We use our existing imported methods directly
        // No need to call setState or getState as we have them destructured
        clearError();
        // Setting the error message directly with our own local variable
        const errorMsg = "Minimum bet amount is ₹100. Please increase your bet.";
        
        // Using a DOM-based approach to show the error instead of relying on state
        const errorDiv = document.querySelector('.error-message') as HTMLElement;
        if (errorDiv) {
          errorDiv.textContent = errorMsg;
          errorDiv.style.display = 'block';
          
          // Hide after 3 seconds
          setTimeout(() => {
            errorDiv.style.display = 'none';
          }, 3000);
        }
        
        // Shake the input field animation
        const inputField = document.querySelector('input[type="number"]');
        if (inputField) {
          inputField.classList.add('shake-animation');
          setTimeout(() => {
            inputField.classList.remove('shake-animation');
          }, 500);
        }
      }, 50);
      
      return;
    }
    
    // Validation 2: Check wallet balance
    if (wallet) {
      const currentBalance = parseFloat(wallet.balance);
      if (currentBalance < betAmount) {
        setTimeout(() => {
          // Clear any existing error
          clearError();
          
          // Show error message for insufficient balance using DOM approach
          const errorMsg = `Insufficient balance. You only have ₹${currentBalance.toFixed(2)}.`;
          const errorDiv = document.querySelector('.error-message') as HTMLElement;
          if (errorDiv) {
            errorDiv.textContent = errorMsg;
            errorDiv.style.display = 'block';
            
            // Hide after 3 seconds
            setTimeout(() => {
              errorDiv.style.display = 'none';
            }, 3000);
          }
          
          // Shake the input field animation
          const inputField = document.querySelector('input[type="number"]');
          if (inputField) {
            inputField.classList.add('shake-animation');
            setTimeout(() => {
              inputField.classList.remove('shake-animation');
            }, 500);
          }
        }, 50);
        
        return;
      }
    }
    
    // Trigger button animation
    setButtonAnimating(true);
    setTimeout(() => {
      setButtonAnimating(false);
      placeBet();
    }, 300);
  };

  // Get motivational message based on multiplier
  const getMotivationalMessage = () => {
    if (gameState !== "active" || cashoutTriggered) return null;
    
    if (currentMultiplier < 1.5) {
      return "Just starting... Hold on!";
    } else if (currentMultiplier < 3) {
      return "Looking good! 💰";
    } else if (currentMultiplier < 5) {
      return "Amazing profit! 🔥";
    } else if (currentMultiplier < 10) {
      return "You're crushing it! 🚀";
    } else if (currentMultiplier < 20) {
      return "INCREDIBLE! 💎";
    } else {
      return "LEGENDARY WIN! 👑";
    }
  };

  // Get appropriate button style and text based on game state
  const getActionButton = () => {
    if (gameState === "active") {
      // Calculate potential payout
      const potentialPayout = betAmount * currentMultiplier;
      const profit = potentialPayout - betAmount;
      
      // Cashout button with increasing amount
      return (
        <div className="relative">
          <button
            onClick={cashOut}
            disabled={cashoutTriggered !== null}
            className={cn(
              "w-full rounded-2xl font-bold py-4 transition-all duration-300 relative overflow-hidden",
              cashoutTriggered !== null 
                ? "bg-gray-700 text-gray-300" 
                : "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white shadow-lg shadow-green-500/30"
            )}
            style={{
              transform: cashoutTriggered !== null ? "scale(1)" : `scale(${1 + Math.min(currentMultiplier / 50, 0.08)})`,
            }}
          >
            {/* Background pulse animation based on multiplier */}
            {cashoutTriggered === null && (
              <div 
                className="absolute inset-0 animate-pulse" 
                style={{ 
                  background: `radial-gradient(circle, rgba(0,255,0,0.1) 0%, rgba(0,0,0,0) 70%)`,
                  animationDuration: `${Math.max(0.8 - (currentMultiplier / 20), 0.3)}s`
                }}
              />
            )}
            
            <div className="flex flex-col items-center">
              <span className="text-lg">
                {cashoutTriggered !== null ? "CASHED OUT" : "CASH OUT"}
              </span>
              <span className="text-xl font-mono font-bold">
                ${potentialPayout.toFixed(2)}
              </span>
              {cashoutTriggered === null && profit > 0 && (
                <span className="text-sm">
                  +${profit.toFixed(2)}
                </span>
              )}
            </div>
          </button>
          
          {/* Motivational message */}
          {getMotivationalMessage() && (
            <div className="absolute -top-8 left-0 right-0 text-center">
              <div className="inline-block px-3 py-1 bg-gray-800/80 text-white text-sm rounded-full animate-bounce">
                {getMotivationalMessage()}
              </div>
            </div>
          )}
        </div>
      );
    } else if (gameState === "countdown" || isWaiting) {
      // Cancel button during countdown - more rounded with gradient
      return (
        <button
          onClick={() => {/* Cancel functionality would go here */}}
          className="w-full rounded-2xl font-bold py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-red-500/30"
        >
          CANCEL
        </button>
      );
    } else {
      // Place bet button - more rounded with gradient and animation
      return (
        <button
          onClick={handlePlaceBet}
          disabled={betAmount < 100}
          className={cn(
            "w-full rounded-2xl font-bold py-4 relative overflow-hidden transition-all",
            buttonAnimating ? "duration-300 transform scale-95" : "duration-500",
            betAmount < 100 
              ? "bg-gray-700 text-gray-300" 
              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/30"
          )}
        >
          {/* Animated particles effect */}
          {betAmount >= 100 && !buttonAnimating && (
            <>
              <span className="absolute top-0 left-1/4 w-1 h-1 rounded-full bg-white opacity-70 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.2s" }}></span>
              <span className="absolute top-0 left-2/4 w-1 h-1 rounded-full bg-white opacity-70 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }}></span>
              <span className="absolute top-0 left-3/4 w-1 h-1 rounded-full bg-white opacity-70 animate-ping" style={{ animationDuration: "1.8s", animationDelay: "0.8s" }}></span>
            </>
          )}
          
          {/* Button text with minimum bet notice */}
          <div className="relative z-10">
            {betAmount < 100 ? (
              <div className="flex flex-col items-center">
                <span>PLACE BET</span>
                <span className="text-xs opacity-70">Min. bet: ₹100</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-md">PLACE BET</span>
                <span className="text-xs opacity-90">₹{betAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          {/* Background shimmer effect */}
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -translate-x-full ${
              betAmount >= 100 && !buttonAnimating ? "animate-shimmer" : ""
            }`}
          ></div>
        </button>
      );
    }
  };

  // Render game status text
  const renderGameStatus = () => {
    if (gameState === "countdown") {
      return (
        <div className="text-center text-white uppercase font-bold text-lg">
          NEXT ROUND
        </div>
      );
    } else if (gameState === "active") {
      return (
        <div className="text-center text-white uppercase font-bold text-lg animate-pulse">
          IN PROGRESS
        </div>
      );
    } else if (gameState === "crashed") {
      return (
        <div className="text-center text-red-400 uppercase font-bold text-lg">
          EXPLODED @ {currentMultiplier.toFixed(2)}x
        </div>
      );
    }
    return null;
  };

  // Calculate potential/current winnings  
  const getWinningsAmount = () => {
    if (gameState === "active" && cashoutTriggered === null) {
      return (betAmount * currentMultiplier).toFixed(2);
    } else if (cashoutTriggered !== null) {
      return (betAmount * cashoutTriggered).toFixed(2);
    } else if (autoCashoutValue && betAmount) {
      return (betAmount * autoCashoutValue).toFixed(2);
    } else {
      return (betAmount * 2).toFixed(2); // Default 2x multiplier
    }
  };

  return (
    <div>
      {/* Error message container - Always present but only visible when needed */}
      <div className="error-message fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-red-600/90 text-white px-4 py-2 rounded-lg shadow-lg text-center hidden"></div>
      
      {/* Render game state at the top on mobile only */}
      <div className="md:hidden mb-3">
        {renderGameStatus()}
      </div>
    
      {/* Main betting panels, showing 1 or 2 depending on selection */}
      <div className="space-y-3">
        {/* Active betting panel */}
        <div className="aviator-card p-4">
          {/* First row: input with +/- buttons */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-md text-white font-bold transition-colors"
                onClick={() => adjustBetAmount(-50)}
                disabled={gameState === "active" || betAmount <= 100}
                title="Decrease bet (min: 100)"
              >
                -
              </button>
              
              <div className="relative flex-1">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setBetAmount(value);
                  }}
                  onBlur={() => {
                    // When input loses focus, enforce minimum bet
                    if (betAmount < 100) {
                      setBetAmount(100);
                    }
                  }}
                  min="100"
                  step="10"
                  disabled={gameState === "active"}
                  className={`aviator-input w-full py-2 text-center font-mono ${betAmount < 100 ? "text-red-400" : "text-white"}`}
                  placeholder="Min 100"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 overflow-hidden rounded-b-lg">
                  <div 
                    className="h-full bg-aviator-blue transition-all duration-300"
                    style={{ width: `${Math.min(100, (betAmount / 10))}%` }}
                  ></div>
                </div>
              </div>
              
              <button 
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-md text-white font-bold transition-colors"
                onClick={() => adjustBetAmount(50)}
                disabled={gameState === "active"}
                title="Increase bet"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Second row: quick amount buttons */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {betAmountPresets.map(preset => (
              <button
                key={`preset-${preset}`}
                onClick={() => setBetAmount(preset)}
                disabled={gameState === "active"}
                className="py-1.5 px-2 text-xs bg-gray-800/80 rounded-lg border border-gray-700/50 text-gray-300 hover:bg-gray-700 hover:border-gray-600/50 hover:text-white transition-all duration-200"
              >
                ₹{preset}
              </button>
            ))}
          </div>
          
          {/* Third row: Auto options */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative inline-block">
                <input
                  id="auto-cashout"
                  type="checkbox"
                  checked={autoCashoutEnabled}
                  onChange={handleAutoCashoutToggle}
                  disabled={gameState === "active"}
                  className="sr-only"
                />
                <label
                  htmlFor="auto-cashout"
                  className={`relative inline-block w-8 h-4 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                    autoCashoutEnabled ? 'bg-aviator-blue' : 'bg-gray-700'
                  }`}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      autoCashoutEnabled ? 'transform translate-x-4' : ''
                    }`}
                  />
                </label>
              </div>
              <span className="text-xs text-gray-300">Auto-cashout</span>
            </div>
            
            {autoCashoutEnabled && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={autoCashoutValue || ""}
                  onChange={(e) => setAutoCashoutValue(parseFloat(e.target.value) || 0)}
                  min="1.1"
                  step="0.1"
                  disabled={gameState === "active"}
                  className="aviator-input w-20 py-1 text-center text-xs"
                  placeholder="2.00"
                />
                <span className="text-gray-300 text-xs">x</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="relative inline-block">
                <input
                  id="auto-bet"
                  type="checkbox"
                  checked={isAutoBetEnabled}
                  onChange={() => setIsAutoBetEnabled(!isAutoBetEnabled)}
                  disabled={gameState === "active"}
                  className="sr-only"
                />
                <label
                  htmlFor="auto-bet"
                  className={`relative inline-block w-8 h-4 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                    isAutoBetEnabled ? 'bg-aviator-blue' : 'bg-gray-700'
                  }`}
                >
                  <span 
                    className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      isAutoBetEnabled ? 'transform translate-x-4' : ''
                    }`}
                  />
                </label>
              </div>
              <span className="text-xs text-gray-300">Auto-bet</span>
            </div>
          </div>
          
          {/* Action Button */}
          {getActionButton()}
        </div>
          
        {/* Second betting panel (optional) */}
        {activeBetPanel === 1 && (
          <div className="aviator-card p-4">
            {/* Second panel UI (simplified) */}
            <div className="flex items-center gap-2 mb-3">
              <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-white font-bold">-</button>
              <input 
                type="number" 
                className="aviator-input w-full py-2 text-center font-mono" 
                value="150"
                disabled
              />
              <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md text-white font-bold">+</button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {betAmountPresets.map(preset => (
                <button
                  key={`preset2-${preset}`}
                  className="py-1 px-2 text-xs bg-gray-800 rounded-md text-gray-300"
                >
                  +{preset}
                </button>
              ))}
            </div>
            
            <button className="w-full aviator-btn font-bold py-3">PLACE BET</button>
          </div>
        )}
      </div>
      
      {/* Bottom tab navigation for single/double bet */}
      <div className="flex rounded-xl overflow-hidden mt-3 aviator-card-dark">
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeBetPanel === 0 ? 'bg-aviator-card text-white' : 'bg-transparent text-gray-400'}`}
          onClick={() => setActiveBetPanel(0)}
        >
          All
        </button>
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeBetPanel === 1 ? 'bg-aviator-card text-white' : 'bg-transparent text-gray-400'}`}
          onClick={() => setActiveBetPanel(1)}
        >
          My Bets
        </button>
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium transition-colors text-gray-400 bg-transparent`}
        >
          Top
        </button>
      </div>
      
      {/* Sound Testing Controls (Development Only) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-2 border border-dashed border-purple-500 rounded-md bg-purple-950/30">
          <h4 className="text-xs text-purple-300 mb-2">🔊 Sound Test Panel</h4>
          <div className="flex space-x-2">
            <button
              className="py-1 px-2 text-xs bg-green-800 text-white rounded hover:bg-green-700 transition-colors"
              onClick={() => {
                if ((window as any).audioPlayers && (window as any).audioPlayers['success-sound']) {
                  console.log('Testing success sound via window.audioPlayers');
                  (window as any).audioPlayers['success-sound'].play();
                } else {
                  console.error('Success sound player not found!', (window as any).audioPlayers);
                }
              }}
            >
              Test Success
            </button>
            
            <button
              className="py-1 px-2 text-xs bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
              onClick={() => {
                if ((window as any).audioPlayers && (window as any).audioPlayers['explosion-sound']) {
                  console.log('Testing explosion sound via window.audioPlayers');
                  (window as any).audioPlayers['explosion-sound'].play();
                } else {
                  console.error('Explosion sound player not found!', (window as any).audioPlayers);
                }
              }}
            >
              Test Explosion
            </button>
            
            <button
              className="py-1 px-2 text-xs bg-yellow-800 text-white rounded hover:bg-yellow-700 transition-colors"
              onClick={() => {
                if ((window as any).audioPlayers && (window as any).audioPlayers['countdown-sound']) {
                  console.log('Testing countdown sound via window.audioPlayers');
                  (window as any).audioPlayers['countdown-sound'].play();
                } else {
                  console.error('Countdown sound player not found!', (window as any).audioPlayers);
                }
              }}
            >
              Test Countdown
            </button>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-900/50 border border-red-500 text-sm text-red-200 rounded-lg animate-pulse-once">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
