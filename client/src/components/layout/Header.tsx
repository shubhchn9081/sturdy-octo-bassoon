import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Menu, 
  Search, 
  User, 
  Bell, 
  Wallet as WalletIcon,
  Gift,
  HelpCircle,
  MessageSquare,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  // Temporary value until we fix context providers
  const balance = "1.00000000";
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
        
        <div className="flex items-center cursor-pointer">
          <Link href="/">
            <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-16" />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex bg-[#172B3A] rounded-md px-3 py-2 items-center">
            <span className="text-white mr-2 font-mono">{balance}</span>
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <Link href="/wallet">
            <Button className="bg-[#1375e1] hover:bg-[#0e5dba] rounded-md text-white font-medium py-2 px-4 text-sm">
              Wallet
            </Button>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {/* Search */}
            <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A] relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 bg-red-500 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-[#172B3A] border-[#243442] text-white">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs hover:bg-[#243442]">
                    Mark all as read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#243442]" />
                {[
                  { icon: <Gift className="h-4 w-4 text-green-400" />, title: "Bonus Credited", desc: "You received a 50% reload bonus", time: "2 hours ago" },
                  { icon: <Bell className="h-4 w-4 text-amber-400" />, title: "Weekend Tournament", desc: "The $25,000 weekend tournament starts soon", time: "5 hours ago" },
                  { icon: <MessageSquare className="h-4 w-4 text-blue-400" />, title: "New Reply", desc: "Someone replied to your forum post", time: "Yesterday" }
                ].map((item, i) => (
                  <DropdownMenuItem key={i} className="flex items-start gap-3 py-3 cursor-pointer hover:bg-[#243442]">
                    <div className="bg-[#0F212E] rounded-full p-2 mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-[#243442]" />
                <Link href="/notifications" className="block">
                  <DropdownMenuItem className="text-center text-blue-400 cursor-pointer hover:bg-[#243442]">
                    View all notifications
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#546D7A] hover:text-white hover:bg-[#172B3A]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=stake" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#172B3A] border-[#243442] text-white">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=stake" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Stake_User123</p>
                    <p className="text-xs text-gray-400">Bronze Level</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#243442]" />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#243442]">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/wallet">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#243442]">
                    <WalletIcon className="mr-2 h-4 w-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/promotions">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#243442]">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Promotions</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/help">
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#243442]">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help Center</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#243442]" />
                <DropdownMenuItem className="cursor-pointer hover:bg-[#243442]">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 cursor-pointer hover:bg-[#243442]">
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Link href="/">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Home
              </div>
            </Link>
            <Link href="/originals">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Stake Originals
              </div>
            </Link>
            <Link href="/profile">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Profile
              </div>
            </Link>
            <Link href="/wallet">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Wallet
              </div>
            </Link>
            <Link href="/promotions">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Promotions
              </div>
            </Link>
            <Link href="/help">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Help Center
              </div>
            </Link>
            <Link href="/community">
              <div className="block p-2 hover:bg-[#172B3A] rounded-md cursor-pointer">
                Community
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
