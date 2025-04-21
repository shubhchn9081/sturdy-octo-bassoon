import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { useSportsBettingStore, type Event, type Outcome } from '@/stores/sportsBettingStore';

interface SportsEventCardProps {
  event: Event;
}

const SportsEventCard: React.FC<SportsEventCardProps> = ({ event }) => {
  const { addToBetSlip } = useSportsBettingStore();
  
  // Format event time
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle odds selection
  const handleSelectOdds = (outcome: Outcome, marketName: string) => {
    addToBetSlip({
      eventId: event.id,
      marketId: outcome.id.split('-')[0].replace('outcome', 'market'),
      outcomeId: outcome.id,
      odds: outcome.odds,
      name: outcome.name,
      eventName: event.name,
      marketName: marketName
    });
  };
  
  // Generate a team score display for live events
  const renderScores = () => {
    if (event.status !== 'live' || event.homeScore === null || event.awayScore === null) {
      return null;
    }
    
    return (
      <div className="flex items-center justify-center bg-[#1a3347] px-2 py-1 rounded">
        <span className="text-white font-bold">{event.homeScore}</span>
        <span className="mx-1 text-gray-400">-</span>
        <span className="text-white font-bold">{event.awayScore}</span>
      </div>
    );
  };
  
  // Render outcome button with odds
  const renderOutcomeButton = (outcome: Outcome) => {
    // Calculate color based on odds change direction
    let changeIndicator = null;
    if (outcome.previousOdds !== null) {
      if (outcome.odds > outcome.previousOdds) {
        changeIndicator = <ArrowUp className="h-3 w-3 text-green-500 ml-1" />;
      } else if (outcome.odds < outcome.previousOdds) {
        changeIndicator = <ArrowDown className="h-3 w-3 text-red-500 ml-1" />;
      }
    }
    
    const isChanging = Date.now() - outcome.timestamp < 5000;
    
    return (
      <button 
        key={outcome.id}
        className={`flex-1 px-2 py-3 rounded bg-[#243B4D] hover:bg-[#2A445A] transition-all duration-200 flex flex-col items-center justify-center ${isChanging ? 'animate-pulse' : ''}`}
        onClick={() => handleSelectOdds(outcome, event.markets[0].name)}
        disabled={outcome.isLocked}
      >
        <div className="text-xs text-gray-300 mb-1">{outcome.name}</div>
        <div className="flex items-center">
          <span className="font-bold text-white">{outcome.odds.toFixed(2)}</span>
          {changeIndicator}
        </div>
      </button>
    );
  };
  
  // Get main market (usually Match Winner or 1X2)
  const mainMarket = event.markets[0];
  
  return (
    <Card className="overflow-hidden bg-[#0F212E] border-[#203343] hover:border-[#2A445A] transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {/* League name */}
            <span className="text-xs text-gray-400 mr-2">
              {event.leagueName}
            </span>
            
            {/* Status indicator */}
            {event.status === 'live' ? (
              <Badge variant="secondary" className="bg-red-900/30 text-red-400 flex items-center text-xs">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatEventTime(event.startTime)}
              </Badge>
            )}
          </div>
          
          {renderScores()}
        </div>
        
        {/* Event name/teams */}
        <div className="mb-3">
          <h3 className="font-medium text-white">{event.homeTeam} vs {event.awayTeam}</h3>
        </div>
        
        {/* Main betting market outcomes */}
        <div className="flex gap-2">
          {mainMarket.outcomes.map(outcome => renderOutcomeButton(outcome))}
        </div>
        
        {/* More markets link */}
        <div className="mt-2 text-right">
          <button className="flex items-center text-xs text-blue-400 hover:text-blue-300 ml-auto">
            +{event.markets.length - 1} more markets
            <ChevronRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SportsEventCard;