import React from 'react';
import PlaceholderPage from './placeholder-page';
import { DollarSign } from 'lucide-react';

export default function BetsPage() {
  return (
    <PlaceholderPage 
      title="My Bets" 
      description="View your betting history and results"
      icon={<DollarSign className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}