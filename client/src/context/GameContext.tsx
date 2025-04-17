import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type Game = {
  id: number;
  name: string;
  slug: string;
  type: string;
  activePlayers: number;
  rtp: number;
  maxMultiplier: number;
  minBet: number;
  maxBet: number;
};

type GameContextType = {
  selectedGame: Game | null;
  selectGame: (game: Game) => void;
  setBetAmount: (amount: number) => void;
  betAmount: number;
  gameHistory: any[];
  isLoading: boolean;
  gamesList: Game[];
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0.00000001);

  // Fetch list of games
  const { data: gamesList = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  // Fetch game history if a game is selected
  const { data: gameHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/bets/history', selectedGame?.id],
    enabled: !!selectedGame,
  });

  const selectGame = (game: Game) => {
    setSelectedGame(game);
  };

  return (
    <GameContext.Provider
      value={{
        selectedGame,
        selectGame,
        setBetAmount,
        betAmount,
        gameHistory,
        isLoading: gamesLoading || historyLoading,
        gamesList
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
