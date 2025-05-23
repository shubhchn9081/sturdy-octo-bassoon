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
  Bomb,
  ShieldCheck,
  Car
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import NovitoLogo from '../NovitoLogo';

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
};

const SidebarLink = ({ href, icon, children, className, active: forceActive }: SidebarLinkProps) => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const active = forceActive || location === href;
  
  // Handle navigation with authentication check
  const handleNavigate = () => {
    // Routes that don't require authentication - '/' is already publicly accessible via App.tsx
    const publicRoutes = ['/auth', '/animation-examples', '/init-db'];
    const isPublicRoute = publicRoutes.includes(href);
    
    if (user || isPublicRoute) {
      // Authenticated users or public routes - direct navigation
      setLocation(href);
    } else {
      // Save intended destination and redirect to login
      localStorage.setItem('intended_route', href);
      setLocation('/auth');
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-center px-2 py-0 h-6 text-gray-300 text-xs rounded group transition-colors cursor-pointer",
        active ? "text-white border-l-2 border-[#57FBA2]" : "hover:text-white",
        className
      )}
      onClick={handleNavigate}
    >
      <span className={cn(
        "mr-1.5",
        active ? "text-[#57FBA2]" : "text-[#546d7a] group-hover:text-white"
      )}>
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
};

const Sidebar = () => {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  
  return (
    <aside className="w-56 h-full flex-shrink-0 bg-[#0F1923] border-r border-[#1d2a35] overflow-y-auto m-0 p-0">
      <div className="p-3">
        <div className="flex items-center mb-5 mt-2">
          <div 
            className="flex-1 flex items-center justify-center cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            <NovitoLogo className="h-12" />
          </div>
        </div>
        
        <div className="relative h-8 mb-4 rounded-md overflow-hidden bg-[#1C2C39] flex items-center">
          <div 
            className="absolute h-full w-1/2 bg-gradient-to-r from-[#57FBA2] to-[#39AD6E] rounded-md"
          ></div>
          <div 
            className="relative z-10 flex w-full"
          >
            <div 
              className="flex-1 text-center text-xs font-bold py-1.5 text-black cursor-pointer"
              onClick={() => window.location.href = '/'}
            >
              CASINO
            </div>
            <div 
              className="flex-1 text-center text-xs font-bold py-1.5 text-gray-300 cursor-pointer"
            >
              SPORTS
            </div>
          </div>
        </div>
        
        <nav className="space-y-0">
          <div className="mb-1">
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
            <SidebarLink href="/animation-examples" icon={<Sparkles className="h-4 w-4 text-[#57FBA2]" />}>
              Animations
            </SidebarLink>
            {user?.isAdmin && (
              <SidebarLink href="/admin" icon={<ShieldCheck className="h-4 w-4" />}>
                Admin Panel
              </SidebarLink>
            )}
          </div>
          
          <div className="pt-1 border-t border-[#243442]">
            <h3 className="px-4 text-xs font-semibold text-[#546d7a] uppercase tracking-wider mb-0.5">
              Games
            </h3>
            <SidebarLink href="/originals" icon={<Zap className="h-5 w-5 text-[#57FBA2]" />} active={true}>
              Novito Originals
            </SidebarLink>
            <SidebarLink href="/games/crash-car" icon={<Car className="h-5 w-5 text-[#FF8C42]" />}>
              Crash Car
            </SidebarLink>
            <SidebarLink href="/exclusives" icon={<FileEdit className="h-5 w-5" />}>
              Novito Exclusives
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
            <SidebarLink href="/novito-poker" icon={<Megaphone className="h-5 w-5" />}>
              Novito Poker
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
