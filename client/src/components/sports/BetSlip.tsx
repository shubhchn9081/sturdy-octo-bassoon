import React, { useState } from 'react';
import { X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSportsBettingStore } from '@/stores/sportsBettingStore';

interface BetSlipProps {
  onClose?: () => void;
}

const BetSlip: React.FC<BetSlipProps> = ({ onClose }) => {
  const { betSlip, removeFromBetSlip, clearBetSlip, setStake } = useSportsBettingStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setStake(value);
    } else if (e.target.value === '') {
      setStake(0);
    }
  };
  
  const quickStakeAmount = (amount: number) => {
    setStake(amount);
  };
  
  const totalOdds = betSlip.selections.reduce((acc, sel) => acc * sel.odds, 1);
  
  // Helper to format odds with proper precision
  const formatOdds = (odds: number) => {
    return odds < 10 ? odds.toFixed(2) : odds.toFixed(1);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#1A3347] border-b border-[#243B4D]">
        <h3 className="text-white font-medium flex items-center">
          Bet Slip
          {betSlip.selections.length > 0 && (
            <span className="ml-2 bg-blue-600 text-white rounded-full text-xs px-2 py-0.5">
              {betSlip.selections.length}
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          {betSlip.selections.length > 0 && (
            <button 
              className="text-gray-400 hover:text-gray-300" 
              onClick={clearBetSlip}
              title="Clear bet slip"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button 
            className="text-gray-400 hover:text-gray-300" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {onClose && (
            <button 
              className="text-gray-400 hover:text-gray-300 md:hidden" 
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Body - Collapsed state just shows summary */}
      {isCollapsed ? (
        <div className="p-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Selections</span>
            <span className="text-white font-medium">{betSlip.selections.length}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300">Total Odds</span>
            <span className="text-white font-medium">{formatOdds(totalOdds)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300">Stake</span>
            <span className="text-white font-medium">${betSlip.stake.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Content */}
          <div className="flex-1 overflow-auto p-3">
            {betSlip.selections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="4" y1="10" x2="20" y2="10" />
                </svg>
                <p className="mt-2 text-center">Your bet slip is empty. Click on odds to add selections.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {betSlip.selections.map((selection) => (
                  <div 
                    key={selection.outcomeId} 
                    className="bg-[#243B4D] rounded-md p-3 relative"
                  >
                    <button 
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
                      onClick={() => removeFromBetSlip(selection.outcomeId)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    
                    <div className="mb-2">
                      <div className="text-xs text-gray-400">{selection.eventName}</div>
                      <div className="text-sm text-white font-medium">{selection.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{selection.marketName}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Odds</span>
                      <span className="text-white font-medium">{formatOdds(selection.odds)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Stake input and calculations */}
          {betSlip.selections.length > 0 && (
            <div className="p-3 border-t border-[#243B4D]">
              {/* Quick stake buttons */}
              <div className="flex justify-between mb-3">
                <Button 
                  variant="outline" 
                  className="h-7 px-2 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]"
                  onClick={() => quickStakeAmount(5)}
                >
                  $5
                </Button>
                <Button 
                  variant="outline" 
                  className="h-7 px-2 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]"
                  onClick={() => quickStakeAmount(10)}
                >
                  $10
                </Button>
                <Button 
                  variant="outline" 
                  className="h-7 px-2 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]"
                  onClick={() => quickStakeAmount(25)}
                >
                  $25
                </Button>
                <Button 
                  variant="outline" 
                  className="h-7 px-2 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]"
                  onClick={() => quickStakeAmount(50)}
                >
                  $50
                </Button>
                <Button 
                  variant="outline" 
                  className="h-7 px-2 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]"
                  onClick={() => quickStakeAmount(100)}
                >
                  $100
                </Button>
              </div>
              
              {/* Stake input */}
              <div className="mb-3">
                <Label htmlFor="stake" className="text-sm text-gray-300 mb-1 block">Stake</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    id="stake"
                    type="number"
                    min="0"
                    step="any"
                    value={betSlip.stake || ''}
                    onChange={handleStakeChange}
                    className="pl-7 bg-[#172B3A] border-[#243B4D] text-white"
                  />
                </div>
              </div>
              
              {/* Total odds */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Total Odds</span>
                <span className="text-white font-medium">{formatOdds(totalOdds)}</span>
              </div>
              
              {/* Potential winnings */}
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-300">Potential Winnings</span>
                <span className="text-green-400 font-medium">
                  ${betSlip.potentialWinnings.toFixed(2)}
                </span>
              </div>
              
              {/* Place bet button */}
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Place Bet
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BetSlip;