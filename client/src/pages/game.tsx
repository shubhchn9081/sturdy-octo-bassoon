import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { GAMES, getGameBySlug } from '@/games';
import Layout from '@/components/layout/Layout';
import Dice from '@/games/Dice';
import Mines from '@/games/Mines';
import Plinko from '@/games/Plinko';
import Crash from '@/games/CrashFinal';
import Limbo from '@/games/LimboFinal';
import DragonTower from '@/games/DragonTower';
import BlueSamurai from '@/games/BlueSamurai';
import Pump from '@/games/Pump';
import Hilo from '@/games/Hilo';
import { useGame } from '@/context/GameContext';

type Game = typeof GAMES[0];

const GameComponents: Record<string, React.ComponentType> = {
  dice: Dice,
  mines: Mines,
  plinko: Plinko,
  crash: Crash,
  limbo: Limbo,
  'dragon-tower': DragonTower,
  'blue-samurai': BlueSamurai,
  pump: Pump,
  hilo: Hilo,
};

const GamePage = () => {
  const [normalMatch, normalParams] = useRoute<{ gameSlug: string }>('/games/:gameSlug');
  const [casinoMatch, casinoParams] = useRoute<{ gameSlug: string }>('/casino/games/:gameSlug');
  
  const match = normalMatch || casinoMatch;
  const params = normalMatch ? normalParams : casinoParams;
  const [_, setLocation] = useLocation();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  
  // Use the GameContext
  const { selectGame } = useGame();
  
  useEffect(() => {
    if (!match || !params) return;
    
    const game = getGameBySlug(params.gameSlug);
    if (!game) {
      setLocation('/');
      return;
    }
    
    // Set the selected game in the local state
    setCurrentGame(game);
    
    // Set the selected game in the context
    selectGame(game);
    
    // Update document title
    document.title = `${game.name} - Stake.com`;
    
    return () => {
      document.title = 'Stake.com';
    };
  }, [match, params, setLocation, selectGame]);
  
  if (!match || !params) {
    return null;
  }
  
  const { gameSlug } = params;
  const GameComponent = GameComponents[gameSlug];
  
  if (!GameComponent) {
    return (
      <Layout>
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
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="w-full h-full">
        {currentGame && <GameComponent />}
      </div>
    </Layout>
  );
};

export default GamePage;
