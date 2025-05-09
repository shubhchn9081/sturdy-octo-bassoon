import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { GAMES, getGameBySlug } from '@/games';
import Layout from '@/components/layout/Layout';
import Dice from '@/games/Dice';
import Mines from '@/games/Mines';
import CricketMines from '@/games/CricketMines';
import Plinko from '@/games/Plinko';
import CrashFinal from '@/games/CrashFinal';
import LimboFinal from '@/games/LimboFinal';
import Keno from '@/games/Keno';
import Wheel from '@/games/Wheel';
import Slots from '@/games/Slots';
// CupAndBall has been removed in favor of NewCupAndBall
import NewCupAndBall from '@/games/NewCupAndBall';
import TowerClimb from '@/games/TowerClimb';
import RocketLaunchRevised from '@/games/RocketLaunchRevised';
import { useToast } from '@/hooks/use-toast';


type Game = typeof GAMES[0];

const GameComponents: Record<string, React.ComponentType> = {
  dice: Dice,
  mines: Mines,
  'cricket-mines': CricketMines,
  plinko: Plinko,
  crash: CrashFinal,
  limbo: LimboFinal,
  keno: Keno,
  wheel: Wheel,
  slots: Slots,
  'cup-and-ball': NewCupAndBall, // Now using the new implementation for both routes
  'new-cup-game': NewCupAndBall,
  'tower-climb': TowerClimb,
  'rocket-launch': RocketLaunchRevised
};

const GamePage = () => {
  const [normalMatch, normalParams] = useRoute<{ gameSlug: string }>('/games/:gameSlug');
  const [casinoMatch, casinoParams] = useRoute<{ gameSlug: string }>('/casino/games/:gameSlug');
  
  const match = normalMatch || casinoMatch;
  const params = normalMatch ? normalParams : casinoParams;
  const [_, setLocation] = useLocation();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const { toast } = useToast();
  
  // State for game access
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessCheckComplete, setAccessCheckComplete] = useState<boolean>(false);
  
  useEffect(() => {
    if (!match || !params) return;
    
    const game = getGameBySlug(params.gameSlug);
    if (!game) {
      setLocation('/');
      return;
    }
    
    // Set the selected game in the local state
    setCurrentGame(game);
    
    // Update document title
    document.title = `${game.name} - Novito`;
    
    return () => {
      document.title = 'Novito Instant Casino';
    };
  }, [match, params, setLocation]);
  
  // Check if the user has access to this game
  const { isLoading: accessCheckLoading } = useQuery({
    queryKey: ['/api/games/check-access', currentGame?.id],
    queryFn: async () => {
      if (!currentGame) return { hasAccess: false };
      
      try {
        const response = await fetch(`/api/games/${currentGame.id}/check-access`);
        if (!response.ok) {
          throw new Error('Failed to check game access');
        }
        const data = await response.json();
        setHasAccess(data.hasAccess);
        setAccessCheckComplete(true);
        return data;
      } catch (error) {
        console.error('Error checking game access:', error);
        setHasAccess(false);
        setAccessCheckComplete(true);
        return { hasAccess: false };
      }
    },
    enabled: !!currentGame,
    retry: false
  });
  
  if (!match || !params) {
    return null;
  }
  
  const { gameSlug } = params;
  const GameComponent = GameComponents[gameSlug];
  
  if (!GameComponent) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-secondary rounded-lg p-6 text-center">
          <h1 className="text-2xl mb-4">Game Not Found</h1>
          <p>The game you're looking for does not exist or is not available.</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Display access denied message if the user doesn't have access
  if (accessCheckComplete && hasAccess === false) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-secondary rounded-lg p-6 text-center">
          <h1 className="text-2xl mb-4 text-red-500">Access Denied</h1>
          <p>This game is not accessible to you. Please contact an administrator if you believe this is an error.</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state while checking access
  if (!accessCheckComplete && currentGame) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-secondary rounded-lg p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking game access...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full ml-0">
      {currentGame && <GameComponent />}
    </div>
  );
};

export default GamePage;
