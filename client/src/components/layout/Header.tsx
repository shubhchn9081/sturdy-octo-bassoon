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
    <header className="bg-[#0F212E] border-b border-[#172B3A] sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
          <div className="hidden md:flex bg-[#172B3A] rounded-md px-3 py-2 items-center">
            <span className="text-white mr-2 font-mono">{balance}</span>
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <Button 
            className="bg-[#1375e1] hover:bg-[#0e5dba] rounded-md text-white font-medium py-2 px-4 text-sm"
            onClick={() => setLocation('/wallet')}
          >
            <WalletIcon className="h-4 w-4 mr-2" />
            Wallet
          </Button>
          
          {isAuthenticated ? (
            <Button 
              variant="outline" 
              className="border-[#243442] text-white hover:bg-[#172B3A] hover:text-white"
              onClick={() => {
                logout();
                setLocation('/');
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 text-sm flex items-center"
              onClick={() => setLocation('/auth')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign Up / Login
            </Button>
          )}
          
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
              <Search className="h-5 w-5" />
            </Button>
            
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
                        {user ? user.balance.BTC.toFixed(8) : '0.00000000'} BTC
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
                        onClick={() => { setLocation('/statistics'); setShowUserMenu(false); }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <BarChart2 className="h-4 w-4 mr-3" />
                        Statistics
                      </button>
                      <button 
                        onClick={() => { setLocation('/transactions'); setShowUserMenu(false); }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <ListOrdered className="h-4 w-4 mr-3" />
                        Transactions
                      </button>
                      <button 
                        onClick={() => { setLocation('/bets'); setShowUserMenu(false); }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <DollarSign className="h-4 w-4 mr-3" />
                        My Bets
                      </button>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={() => { setLocation('/settings'); setShowUserMenu(false); }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <button 
                        onClick={() => { setLocation('/stake-smart'); setShowUserMenu(false); }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <Shield className="h-4 w-4 mr-3" />
                        Stake Smart
                      </button>
                      <button 
                        onClick={() => { setLocation('/support'); setShowUserMenu(false); }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <Headphones className="h-4 w-4 mr-3" />
                        Live Support
                      </button>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={() => { 
                          logout();
                          setShowUserMenu(false);
                        }} 
                        className="flex items-center w-full px-4 py-2 text-sm leading-5 text-white hover:bg-[#243442]"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
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