import React, { useState } from 'react';
import { useUser, useAuth, SignOutButton } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
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
  LogOut,
  User,
} from 'lucide-react';

export const UserProfileButton = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  const getInitials = (name: string) => {
    // Extract initials from name (e.g., "John Doe" -> "JD")
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userInitials = user.fullName ? getInitials(user.fullName) : user.emailAddresses[0]?.emailAddress?.slice(0, 2).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
          <Avatar className="h-8 w-8 border border-[#243442]">
            <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'}/>
            <AvatarFallback className="bg-[#172B3A] text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1A2C38] border border-[#243442] text-white" align="end">
        <div className="px-4 py-3">
          <p className="text-sm font-medium leading-none">{user.fullName || user.username || 'User'}</p>
          <p className="text-xs text-muted-foreground mt-1 text-[#7F8990]">{user.primaryEmailAddress?.emailAddress}</p>
          <p className="text-xs text-muted-foreground mt-1 text-[#7F8990]">0.00000000 BTC</p>
        </div>
        
        <DropdownMenuSeparator className="bg-[#243442]" />
        
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/wallet')}
        >
          <Wallet className="h-4 w-4 mr-3" />
          Wallet
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/vault')}
        >
          <KeyRound className="h-4 w-4 mr-3" />
          Vault
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/vip')}
        >
          <Trophy className="h-4 w-4 mr-3" />
          VIP
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/affiliate')}
        >
          <Share2 className="h-4 w-4 mr-3" />
          Affiliate
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[#243442]" />
        
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/statistics')}
        >
          <BarChart2 className="h-4 w-4 mr-3" />
          Statistics
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/transactions')}
        >
          <ListOrdered className="h-4 w-4 mr-3" />
          Transactions
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/bets')}
        >
          <DollarSign className="h-4 w-4 mr-3" />
          My Bets
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[#243442]" />
        
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/settings')}
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/stake-smart')}
        >
          <Shield className="h-4 w-4 mr-3" />
          Stake Smart
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer"
          onClick={() => setLocation('/support')}
        >
          <Headphones className="h-4 w-4 mr-3" />
          Live Support
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[#243442]" />
        
        <DropdownMenuItem 
          className="px-4 py-2 focus:bg-[#243442] cursor-pointer text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};