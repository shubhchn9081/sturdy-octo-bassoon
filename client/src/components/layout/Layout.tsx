import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CollapsedSidebar from './CollapsedSidebar';
import Footer from './Footer';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

type LayoutProps = {
  children: ReactNode;
};

const LayoutContent = ({ children }: LayoutProps) => {
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

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <LayoutContent children={children} />
    </SidebarProvider>
  );
};

export default Layout;
