import React, { ReactNode } from 'react';
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

  return (
    <div className="flex h-screen overflow-hidden">
      {collapsed ? <CollapsedSidebar /> : <Sidebar />}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
