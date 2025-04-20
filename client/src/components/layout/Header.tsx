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
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/use-auth';
import { useCurrency } from '@/context/CurrencyContext';
import { useBalance } from '@/hooks/use-balance';
import { UserProfileButton } from '@/components/user/UserProfileButton';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';

const Header = () => {
  const { isAuthenticated, user: contextUser } = useUser();
  const { user, isLoading } = useAuth();
  const isSignedIn = !!user;
  const isLoaded = !isLoading;
  const { collapsed, toggleSidebar } = useSidebar();
  const { activeCurrency } = useCurrency();
  const { balance, rawBalance } = useBalance(activeCurrency);
  const [, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className="bg-[#0F1923] border-b border-[#182634] sticky top-0 z-10">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="hidden md:block mr-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <AlignJustify className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-16" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            {isSignedIn && (
              <div className="flex items-center bg-[#1C2C39] rounded text-xs relative cursor-pointer" onClick={() => setLocation('/wallet')}>
                <span className="text-white px-2 py-1.5 font-mono">{balance}</span>
                <span className="text-gray-400 mr-2">
                  <ChevronDown className="h-3 w-3 inline-block" />
                </span>
                <div className="border-l border-[#0B131C] pl-2 py-1.5 pr-2 flex items-center">
                  <CurrencySwitcher variant="header" currencies={['BTC', 'USD', 'INR']} />
                </div>
              </div>
            )}
          </div>
          
          <Button 
            className="bg-[#1C82E3] hover:bg-[#1375d1] rounded text-white font-medium py-1.5 px-3 text-xs"
            onClick={() => setLocation('/wallet')}
          >
            Wallet
          </Button>
          
          {isLoaded && isSignedIn ? (
            <UserProfileButton />
          ) : (
            <Button 
              className="bg-[#57FBA2] hover:bg-[#4ce996] text-black font-medium py-1.5 px-3 text-xs rounded"
              onClick={() => setLocation('/auth')}
            >
              Sign Up
            </Button>
          )}
          
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
              <Search className="h-5 w-5" />
            </Button>
            
            {isLoaded && !isSignedIn && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="h-5 w-5" />
                </Button>
              
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#1A2C38] border border-[#243442] z-50">
                    <div className="py-1 divide-y divide-[#243442]">
                      <div className="px-4 py-3">
                        <p className="text-sm leading-5 text-white">
                          {user ? user.username : 'Guest'}
                        </p>
                        <p className="text-xs leading-4 text-[#7F8990] mt-1">
                          {balance} {activeCurrency}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={() => { setLocation('/wallet'); setShowUserMenu(false); }} 
                          className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                        >
                          <Wallet className="h-4 w-4 mr-3" />
                          Wallet
                        </button>
                        <button 
                          onClick={() => { setLocation('/vault'); setShowUserMenu(false); }} 
                          className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                        >
                          <KeyRound className="h-4 w-4 mr-3" />
                          Vault
                        </button>
                        <button 
                          onClick={() => { setLocation('/vip'); setShowUserMenu(false); }} 
                          className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                        >
                          <Trophy className="h-4 w-4 mr-3" />
                          VIP
                        </button>
                        <button 
                          onClick={() => { setLocation('/affiliate'); setShowUserMenu(false); }} 
                          className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                        >
                          <Share2 className="h-4 w-4 mr-3" />
                          Affiliate
                        </button>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={() => { setLocation('/auth'); setShowUserMenu(false); }} 
                          className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                        >
                          <LogIn className="h-4 w-4 mr-3" />
                          Sign In/Sign Up
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden bg-[#0F212E] border-t border-[#172B3A] p-4">
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