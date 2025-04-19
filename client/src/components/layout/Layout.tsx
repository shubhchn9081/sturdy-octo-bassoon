import React, { ReactNode } from 'react';
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
    <div className="flex h-screen overflow-hidden bg-[#0F212E]">
      {/* Apply auto-animate ref to the parent container */}
      <div 
        ref={animationParent} 
        className={`flex h-full transition-all duration-300 ease-out ${sidebarClass}`}
      >
        {collapsed ? <CollapsedSidebar /> : <Sidebar />}
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
