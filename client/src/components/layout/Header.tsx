import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { 
  Menu, 
  Search, 
  User, 
  Bell, 
  Wallet as WalletIcon,
  Wallet,
  KeyRound,
  Trophy,
  Share2,
  BarChart2,
  ListOrdered,
  DollarSign,
  Settings,
  Shield,
  Headphones,
  LogIn,
  LogOut,
  AlignJustify,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useSidebar } from '@/context/SidebarContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useUser();
  const { collapsed, toggleSidebar } = useSidebar();
  const balance = user ? user.balance.BTC.toFixed(8) : "0.00000000";
  const [, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className="bg-[#0F212E] border-b border-[#172B3A] sticky top-0 z-10 h-[60px] flex items-center">
      <div className="w-full px-4 flex items-center justify-between h-full">
        <div className="flex items-center h-full">
          <div className="hidden md:block mr-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="text-[#546D7A] hover:text-white hover:bg-transparent p-1"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-[#546D7A] hover:text-white hover:bg-transparent p-1"
            >
              <AlignJustify className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center cursor-pointer h-full" onClick={() => setLocation('/')}>
            <img src="/images/stake_logo_white.png" alt="Stake" className="h-6" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative h-[28px] flex items-center group">
            <div className="flex items-center bg-[#1A242D] px-2 py-1 h-full rounded-sm cursor-pointer">
              <span className="text-white text-xs font-mono mr-1">{balance}</span>
              <span className="text-amber-500 text-xs">⊙</span>
              <svg className="h-3 w-3 ml-0.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
          
          <Button 
            className="bg-[#1C82E3] hover:bg-[#1375d1] text-white font-medium text-xs h-[28px] px-3 rounded-[3px]"
            onClick={() => setLocation('/wallet')}
          >
            Wallet
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-transparent p-1 flex items-center">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-transparent p-1 flex items-center">
              <User className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-transparent p-1 flex items-center">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-[#0F212E] border-t border-[#172B3A] p-4">
          <div className="relative mb-4">
            <Input 
              placeholder="Search games..." 
              className="pl-8 bg-[#172B3A] border-[#243442]"
            />
            <div className="absolute left-3 top-3">
              <Search className="h-4 w-4 text-[#7F8990]" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="block p-2 bg-[#172B3A] rounded-md cursor-pointer" onClick={() => setLocation('/')}>
              Home
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => setLocation('/originals')}>
              Stake Originals
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => setLocation('/slots')}>
              Slots
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => setLocation('/live-casino')}>
              Live Casino
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;