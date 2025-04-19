import React from 'react';
import PlaceholderPage from './placeholder-page';
import { ListOrdered } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <PlaceholderPage 
      title="Transactions" 
      description="View your deposit and withdrawal history"
      icon={<ListOrdered className="h-6 w-6 text-[#1375e1]" />}
    />
  );
}