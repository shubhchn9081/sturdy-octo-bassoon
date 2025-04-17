import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type CategoryButtonProps = {
  href: string;
  icon: LucideIcon;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
};

const CategoryButton = ({
  href,
  icon: Icon,
  active = false,
  children,
  className
}: CategoryButtonProps) => {
  return (
    <div 
      className={cn(
        "bg-secondary rounded-full px-4 py-2 text-foreground flex items-center transition-colors cursor-pointer",
        active && "bg-accent text-accent-foreground", 
        className
      )}
      onClick={() => window.location.href = href}
    >
      <Icon className="h-5 w-5 mr-2" />
      {children}
    </div>
  );
};

export default CategoryButton;
