import React, { ReactNode } from 'react';
import Header from './Header';
import AnimatedSidebar from './AnimatedSidebar';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatedSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
