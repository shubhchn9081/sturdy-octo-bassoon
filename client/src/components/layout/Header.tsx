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
  LogIn
} from 'lucide-react';


const Header = () => {
  // Using static values for now, will integrate with UserContext later
  const isAuthenticated = false;
  const balance = "1.00000000";
  const [, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  return (
    <header className="bg-[#0F212E] border-b border-[#172B3A] sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
          <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-16" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex bg-[#172B3A] rounded-md px-3 py-2 items-center">
            <span className="text-white mr-2 font-mono">{balance}</span>
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <Button className="bg-[#1375e1] hover:bg-[#0e5dba] rounded-md text-white font-medium py-2 px-4 text-sm">
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
              Logout
              {user?.username && ` (${user.username})`}
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
            
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
              <User className="h-5 w-5" />
            </Button>
            
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
            <div className="block p-2 bg-[#172B3A] rounded-md cursor-pointer" onClick={() => window.location.href = '/'}>
              Home
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => window.location.href = '/originals'}>
              Stake Originals
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => window.location.href = '/slots'}>
              Slots
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => window.location.href = '/live-casino'}>
              Live Casino
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
