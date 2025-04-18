import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Home, 
  Clock, 
  Trophy, 
  Wallet, 
  Star, 
  Zap, 
  FileEdit, 
  Tv2, 
  SmilePlus, 
  Dices, 
  Sparkles, 
  Megaphone, 
  Gamepad2,
  Diamond,
  BarChart2,
  CircleDollarSign,
  ChevronRight,
  Settings
} from 'lucide-react';

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
};

const SidebarLink = ({ href, icon, children, className, active: forceActive }: SidebarLinkProps) => {
  const [location] = useLocation();
  const active = forceActive || location === href;
  
  return (
    <div 
      className={cn(
        "flex items-center px-4 py-2 text-white font-semibold rounded-md hover:bg-[#243442] group transition-colors cursor-pointer",
        active && "bg-[#243442] text-white",
        className
      )}
      onClick={() => window.location.href = href}
    >
      <span className="mr-3 text-[#546d7a] group-hover:text-white">
        {icon}
      </span>
      <span>{children}</span>
      {active && <ChevronRight className="ml-auto h-4 w-4 text-[#57FBA2]" />}
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-64 h-full flex-shrink-0 bg-[#1a2c38] border-r border-[#243442] hidden md:block overflow-y-auto">
      <div className="px-6 py-4">
        <div 
          className="flex items-center justify-center mb-6 cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-16" />
        </div>
        
        <div className="flex space-x-2 mb-6">
          <div 
            className="flex-1 bg-gradient-to-br from-[#57FBA2] to-[#39AD6E] text-black font-bold py-2 px-4 rounded-md text-center cursor-pointer text-lg"
            onClick={() => window.location.href = '/'}
          >
            CASINO
          </div>
          <div 
            className="flex-1 bg-[#243442] text-white font-bold py-2 px-4 rounded-md text-center cursor-pointer text-lg"
          >
            SPORTS
          </div>
        </div>
        
        <nav className="space-y-1">
          <div className="mb-4">
            <SidebarLink href="/favorites" icon={<Star className="h-5 w-5" />}>
              Favourites
            </SidebarLink>
            <SidebarLink href="/recent" icon={<Clock className="h-5 w-5" />}>
              Recent
            </SidebarLink>
            <SidebarLink href="/challenges" icon={<Trophy className="h-5 w-5" />}>
              Challenges
            </SidebarLink>
            <SidebarLink href="/bets" icon={<Wallet className="h-5 w-5" />}>
              My Bets
            </SidebarLink>
            <SidebarLink href="/admin" icon={<Settings className="h-5 w-5" />}>
              Admin Panel
            </SidebarLink>
          </div>
          
          <div className="pt-4 border-t border-[#243442]">
            <h3 className="px-4 text-xs font-semibold text-[#546d7a] uppercase tracking-wider mb-2">
              Games
            </h3>
            <SidebarLink href="/originals" icon={<Zap className="h-5 w-5 text-[#57FBA2]" />} active={true}>
              Stake Originals
            </SidebarLink>
            <SidebarLink href="/exclusives" icon={<FileEdit className="h-5 w-5" />}>
              Stake Exclusives
            </SidebarLink>
            <SidebarLink href="/slots" icon={<SmilePlus className="h-5 w-5" />}>
              Slots
            </SidebarLink>
            <SidebarLink href="/live-casino" icon={<Dices className="h-5 w-5" />}>
              Live Casino
            </SidebarLink>
            <SidebarLink href="/game-shows" icon={<Tv2 className="h-5 w-5" />}>
              Game Shows
            </SidebarLink>
            <SidebarLink href="/new-releases" icon={<Sparkles className="h-5 w-5" />}>
              New Releases
            </SidebarLink>
            <SidebarLink href="/stake-poker" icon={<Megaphone className="h-5 w-5" />}>
              Stake Poker
            </SidebarLink>
            <SidebarLink href="/bonus-buy" icon={<CircleDollarSign className="h-5 w-5" />}>
              Bonus Buy
            </SidebarLink>
            <SidebarLink href="/enhanced-rtp" icon={<BarChart2 className="h-5 w-5" />}>
              Enhanced RTP
            </SidebarLink>
            <SidebarLink href="/table-games" icon={<Gamepad2 className="h-5 w-5" />}>
              Table Games
            </SidebarLink>
            <SidebarLink href="/blackjack" icon={<Diamond className="h-5 w-5" />}>
              Blackjack
            </SidebarLink>
            <SidebarLink href="/baccarat" icon={<Star className="h-5 w-5" />}>
              Baccarat
            </SidebarLink>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
