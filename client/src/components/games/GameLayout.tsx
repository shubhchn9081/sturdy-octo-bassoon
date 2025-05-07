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
  const [showMobileControls, setShowMobileControls] = React.useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  // Thumb-friendly mobile version with collapsible sections
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Main action button - always visible and large for thumb access */}
        <button 
          className="w-full bg-[#4ECD5D] hover:bg-[#3DBB4C] text-black font-bold py-4 rounded-xl text-lg shadow-lg"
          disabled={betButtonDisabled}
          onClick={onBet}
        >
          {betButtonText}
        </button>
      
        {/* Quick bet amount buttons */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[10, 50, 100, 500].map(amount => (
            <button
              key={`preset-${amount}`}
              className="py-3 bg-[#243442] rounded-lg text-white font-medium"
              onClick={() => onBetAmountChange(amount.toString())}
            >
              {amount}
            </button>
          ))}
        </div>
        
        {/* Collapsible settings button */}
        <button 
          className="w-full flex items-center justify-between bg-[#243442] p-3 rounded-lg text-white"
          onClick={() => setShowMobileControls(!showMobileControls)}
        >
          <span className="font-medium">Bet Settings</span>
          <span className="text-lg">{showMobileControls ? '▲' : '▼'}</span>
        </button>
        
        {/* Collapsible settings panel */}
        {showMobileControls && (
          <div className="bg-[#1B2834] p-3 rounded-lg mt-2 space-y-3">
            {/* Bet amount with large +/- buttons */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onHalfBet}
                  className="h-10 w-10 flex items-center justify-center text-white bg-[#243442] rounded-lg"
                >
                  −
                </button>
                <input
                  type="text"
                  value={betAmount}
                  onChange={(e) => onBetAmountChange(e.target.value)}
                  className="flex-1 bg-[#243442] text-white h-10 rounded-lg px-3 text-center"
                  placeholder="0.00"
                />
                <button 
                  onClick={onDoubleBet}
                  className="h-10 w-10 flex items-center justify-center text-white bg-[#243442] rounded-lg"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Game-specific settings */}
            {children}
          </div>
        )}
      </div>
    );
  }

  // Original desktop version
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
          
          {/* Game Panel - takes exactly 65% of the screen height */}
          <div className="w-full h-[65vh] relative">
            {gamePanel}
          </div>

          {/* Controls Panel - takes only 35% of screen height, no scrolling needed with our compact design */}
          <div className="w-full h-[35vh] bg-[#172B3A] p-2 border-t border-gray-700 shadow-lg flex flex-col justify-between">
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
