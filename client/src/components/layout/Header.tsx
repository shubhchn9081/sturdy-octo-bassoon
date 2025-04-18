import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#0F1923] border-b border-[#243442] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M108.055 47.803L69.8945 16.8076C65.8242 13.5156 59.1758 13.5156 55.1055 16.8076L16.9453 47.803C12.875 51.0949 12.875 56.5635 16.9453 59.8555L55.1055 90.851C59.1758 94.1429 65.8242 94.1429 69.8945 90.851L108.055 59.8555C112.125 56.5635 112.125 51.0949 108.055 47.803Z" stroke="white" strokeWidth="4"/>
                  <path d="M62.5003 63.3789C62.5003 69.0747 58.7864 69.6444 53.6635 69.3013C53.5479 69.2938 53.4313 69.2927 53.3146 69.2927H47.4263C47.1931 69.2927 46.9644 69.2406 46.756 69.1401C46.5476 69.0396 46.3651 68.8933 46.2212 68.7115C46.0774 68.5297 45.9761 68.3169 45.9248 68.0887C45.8735 67.8605 45.8735 67.6232 45.925 67.395L49.6699 52.2974C49.7223 52.0671 49.8255 51.8522 49.9719 51.6692C50.1184 51.4861 50.3044 51.3396 50.5163 51.2399C50.7282 51.1403 50.9604 51.0898 51.1963 51.0923C51.4322 51.0947 51.6633 51.15 51.8729 51.2543L57.5934 54.1147C59.9055 55.2745 62.5003 56.3267 62.5003 59.6936V63.3789Z" fill="white"/>
                  <path d="M62.5003 75.0463C62.5003 69.3505 58.7864 68.7809 53.6635 69.124C53.5479 69.1314 53.4313 69.1325 53.3146 69.1325H47.4263C47.1931 69.1325 46.9644 69.1847 46.756 69.2852C46.5476 69.3857 46.3651 69.532 46.2212 69.7138C46.0774 69.8956 45.9761 70.1084 45.9248 70.3366C45.8735 70.5647 45.8735 70.8021 45.925 71.0303L49.6699 86.1279C49.7223 86.3582 49.8255 86.5731 49.9719 86.7561C50.1184 86.9391 50.3044 87.0856 50.5163 87.1853C50.7282 87.285 50.9604 87.3354 51.1963 87.333C51.4322 87.3306 51.6633 87.2753 51.8729 87.171L57.5934 84.3105C59.9055 83.1507 62.5003 82.0986 62.5003 78.7316V75.0463Z" fill="white"/>
                  <path d="M82.6841 69.2938H76.6848C76.5681 69.2938 76.4515 69.2949 76.3359 69.3024C71.213 69.6455 67.4992 69.0758 67.4992 63.38V59.6947C67.4992 56.3278 70.0939 55.2756 72.406 54.1158L78.1266 51.2554C78.3361 51.1511 78.5672 51.0958 78.8032 51.0934C79.0391 51.0909 79.2713 51.1414 79.4832 51.2411C79.695 51.3407 79.881 51.4872 80.0275 51.6703C80.174 51.8533 80.2771 52.0682 80.3295 52.2985L84.0745 67.3961C84.1259 67.6243 84.1259 67.8617 84.0746 68.0898C84.0233 68.318 83.922 68.5308 83.7782 68.7126C83.6343 68.8944 83.4518 69.0407 83.2434 69.1412C83.035 69.2417 82.8063 69.2938 82.5731 69.2938H82.6841Z" fill="white"/>
                </svg>
                <span className="text-white font-bold text-xl">Stake</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-8 space-x-6">
              <Link href="/">
                <span className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium cursor-pointer">
                  Casino
                </span>
              </Link>
              <Link href="/sports">
                <span className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer">
                  Sports
                </span>
              </Link>
              <Link href="/promotions">
                <span className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer">
                  Promotions
                </span>
              </Link>
            </nav>
          </div>
          
          {/* Authentication and user controls */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <div className="text-sm text-gray-300">
                    Balance: <span className="text-white font-medium">${user.balance.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="hidden md:inline-block text-white">
                    {user.username}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#1E3851] flex items-center justify-center text-white uppercase">
                    {user.username.charAt(0)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <AuthButtons />
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-gray-300 hover:text-white"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0F1923] border-t border-[#243442]">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/">
                <span className="text-white px-3 py-2 text-lg font-medium cursor-pointer">
                  Casino
                </span>
              </Link>
              <Link href="/sports">
                <span className="text-gray-400 hover:text-white px-3 py-2 text-lg font-medium cursor-pointer">
                  Sports
                </span>
              </Link>
              <Link href="/promotions">
                <span className="text-gray-400 hover:text-white px-3 py-2 text-lg font-medium cursor-pointer">
                  Promotions
                </span>
              </Link>
              
              {!user && (
                <div className="pt-4 border-t border-[#243442]">
                  <AuthButtons />
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;