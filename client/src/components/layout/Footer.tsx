import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F1923] text-gray-400 py-6 border-t border-[#243442]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} Stake.com - All rights reserved
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm hover:text-white transition-colors">
              Responsible Gambling
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;