import { 
  users, 
  type User, 
  type InsertUser, 
  games, 
  type Game, 
  type InsertGame,
  bets, 
  type Bet, 
  type InsertBet 
} from "@shared/schema";
import { GAMES } from "../client/src/games";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Session management
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, newBalance: number): Promise<User | undefined>;
  
  // Game methods
  getGame(id: number): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGameImage(id: number, imageUrl: string): Promise<Game | undefined>;
  
  // Bet methods
  getBet(id: number): Promise<Bet | undefined>;
  createBet(bet: InsertBet & { 
    serverSeed: string; 
    nonce: number; 
    outcome: any;
    completed?: boolean;
  }): Promise<Bet>;
  updateBet(id: number, bet: Bet): Promise<Bet>;
  getBetHistory(userId: number, gameId?: number): Promise<Bet[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private bets: Map<number, Bet>;
  
  private userIdCounter: number;
  private betIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.bets = new Map();
    
    this.userIdCounter = 1;
    this.betIdCounter = 1;
    
    // Create a memory store for session management
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    
    // Initialize with demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      password: "demo123456", // In a real app, this would be hashed
      balance: 1000,
      dateOfBirth: new Date("1990-01-01"),
      phone: null,
      referralCode: null,
      language: "English",
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
        maxBet: game.maxBet || 100,
        imageUrl: null
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      balance: 1000, // Default starting balance
      dateOfBirth: insertUser.dateOfBirth || new Date(),
      phone: insertUser.phone || null,
      referralCode: insertUser.referralCode || null,
      language: insertUser.language || "English",
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
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    // Get highest ID to increment
    const gameIds = Array.from(this.games.keys());
    const nextId = gameIds.length > 0 ? Math.max(...gameIds) + 1 : 1;
    
    const game: Game = {
      ...insertGame,
      id: nextId,
      activePlayers: insertGame.activePlayers || 0,
      imageUrl: insertGame.imageUrl || null,
    };
    
    this.games.set(nextId, game);
    return game;
  }
  
  async updateGameImage(id: number, imageUrl: string): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, imageUrl };
    this.games.set(id, updatedGame);
    return updatedGame;
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

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, newBalance: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games);
  }
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async updateGameImage(id: number, imageUrl: string): Promise<Game | undefined> {
    const [game] = await db
      .update(games)
      .set({ imageUrl })
      .where(eq(games.id, id))
      .returning();
    return game || undefined;
  }

  async getBet(id: number): Promise<Bet | undefined> {
    const [bet] = await db.select().from(bets).where(eq(bets.id, id));
    return bet || undefined;
  }

  async createBet(bet: InsertBet & { serverSeed: string; nonce: number; outcome: any; }): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values(bet)
      .returning();
    return newBet;
  }

  async updateBet(id: number, bet: Bet): Promise<Bet> {
    const [updatedBet] = await db
      .update(bets)
      .set(bet)
      .where(eq(bets.id, id))
      .returning();
    return updatedBet;
  }

  async getBetHistory(userId: number, gameId?: number): Promise<Bet[]> {
    if (gameId) {
      return await db.select()
        .from(bets)
        .where(
          and(
            eq(bets.userId, userId),
            eq(bets.gameId, gameId)
          )
        )
        .orderBy(desc(bets.createdAt));
    } else {
      return await db.select()
        .from(bets)
        .where(eq(bets.userId, userId))
        .orderBy(desc(bets.createdAt));
    }
  }
}

// Create an instance of MemStorage as a fallback in case the DB setup isn't complete
const memStorage = new MemStorage();

// Use DatabaseStorage if we have a DB connection, otherwise use MemStorage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : memStorage;
