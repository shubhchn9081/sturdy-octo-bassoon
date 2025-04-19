import React from 'react';
import PlaceholderPage from './placeholder-page';
import { Trophy } from 'lucide-react';

export default function VIPPage() {
  return (
    <PlaceholderPage 
      title="VIP Program" 
      description="Exclusive rewards and perks for our most valued players"
      icon={<Trophy className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}