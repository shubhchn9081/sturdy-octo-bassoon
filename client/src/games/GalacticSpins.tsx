import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useBalance } from '@/hooks/use-balance';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
// Importing game components
import GalacticSpinsGame from '@/games/components/galactic-spins/GalacticSpinsGame';
import GalacticSpinsPaytable from '@/games/components/galactic-spins/GalacticSpinsPaytable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Star, RefreshCw, Volume2, VolumeX, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SlotSymbol } from '@shared/schema';

type SpinResult = {
  reels: SlotSymbol[][];
  lines: number;
  win: boolean;
  winningLines: number[];
  multiplier: number;
  bonusTriggered: boolean;
  expandingWilds: number[];
  winAmount: number;
};

const GalacticSpins = () => {
  const { balance, rawBalance, refetch: refreshBalance } = useBalance("INR");
  const { toast } = useToast();
  
  // Game state
  const [betAmount, setBetAmount] = useState<number>(1);
  const [lines, setLines] = useState<number>(10); // Default 10 paylines
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [spinResults, setSpinResults] = useState<SpinResult | null>(null);
  const [reels, setReels] = useState<SlotSymbol[][]>([
    ['planet', 'star', 'rocket'],
    ['alien', 'asteroid', 'comet'],
    ['galaxy', 'blackhole', 'wild'],
    ['star', 'rocket', 'planet'],
    ['comet', 'alien', 'asteroid']
  ]);
  const [error, setError] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<SpinResult[]>([]);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  
  // Preset bet amounts
  const betPresets = [0.1, 0.5, 1, 5, 10, 25, 50, 100];

  // Handle spin button click
  const handleSpin = async () => {
    if (isSpinning) return;
    
    // Validate bet amount
    if (betAmount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    // Calculate total bet (bet amount * number of lines)
    const totalBet = betAmount * lines;
    
    // Check if player has enough balance
    if (totalBet > rawBalance) {
      setError('Insufficient balance');
      return;
    }
    
    setError(null);
    setIsSpinning(true);
    setSpinResults(null);
    
    try {
      // Generate a client seed
      const clientSeed = Math.random().toString(36).substring(2, 15);
      
      // Call the server API to place the bet and get results
      const response = await fetch('/api/slots/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: 16, // Galactic Spins game ID
          amount: totalBet,
          clientSeed,
          lines
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error processing bet');
      }
      
      const data = await response.json();
      
      // Process the server response
      // We need to map the server response to our SpinResult format
      const serverOutcome = data.outcome;
      
      // Transform the slot result to match our visualization format
      // This is where we connect the server result to our UI
      const resultReels = generateSpinResultReels(serverOutcome);
      
      const result: SpinResult = {
        reels: resultReels,
        lines: lines,
        win: serverOutcome.win,
        winningLines: serverOutcome.winningLines || [],
        multiplier: data.multiplier || 1,
        bonusTriggered: serverOutcome.bonusTriggered || false,
        expandingWilds: serverOutcome.expandingWilds || [],
        winAmount: data.payout
      };
      
      // Update UI with result
      setReels(resultReels);
      setSpinResults(result);
      setGameHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 spins
      
      // Show toast for wins
      if (result.win) {
        toast({
          title: "You Won!",
          description: `${result.winAmount.toFixed(2)} INR`
        });
        
        // If bonus triggered, show special toast
        if (result.bonusTriggered) {
          toast({
            title: "Bonus Round Triggered!",
            description: "Free spins awarded!"
          });
        }
      }
      
      // Refresh user balance to reflect changes
      refreshBalance();
      
      // Continue auto-spin if enabled
      if (autoSpin) {
        setTimeout(() => {
          handleSpin();
        }, 2000);
      }
      
    } catch (err) {
      console.error('Error processing bet:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to game server');
    } finally {
      setIsSpinning(false);
    }
  };
  
  // Convert server outcome to visual reels
  const generateSpinResultReels = (serverOutcome: any): SlotSymbol[][] => {
    const symbols: SlotSymbol[] = ['planet', 'star', 'rocket', 'alien', 'asteroid', 'comet', 'galaxy', 'blackhole', 'wild'];
    const resultReels: SlotSymbol[][] = [];
    
    // If we have specific reels from server, use those
    if (serverOutcome.reels && Array.isArray(serverOutcome.reels)) {
      // Map server's number values to our symbol types
      for (let i = 0; i < 5; i++) {
        const reel: SlotSymbol[] = [];
        for (let j = 0; j < 3; j++) {
          // Use the server's reel value or generate a random one if not available
          const reelValue = serverOutcome.reels[i] !== undefined ? serverOutcome.reels[i] % symbols.length : Math.floor(Math.random() * symbols.length);
          reel.push(symbols[reelValue]);
        }
        resultReels.push(reel);
      }
    } else {
      // Fallback to random generation if server doesn't provide reels
      for (let i = 0; i < 5; i++) {
        const reel: SlotSymbol[] = [];
        for (let j = 0; j < 3; j++) {
          const randomIndex = Math.floor(Math.random() * symbols.length);
          reel.push(symbols[randomIndex]);
        }
        resultReels.push(reel);
      }
    }
    
    return resultReels;
  };
  
  // Generate random reels (for mock implementation)
  const generateRandomReels = (): SlotSymbol[][] => {
    const symbols: SlotSymbol[] = ['planet', 'star', 'rocket', 'alien', 'asteroid', 'comet', 'galaxy', 'blackhole', 'wild'];
    const newReels: SlotSymbol[][] = [];
    
    for (let i = 0; i < 5; i++) {
      const reel: SlotSymbol[] = [];
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        reel.push(symbols[randomIndex]);
      }
      newReels.push(reel);
    }
    
    return newReels;
  };
  
  const toggleAutoSpin = () => {
    const newAutoSpin = !autoSpin;
    setAutoSpin(newAutoSpin);
    
    if (newAutoSpin && !isSpinning) {
      // Start spinning if auto-spin is enabled and we're not currently spinning
      handleSpin();
    }
  };
  
  const handleBetAmountChange = (value: number) => {
    if (value >= 0) {
      setBetAmount(value);
    }
  };
  
  const calculateTotalBet = () => {
    return betAmount * lines;
  };
  
  return (
    <div className="flex flex-col h-full bg-[#050A1C] text-white">
      <div className="mx-auto w-full max-w-5xl flex flex-col h-full overflow-auto pb-0">
        {/* Game title and description */}
        <div className="text-center pt-6 pb-2">
          <h2 className="text-3xl font-bold text-[#44CCFF]">GALACTIC SPINS</h2>
          <p className="text-sm text-blue-300">Explore the cosmos for huge multipliers up to 50×!</p>
        </div>
        
        {/* Main game area */}
        <div className="flex-1 p-2">
          <div className="bg-[#0A0F24] p-4 rounded-md border border-[#2A3F7A] mb-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ 
              background: 'radial-gradient(circle at 50% 50%, rgba(68, 204, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)', 
              borderRadius: '0.375rem' 
            }}></div>
            
            {/* Game canvas where the slot machine will be rendered */}
            <GalacticSpinsGame 
              reels={reels}
              isSpinning={isSpinning}
              spinResults={spinResults} 
              onSpin={handleSpin}
              soundEnabled={soundEnabled}
            />
          </div>
          
          {/* Game controls */}
          <div className="bg-[#0A0F24] p-4 rounded-md border border-[#2A3F7A] relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Game Controls</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="h-8 w-8"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowPaytable(!showPaytable)}
                  className="h-8 w-8"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowControls(!showControls)}
                  className="h-8 w-8"
                >
                  {showControls ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {showControls && (
              <div className="space-y-4">
                {/* Error message */}
                {error && (
                  <div className="bg-red-500/20 text-red-200 p-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                {/* Bet controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm text-gray-400">Bet Amount (INR)</label>
                      <span className="text-sm">{betAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={betAmount}
                        onChange={(e) => handleBetAmountChange(parseFloat(e.target.value))}
                        className="bg-[#161B36] border-[#2A3F7A]"
                        disabled={isSpinning}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {betPresets.map((preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => handleBetAmountChange(preset)}
                          disabled={isSpinning}
                          className="flex-1 min-w-[60px] bg-[#161B36] border-[#2A3F7A] hover:bg-[#212a52]"
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm text-gray-400">Paylines</label>
                      <span className="text-sm">{lines}</span>
                    </div>
                    <Slider
                      value={[lines]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setLines(value[0])}
                      disabled={isSpinning}
                      className="py-4"
                    />
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <label className="text-sm text-gray-400">Total Bet</label>
                        <div className="text-lg font-bold">{calculateTotalBet().toFixed(2)} INR</div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleAutoSpin}
                          disabled={isSpinning && !autoSpin}
                          className={autoSpin ? "bg-green-800 hover:bg-green-700" : "bg-[#161B36] border-[#2A3F7A] hover:bg-[#212a52]"}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {autoSpin ? "Stop Auto" : "Auto Spin"}
                        </Button>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={handleSpin}
                          disabled={isSpinning}
                          className="bg-gradient-to-r from-[#44CCFF] to-[#3388FF] hover:opacity-90"
                        >
                          {isSpinning ? "Spinning..." : "SPIN"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Paytable Modal */}
        {showPaytable && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A0F24] rounded-lg border border-[#2A3F7A] max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 flex justify-between items-center border-b border-[#2A3F7A]">
                <h3 className="text-xl font-bold">Paytable & Game Rules</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPaytable(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <GalacticSpinsPaytable />
              </div>
            </div>
          </div>
        )}
        
        {/* Game History */}
        <div className="mt-4 p-4 bg-[#0A0F24] rounded-md border border-[#2A3F7A]">
          <h3 className="text-lg font-semibold mb-2">Game History</h3>
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {gameHistory.length === 0 ? (
              <div className="text-gray-400 text-sm">No game history yet. Start playing!</div>
            ) : (
              gameHistory.map((result, index) => (
                <div key={index} className={`p-2 rounded-md ${result.win ? 'bg-green-900/30' : 'bg-[#161B36]'} flex justify-between`}>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Spin #{gameHistory.length - index}</span>
                    {result.bonusTriggered && (
                      <Badge variant="outline" className="mr-2 bg-yellow-900/30 text-yellow-300 border-yellow-600">
                        BONUS
                      </Badge>
                    )}
                    {result.expandingWilds.length > 0 && (
                      <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-600">
                        WILDS
                      </Badge>
                    )}
                  </div>
                  <div className={result.win ? 'text-green-400' : 'text-gray-400'}>
                    {result.win ? `+${result.winAmount.toFixed(2)}` : '0.00'} INR
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalacticSpins;