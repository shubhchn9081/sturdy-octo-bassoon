import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronsUpDown
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
  const [isScrolled, setIsScrolled] = useState(false);

  // Listen for scroll to add shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`bg-[#0B131C] sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-black/20 border-b border-[#182634]/50' : 'border-b border-[#182634]/30'}`}>
      <div className="px-2 md:px-6 py-1.5 md:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1 md:space-x-4">
          <div className="hidden md:block">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="text-[#546D7A] hover:text-white hover:bg-[#172B3A] rounded-full transition-colors"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="px-1 py-1 rounded-full text-[#546D7A] hover:text-white"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <div className="relative">
              {/* Use mobile-optimized logo on small screens */}
              <NovitoLogo 
                className="h-6 md:h-9" 
                isMobile={true} 
              />
              {/* Add a subtle glow effect beneath the logo */}
              <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#57FBA2]/0 via-[#57FBA2]/70 to-[#57FBA2]/0 blur-sm"></div>
            </div>
          </div>
          
          {isSignedIn && (
            <div className="md:hidden ml-1 bg-gradient-to-r from-[#1A2C39] to-[#243442] rounded-full shadow-inner shadow-black/30 text-xs cursor-pointer overflow-hidden" onClick={() => setLocation('/wallet')}>
              <span className="text-white px-2.5 py-1.5 font-mono flex items-center">
                {symbol}{balance}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1.5 md:space-x-4">
          {/* Balance display with improved styling */}
          <div className="hidden md:block">
            {isSignedIn && (
              <div 
                className="flex items-center rounded-full overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] bg-gradient-to-r from-[#182634] to-[#1C2C39]"
                onClick={() => setLocation('/wallet')}
              >
                <span className="text-white px-3 py-1.5 font-mono text-sm header-balance font-medium" id="header-balance">
                  {symbol}{balance}
                </span>
                <div className="border-l border-[#0B131C]/60 pl-2 pr-3 py-1.5 flex items-center bg-[#1A2D3E]">
                  <span className="text-gray-300 text-xs">INR</span>
                  <ChevronsUpDown className="h-3 w-3 ml-1 text-gray-400" />
                </div>
              </div>
            )}
          </div>
          
          {/* Deposit button with improved styling */}
          <Button 
            className="bg-gradient-to-r from-[#57FBA2] to-[#4BDF8D] hover:brightness-105 rounded-full text-black font-semibold py-1 md:py-1.5 px-2 md:px-4 text-[10px] md:text-sm flex items-center gap-1 md:gap-1.5 shadow-md shadow-[#57FBA2]/20 transition-all hover:shadow-[#57FBA2]/30"
            onClick={() => setLocation('/recharge')}
          >
            <div className="relative flex items-center justify-center w-3.5 h-3.5 md:w-4 md:h-4">
              <span className="absolute text-[9px] md:text-[10px] font-bold top-0.5">$</span>
              <div className="absolute inset-0 bg-black/10 rounded-full blur-[1px]"></div>
            </div>
            <span className="hidden md:inline ml-1">Deposit</span>
            <span className="md:hidden ml-0.5">Deposit</span>
          </Button>
          
          {/* Wallet button with improved styling */}
          <Button 
            className="bg-gradient-to-r from-[#1C82E3] to-[#156DCF] hover:brightness-105 rounded-full text-white font-semibold py-1 md:py-1.5 px-2 md:px-4 text-[10px] md:text-sm flex items-center shadow-md shadow-[#156DCF]/20"
            onClick={() => setLocation('/wallet')}
          >
            <Wallet className="h-3 w-3 md:h-3.5 md:w-3.5 md:mr-1" />
            <span className="hidden md:inline">Wallet</span>
          </Button>
          
          {/* User authentication buttons */}
          {isLoaded && isSignedIn ? (
            <UserProfileButton />
          ) : (
            <Button 
              className="bg-gradient-to-r from-[#57FBA2] to-[#4BDF8D] hover:brightness-105 rounded-full text-black font-semibold py-1 md:py-1.5 px-2 md:px-4 text-[10px] md:text-sm shadow-md shadow-[#57FBA2]/20"
              onClick={() => setLocation('/auth')}
            >
              Sign Up
            </Button>
          )}
          
          {/* Desktop-only buttons */}
          <div className="hidden md:flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#546D7A] hover:text-white hover:bg-[#172B3A] rounded-full transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {isLoaded && !isSignedIn && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-[#546D7A] hover:text-white hover:bg-[#172B3A] rounded-full transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="h-5 w-5" />
                </Button>
              
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-[#1A2C38] border border-[#243442]/70 z-50 overflow-hidden">
                    <div className="py-1 divide-y divide-[#243442]/70">
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
                          onClick={() => { setLocation('/recharge'); setShowUserMenu(false); }} 
                          className="flex items-center w-full px-4 py-2 text-sm leading-5 text-black bg-[#57FBA2] hover:bg-[#4ce996]"
                        >
                          <div className="relative flex items-center justify-center w-4 h-4 mr-3">
                            <span className="absolute text-[10px] font-bold top-0.5">$</span>
                            <div className="absolute inset-0 bg-black/10 rounded-full blur-[1px]"></div>
                          </div>
                          Deposit
                        </button>
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
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#546D7A] hover:text-white hover:bg-[#172B3A] rounded-full transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {/* Adding notification indicator */}
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#57FBA2] rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu with improved styling */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#0B1823] border-t border-[#172B3A]/50 p-4">
          {isSignedIn && (
            <div className="flex items-center bg-gradient-to-r from-[#182634] to-[#1C2C39] rounded-lg shadow-inner shadow-black/20 text-xs mb-4 cursor-pointer overflow-hidden" onClick={() => setLocation('/wallet')}>
              <span className="text-white px-3 py-2.5 font-mono flex-1 header-balance-mobile font-medium text-sm">
                {symbol}{balance}
              </span>
              <div className="border-l border-[#0B131C]/60 pl-2 py-2.5 pr-3 flex items-center bg-[#1A2D3E]">
                <span className="text-gray-300 text-xs">INR</span>
                <ChevronsUpDown className="h-3 w-3 ml-1 text-gray-400" />
              </div>
            </div>
          )}
          
          <div className="relative mb-4">
            <Input 
              placeholder="Search games..." 
              className="pl-10 py-2 text-sm bg-[#172B3A]/80 border-[#243442]/50 rounded-lg"
            />
            <div className="absolute left-3 top-2.5">
              <Search className="h-4 w-4 text-[#7F8990]" />
            </div>
          </div>
          
          {/* Special button for deposit */}
          <div className="flex w-full mb-4">
            <div 
              className="flex items-center justify-center w-full p-2.5 text-sm bg-gradient-to-r from-[#57FBA2] to-[#4BDF8D] text-black rounded-lg cursor-pointer gap-1.5 font-semibold shadow-md"
              onClick={() => setLocation('/recharge')}
            >
              <div className="relative flex items-center justify-center w-5 h-5 mr-1">
                <span className="absolute text-xs font-bold top-0.5">$</span>
                <div className="absolute inset-0 bg-black/10 rounded-full blur-[1px]"></div>
              </div>
              Deposit Now
            </div>
          </div>
            
          <div className="grid grid-cols-2 gap-2.5">
            <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/')}>
              Home
            </div>
            <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/originals')}>
              Novito Originals
            </div>
            <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/slots')}>
              Slots
            </div>
            <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/live-casino')}>
              Live Casino
            </div>
            <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/sports')}>
              Sports
            </div>
            <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/promotions')}>
              Promotions
            </div>
            {isSignedIn && (
              <div className="block p-3 text-sm bg-[#172B3A]/70 rounded-lg cursor-pointer hover:bg-[#172B3A] transition-colors" onClick={() => setLocation('/account')}>
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