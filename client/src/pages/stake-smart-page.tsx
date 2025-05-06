import React from 'react';
import PlaceholderPage from './placeholder-page';
import { Shield } from 'lucide-react';

export default function StakeSmartPage() {
  return (
    <PlaceholderPage 
      title="Novito Smart" 
      description="Tools for responsible gambling and self-control"
      icon={<Shield className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}