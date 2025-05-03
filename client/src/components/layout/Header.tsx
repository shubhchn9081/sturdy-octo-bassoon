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
import NovitoLogo from '@/components/NovitoLogo';
import { useUser } from '@/context/UserContext';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/use-auth';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { useBalance } from '@/hooks/use-balance';
import { UserProfileButton } from '@/components/user/UserProfileButton';
// Currency switcher removed as we only support INR now

const Header = () => {
  const { isAuthenticated, user: contextUser } = useUser();
  const { user, isLoading } = useAuth();
  const isSignedIn = !!user;
  const isLoaded = !isLoading;
  const { collapsed, toggleSidebar } = useSidebar();
  const { activeCurrency } = useCurrency();
  
  // Using the new wallet context instead of useBalance
  const { balance: walletBalance, formattedBalance, symbol } = useWallet();
  
  // Keeping useBalance for backward compatibility
  const { balance: oldBalance = "0.00", rawBalance = 0 } = useBalance(activeCurrency);
  
  // Use new wallet balance but fallback to old system if needed
  const balance = formattedBalance || oldBalance;
  
  const [, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className="bg-[#0F1923] border-b border-[#182634] sticky top-0 z-10">
      <div className="px-2 md:px-4 py-1 md:py-2 flex items-center justify-between">
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
              className="p-1"
            >
              <AlignJustify className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <NovitoLogo className="h-6 md:h-12" />
          </div>
          
          {isSignedIn && (
            <div className="md:hidden ml-2 bg-[#1C2C39] rounded text-xs cursor-pointer" onClick={() => setLocation('/wallet')}>
              <span className="text-white px-2 py-1 font-mono">
                {symbol}{balance}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            {isSignedIn && (
              <div className="flex items-center bg-[#1C2C39] rounded text-xs relative cursor-pointer" onClick={() => setLocation('/wallet')}>
                <span className="text-white px-2 py-1.5 font-mono header-balance" id="header-balance">
                  {symbol}{balance}
                </span>
                {/* Removed the first chevron down icon */}
                <div className="border-l border-[#0B131C] pl-2 py-1.5 pr-2 flex items-center">
                  <span className="text-gray-400 text-xs ml-1">INR</span>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            className="bg-[#1C82E3] hover:bg-[#1375d1] rounded text-white font-medium py-1 md:py-1.5 px-2 md:px-3 text-[10px] md:text-xs"
            onClick={() => setLocation('/wallet')}
          >
            Wallet
          </Button>
          
          {isLoaded && isSignedIn ? (
            <UserProfileButton />
          ) : (
            <Button 
              className="bg-[#57FBA2] hover:bg-[#4ce996] text-black font-medium py-1 md:py-1.5 px-2 md:px-3 text-[10px] md:text-xs rounded"
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
                          Guest
                        </p>
                        <p className="text-xs leading-4 text-[#7F8990] mt-1">
                          {symbol}{balance} INR
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
        <div className="md:hidden bg-[#0F212E] border-t border-[#172B3A] p-3">
          {isSignedIn && (
            <div className="flex items-center bg-[#1C2C39] rounded text-xs mb-3 cursor-pointer" onClick={() => setLocation('/wallet')}>
              <span className="text-white px-2 py-2 font-mono flex-1 header-balance-mobile">
                {symbol}{balance}
              </span>
              <div className="border-l border-[#0B131C] pl-2 py-2 pr-2 flex items-center">
                <span className="text-gray-400 text-xs ml-1">INR</span>
              </div>
            </div>
          )}
          <div className="relative mb-3">
            <Input 
              placeholder="Search games..." 
              className="pl-8 py-1 text-sm bg-[#172B3A] border-[#243442]"
            />
            <div className="absolute left-3 top-2">
              <Search className="h-4 w-4 text-[#7F8990]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/')}>
              Home
            </div>
            <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/originals')}>
              Novito Originals
            </div>
            <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/slots')}>
              Slots
            </div>
            <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/live-casino')}>
              Live Casino
            </div>
            <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/sports')}>
              Sports
            </div>
            <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/promotions')}>
              Promotions
            </div>
            {isSignedIn && (
              <div className="block p-2 text-sm bg-[#172B3A] rounded cursor-pointer" onClick={() => setLocation('/account')}>
                My Account
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;