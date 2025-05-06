import React from 'react';
import PlaceholderPage from './placeholder-page';
import { Share2 } from 'lucide-react';

export default function AffiliatePage() {
  return (
    <PlaceholderPage 
      title="Affiliate Program" 
      description="Earn rewards by referring friends to Novito"
      icon={<Share2 className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}