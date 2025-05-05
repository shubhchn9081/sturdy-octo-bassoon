import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type GameControlsProps = {
  betAmount: string;
  onBetAmountChange: (value: string) => void;
  onHalfBet: () => void;
  onDoubleBet: () => void;
  onBet: () => void;
  betButtonText?: string;
  betButtonDisabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export const GameControls = ({
  betAmount,
  onBetAmountChange,
  onHalfBet,
  onDoubleBet,
  onBet,
  betButtonText = 'Bet',
  betButtonDisabled = false,
  children,
  className
}: GameControlsProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-4">
        <div className="bg-[#243442] p-2 rounded">
          <div className="flex justify-between">
            <label className="text-xs text-gray-400">Bet Amount</label>
            <div className="text-xs text-gray-400">$0.00</div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={betAmount}
              onChange={(e) => onBetAmountChange(e.target.value)}
              className="w-full bg-transparent outline-none text-white h-6"
              placeholder="0.00000000"
            />
            <div className="absolute right-0 top-0 flex h-full">
              <button 
                onClick={onHalfBet}
                className="h-full px-2 text-gray-400 hover:text-white bg-transparent hover:bg-[#1B3549] rounded-none"
              >
                ½
              </button>
              <button 
                onClick={onDoubleBet}
                className="h-full px-2 text-gray-400 hover:text-white bg-transparent hover:bg-[#1B3549] rounded-none"
              >
                2×
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {children}
      
      <button 
        className="w-full bg-[#4ECD5D] hover:bg-[#3DBB4C] text-black font-medium py-2 rounded"
        disabled={betButtonDisabled}
        onClick={onBet}
      >
        {betButtonText}
      </button>
    </div>
  );
};

type GameTabsProps = {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export const GameTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className
}: GameTabsProps) => {
  return (
    <div className={cn("flex bg-[#1B3549] rounded-full overflow-hidden mb-6", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "flex-1 py-2 text-center",
            activeTab === tab.id ? "bg-[#243442]" : "text-gray-400"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export type GameLayoutProps = {
  title: string;
  controlsPanel: ReactNode;
  gamePanel: ReactNode;
  className?: string;
  isMobileFriendly?: boolean;
  mobileFirst?: boolean;
};

const GameLayout = ({
  title,
  controlsPanel,
  gamePanel,
  className,
  isMobileFriendly = false,
  mobileFirst = false
}: GameLayoutProps) => {
  const [showControls, setShowControls] = React.useState(!mobileFirst);

  if (isMobileFriendly) {
    return (
      <div className="bg-[#0F212E] min-h-screen text-white">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-[100vh] max-h-[100vh] overflow-hidden">
          {/* Mobile Header with Title */}
          <div className="bg-[#172B3A] p-2 text-center">
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          
          {/* Game Panel - takes up most of the space but not all */}
          <div className="w-full flex-1 overflow-y-auto">
            {gamePanel}
          </div>

          {/* Controls Panel - fixed at bottom */}
          <div className="w-full bg-[#172B3A] p-3 border-t border-gray-700 shadow-lg">
            {controlsPanel}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex">
          {/* Left Panel (Controls) */}
          <div className="w-64 bg-[#172B3A] p-4">
            {controlsPanel}
          </div>
          
          {/* Right Panel (Game) */}
          <div className="flex-1 p-6">
            {gamePanel}
          </div>
        </div>
      </div>
    );
  }

  // Standard Desktop Layout
  return (
    <div className="bg-[#0F212E] min-h-screen text-white">
      <div className="flex">
        {/* Left Panel (Controls) */}
        <div className="w-64 bg-[#172B3A] p-4">
          {controlsPanel}
        </div>
        
        {/* Right Panel (Game) */}
        <div className="flex-1 p-6">
          {gamePanel}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
