import React from 'react';
import PlaceholderPage from './placeholder-page';
import { Headphones } from 'lucide-react';

export default function SupportPage() {
  return (
    <PlaceholderPage 
      title="Live Support" 
      description="Get help from our 24/7 customer support team"
      icon={<Headphones className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}