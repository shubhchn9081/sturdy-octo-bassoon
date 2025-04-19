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
  AlignJustify
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
        "relative flex flex-col items-center justify-center p-3 mb-2 text-white rounded-md hover:bg-[#243442] group transition-colors cursor-pointer",
        active && "bg-[#243442] text-white border-l-2 border-[#4cd964]"
      )}
      onClick={() => window.location.href = href}
    >
      <span className={`text-[#546d7a] group-hover:text-white ${active ? "text-white" : ""}`}>
        {icon}
      </span>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-[#243442] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
};

const CollapsedSidebar = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <aside className="w-16 h-full flex-shrink-0 bg-[#1a2c38] border-r border-[#243442] hidden md:flex flex-col items-center py-4 overflow-y-auto">
      {/* Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleSidebar}
        className="text-[#546D7A] hover:text-white hover:bg-[#172B3A] mb-4"
      >
        <AlignJustify className="h-5 w-5" />
      </Button>
      
      {/* Casino / Sports Buttons */}
      <div className="mb-4 w-12 h-12 bg-gradient-to-br from-[#57FBA2] to-[#39AD6E] text-black font-bold rounded-md flex items-center justify-center cursor-pointer">
        <span className="text-xs font-bold">CASINO</span>
      </div>
      
      {/* Navigation Icons */}
      <div className="flex flex-col items-center w-full overflow-y-auto">
        <CollapsedSidebarLink href="/favorites" icon={<Star className="h-5 w-5" />} tooltip="Favourites" />
        <CollapsedSidebarLink href="/recent" icon={<Clock className="h-5 w-5" />} tooltip="Recent" />
        <CollapsedSidebarLink href="/challenges" icon={<Trophy className="h-5 w-5" />} tooltip="Challenges" />
        <CollapsedSidebarLink href="/bets" icon={<Wallet className="h-5 w-5" />} tooltip="My Bets" />
        
        <div className="w-8 border-t border-[#243442] my-3"></div>
        
        <CollapsedSidebarLink 
          href="/originals" 
          icon={<Zap className="h-5 w-5 text-[#57FBA2]" />} 
          tooltip="Stake Originals" 
          active={true} 
        />
        <CollapsedSidebarLink href="/exclusives" icon={<FileEdit className="h-5 w-5" />} tooltip="Stake Exclusives" />
        <CollapsedSidebarLink href="/slots" icon={<SmilePlus className="h-5 w-5" />} tooltip="Slots" />
        <CollapsedSidebarLink href="/live-casino" icon={<Dices className="h-5 w-5" />} tooltip="Live Casino" />
        <CollapsedSidebarLink href="/game-shows" icon={<Tv2 className="h-5 w-5" />} tooltip="Game Shows" />
        <CollapsedSidebarLink href="/new-releases" icon={<Sparkles className="h-5 w-5" />} tooltip="New Releases" />
        <CollapsedSidebarLink href="/stake-poker" icon={<Megaphone className="h-5 w-5" />} tooltip="Stake Poker" />
        <CollapsedSidebarLink href="/bonus-buy" icon={<CircleDollarSign className="h-5 w-5" />} tooltip="Bonus Buy" />
        <CollapsedSidebarLink href="/enhanced-rtp" icon={<BarChart2 className="h-5 w-5" />} tooltip="Enhanced RTP" />
        <CollapsedSidebarLink href="/table-games" icon={<Gamepad2 className="h-5 w-5" />} tooltip="Table Games" />
        <CollapsedSidebarLink href="/blackjack" icon={<Diamond className="h-5 w-5" />} tooltip="Blackjack" />
        <CollapsedSidebarLink href="/admin" icon={<Settings className="h-5 w-5" />} tooltip="Admin Panel" />
      </div>
    </aside>
  );
};

export default CollapsedSidebar;