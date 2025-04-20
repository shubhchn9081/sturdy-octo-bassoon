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
    <div className="flex h-screen overflow-hidden" style={{ boxSizing: 'border-box', margin: 0, padding: 0 }}>
      {/* Apply auto-animate ref to the parent container without any margin/spacing */}
      <div 
        ref={animationParent} 
        className={`flex h-full transition-all duration-300 ease-out ${sidebarClass} sidebar-container`}
        style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}
      >
        {collapsed ? <CollapsedSidebar /> : <Sidebar />}
      </div>
      {/* Content area with no padding/margin and tight to sidebar */}
      <div className="flex-1 flex flex-col overflow-y-auto sidebar-content"
           style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
