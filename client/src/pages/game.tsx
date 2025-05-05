import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
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
import CupAndBall from '@/games/CupAndBall';
import TowerClimb from '@/games/TowerClimb';
import RocketLaunchRevised from '@/games/RocketLaunchRevised';
import GalacticSpins from '@/games/GalacticSpins';


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
  'cup-and-ball': CupAndBall,
  'tower-climb': TowerClimb,
  'rocket-launch': RocketLaunchRevised,
  'galactic-spins': GalacticSpins
};

const GamePage = () => {
  const [normalMatch, normalParams] = useRoute<{ gameSlug: string }>('/games/:gameSlug');
  const [casinoMatch, casinoParams] = useRoute<{ gameSlug: string }>('/casino/games/:gameSlug');
  
  const match = normalMatch || casinoMatch;
  const params = normalMatch ? normalParams : casinoParams;
  const [_, setLocation] = useLocation();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  
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
    document.title = `${game.name} - Stake.com`;
    
    return () => {
      document.title = 'Stake.com';
    };
  }, [match, params, setLocation]);
  
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
  
  return (
    <div className="w-full h-full ml-0">
      {currentGame && <GameComponent />}
    </div>
  );
};

export default GamePage;
