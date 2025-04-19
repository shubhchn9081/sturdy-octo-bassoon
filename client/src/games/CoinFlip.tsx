import React, { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

// Choice type
type CoinSide = 'heads' | 'tails';

// Sound effects
const playSound = (type: 'flip' | 'win' | 'lose' | 'click') => {
  const sounds = {
    flip: new Audio('/sounds/coin-flip.mp3'),
    win: new Audio('/sounds/win.mp3'),
    lose: new Audio('/sounds/lose.mp3'),
    click: new Audio('/sounds/click.mp3')
  };
  
  try {
    sounds[type].volume = 0.3;
    sounds[type].play().catch(e => console.log('Audio play error:', e));
  } catch (err) {
    console.log('Sound error:', err);
  }
};

const CoinFlipGame: React.FC = () => {
  // Game state
  const [betAmount, setBetAmount] = useState<string>('0.00010000');
  const [balance, setBalance] = useState<number>(1.00000000);
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'Manual' | 'Auto'>('Manual');
  const [multiplier, setMultiplier] = useState<number>(1.98); // Default multiplier
  const [betHistory, setBetHistory] = useState<Array<{
    time: string;
    amount: number;
    choice: CoinSide;
    result: CoinSide;
    payout: number;
    isWin: boolean;
  }>>([]);
  
  // References
  const coinRef = useRef<HTMLDivElement>(null);
  const [onlinePlayers] = useState<number>(Math.floor(Math.random() * 800) + 300);
  
  // Handle coin flip animation
  const flipCoin = () => {
    if (isFlipping) return;
    
    // Validate bet amount
    const betValue = parseFloat(betAmount);
    if (isNaN(betValue) || betValue <= 0 || betValue > balance) {
      alert('Please enter a valid bet amount');
      return;
    }
    
    // Deduct bet amount from balance
    setBalance(prev => parseFloat((prev - betValue).toFixed(8)));
    
    // Play flip sound
    playSound('flip');
    
    // Start flipping animation
    setIsFlipping(true);
    setResult(null);
    setHasWon(null);
    
    // Random result
    const flipResult: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // Apply flipping animation with enhanced visual effects
    if (coinRef.current) {
      // Create visual effects for the flip
      const container = coinRef.current.parentElement;
      if (container) {
        // Add dramatic light effect
        const lightEffect = document.createElement('div');
        lightEffect.className = 'absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse z-10';
        container.appendChild(lightEffect);
        
        // Add particles around the coin
        for (let i = 0; i < 20; i++) {
          const particle = document.createElement('div');
          particle.className = 'absolute bg-yellow-300 rounded-full z-0 opacity-0';
          
          // Random size, position, and animation duration
          const size = 2 + Math.random() * 6;
          const angle = Math.random() * Math.PI * 2;
          const distance = 60 + Math.random() * 80;
          const duration = 0.5 + Math.random() * 1.5;
          
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${container.offsetWidth / 2}px`;
          particle.style.top = `${container.offsetHeight / 2}px`;
          particle.style.animation = `particle ${duration}s ease-out forwards`;
          particle.style.transform = `translate(-50%, -50%) rotate(${angle}rad) translateX(${distance}px)`;
          
          container.appendChild(particle);
          
          // Clean up particles after animation
          setTimeout(() => {
            if (container.contains(particle)) {
              container.removeChild(particle);
            }
          }, duration * 1000 + 100);
        }
        
        // Clean up light effect after animation
        setTimeout(() => {
          if (container.contains(lightEffect)) {
            container.removeChild(lightEffect);
          }
        }, 3000);
      }
      
      // Start the actual flip animation
      coinRef.current.classList.add('flipping');
      
      // Set the final state after some flips
      setTimeout(() => {
        if (coinRef.current) {
          // Set the resulting side for the animation
          coinRef.current.classList.remove('flipping');
          coinRef.current.setAttribute('data-result', flipResult);
          
          // Update game state
          setResult(flipResult);
          const userWins = flipResult === selectedSide;
          setHasWon(userWins);
          
          // Play appropriate sound
          if (userWins) {
            playSound('win');
            // Add winnings to balance
            const winAmount = betValue * multiplier;
            setBalance(prev => parseFloat((prev + winAmount).toFixed(8)));
            
            // Add win celebration effects
            if (container) {
              // Add confetti for wins
              for (let i = 0; i < 40; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'absolute rounded-sm z-20';
                
                // Random properties
                const size = 4 + Math.random() * 8;
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 150;
                const duration = 1 + Math.random() * 2;
                const color = ['bg-green-400', 'bg-yellow-300', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'][Math.floor(Math.random() * 5)];
                
                confetti.className += ` ${color}`;
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.left = `${container.offsetWidth / 2}px`;
                confetti.style.top = `${container.offsetHeight / 2}px`;
                confetti.style.animation = `confetti ${duration}s ease-out forwards`;
                confetti.style.transform = `translate(-50%, -50%) rotate(${angle}rad) translateY(${distance}px)`;
                
                container.appendChild(confetti);
                
                // Clean up
                setTimeout(() => {
                  if (container.contains(confetti)) {
                    container.removeChild(confetti);
                  }
                }, duration * 1000 + 100);
              }
            }
          } else {
            playSound('lose');
          }
          
          // Add to bet history
          setBetHistory(prev => [
            {
              time: new Date().toLocaleTimeString(),
              amount: betValue,
              choice: selectedSide,
              result: flipResult,
              payout: userWins ? betValue * multiplier : 0,
              isWin: userWins
            },
            ...prev.slice(0, 9)
          ]);
          
          // Reset flip state
          setIsFlipping(false);
        }
      }, 2500); // Slightly longer duration for more dramatic effect
    }
  };
  
  const handleSelectedSide = (value: string) => {
    setSelectedSide(value as CoinSide);
    playSound('click');
  };
  
  const handleBet = () => {
    if (isFlipping) {
      alert('Coin is currently flipping!');
      return;
    }
    
    playSound('click');
    flipCoin();
  };
  
  const handleHalfBet = () => {
    playSound('click');
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount / 2).toFixed(8));
    }
  };
  
  const handleDoubleBet = () => {
    playSound('click');
    const currentAmount = parseFloat(betAmount);
    if (!isNaN(currentAmount)) {
      setBetAmount((currentAmount * 2).toFixed(8));
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0f1a24] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-[#172B3A] p-0 z-10 border-r border-[#243442]">
        {/* Tab switch */}
        <div className="flex bg-[#172B3A] mb-4">
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'Manual' ? 'bg-[#172B3A] text-white border-b-2 border-[#1375e1]' : 'bg-[#11212d] text-gray-400'}`}
            onClick={() => setActiveTab('Manual')}
          >
            Manual
          </button>
          <button 
            className={`flex-1 py-3 px-4 ${activeTab === 'Auto' ? 'bg-[#172B3A] text-white border-b-2 border-[#1375e1]' : 'bg-[#11212d] text-gray-400'}`}
            onClick={() => setActiveTab('Auto')}
          >
            Auto
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Balance */}
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Balance</span>
            <span className="text-white font-medium">{balance.toFixed(8)} BTC</span>
          </div>
          
          {/* Bet amount */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Bet Amount</span>
              <span className="text-sm text-gray-400">${(parseFloat(betAmount) * 44000).toFixed(2)}</span>
            </div>
            <div className="flex">
              <input 
                type="text" 
                value={betAmount} 
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 bg-[#0e1822] py-2 px-3 text-white rounded-l border-0 focus:outline-none focus:ring-1 focus:ring-[#1375e1]" 
              />
              <div className="bg-[#0e1822] flex items-center px-2 rounded-r">
                <span className="text-amber-500">₿</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => setBetAmount('0.00010000')}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                Min
              </button>
              <button 
                onClick={handleHalfBet}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                ½
              </button>
              <button 
                onClick={handleDoubleBet}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                2×
              </button>
              <button 
                onClick={() => setBetAmount((balance).toFixed(8))}
                className="bg-[#0e1822] py-1 px-2 rounded text-white hover:bg-[#1a2c3d] text-xs"
              >
                Max
              </button>
            </div>
          </div>
          
          {/* Select coin side */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Select Side</span>
            <Select value={selectedSide} onValueChange={handleSelectedSide}>
              <SelectTrigger className="w-full bg-[#0e1822] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0e1822] border-[#2a3642] text-white">
                <SelectItem value="heads">Heads</SelectItem>
                <SelectItem value="tails">Tails</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Payout multiplier info */}
          <div className="bg-[#0e1822] p-3 rounded space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Multiplier</span>
              <span className="text-white font-medium">{multiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Payout on win</span>
              <span className="text-white font-medium">
                {(parseFloat(betAmount) * multiplier).toFixed(8)} BTC
              </span>
            </div>
          </div>
          
          {/* Bet button */}
          <button 
            onClick={handleBet}
            disabled={isFlipping}
            className={`w-full py-3 rounded font-semibold transition-colors mt-6
              ${isFlipping 
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                : 'bg-[#4cd964] text-black hover:bg-[#40c557]'}`}
          >
            {isFlipping ? 'Flipping...' : 'Flip Coin'}
          </button>
        </div>
        
        {/* Bet history */}
        {betHistory.length > 0 && (
          <div className="border-t border-[#243442] mt-6 pt-4 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Bet History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {betHistory.map((bet, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-[#243442] last:border-0">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${bet.isWin ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{bet.time}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className={bet.isWin ? 'text-green-500' : 'text-red-500'}>
                      {bet.isWin ? '+' : '-'}{bet.isWin ? bet.payout.toFixed(8) : bet.amount.toFixed(8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Game board */}
      <div className="flex-1 flex flex-col p-5 bg-[#0f1a24]">
        {/* Stats bar */}
        <div className="flex justify-between items-center mb-4 px-4 py-2 bg-[#172B3A] rounded-lg">
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Coin Flip</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">{onlinePlayers} Online</span>
          </div>
        </div>
        
        {/* Game container */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Selected side display */}
          <div className="mb-6">
            <Badge className="px-4 py-2 text-base font-medium bg-[#1375e1] hover:bg-[#1375e1]">
              You selected: {selectedSide.toUpperCase()}
            </Badge>
          </div>
          
          {/* Coin container */}
          <div className="relative w-64 h-64">
            {/* Result display */}
            {result !== null && (
              <div className={`absolute -top-16 left-0 right-0 z-10 text-center text-3xl font-bold ${hasWon ? 'text-green-400' : 'text-red-500'}`}>
                {hasWon ? 'YOU WIN!' : 'YOU LOSE!'}
              </div>
            )}
            
            {/* Coin */}
            <div 
              ref={coinRef} 
              className="coin" 
              data-result={result || 'heads'}
            >
              {/* Heads side */}
              <div className="side heads">
                <div className="coin-content bg-gradient-to-br from-yellow-300 to-yellow-600">
                  <div className="symbol">
                    <div className="circle-border">
                      <div className="center-circle flex items-center justify-center">
                        <div className="text-6xl font-bold text-yellow-800">
                          H
                        </div>
                      </div>
                    </div>
                    <div className="coin-decorations">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="coin-dot"
                          style={{
                            transform: `rotate(${i * 45}deg) translateX(70px)`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tails side */}
              <div className="side tails">
                <div className="coin-content bg-gradient-to-br from-yellow-400 to-yellow-700">
                  <div className="symbol">
                    <div className="circle-border">
                      <div className="center-circle flex items-center justify-center">
                        <div className="text-6xl font-bold text-yellow-800">
                          T
                        </div>
                      </div>
                    </div>
                    <div className="coin-decorations">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="coin-star"
                          style={{
                            transform: `rotate(${i * 45}deg) translateX(70px)`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Edge */}
              <div className="edge"></div>
            </div>
          </div>
          
          {/* Result text */}
          {result && (
            <div className="mt-8 text-xl font-medium">
              Result: <span className="font-bold">{result.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS is added in a separate style element in public/index.html */}
    </div>
  );
};

export default CoinFlipGame;