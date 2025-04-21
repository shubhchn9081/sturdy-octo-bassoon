import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type SportCategory } from '@/stores/sportsBettingStore';

interface SportsCategorySelectorProps {
  categories: SportCategory[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

const SportsCategorySelector: React.FC<SportsCategorySelectorProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle horizontal scrolling
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 200; // Adjust based on your design
      
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };
  
  // Get appropriate icon for each sport
  const getSportIcon = (sportId: string) => {
    switch (sportId) {
      case 'soccer':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8l4 4-4 4-4-4 4-4z" />
          </svg>
        );
      case 'basketball':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M4.93 4.93l14.14 14.14" />
            <path d="M19.07 4.93l-14.14 14.14" />
          </svg>
        );
      case 'tennis':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20" />
            <path d="M2 12h20" />
          </svg>
        );
      case 'cricket':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M2 12h20" />
            <path d="M12 18l-8-8" />
          </svg>
        );
      case 'american-football':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9h12l-3 9H9z" />
            <path d="M5.05 3.05l.95.95" />
            <path d="M19.05 3.05l-.95.95" />
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          </svg>
        );
      case 'baseball':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            <line x1="6" y1="16" x2="6.01" y2="16" />
            <line x1="10" y1="16" x2="10.01" y2="16" />
          </svg>
        );
      case 'ice-hockey':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2l-5 5.5 3.5 3.5 5-5.5L8 2Z" />
            <path d="M14.5 7.5 16 6l5.5 5.5-1.5 1.5-5.5-5.5Z" />
            <path d="M6 12.5 9.5 16l1-1 2-2-4-4-2.5 3.5Z" />
            <path d="M11.5 15 14 12.5 19 17.5 16.5 20l-5-5Z" />
            <path d="M4 22a4 4 0 0 1 1.5-3" />
            <path d="M9 22a4 4 0 0 0-1.5-3" />
            <path d="M15 22a4 4 0 0 1 1.5-3" />
            <path d="M20 22a4 4 0 0 0-1.5-3" />
          </svg>
        );
      case 'esports':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="8" y1="10" x2="8" y2="14" />
            <circle cx="16" cy="12" r="2" />
            <circle cx="19" cy="10" r="1" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
        );
    }
  };
  
  return (
    <div className="relative py-2 px-1 bg-[#172B3A] border-b border-[#243B4D]">
      {/* Scroll left button */}
      <button 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#0F212E] hover:bg-[#1a3347] p-1 rounded-full z-10 shadow-md"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      
      {/* Scrollable categories */}
      <div 
        className="flex space-x-2 overflow-x-auto hide-scrollbar py-1 px-8"
        ref={scrollContainerRef}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            className={`
              flex flex-col items-center justify-center px-4 py-2 rounded 
              transition-colors duration-200 whitespace-nowrap
              ${activeCategory === category.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#243B4D] text-gray-300 hover:bg-[#2A445A]'
              }
            `}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="h-5 w-5 mb-1">
              {getSportIcon(category.id)}
            </div>
            <span className="text-xs">{category.name}</span>
            {category.isActive && (
              <div className="w-1 h-1 bg-white rounded-full mt-1"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Scroll right button */}
      <button 
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#0F212E] hover:bg-[#1a3347] p-1 rounded-full z-10 shadow-md"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

export default SportsCategorySelector;