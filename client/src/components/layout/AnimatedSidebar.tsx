import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useSidebar } from '@/context/SidebarContext';
import { useAutoAnimate } from '@formkit/auto-animate/react';
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
  AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Common NavLink type for both expanded and collapsed views
type NavLinkProps = {
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

// Expanded view link
type ExpandedLinkProps = NavLinkProps & {
  children: React.ReactNode;
  className?: string;
};

const ExpandedLink = ({ href, icon, children, className, active }: ExpandedLinkProps) => {
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

// Collapsed view link
type CollapsedLinkProps = NavLinkProps & {
  tooltip: string;
};

const CollapsedLink = ({ href, icon, tooltip, active }: CollapsedLinkProps) => {
  return (
    <div 
      className={cn(
        "w-12 h-12 flex justify-center items-center relative cursor-pointer my-1 rounded-md group transition-colors",
        active && "bg-[#243442]"
      )}
      onClick={() => window.location.href = href}
    >
      <div className={cn(
        "text-[#546d7a] group-hover:text-white",
        active && "text-[#57FBA2]"
      )}>
        {icon}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-[#243442] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  );
};

const AnimatedSidebar = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const [topNavRef] = useAutoAnimate();
  const [gamesNavRef] = useAutoAnimate();
  const [containerRef] = useAutoAnimate();
  
  return (
    <aside 
      ref={containerRef} 
      className={cn(
        "h-full flex-shrink-0 bg-[#1a2c38] border-r border-[#243442] hidden md:flex flex-col overflow-hidden transition-all duration-300",
        collapsed ? "w-16 items-center py-4" : "w-64"
      )}
    >
      {collapsed ? (
        // Collapsed Sidebar Content
        <>
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
          <div ref={topNavRef} className="flex flex-col items-center w-full overflow-y-auto">
            <CollapsedLink href="/favorites" icon={<Star className="h-5 w-5" />} tooltip="Favourites" />
            <CollapsedLink href="/recent" icon={<Clock className="h-5 w-5" />} tooltip="Recent" />
            <CollapsedLink href="/challenges" icon={<Trophy className="h-5 w-5" />} tooltip="Challenges" />
            <CollapsedLink href="/bets" icon={<Wallet className="h-5 w-5" />} tooltip="My Bets" />
            
            <div className="w-8 border-t border-[#243442] my-3"></div>
          </div>
          
          <div ref={gamesNavRef} className="flex flex-col items-center w-full overflow-y-auto">
            <CollapsedLink 
              href="/originals" 
              icon={<Zap className="h-5 w-5" />}
              tooltip="Stake Originals" 
              active={true} 
            />
            <CollapsedLink href="/exclusives" icon={<FileEdit className="h-5 w-5" />} tooltip="Stake Exclusives" />
            <CollapsedLink href="/slots" icon={<SmilePlus className="h-5 w-5" />} tooltip="Slots" />
            <CollapsedLink href="/live-casino" icon={<Dices className="h-5 w-5" />} tooltip="Live Casino" />
            <CollapsedLink href="/game-shows" icon={<Tv2 className="h-5 w-5" />} tooltip="Game Shows" />
            <CollapsedLink href="/new-releases" icon={<Sparkles className="h-5 w-5" />} tooltip="New Releases" />
            <CollapsedLink href="/stake-poker" icon={<Megaphone className="h-5 w-5" />} tooltip="Stake Poker" />
            <CollapsedLink href="/bonus-buy" icon={<CircleDollarSign className="h-5 w-5" />} tooltip="Bonus Buy" />
            <CollapsedLink href="/enhanced-rtp" icon={<BarChart2 className="h-5 w-5" />} tooltip="Enhanced RTP" />
            <CollapsedLink href="/table-games" icon={<Gamepad2 className="h-5 w-5" />} tooltip="Table Games" />
            <CollapsedLink href="/blackjack" icon={<Diamond className="h-5 w-5" />} tooltip="Blackjack" />
            <CollapsedLink href="/admin" icon={<Settings className="h-5 w-5" />} tooltip="Admin Panel" />
          </div>
        </>
      ) : (
        // Expanded Sidebar Content
        <div className="px-6 py-4 w-full">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 text-[#546D7A] hover:text-white hover:bg-[#172B3A]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div 
              className="flex-1 flex items-center justify-center cursor-pointer"
              onClick={() => window.location.href = '/'}
            >
              <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-16" />
            </div>
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
            {/* Top navigation section with auto-animate */}
            <div ref={topNavRef} className="mb-4">
              <ExpandedLink href="/favorites" icon={<Star className="h-5 w-5" />}>
                Favourites
              </ExpandedLink>
              <ExpandedLink href="/recent" icon={<Clock className="h-5 w-5" />}>
                Recent
              </ExpandedLink>
              <ExpandedLink href="/challenges" icon={<Trophy className="h-5 w-5" />}>
                Challenges
              </ExpandedLink>
              <ExpandedLink href="/bets" icon={<Wallet className="h-5 w-5" />}>
                My Bets
              </ExpandedLink>
              <ExpandedLink href="/admin" icon={<Settings className="h-5 w-5" />}>
                Admin Panel
              </ExpandedLink>
            </div>
            
            <div className="pt-4 border-t border-[#243442]">
              <h3 className="px-4 text-xs font-semibold text-[#546d7a] uppercase tracking-wider mb-2">
                Games
              </h3>
              {/* Games navigation section with auto-animate */}
              <div ref={gamesNavRef}>
                <ExpandedLink href="/originals" icon={<Zap className="h-5 w-5 text-[#57FBA2]" />} active={true}>
                  Stake Originals
                </ExpandedLink>
                <ExpandedLink href="/exclusives" icon={<FileEdit className="h-5 w-5" />}>
                  Stake Exclusives
                </ExpandedLink>
                <ExpandedLink href="/slots" icon={<SmilePlus className="h-5 w-5" />}>
                  Slots
                </ExpandedLink>
                <ExpandedLink href="/live-casino" icon={<Dices className="h-5 w-5" />}>
                  Live Casino
                </ExpandedLink>
                <ExpandedLink href="/game-shows" icon={<Tv2 className="h-5 w-5" />}>
                  Game Shows
                </ExpandedLink>
                <ExpandedLink href="/new-releases" icon={<Sparkles className="h-5 w-5" />}>
                  New Releases
                </ExpandedLink>
                <ExpandedLink href="/stake-poker" icon={<Megaphone className="h-5 w-5" />}>
                  Stake Poker
                </ExpandedLink>
                <ExpandedLink href="/bonus-buy" icon={<CircleDollarSign className="h-5 w-5" />}>
                  Bonus Buy
                </ExpandedLink>
                <ExpandedLink href="/enhanced-rtp" icon={<BarChart2 className="h-5 w-5" />}>
                  Enhanced RTP
                </ExpandedLink>
                <ExpandedLink href="/table-games" icon={<Gamepad2 className="h-5 w-5" />}>
                  Table Games
                </ExpandedLink>
                <ExpandedLink href="/blackjack" icon={<Diamond className="h-5 w-5" />}>
                  Blackjack
                </ExpandedLink>
                <ExpandedLink href="/baccarat" icon={<Star className="h-5 w-5" />}>
                  Baccarat
                </ExpandedLink>
              </div>
            </div>
          </nav>
        </div>
      )}
    </aside>
  );
};

export default AnimatedSidebar;