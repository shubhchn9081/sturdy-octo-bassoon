import React, { ReactNode, useEffect, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsedSidebar from './CollapsedSidebar';
import Footer from './Footer';
import MobileFooterMenu from './MobileFooterMenu';
import { useSidebar } from '@/context/SidebarContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { collapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use auto-animate for smooth transitions with customized options
  const [animationParent] = useAutoAnimate({
    // Slightly slower animation for a more polished effect
    duration: 250,
    // Ease-out provides a smoother deceleration at the end
    easing: 'ease-out'
  });
  
  // Apply a CSS class for additional transition effects
  // This provides a backup animation in case auto-animate is disrupted
  const sidebarClass = collapsed ? 'w-16' : 'w-64';

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Sidebar - absolutely positioned - hidden on mobile */}
      <div 
        ref={animationParent} 
        className={`absolute left-0 top-0 h-full ${sidebarClass} transition-all duration-300 ease-out hidden md:block`}
        style={{ margin: 0, padding: 0, zIndex: 10 }}
      >
        {collapsed ? <CollapsedSidebar /> : <Sidebar />}
      </div>
      
      {/* Content area - positioned to the right of sidebar on desktop, full width on mobile */}
      <div 
        className="absolute top-0 right-0 bottom-0 overflow-y-auto md:pb-0 pb-20"
        style={{ 
          left: isMobile ? 0 : (collapsed ? '4rem' : '16rem'), 
          margin: 0, 
          padding: 0,
          transition: 'left 0.3s ease-out'
        }}
      >
        <Header />
        <div className="px-2 md:px-4">
          {children}
        </div>
        <Footer />
      </div>
      
      {/* Mobile Footer Menu */}
      <MobileFooterMenu />
    </div>
  );
};

export default Layout;
