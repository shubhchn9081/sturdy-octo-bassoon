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
  ChevronLeft,
  Settings,
  AlignJustify,
  Bomb
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { Button } from '@/components/ui/button';

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  count?: number;
};

const SidebarLink = ({ href, icon, children, className, active: forceActive, count }: SidebarLinkProps) => {
  const [location] = useLocation();
  const active = forceActive || location === href;
  
  return (
    <div 
      className={cn(
        "flex items-center px-3 py-1.5 text-gray-300 text-xs rounded group transition-colors cursor-pointer",
        active ? "text-white border-l-2 border-[#57FBA2]" : "hover:text-white",
        className
      )}
      onClick={() => window.location.href = href}
    >
      <span className={cn(
        "mr-3",
        active ? "text-[#57FBA2]" : "text-[#546d7a] group-hover:text-white"
      )}>
        {icon}
      </span>
      <span className="flex-1">{children}</span>
      
      {count !== undefined && (
        <span className="text-[#546d7a] text-xs">{count.toLocaleString()}</span>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { toggleSidebar } = useSidebar();
  const [location] = useLocation();
  
  return (
    <aside className="w-64 h-full flex-shrink-0 bg-[#0F212E] border-r border-[#172B3A] overflow-y-auto">
      <div className="p-3">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="text-[#546D7A] hover:text-white hover:bg-transparent p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative h-8 mb-5 rounded-sm overflow-hidden bg-[#1A242D] flex items-center">
          <div 
            className="absolute h-full w-1/2 bg-[#7BFA4C] rounded-sm"
            style={{ left: location.includes('/sports') ? '50%' : '0' }}
          ></div>
          <div 
            className="relative z-10 flex w-full"
          >
            <div 
              className={`flex-1 text-center text-xs font-bold py-1.5 cursor-pointer ${location.includes('/sports') ? 'text-white' : 'text-black'}`}
              onClick={() => window.location.href = '/'}
            >
              CASINO
            </div>
            <div 
              className={`flex-1 text-center text-xs font-bold py-1.5 cursor-pointer ${!location.includes('/sports') ? 'text-white' : 'text-black'}`}
              onClick={() => window.location.href = '/sports'}
            >
              SPORTS
            </div>
          </div>
        </div>
        
        <nav className="space-y-1">
          <div className="mb-4">
            <SidebarLink href="/favorites" icon={<Star className="h-4 w-4" />}>
              Favourites
            </SidebarLink>
            <SidebarLink href="/recent" icon={<Clock className="h-4 w-4" />}>
              Recent
            </SidebarLink>
            <SidebarLink href="/challenges" icon={<Trophy className="h-4 w-4" />}>
              Challenges
            </SidebarLink>
            <SidebarLink href="/bets" icon={<Wallet className="h-4 w-4" />}>
              My Bets
            </SidebarLink>
          </div>
          
          <div className="pt-4 border-t border-[#182634]">
            <h3 className="px-3 text-xs font-semibold text-[#546d7a] uppercase tracking-wider mb-2">
              Games
            </h3>
            <SidebarLink 
              href="/originals" 
              icon={<Home className="h-4 w-4" />} 
              active={location === '/originals'}
              count={13166}
            >
              Stake Originals
            </SidebarLink>
            <SidebarLink 
              href="/exclusives" 
              icon={<FileEdit className="h-4 w-4" />}
              count={7781}
            >
              Stake Exclusives
            </SidebarLink>
            <SidebarLink 
              href="/slots" 
              icon={<SmilePlus className="h-4 w-4" />}
              count={5134}
            >
              Slots
            </SidebarLink>
            <SidebarLink 
              href="/live-casino" 
              icon={<Dices className="h-4 w-4" />}
              count={8092}
            >
              Live Casino
            </SidebarLink>
            <SidebarLink 
              href="/game-shows" 
              icon={<Tv2 className="h-4 w-4" />}
              count={2099}
            >
              Game Shows
            </SidebarLink>
            <SidebarLink 
              href="/new-releases" 
              icon={<Sparkles className="h-4 w-4" />}
              count={4411}
            >
              New Releases
            </SidebarLink>
            <SidebarLink 
              href="/stake-poker" 
              icon={<Diamond className="h-4 w-4" />}
              count={2226}
            >
              Stake Poker
            </SidebarLink>
            <SidebarLink 
              href="/bonus-buy" 
              icon={<CircleDollarSign className="h-4 w-4" />}
            >
              Bonus Buy
            </SidebarLink>
            <SidebarLink 
              href="/enhanced-rtp" 
              icon={<BarChart2 className="h-4 w-4" />}
            >
              Enhanced RTP
            </SidebarLink>
            <SidebarLink 
              href="/table-games" 
              icon={<Gamepad2 className="h-4 w-4" />}
            >
              Table Games
            </SidebarLink>
            <SidebarLink 
              href="/blackjack" 
              icon={<Diamond className="h-4 w-4" />}
            >
              Blackjack
            </SidebarLink>
            <SidebarLink 
              href="/baccarat" 
              icon={<Star className="h-4 w-4" />}
            >
              Baccarat
            </SidebarLink>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
