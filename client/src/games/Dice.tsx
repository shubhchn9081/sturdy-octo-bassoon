import React, { useState, useEffect } from 'react';
import { useBalance } from '@/hooks/use-balance';
import { useProvablyFair } from '@/hooks/use-provably-fair';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { useGameBet } from '@/hooks/use-game-bet';

// Simple formatCrypto implementation to avoid dependency
const formatCryptoAmount = (amount: number): string => {
  return amount.toFixed(8);
};

const DiceGame = () => {
  // Use hooks for game functionality
  const { getGameResult } = useProvablyFair('dice');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get wallet data - Use only WalletContext for balance
  const { balance: walletBalance, symbol, formattedBalance, refreshBalance } = useWallet();
  
  // Use the game bet hooks for consistent betting across all games
  const { placeBet: placeGameBet, completeBet: completeGameBet } = useGameBet(5); // 5 is Dice game ID
  
  // Local state for bet amount
  const [betAmount, setBetAmount] = useState(0.00000000);
  
  // Game state
  const [target, setTarget] = useState(50.00);
  const [multiplier, setMultiplier] = useState(2.0000);
  const [winChance, setWinChance] = useState(50.0000);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [rollMode, setRollMode] = useState<'over' | 'under'>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [profit, setProfit] = useState(0);
  const [currentBetId, setCurrentBetId] = useState<number | null>(null);
  
  // Update multiplier and win chance when target changes
  useEffect(() => {
    const newMultiplier = parseFloat((100 / (rollMode === 'over' ? (100 - target) : target)).toFixed(4));
    setMultiplier(newMultiplier);
    setWinChance(rollMode === 'over' ? (100 - target) : target);
  }, [target, rollMode]);
  
  // Update profit calculation when betAmount or multiplier changes
  useEffect(() => {
    const profitValue = betAmount * (multiplier - 1);
    setProfit(profitValue);
  }, [betAmount, multiplier]);
  
  const handleTargetChange = (value: number) => {
    setTarget(value);
  };
  
  const handleHalfBet = () => {
    setBetAmount(betAmount / 2);
  };
  
  const handleDoubleBet = () => {
    setBetAmount(betAmount * 2);
  };
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(parseFloat(value) || 0);
  };
  
  const handleRollModeChange = () => {
    setRollMode(rollMode === 'over' ? 'under' : 'over');
  };
  
  const handleBet = async () => {
    if (rolling || betAmount <= 0) return;
    
    try {
      // Set UI state
      setRolling(true);
      setResult(null);
      setWon(null);
      
      // Use the unified game bet hook to place the bet
      const response = await placeGameBet({
        amount: betAmount,
        options: {
          target,
          rollMode
        },
        autoCashout: null
      });

      if (!response || !response.betId) {
        throw new Error("Invalid response from server");
      }

      setCurrentBetId(response.betId);
      console.log("Bet placed successfully with ID:", response.betId);
      
      // Generate dice result using provably fair mechanism
      const diceResult = getGameResult() as number;
      const formattedResult = parseFloat((diceResult * 100).toFixed(2));
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update UI with result
      setResult(formattedResult);
      
      // Determine win/loss based on game rules
      const isWin = rollMode === 'over' 
        ? formattedResult > target 
        : formattedResult < target;
        
      setWon(isWin);
      
      // Calculate payout amounts
      const winAmount = isWin ? betAmount * multiplier : 0;
      const profitAmount = isWin ? betAmount * (multiplier - 1) : -betAmount;
      
      console.log("Game result:", {
        result: formattedResult,
        target,
        rollMode,
        win: isWin,
        multiplier: isWin ? multiplier : 0,
        payout: winAmount
      });
      
      // Complete the bet and update wallet
      await completeGameBet(response.betId, {
        result: formattedResult,
        target,
        rollMode,
        win: isWin,
        multiplier: isWin ? multiplier : 0,
        payout: winAmount
      });
      
      console.log("Bet completed: " + (isWin ? "Win" : "Loss") + ", Multiplier: " + 
        (isWin ? multiplier : 0) + "x, Payout: " + winAmount);
      
      // Refresh the balance to update UI
      refreshBalance();
      
    } catch (error) {
      console.error('Error rolling dice:', error);
      toast({
        title: "Error placing bet",
        description: "An error occurred while placing your bet",
        variant: "destructive"
      });
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-[#0F212E] min-h-screen">
      <div className="flex flex-col lg:flex-row flex-1 p-4 space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Game interface - appears first on mobile */}
        <div className="flex-1 flex flex-col gap-4 order-first">
          <div className="bg-[#172B3A] rounded-lg flex-1 flex flex-col p-5">
            <div className="flex-1 flex flex-col">
            
              {/* Betting History Table */}
              <div className="mb-6 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#7F8990] text-xs">
                      <th className="text-left pb-2 font-normal">PLAYER</th>
                      <th className="text-left pb-2 font-normal">BET</th>
                      <th className="text-left pb-2 font-normal">MULTIPLIER</th>
                      <th className="text-left pb-2 font-normal">PAYOUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-white border-t border-[#243442]">
                      <td className="py-2 flex items-center">
                        <div className="w-6 h-6 bg-[#243442] rounded-full mr-2"></div>
                        <span className="text-[#57FBA2]">Player123</span>
                      </td>
                      <td className="py-2">₹123.45</td>
                      <td className="py-2">2.00×</td>
                      <td className="py-2 text-[#57FBA2]">₹246.90</td>
                    </tr>
                    <tr className="text-white border-t border-[#243442]">
                      <td className="py-2 flex items-center">
                        <div className="w-6 h-6 bg-[#243442] rounded-full mr-2"></div>
                        <span>Player456</span>
                      </td>
                      <td className="py-2">₹54.32</td>
                      <td className="py-2">1.98×</td>
                      <td className="py-2 text-[#FF5359]">₹0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Slider scale numbers */}
              <div className="flex justify-between text-white text-sm font-bold mb-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              
              {/* Slider */}
              <div className="relative h-7 mb-16">
                {/* Track Background (Grey border) */}
                <div className="absolute inset-0 rounded-[28px] bg-[#2A3740] p-[4px] shadow-[inset_0_0_3px_rgba(0,0,0,0.3)]">
                  {/* Inside track */}
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#101820]">
                    {/* Red section */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-[#FF5359]"
                      style={{ width: `${target}%` }}
                    ></div>
                    
                    {/* Green section */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#00E700]"
                      style={{ width: `${100 - target}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Slider thumb */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                  style={{ left: `${target}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-8 h-8 bg-[#3D94F4] flex flex-col items-center justify-center gap-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.4)] rounded-[2px]">
                    <div className="w-4 h-[1px] bg-[#2D6EB8]"></div>
                    <div className="w-4 h-[1px] bg-[#2D6EB8]"></div>
                    <div className="w-4 h-[1px] bg-[#2D6EB8]"></div>
                  </div>
                </div>
                
                {/* Hidden interactive slider */}
                <input 
                  type="range"
                  min={1}
                  max={99}
                  step={0.01}
                  value={target}
                  onChange={(e) => handleTargetChange(parseFloat(e.target.value))}
                  className="absolute inset-0 z-20 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              
              {/* Result display */}
              {result !== null && (
                <div className={`text-center my-4 text-2xl font-bold ${won ? 'text-[#00E700]' : 'text-[#FF5359]'}`}>
                  {result.toFixed(2)} - {won ? 'WIN!' : 'LOSE'}
                </div>
              )}
              
              {/* Spacer */}
              <div className="flex-grow"></div>
              
              {/* Stats Panel */}
              <div className="bg-[#121A20] rounded-lg p-4 mt-auto">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[#7F8990] mb-3 text-sm">Multiplier</div>
                    <div className="bg-[#0F212E] flex items-center justify-between rounded p-3 h-12">
                      <span className="text-white font-medium">{multiplier.toFixed(4)}</span>
                      <span className="text-[#7F8990] ml-0.5 text-xl">×</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[#7F8990] mb-3 text-sm">Roll Over</div>
                    <div 
                      className="bg-[#0F212E] flex items-center justify-between rounded p-3 h-12 cursor-pointer"
                      onClick={handleRollModeChange}
                    >
                      <span className="text-white font-medium">{target.toFixed(2)}</span>
                      <button className="text-[#7F8990] hover:text-white">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 2v6h-6"></path>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                          <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                          <path d="M21 22v-6h-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[#7F8990] mb-3 text-sm">Win Chance</div>
                    <div className="bg-[#0F212E] flex items-center justify-between rounded p-3 h-12">
                      <span className="text-white font-medium">{winChance.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bet controls - appears second (below) on mobile */}
        <div className="w-full lg:w-[210px] lg:shrink-0 order-last">
          <div className="bg-[#172B3A] rounded-lg overflow-hidden">
            <div className="p-4">
              {/* Manual/Auto toggle */}
              <div className="bg-[#0F212E] rounded-full p-1 flex mb-4">
                <button 
                  className={`flex-1 py-2 rounded-full text-sm font-medium ${mode === 'manual' ? 'bg-[#172B3A] text-white' : 'text-[#7F8990]'}`}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button 
                  className={`flex-1 py-2 rounded-full text-sm font-medium ${mode === 'auto' ? 'bg-[#172B3A] text-white' : 'text-[#7F8990]'}`}
                  onClick={() => setMode('auto')}
                >
                  Auto
                </button>
              </div>
              
              {/* Bet Amount */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-[#7F8990]">Bet Amount</div>
                  <div className="text-xs text-[#7F8990]">{symbol}{formattedBalance}</div>
                </div>
                <div className="bg-[#0F212E] rounded flex items-center">
                  <div className="pl-2.5 pr-1">
                    <div className="w-5 h-5 rounded-full bg-[#4CAF50] text-center text-xs font-bold text-black leading-5">₹</div>
                  </div>
                  <input
                    type="text"
                    value={formatCryptoAmount(betAmount)}
                    onChange={handleBetAmountChange}
                    className="bg-transparent border-none outline-none h-9 text-sm text-white px-0 flex-1 min-w-0"
                  />
                  <div className="flex h-full">
                    <button 
                      onClick={handleHalfBet}
                      className="h-9 w-8 text-[#7F8990] hover:text-white border-l border-[#172B3A] flex items-center justify-center"
                    >
                      ½
                    </button>
                    <button 
                      onClick={handleDoubleBet}
                      className="h-9 w-8 text-[#7F8990] hover:text-white border-l border-[#172B3A] flex items-center justify-center"
                    >
                      2×
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Profit on Win */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-[#7F8990]">Profit on Win</div>
                  <div className="text-xs text-[#7F8990]">{symbol}{profit.toFixed(2)}</div>
                </div>
                <div className="bg-[#0F212E] rounded flex items-center">
                  <div className="pl-2.5 pr-1">
                    <div className="w-5 h-5 rounded-full bg-[#4CAF50] text-center text-xs font-bold text-black leading-5">₹</div>
                  </div>
                  <input
                    value={formatCryptoAmount(profit)}
                    readOnly
                    className="bg-transparent border-none outline-none h-9 text-sm text-white px-0 flex-1"
                  />
                </div>
              </div>
              
              {/* Bet and keyboard shortcuts */}
              <div className="space-y-4">
                <button 
                  onClick={handleBet}
                  disabled={rolling || betAmount <= 0}
                  className="w-full bg-[#00E700] hover:bg-[#00D100] text-black font-medium h-10 rounded text-sm transition-colors"
                >
                  {rolling ? 'Rolling...' : 'BET'}
                </button>
                
                <div className="text-xs text-[#7F8990] bg-[#0F212E] rounded p-3">
                  <div className="mb-2">Keyboard shortcuts:</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-5 h-5 bg-[#172B3A] flex items-center justify-center rounded">↑</div>
                      <div className="w-5 h-5 bg-[#172B3A] flex items-center justify-center rounded">↓</div>
                    </div>
                    <span>Adjust target</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;