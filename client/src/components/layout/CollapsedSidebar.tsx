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
        "relative flex flex-col items-center justify-center py-1 text-white group transition-colors cursor-pointer",
        active ? "text-white" : "text-[#546d7a] hover:text-gray-400"
      )}
      onClick={() => window.location.href = href}
    >
      <span className="h-5 w-5">
        {icon}
      </span>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-[#1d2a35] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
};

const CollapsedSidebar = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <aside className="w-12 h-full flex-shrink-0 bg-[#0F1923] border-r border-[#1d2a35] flex flex-col items-center pt-2 overflow-y-auto m-0 p-0">
      {/* Casino / Sports Buttons */}
      <div className="mb-3 w-12 h-12 bg-gradient-to-br from-[#57FBA2] to-[#39AD6E] text-black font-bold rounded-md flex items-center justify-center cursor-pointer">
        <span className="text-xs font-bold">CASINO</span>
      </div>
      
      {/* Navigation Icons */}
      <div className="flex flex-col items-center w-full overflow-y-auto">
        <CollapsedSidebarLink href="/favorites" icon={<Star className="h-5 w-5" />} tooltip="Favourites" />
        <CollapsedSidebarLink href="/recent" icon={<Clock className="h-5 w-5" />} tooltip="Recent" />
        <CollapsedSidebarLink href="/challenges" icon={<Trophy className="h-5 w-5" />} tooltip="Challenges" />
        <CollapsedSidebarLink href="/bets" icon={<Wallet className="h-5 w-5" />} tooltip="My Bets" />
        
        <div className="w-8 border-t border-[#243442] my-1"></div>
        
        <CollapsedSidebarLink 
          href="/originals" 
          icon={<Zap className="h-5 w-5 text-[#57FBA2]" />} 
          tooltip="Novito Originals" 
          active={true} 
        />
        <CollapsedSidebarLink href="/exclusives" icon={<FileEdit className="h-5 w-5" />} tooltip="Novito Exclusives" />
        <CollapsedSidebarLink href="/slots" icon={<SmilePlus className="h-5 w-5" />} tooltip="Slots" />
        <CollapsedSidebarLink href="/live-casino" icon={<Dices className="h-5 w-5" />} tooltip="Live Casino" />
        <CollapsedSidebarLink href="/game-shows" icon={<Tv2 className="h-5 w-5" />} tooltip="Game Shows" />
        <CollapsedSidebarLink href="/new-releases" icon={<Sparkles className="h-5 w-5" />} tooltip="New Releases" />
        <CollapsedSidebarLink href="/novito-poker" icon={<Megaphone className="h-5 w-5" />} tooltip="Novito Poker" />
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