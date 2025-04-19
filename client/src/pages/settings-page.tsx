import React from 'react';
import PlaceholderPage from './placeholder-page';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <PlaceholderPage 
      title="Account Settings" 
      description="Manage your account preferences and security"
      icon={<Settings className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}