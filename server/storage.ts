import { 
  users, 
  type User, 
  type InsertUser, 
  games, 
  type Game, 
  bets, 
  type Bet, 
  type InsertBet 
} from "@shared/schema";
import { GAMES } from "../client/src/games";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, newBalance: number): Promise<User | undefined>;
  
  // Game methods
  getGame(id: number): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  
  // Bet methods
  getBet(id: number): Promise<Bet | undefined>;
  createBet(bet: InsertBet & { serverSeed: string; nonce: number; outcome: any; }): Promise<Bet>;
  updateBet(id: number, bet: Bet): Promise<Bet>;
  getBetHistory(userId: number, gameId?: number): Promise<Bet[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private bets: Map<number, Bet>;
  
  private userIdCounter: number;
  private betIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.bets = new Map();
    
    this.userIdCounter = 1;
    this.betIdCounter = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      password: "hashed_password", // In a real app, this would be hashed
      balance: 1000,
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    
    // Initialize games from the frontend list
    GAMES.forEach(game => {
      const gameRecord: Game = {
        id: game.id,
        name: game.name,
        slug: game.slug,
        type: game.type,
        activePlayers: game.activePlayers || Math.floor(Math.random() * 10000),
        rtp: game.rtp || 99,
        maxMultiplier: game.maxMultiplier || 1000,
        minBet: game.minBet || 0.00000001,
        maxBet: game.maxBet || 100
      };
      this.games.set(gameRecord.id, gameRecord);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 1000, // Default starting balance
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(id: number, newBalance: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Game methods
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  // Bet methods
  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }
  
  async createBet(bet: InsertBet & { serverSeed: string; nonce: number; outcome: any; }): Promise<Bet> {
    const id = this.betIdCounter++;
    const newBet: Bet = {
      ...bet,
      id,
      multiplier: null,
      profit: null,
      completed: false,
      createdAt: new Date()
    };
    this.bets.set(id, newBet);
    return newBet;
  }
  
  async updateBet(id: number, bet: Bet): Promise<Bet> {
    this.bets.set(id, bet);
    return bet;
  }
  
  async getBetHistory(userId: number, gameId?: number): Promise<Bet[]> {
    const userBets = Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (gameId) {
      return userBets.filter(bet => bet.gameId === gameId);
    }
    
    return userBets;
  }
}

export const storage = new MemStorage();
