import React from 'react';
import PlaceholderPage from './placeholder-page';
import { BarChart2 } from 'lucide-react';

export default function StatisticsPage() {
  return (
    <PlaceholderPage 
      title="Statistics" 
      description="Track your gaming performance and history"
      icon={<BarChart2 className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}