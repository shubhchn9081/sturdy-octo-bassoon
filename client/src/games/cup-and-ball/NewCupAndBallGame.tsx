import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, VolumeX, Volume2 } from 'lucide-react';

// Types for our game
interface CupAndBallGameProps {
  gamePhase: 'initial' | 'shuffling' | 'selecting' | 'revealing' | 'complete';
  ballPosition: number | null;
  selectedCup: number | null;
  shuffleMoves: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  onCupSelect: (cupIndex: number) => void;
  gameResult: { win: boolean; profit: number } | null;
}

// Ball component that shows in reveal phase
const Ball: React.FC<{ visible: boolean }> = ({ visible }) => (
  <motion.div
    className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg relative"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {/* Ball highlight */}
    <div className="absolute top-2 left-3 w-4 h-2 bg-white opacity-40 rounded-full transform rotate-30"></div>
  </motion.div>
);

/**
 * Enhanced Cup and Ball Game with improved animations and graphics
 */
const NewCupAndBallGame: React.FC<CupAndBallGameProps> = ({
  gamePhase,
  ballPosition,
  selectedCup,
  shuffleMoves,
  difficulty,
  onCupSelect,
  gameResult
}) => {
  // Game state
  const [cupPositions, setCupPositions] = useState<number[]>([0, 1, 2]);
  const [message, setMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Audio elements
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);
  const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
  
  // Animation settings based on difficulty
  const difficultySettings = {
    easy: { shuffleCount: 5, speed: 0.7 },
    medium: { shuffleCount: 8, speed: 1 },
    hard: { shuffleCount: 12, speed: 1.3 }
  };
  
  const { shuffleCount, speed } = difficultySettings[difficulty] || difficultySettings.medium;
  
  // Initialize audio elements
  useEffect(() => {
    const success = new Audio();
    success.src = 'https://assets.codepen.io/21542/success-1.mp3';
    setSuccessSound(success);
    
    const hit = new Audio();
    hit.src = 'https://assets.codepen.io/21542/click.mp3';
    setHitSound(hit);
    
    return () => {
      // Clean up audio elements
      success.pause();
      hit.pause();
    }
  }, []);
  
  // Play sound effects
  const playSound = useCallback((sound: HTMLAudioElement | null) => {
    if (sound && !isMuted) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Error playing sound:', err));
    }
  }, [isMuted]);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Reset cup positions when game starts
  useEffect(() => {
    if (gamePhase === 'initial') {
      // Reset cup positions at the start of a new game
      setCupPositions([0, 1, 2]);
      setMessage('Watch the ball placement...');
    } else if (gamePhase === 'shuffling') {
      setMessage('Cups are shuffling...');
      if (hitSound) playSound(hitSound);
    } else if (gamePhase === 'selecting') {
      setMessage('Select a cup!');
    } else if (gamePhase === 'revealing') {
      setMessage('Revealing...');
    } else if (gamePhase === 'complete' && gameResult) {
      if (gameResult.win) {
        setMessage(`You won ${gameResult.profit.toFixed(2)}!`);
        if (successSound) playSound(successSound);
      } else {
        setMessage('Wrong cup! Try again.');
        if (hitSound) playSound(hitSound);
      }
    }
  }, [gamePhase, gameResult, playSound, hitSound, successSound]);
  
  // Animation sequence for shuffling
  useEffect(() => {
    if (gamePhase === 'shuffling' && shuffleMoves.length > 0) {
      let currentPositions = [...cupPositions];
      let delay = 0;
      
      // Animate each shuffle move
      shuffleMoves.forEach((moveType, index) => {
        setTimeout(() => {
          // Apply the swap to the current positions array
          let newPositions = [...currentPositions];
          if (moveType === 0) { // Swap cups 0-1
            [newPositions[0], newPositions[1]] = [newPositions[1], newPositions[0]];
          } else if (moveType === 1) { // Swap cups 1-2
            [newPositions[1], newPositions[2]] = [newPositions[2], newPositions[1]];
          } else { // Swap cups 0-2
            [newPositions[0], newPositions[2]] = [newPositions[2], newPositions[0]];
          }
          currentPositions = newPositions;
          setCupPositions([...newPositions]);
          
          // Play sound for each shuffle
          playSound(hitSound);
        }, delay);
        
        // Increase delay for next animation
        delay += (500 / speed);
      });
    }
  }, [gamePhase, shuffleMoves, speed, cupPositions, playSound, hitSound]);
  
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
      showBall = ballPosition !== null && position === ballPosition;
    } else if (gamePhase === 'revealing' || gamePhase === 'complete') {
      // After shuffling, the ball is under the cup with the matching index
      showBall = ballPosition !== null && cupIndex === ballPosition;
    }
    
    const canSelect = gamePhase === 'selecting';
    
    return (
      <div className="flex flex-col items-center justify-end">
        <motion.div
          key={`cup-${position}`}
          className={`relative cursor-pointer ${canSelect ? 'hover:scale-105' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          initial={{ y: 0 }}
          animate={{ 
            // Lift the cup containing the ball when revealing
            y: (gamePhase === 'revealing' || gamePhase === 'complete') && ballPosition === cupIndex ? -80 : 0,
            scale: isSelected ? 1.05 : 1
          }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 120,
            damping: 10
          }}
          onClick={() => {
            if (canSelect) {
              onCupSelect(cupIndex);
            }
          }}
          whileHover={canSelect ? { scale: 1.05 } : {}}
          whileTap={canSelect ? { scale: 0.98 } : {}}
        >
          {/* Cup */}
          <div className="w-20 h-32 md:w-24 md:h-36 relative">
            <div className="absolute bottom-0 w-full h-28 md:h-32 bg-gradient-to-b from-orange-500 to-orange-700 rounded-b-2xl rounded-t-xl transform-gpu"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-orange-400 rounded-t-xl before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-gradient-to-tr before:from-orange-300/30 before:to-transparent before:rounded-t-xl"></div>
            
            {/* Cup handle */}
            <div className="absolute right-0 top-12 w-6 h-16 bg-orange-600 rounded-r-full"></div>
            
            {/* Cup shine effect */}
            <div className="absolute top-8 left-4 w-4 h-12 bg-white opacity-10 rounded-full transform rotate-15"></div>
            
            {/* Cup number indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              {position + 1}
            </div>
          </div>
        </motion.div>
        
        {/* Ball shown under cup */}
        {showBall && <Ball visible={true} />}
      </div>
    );
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full min-h-[500px] px-4">
      {/* Game stage text */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg font-bold text-center mb-8 z-10 bg-slate-800/80 px-4 py-2 rounded-full">
        {gamePhase === 'complete' && gameResult ? (
          <div className={`flex items-center ${gameResult.win ? 'text-green-500' : 'text-red-500'}`}>
            {gameResult.win ? (
              <>
                <CheckCircle className="mr-2" />
                {message}
              </>
            ) : (
              <>
                <XCircle className="mr-2" />
                {message}
              </>
            )}
          </div>
        ) : (
          message
        )}
      </div>
      
      {/* Mute button */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      
      {/* Game surface */}
      <div className="relative w-full bg-gradient-to-b from-[#1a2e44] to-[#0d1b29] rounded-xl p-4 md:p-10 shadow-2xl flex-1 flex items-center justify-center overflow-hidden">
        {/* Wood-inspired backdrop with refined texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuXyEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuXyEpIi8+PC9zdmc+')]"></div>
        
        {/* Sleek reflection atop the table surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent h-24 pointer-events-none"></div>
        
        {/* Cups and ball containers */}
        <div className="flex space-x-4 md:space-x-16 justify-center items-end z-10">
          {/* Render the three cups */}
          {renderCup(0)}
          {renderCup(1)}
          {renderCup(2)}
        </div>
      </div>
      
      {/* Game instructions */}
      <div className="mt-6 text-center text-slate-300 max-w-lg">
        <h3 className="font-bold text-lg mb-2">How to Play</h3>
        <p className="text-sm md:text-base">Watch where the ball is placed, follow the cups as they shuffle, then select the cup you think contains the ball.</p>
        <p className="mt-2 text-sm md:text-base">
          <span className="font-bold">Difficulty:</span> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} 
          {difficulty === 'easy' ? ' - 5 shuffles (1.5x payout)' : 
           difficulty === 'medium' ? ' - 8 shuffles (2x payout)' : 
           ' - 12 shuffles (3x payout)'}
        </p>
      </div>
    </div>
  );
};

export default NewCupAndBallGame;