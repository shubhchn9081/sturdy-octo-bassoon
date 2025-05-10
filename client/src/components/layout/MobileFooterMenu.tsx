import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { saveIntendedRoute } from '@/lib/auth-redirect';

// Custom navigation link component that handles auth checks
const MobileNavLink = ({ 
  href, 
  label, 
  icon, 
  isActive 
}: { 
  href: string; 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean 
}) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Handle navigation with auth check
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if this is a route that should be protected
    const publicRoutes = ['/', '/auth', '/animation-examples', '/init-db'];
    const isPublicRoute = publicRoutes.includes(href);
    
    if (user || isPublicRoute) {
      // User is authenticated or route is public, navigate directly
      setLocation(href);
    } else {
      // User is not authenticated and route is protected,
      // save intended destination and redirect to login
      saveIntendedRoute(href);
      setLocation('/auth');
    }
  };
  
  return (
    <div className={`flex flex-col items-center p-3 ${isActive ? 'text-blue-400 border-t-2 border-blue-400 -mt-px' : ''}`}>
      <div onClick={handleClick} className="cursor-pointer">
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

const MobileFooterMenu = () => {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0F1923] border-t border-[#172B3A] md:hidden z-50">
      <div className="flex justify-around text-[#546D7A]">
        <MobileNavLink 
          href="/" 
          label="Browse" 
          isActive={location === '/'}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
              <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        
        <MobileNavLink 
          href="/casino" 
          label="Casino" 
          isActive={location === '/casino'}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        
        <MobileNavLink 
          href="/bets" 
          label="Bets" 
          isActive={location === '/bets'}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          }
        />
        
        <MobileNavLink 
          href="/sports" 
          label="Sports" 
          isActive={location === '/sports'}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 3C14.5 5 16 8 16 12C16 16 14.5 19 12 21M12 3C9.5 5 8 8 8 12C8 16 9.5 19 12 21M3 12H21" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          }
        />
        
        <MobileNavLink 
          href="/chat" 
          label="Chat" 
          isActive={location === '/chat'}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
              <path d="M21 12c0 4.418-4.03 8-9 8-1.173 0-2.3-.21-3.34-.594-1.2.537-4.16 1.594-4.16 1.594 0 0 1.2-3 .6-4-1.299-1.215-2.1-2.925-2.1-4.85C3 7.582 7.03 4 12 4s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default MobileFooterMenu;