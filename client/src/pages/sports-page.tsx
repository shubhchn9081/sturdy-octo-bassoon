import React, { useEffect, useState } from 'react';
import { useSportsBettingStore } from '@/stores/sportsBettingStore';
import { webSocketService } from '@/lib/websocket-service';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Star, 
  TrendingUp, 
  ChevronRight, 
  Search, 
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import SportsEventCard from '@/components/sports/SportsEventCard';
import BetSlip from '@/components/sports/BetSlip';
import SportsCategorySelector from '@/components/sports/SportsCategorySelector';
import SportsFilterBar from '@/components/sports/SportsFilterBar';

const SportsPage = () => {
  const { 
    sportsCategories, 
    activeCategory, 
    setActiveCategory, 
    loadSportsData, 
    featuredEvents, 
    liveEvents, 
    trendingEvents, 
    updateOdds,
    isLoading,
    error
  } = useSportsBettingStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('live');
  const [isConnected, setIsConnected] = useState(false);
  const [betSlipVisible, setBetSlipVisible] = useState(false);
  
  // Connect to WebSocket on component mount
  useEffect(() => {
    const connectToWebSocket = async () => {
      try {
        await webSocketService.connect();
        setIsConnected(true);
        
        // Subscribe to all odds updates
        webSocketService.subscribe('sports.odds.all', handleOddsUpdate);
        
        // Subscribe to events for the active category
        if (activeCategory) {
          webSocketService.subscribe(`odds.${activeCategory}`, handleOddsUpdate);
        }
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      }
    };
    
    connectToWebSocket();
    
    // Load initial sports data
    loadSportsData();
    
    // Cleanup on unmount
    return () => {
      webSocketService.unsubscribe('sports.odds.all', handleOddsUpdate);
      if (activeCategory) {
        webSocketService.unsubscribe(`odds.${activeCategory}`, handleOddsUpdate);
      }
      webSocketService.disconnect();
    };
  }, []);
  
  // Update subscription when active category changes
  useEffect(() => {
    if (isConnected && activeCategory) {
      // Unsubscribe from all category-specific topics
      sportsCategories.forEach(category => {
        webSocketService.unsubscribe(`odds.${category.id}`, handleOddsUpdate);
      });
      
      // Subscribe to new active category
      webSocketService.subscribe(`odds.${activeCategory}`, handleOddsUpdate);
    }
  }, [activeCategory, isConnected, sportsCategories]);
  
  // Handle odds updates from WebSocket
  const handleOddsUpdate = (data: any) => {
    const { sportId, eventId, marketId, outcomeId, odds } = data;
    updateOdds(sportId, eventId, marketId, outcomeId, odds);
  };
  
  // Filter events based on search and active category
  const getFilteredEvents = () => {
    const categoryEvents = activeCategory 
      ? sportsCategories.find(cat => cat.id === activeCategory)?.events || []
      : sportsCategories.flatMap(cat => cat.events);
    
    const filteredBySearch = searchQuery
      ? categoryEvents.filter(event => 
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.leagueName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : categoryEvents;
    
    if (selectedTab === 'live') {
      return filteredBySearch.filter(event => event.status === 'live');
    } else if (selectedTab === 'upcoming') {
      return filteredBySearch.filter(event => event.status === 'upcoming');
    } else if (selectedTab === 'featured') {
      return filteredBySearch.filter(event => event.isFeatured);
    }
    
    return filteredBySearch;
  };
  
  const filteredEvents = getFilteredEvents();
  
  return (
    <main className="flex-1 flex flex-col h-full">
      <div className="p-4 flex items-center justify-between bg-[#172B3A] border-b border-[#243B4D]">
        <h1 className="text-xl font-semibold text-white">Sports</h1>
        
        {/* Connection status indicator */}
        <div className="flex items-center">
          {isConnected ? (
            <div className="flex items-center text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Live
            </div>
          ) : (
            <div className="flex items-center text-red-400 text-sm">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              Offline
            </div>
          )}
        </div>
      </div>
      
      {/* Sports categories selector (horizontal scroll) */}
      <SportsCategorySelector 
        categories={sportsCategories} 
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      
      <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-9 bg-[#172B3A] border-[#243B4D] text-white"
              placeholder="Search events, teams, leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Tab selection */}
          <Tabs defaultValue="live" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="w-full mb-4 bg-[#172B3A]">
              <TabsTrigger value="live" className="flex-1">
                <Activity className="h-4 w-4 mr-2" />
                Live
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1">
                <Clock className="h-4 w-4 mr-2" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
            </TabsList>
            
            {/* Shared content for all tabs */}
            <TabsContent value="live" className="mt-0">
              <SportsFilterBar />
              
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64 text-red-500">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <span>{error}</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="rounded-full bg-[#172B3A] p-3 mb-3">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <p>No events found</p>
                  {searchQuery && (
                    <p className="text-sm mt-2">Try adjusting your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <SportsEventCard 
                      key={event.id} 
                      event={event} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
              <SportsFilterBar />
              
              {/* Similar content structure as "live" tab */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <SportsEventCard 
                      key={event.id} 
                      event={event}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="featured" className="mt-0">
              <SportsFilterBar />
              
              {/* Similar content structure as "live" tab */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <SportsEventCard 
                      key={event.id} 
                      event={event}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <SportsFilterBar />
              
              {/* Similar content structure as "live" tab */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <SportsEventCard 
                      key={event.id} 
                      event={event}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Bet slip (visible on larger screens or when toggled on mobile) */}
        <div className={`${betSlipVisible ? 'block' : 'hidden md:block'} w-full md:w-80 bg-[#172B3A] border-l border-[#243B4D] overflow-auto`}>
          <BetSlip onClose={() => setBetSlipVisible(false)} />
        </div>
      </div>
      
      {/* Mobile bet slip toggle */}
      <div className="md:hidden fixed bottom-16 right-4">
        <Button 
          className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => setBetSlipVisible(!betSlipVisible)}
        >
          {betSlipVisible ? <X className="h-6 w-6" /> : (
            <div className="relative">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                3
              </div>
            </div>
          )}
        </Button>
      </div>
    </main>
  );
};

export default SportsPage;