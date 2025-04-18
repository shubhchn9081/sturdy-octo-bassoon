import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Menu, 
  Search, 
  User, 
  Bell, 
  Wallet as WalletIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Use authenticated user balance or default
  const balance = user ? user.balance.toFixed(8) : "0.00000000";
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
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
        
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
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
          
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
              <Search className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#172B3A] border-[#243442] text-white">
                {user ? (
                  <>
                    <DropdownMenuItem className="focus:bg-[#243442] cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{user.username}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="focus:bg-[#243442] cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/auth')} className="focus:bg-[#243442] cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Sign in</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => navigate('/')}>
              Home
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => navigate('/originals')}>
              Stake Originals
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => navigate('/slots')}>
              Slots
            </div>
            <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => navigate('/live-casino')}>
              Live Casino
            </div>
            <div className="border-t border-[#243442] my-2"></div>
            {user ? (
              <>
                <div className="flex items-center p-2 hover:bg-[#172B3A] rounded-md">
                  <User className="h-4 w-4 mr-2" />
                  <span>{user.username}</span>
                </div>
                <div className="flex items-center p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </div>
              </>
            ) : (
              <div className="flex items-center p-2 hover:bg-[#172B3A] rounded-md cursor-pointer" onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                <span>Sign in</span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
