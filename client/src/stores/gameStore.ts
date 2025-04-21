import { create } from 'zustand';
import { Game } from '@/types';

interface GameStore {
  games: Game[];
  setGames: (games: Game[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  games: [],
  setGames: (games) => set({ games }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
}));