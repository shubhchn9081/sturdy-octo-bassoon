import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <div>
        <label className="block text-muted-foreground mb-2">Bet Amount</label>
        <div className="relative">
          <Input
            type="text"
            value={betAmount}
            onChange={(e) => onBetAmountChange(e.target.value)}
            className="w-full bg-panel-bg text-foreground pr-20"
          />
          <div className="absolute right-0 top-0 flex h-full">
            <Button 
              variant="ghost" 
              className="h-full rounded-none border-l border-border px-3"
              onClick={onHalfBet}
            >
              ½
            </Button>
            <Button 
              variant="ghost" 
              className="h-full rounded-none border-l border-border px-3"
              onClick={onDoubleBet}
            >
              2×
            </Button>
          </div>
        </div>
      </div>
      
      {children}
      
      <Button 
        className="w-full bg-accent text-accent-foreground font-semibold py-3"
        disabled={betButtonDisabled}
        onClick={onBet}
      >
        {betButtonText}
      </Button>
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
    <div className={cn("flex space-x-4 mb-6", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "bg-panel-bg text-foreground px-6 py-2 rounded-full",
            activeTab === tab.id ? "bg-accent text-accent-foreground" : "bg-secondary border border-border"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

type GameLayoutProps = {
  title: string;
  controlsPanel: ReactNode;
  gamePanel: ReactNode;
  className?: string;
};

const GameLayout = ({
  title,
  controlsPanel,
  gamePanel,
  className
}: GameLayoutProps) => {
  return (
    <div className={cn("bg-secondary rounded-lg p-6 mb-6", className)}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {controlsPanel}
        </div>
        <div className="md:col-span-2">
          {gamePanel}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
