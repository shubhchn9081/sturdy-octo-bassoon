import React, { useEffect, useState } from 'react';
import { useRoute, useLocation, Redirect } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { GAMES, getGameBySlug } from '@/games';
import { useAuth } from '@/hooks/use-auth';
import { saveIntendedRoute } from '@/lib/auth-redirect';
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
import CrashCar from '@/games/CrashCar';
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
  'rocket-launch': RocketLaunchRevised,
  'crash-car': CrashCar
};

const GamePage = () => {
  const [normalMatch, normalParams] = useRoute<{ gameSlug: string }>('/games/:gameSlug');
  const [casinoMatch, casinoParams] = useRoute<{ gameSlug: string }>('/casino/games/:gameSlug');
  
  const match = normalMatch || casinoMatch;
  const params = normalMatch ? normalParams : casinoParams;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  // If there's no match or params, return early
  if (!match || !params) {
    return null;
  }
  
  const { gameSlug } = params;
  const GameComponent = GameComponents[gameSlug];
  
  // Handle game not found
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
  
  // Get the game from the slug
  const game = getGameBySlug(gameSlug);
  
  // Handle no matching game
  if (!game) {
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
  
  // Update document title
  // This effect runs once when the component mounts
  React.useEffect(() => {
    document.title = `${game.name} - Novito`;
    return () => {
      document.title = 'Novito Instant Casino';
    };
  }, [game]);
  
  // Handle authentication redirect
  // This effect runs when auth state changes
  React.useEffect(() => {
    if (!authLoading && !user) {
      // Save intended destination and redirect to login
      const gamePath = normalMatch ? `/games/${gameSlug}` : `/casino/games/${gameSlug}`;
      saveIntendedRoute(gamePath);
      setLocation('/auth');
    }
  }, [user, authLoading, gameSlug, normalMatch, setLocation]);
  
  // If still loading auth or user is not authenticated, show nothing
  // The redirect effect above will handle navigation
  if (authLoading || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-secondary rounded-lg p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Once we know the user is authenticated, check game access
  // Access check query
  const { isLoading: accessCheckLoading, data: accessData } = useQuery({
    queryKey: ['/api/games/check-access', game.id],
    queryFn: async () => {
      console.log(`Checking access for game with ID: ${game.id}`);
      const response = await fetch(`/api/games/${game.id}/check-access`);
      
      if (!response.ok) {
        console.error(`Access check API returned status: ${response.status}`);
        throw new Error('Failed to check game access');
      }
      
      const data = await response.json();
      console.log(`Access check returned: ${JSON.stringify(data)}`);
      return data;
    },
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });
  
  // Show loading while checking access
  if (accessCheckLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-secondary rounded-lg p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking game access...</p>
        </div>
      </div>
    );
  }
  
  // If access check is complete but access is denied
  if (accessData && !accessData.hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-secondary rounded-lg p-6 text-center">
          <h1 className="text-2xl mb-4 text-primary">Locked Game</h1>
          <p className="text-lg mb-3">Looks like you've been locked out of the fun zone 😅</p>
          <p>Don't worry — the game will be available to you soon. Sit tight, champ! 🎮✨</p>
          <button 
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-opacity-90 transition-all"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  // If we get here, the user is authenticated and has access to the game
  return (
    <div className="w-full h-full ml-0">
      <GameComponent />
    </div>
  );
};

export default GamePage;
