export interface Game {
  id: number;
  name: string;
  slug: string;
  type: string;
  activePlayers: number;
  color: string;
  iconType: string;
  maxMultiplier?: number;
  imageUrl?: string;
}