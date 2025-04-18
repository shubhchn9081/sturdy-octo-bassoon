import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link href="/">
        <Button className="bg-[#3498db] hover:bg-[#2980b9] text-white">
          Return to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;