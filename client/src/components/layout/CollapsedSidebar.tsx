import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Home, 
  Star, 
  Clock, 
  Trophy, 
  Wallet, 
  Zap, 
  FileEdit, 
  SmilePlus, 
  Dices, 
  Tv2, 
  Sparkles, 
  Megaphone, 
  CircleDollarSign, 
  BarChart2, 
  Gamepad2,
  Diamond,
  Settings,
  AlignJustify,
  ChevronRight
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

type CollapsedSidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
};

const CollapsedSidebarLink = ({ href, icon, tooltip, active: forceActive }: CollapsedSidebarLinkProps) => {
  const [location] = useLocation();
  const active = forceActive || location === href;
  
  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center py-2.5 group transition-colors cursor-pointer",
        active ? "text-white border-l-2 border-[#57FBA2]" : "text-[#546d7a] hover:text-white border-l-2 border-transparent"
      )}
      onClick={() => window.location.href = href}
    >
      <span className="h-4 w-4">
        {icon}
      </span>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-[#172B3A] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
};

const CollapsedSidebar = () => {
  const { toggleSidebar } = useSidebar();
  const [location] = useLocation();
  
  return (
    <aside className="w-16 h-full flex-shrink-0 bg-[#0F212E] border-r border-[#172B3A] flex flex-col items-center pt-2 overflow-y-auto">
      {/* Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleSidebar}
        className="text-[#546D7A] hover:text-white hover:bg-transparent p-1 mb-4"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Casino / Sports Toggle */}
      <div className="mb-6 w-10 h-20 bg-[#1A242D] rounded-sm flex flex-col overflow-hidden">
        <div 
          className={cn(
            "h-10 flex items-center justify-center cursor-pointer transition-colors",
            !location.includes('/sports') ? "bg-[#7BFA4C] text-black" : "bg-transparent text-white"
          )}
          onClick={() => window.location.href = '/'}
        >
          <span className="text-xs font-bold">C</span>
        </div>
        <div 
          className={cn(
            "h-10 flex items-center justify-center cursor-pointer transition-colors",
            location.includes('/sports') ? "bg-[#7BFA4C] text-black" : "bg-transparent text-white"
          )}
          onClick={() => window.location.href = '/sports'}
        >
          <span className="text-xs font-bold">S</span>
        </div>
      </div>
      
      {/* Navigation Icons */}
      <div className="flex flex-col items-center w-full overflow-y-auto">
        <CollapsedSidebarLink 
          href="/favorites" 
          icon={<Star className="h-4 w-4" />} 
          tooltip="Favourites" 
        />
        <CollapsedSidebarLink 
          href="/recent" 
          icon={<Clock className="h-4 w-4" />} 
          tooltip="Recent" 
        />
        <CollapsedSidebarLink 
          href="/challenges" 
          icon={<Trophy className="h-4 w-4" />} 
          tooltip="Challenges" 
        />
        <CollapsedSidebarLink 
          href="/bets" 
          icon={<Wallet className="h-4 w-4" />} 
          tooltip="My Bets" 
        />
        
        <div className="w-8 border-t border-[#182634] my-3"></div>
        
        <CollapsedSidebarLink 
          href="/originals" 
          icon={<Home className="h-4 w-4" />} 
          tooltip="Stake Originals" 
          active={location === '/originals'} 
        />
        <CollapsedSidebarLink 
          href="/exclusives" 
          icon={<FileEdit className="h-4 w-4" />} 
          tooltip="Stake Exclusives" 
        />
        <CollapsedSidebarLink 
          href="/slots" 
          icon={<SmilePlus className="h-4 w-4" />} 
          tooltip="Slots" 
        />
        <CollapsedSidebarLink 
          href="/live-casino" 
          icon={<Dices className="h-4 w-4" />} 
          tooltip="Live Casino" 
        />
        <CollapsedSidebarLink 
          href="/game-shows" 
          icon={<Tv2 className="h-4 w-4" />} 
          tooltip="Game Shows" 
        />
        <CollapsedSidebarLink 
          href="/new-releases" 
          icon={<Sparkles className="h-4 w-4" />} 
          tooltip="New Releases" 
        />
        <CollapsedSidebarLink 
          href="/stake-poker" 
          icon={<Diamond className="h-4 w-4" />} 
          tooltip="Stake Poker" 
        />
        <CollapsedSidebarLink 
          href="/bonus-buy" 
          icon={<CircleDollarSign className="h-4 w-4" />} 
          tooltip="Bonus Buy" 
        />
        <CollapsedSidebarLink 
          href="/enhanced-rtp" 
          icon={<BarChart2 className="h-4 w-4" />} 
          tooltip="Enhanced RTP" 
        />
        <CollapsedSidebarLink 
          href="/table-games" 
          icon={<Gamepad2 className="h-4 w-4" />} 
          tooltip="Table Games" 
        />
        <CollapsedSidebarLink 
          href="/blackjack" 
          icon={<Diamond className="h-4 w-4" />} 
          tooltip="Blackjack" 
        />
      </div>
    </aside>
  );
};

export default CollapsedSidebar;