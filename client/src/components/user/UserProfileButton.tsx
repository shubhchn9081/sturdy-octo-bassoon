import React from 'react';
import { useAuth } from '@/hooks/use-auth';
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
  ChevronDown,
  BadgeCheck
} from 'lucide-react';

export const UserProfileButton = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    logoutMutation.mutate();
    setLocation('/auth');
  };

  const getInitials = (name: string) => {
    // Extract initials from name (e.g., "John Doe" -> "JD")
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userInitials = user.username ? getInitials(user.username) : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full overflow-hidden flex items-center gap-1.5 pl-1 pr-2 h-auto py-1 transition-all hover:bg-[#172B3A]/70"
        >
          <Avatar className="h-7 w-7 border-2 border-[#57FBA2]/30 shadow-sm shadow-[#57FBA2]/20">
            <AvatarFallback className="bg-gradient-to-br from-[#1E364A] to-[#172B3A] text-white text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-white max-w-[80px] truncate hidden md:inline-block">
            {user.username || 'User'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden md:inline-block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-[#0F1A24] border border-[#243442]/70 text-white rounded-xl shadow-xl shadow-black/30 overflow-hidden" 
        align="end"
      >
        <div className="px-5 py-4 bg-gradient-to-br from-[#172B3A] to-[#0F1A24] relative">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#57FBA2]/0 via-[#57FBA2]/40 to-[#57FBA2]/0"></div>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-[#57FBA2]/30 shadow-md shadow-[#57FBA2]/10">
              <AvatarFallback className="bg-gradient-to-br from-[#1E364A] to-[#172B3A] text-white text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold leading-none text-white">{user.username || 'User'}</p>
                {user.isAdmin && (
                  <BadgeCheck className="h-4 w-4 text-[#57FBA2]" />
                )}
              </div>
              <p className="text-xs text-[#8A9CA8] mt-1">{user.email}</p>
              
              <div className="mt-2 bg-[#0B131C]/60 rounded-full px-3 py-1 text-xs inline-flex items-center">
                <span className="text-[#57FBA2] mr-1">•</span>
                <span className="text-gray-300">Level 1 User</span>
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-[#243442]/30" />
        
        <div className="p-1.5">
          <DropdownMenuItem 
            className="px-4 py-2.5 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-3 transition-colors"
            onClick={() => setLocation('/wallet')}
          >
            <div className="bg-[#243442]/50 h-8 w-8 rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-[#57FBA2]" />
            </div>
            <div>
              <p className="text-sm font-medium">Wallet</p>
              <p className="text-xs text-[#8A9CA8]">Manage your funds</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="px-4 py-2.5 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-3 mt-1 transition-colors"
            onClick={() => setLocation('/vault')}
          >
            <div className="bg-[#243442]/50 h-8 w-8 rounded-lg flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-[#4B9FFE]" />
            </div>
            <div>
              <p className="text-sm font-medium">Vault</p>
              <p className="text-xs text-[#8A9CA8]">Secure your assets</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="px-4 py-2.5 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-3 mt-1 transition-colors"
            onClick={() => setLocation('/vip')}
          >
            <div className="bg-[#243442]/50 h-8 w-8 rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <p className="text-sm font-medium">VIP Program</p>
              <p className="text-xs text-[#8A9CA8]">Exclusive benefits</p>
            </div>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-[#243442]/30 my-1" />
        
        <div className="p-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <DropdownMenuItem 
              className="px-3 py-2 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/statistics')}
            >
              <BarChart2 className="h-4 w-4 text-[#8A9CA8]" />
              <span className="text-sm">Statistics</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-3 py-2 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/transactions')}
            >
              <ListOrdered className="h-4 w-4 text-[#8A9CA8]" />
              <span className="text-sm">Transactions</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-3 py-2 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/bets')}
            >
              <DollarSign className="h-4 w-4 text-[#8A9CA8]" />
              <span className="text-sm">My Bets</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-3 py-2 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/settings')}
            >
              <Settings className="h-4 w-4 text-[#8A9CA8]" />
              <span className="text-sm">Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-3 py-2 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/affiliate')}
            >
              <Share2 className="h-4 w-4 text-[#8A9CA8]" />
              <span className="text-sm">Affiliate</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-3 py-2 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/support')}
            >
              <Headphones className="h-4 w-4 text-[#8A9CA8]" />
              <span className="text-sm">Support</span>
            </DropdownMenuItem>
          </div>
          
          {user.isAdmin && (
            <DropdownMenuItem 
              className="px-3 py-2 mt-1.5 focus:bg-[#243442]/60 hover:bg-[#243442]/60 cursor-pointer rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => setLocation('/admin')}
            >
              <Shield className="h-4 w-4 text-[#FF5E5E]" />
              <span className="text-sm font-medium">Admin Panel</span>
            </DropdownMenuItem>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-[#243442]/30 my-1" />
        
        <div className="p-1.5">
          <DropdownMenuItem 
            className="px-4 py-2.5 focus:bg-[#3A1F22]/70 hover:bg-[#3A1F22]/70 cursor-pointer rounded-lg flex items-center gap-2 transition-colors bg-[#2A1518]/40"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 text-[#FF5E5E]" />
            <span className="text-sm font-medium text-[#FF5E5E]">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};