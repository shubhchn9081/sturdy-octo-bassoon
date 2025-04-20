import React, { ReactNode, useEffect, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsedSidebar from './CollapsedSidebar';
import Footer from './Footer';
import { useSidebar } from '@/context/SidebarContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { collapsed } = useSidebar();
  
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
      {/* Sidebar - absolutely positioned */}
      <div 
        ref={animationParent} 
        className={`absolute left-0 top-0 h-full ${sidebarClass} transition-all duration-300 ease-out`}
        style={{ margin: 0, padding: 0, zIndex: 10 }}
      >
        {collapsed ? <CollapsedSidebar /> : <Sidebar />}
      </div>
      
      {/* Content area - positioned to the right of sidebar */}
      <div 
        className="absolute top-0 right-0 bottom-0 overflow-y-auto"
        style={{ 
          left: collapsed ? '4rem' : '16rem', 
          margin: 0, 
          padding: 0,
          transition: 'left 0.3s ease-out'
        }}
      >
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
