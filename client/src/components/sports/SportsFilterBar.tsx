import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SportsFilterBar: React.FC = () => {
  const [sortBy, setSortBy] = useState<string>('popular');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const handleSort = (value: string) => {
    setSortBy(value);
  };
  
  const handleFilterToggle = (value: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  
  return (
    <div className="flex justify-between mb-4 overflow-x-auto hide-scrollbar">
      <div className="flex space-x-2">
        {/* Match Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 px-3 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]">
              <Filter className="h-3 w-3 mr-2" />
              Match Type
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#172B3A] border-[#34516A] text-white">
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('pre-match')}
              onCheckedChange={() => handleFilterToggle('pre-match')}
            >
              Pre-match
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('live')}
              onCheckedChange={() => handleFilterToggle('live')}
            >
              Live
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('upcoming')}
              onCheckedChange={() => handleFilterToggle('upcoming')}
            >
              Upcoming
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Tournament Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 px-3 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]">
              <Filter className="h-3 w-3 mr-2" />
              Tournament
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#172B3A] border-[#34516A] text-white">
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('champions-league')}
              onCheckedChange={() => handleFilterToggle('champions-league')}
            >
              Champions League
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('premier-league')}
              onCheckedChange={() => handleFilterToggle('premier-league')}
            >
              Premier League
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('nba')}
              onCheckedChange={() => handleFilterToggle('nba')}
            >
              NBA
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={activeFilters.includes('atp-masters')}
              onCheckedChange={() => handleFilterToggle('atp-masters')}
            >
              ATP Masters
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 px-3 text-xs bg-[#243B4D] border-[#34516A] text-gray-300 hover:bg-[#2A445A]">
            Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#172B3A] border-[#34516A] text-white">
          <DropdownMenuCheckboxItem 
            checked={sortBy === 'popular'}
            onCheckedChange={() => handleSort('popular')}
          >
            Popular
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={sortBy === 'a-z'}
            onCheckedChange={() => handleSort('a-z')}
          >
            A-Z
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem 
            checked={sortBy === 'start-time'}
            onCheckedChange={() => handleSort('start-time')}
          >
            Start Time
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SportsFilterBar;