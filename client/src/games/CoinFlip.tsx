import React, { useEffect, useRef, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
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
  
  // Auto-animate refs
  const [betHistoryRef] = useAutoAnimate();
  
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
    
    // Create visual effects while flipping
    if (coinRef.current && coinRef.current.parentElement) {
      // 1. Add a dramatic backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'absolute inset-0 bg-blue-500/10 rounded-full animate-pulse z-0';
      backdrop.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.5)';
      coinRef.current.parentElement.appendChild(backdrop);
      
      // 2. Add flipping animation with glow effect
      coinRef.current.classList.add('flipping');
      coinRef.current.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.7)';
      
      // 3. Add dynamic particles effect
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 4;
        const color = Math.random() > 0.5 ? '#FFD700' : '#FFA500';
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 60;
        
        particle.className = 'absolute rounded-full z-20';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `calc(50% - ${size/2}px)`;
        particle.style.top = `calc(50% - ${size/2}px)`;
        particle.style.opacity = '0';
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        particle.style.animation = `particle-fly ${0.8 + Math.random() * 1.2}s ease-out forwards ${Math.random() * 0.5}s`;
        particle.style.animationFillMode = 'forwards';
        
        // Setting keyframes dynamically
        const keyframes = `
          @keyframes particle-fly {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1); opacity: 0; }
          }
        `;
        
        // Append the keyframes to the document
        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
        
        coinRef.current.parentElement.appendChild(particle);
        
        // Clean up particles
        setTimeout(() => {
          if (coinRef.current && coinRef.current.parentElement && coinRef.current.parentElement.contains(particle)) {
            coinRef.current.parentElement.removeChild(particle);
          }
          document.head.removeChild(style);
        }, 2500);
      }
      
      // Set the final state after some flips (the animation should show the correct side at the end)
      setTimeout(() => {
        if (coinRef.current) {
          // Remove animation classes
          coinRef.current.classList.remove('flipping');
          coinRef.current.style.boxShadow = '';
          coinRef.current.setAttribute('data-result', flipResult);
          
          // Remove backdrop
          if (backdrop.parentElement && backdrop.parentElement.contains(backdrop)) {
            backdrop.parentElement.removeChild(backdrop);
          }
          
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
      }, 2000); // Duration of flipping animation
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
        
        {/* Bet history with auto-animate */}
        {betHistory.length > 0 && (
          <div className="border-t border-[#243442] mt-6 pt-4 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Bet History</h3>
            <div ref={betHistoryRef} className="space-y-2 max-h-60 overflow-y-auto">
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
            {/* Result display - more exciting animation */}
            {result !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none" style={{ perspective: '1000px' }}>
                <div 
                  className={`
                    result-popup p-6 rounded-xl text-center
                    transform -translate-y-40 rotate-y-animation
                    shadow-2xl border-2
                    ${hasWon 
                      ? 'bg-green-500/90 border-yellow-300 win-bounce' 
                      : 'bg-red-500/90 border-red-700 lose-shake'}
                  `}
                >
                  <div className="text-white font-bold text-4xl">
                    {hasWon ? '🎉 WINNER! 🎉' : '💥 BUSTED! 💥'}
                  </div>
                  <div className="text-white/90 font-medium mt-2">
                    {hasWon 
                      ? `+${(parseFloat(betAmount) * multiplier).toFixed(8)} BTC` 
                      : `Better luck next time!`}
                  </div>
                </div>
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
                        <Coins className="w-12 h-12 text-yellow-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tails side */}
              <div className="side tails">
                <div className="coin-content bg-gradient-to-br from-yellow-400 to-yellow-700">
                  <div className="symbol">
                    <div className="circle-border">
                      <div className="center-circle flex flex-col items-center justify-center">
                        <ChevronUp className="w-8 h-8 text-yellow-800" />
                        <ChevronDown className="w-8 h-8 text-yellow-800 -mt-2" />
                      </div>
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