import { 
  users, 
  type User, 
  type InsertUser, 
  games, 
  type Game, 
  type InsertGame,
  bets, 
  type Bet, 
  type InsertBet,
  transactions,
  type Transaction,
  type InsertTransaction,
  gameSettings,
  type GameSettings,
  type InsertGameSettings,
  userGameControls,
  type UserGameControl,
  type InsertUserGameControl
} from "@shared/schema";
import { GAMES } from "../client/src/games";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { pool } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, currency: string, amount: number): Promise<User | undefined>;
  
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
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUserAdmin(id: number, isAdmin: boolean): Promise<User | undefined>;
  updateUserBanned(id: number, isBanned: boolean): Promise<User | undefined>;
  setUserBalance(id: number, currency: string, exactAmount: number): Promise<User | undefined>;
  updateAdminStatus(id: number, isAdmin: boolean): Promise<User | undefined>;
  
  // Game settings methods
  getGameSettings(gameId: number): Promise<GameSettings | undefined>;
  createGameSettings(settings: InsertGameSettings): Promise<GameSettings>;
  updateGameSettings(gameId: number, settings: Partial<GameSettings>): Promise<GameSettings | undefined>;
  getAllGameSettings(): Promise<GameSettings[]>;
  
  // User game control methods
  getUserGameControl(id: number): Promise<UserGameControl | undefined>;
  getUserGameControlByUserAndGame(userId: number, gameId: number): Promise<UserGameControl | undefined>;
  createUserGameControl(control: InsertUserGameControl): Promise<UserGameControl>;
  updateUserGameControl(id: number, control: Partial<UserGameControl>): Promise<UserGameControl | undefined>;
  deleteUserGameControl(id: number): Promise<boolean>;
  getAllUserGameControls(): Promise<UserGameControl[]>;
  getUserGameControls(userId: number): Promise<UserGameControl[]>;
  incrementUserGameControlCounter(id: number): Promise<UserGameControl | undefined>;
  resetAllUserGameControls(): Promise<boolean>;
  
  // Transaction management (admin)
  getTransactionsByStatus(status: string): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  getAllTransactions(limit?: number): Promise<Transaction[]>;
  getDepositTransactions(): Promise<Transaction[]>;
  getWithdrawalTransactions(): Promise<Transaction[]>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  private userGameControls: Map<number, UserGameControl>;
  private gameSettings: Map<number, GameSettings>;
  
  private userIdCounter: number;
  private betIdCounter: number;
  private transactionIdCounter: number;
  private userGameControlIdCounter: number;
  private gameSettingsIdCounter: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    this.userGameControls = new Map();
    this.gameSettings = new Map();
    
    this.userIdCounter = 1;
    this.betIdCounter = 1;
    this.transactionIdCounter = 1;
    this.userGameControlIdCounter = 1;
    this.gameSettingsIdCounter = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create a demo user
    const demoUser: User = {
      id: 1,
      username: "demo_user",
      password: "hashed_password", // In a real app, this would be hashed
      isAdmin: false,
      isBanned: false,
      balance: {
        BTC: 0.01,
        ETH: 0.1,
        USDT: 1000,
        INR: 75000
      },
      createdAt: new Date(),
      email: "demo@example.com",
      dateOfBirth: new Date("1990-01-01"),
      phone: "1234567890",
      referralCode: null,
      language: "English"
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create an admin user for admin panel access
    const adminUser: User = {
      id: 2,
      username: "admin",
      password: "admin_password", // In a real app, this would be hashed
      isAdmin: true,
      isBanned: false,
      balance: {
        BTC: 1.0,
        ETH: 10.0,
        USDT: 10000,
        INR: 750000
      },
      createdAt: new Date(),
      email: "admin@example.com",
      dateOfBirth: new Date("1985-01-01"),
      phone: "9876543210",
      referralCode: null,
      language: "English"
    };
    this.users.set(adminUser.id, adminUser);
    
    // Update user counter
    this.userIdCounter = 3;
    
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
      ...insertUser, 
      id, 
      isAdmin: false,
      isBanned: false,
      balance: {
        BTC: 0.01,
        ETH: 0.1,
        USDT: 1000,
        INR: 10000 // Lower amount for regular users
      },
      createdAt: new Date(),
      email: insertUser.email,
      dateOfBirth: new Date(insertUser.dateOfBirth),
      phone: insertUser.phone || null,
      referralCode: null,
      language: 'English'
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(id: number, currency: string, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Create a new balance object with the updated currency amount
    const newBalance = { ...user.balance };
    if (currency in newBalance) {
      newBalance[currency] += amount;
      if (newBalance[currency] < 0) newBalance[currency] = 0; // Don't allow negative balances
    }
    
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
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      currency: insertTransaction.currency || "BTC",
      txid: insertTransaction.txid || null,
      description: insertTransaction.description || null,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserAdmin(id: number, isAdmin: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isAdmin };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserBanned(id: number, isBanned: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isBanned };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async setUserBalance(id: number, currency: string, exactAmount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Create a new balance object with the updated currency amount
    const newBalance = { ...user.balance };
    if (currency in newBalance) {
      newBalance[currency] = exactAmount;
    }
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateAdminStatus(id: number, isAdmin: boolean): Promise<User | undefined> {
    // This is an alias for updateUserAdmin for backward compatibility
    return this.updateUserAdmin(id, isAdmin);
  }
  
  // Game settings methods
  async getGameSettings(gameId: number): Promise<GameSettings | undefined> {
    return Array.from(this.gameSettings.values()).find(
      (settings) => settings.gameId === gameId
    );
  }
  
  async createGameSettings(settings: InsertGameSettings): Promise<GameSettings> {
    const id = this.gameSettingsIdCounter++;
    const newSettings: GameSettings = {
      ...settings,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.gameSettings.set(id, newSettings);
    return newSettings;
  }
  
  async updateGameSettings(gameId: number, settings: Partial<GameSettings>): Promise<GameSettings | undefined> {
    const existingSettings = await this.getGameSettings(gameId);
    if (!existingSettings) return undefined;
    
    const updatedSettings = { 
      ...existingSettings, 
      ...settings,
      updatedAt: new Date()
    };
    
    this.gameSettings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
  
  async getAllGameSettings(): Promise<GameSettings[]> {
    return Array.from(this.gameSettings.values());
  }
  
  // User game control methods
  async getUserGameControl(id: number): Promise<UserGameControl | undefined> {
    return this.userGameControls.get(id);
  }
  
  async getUserGameControlByUserAndGame(userId: number, gameId: number): Promise<UserGameControl | undefined> {
    return Array.from(this.userGameControls.values()).find(
      control => control.userId === userId && control.gameId === gameId
    );
  }
  
  async createUserGameControl(control: InsertUserGameControl): Promise<UserGameControl> {
    // First, check if control already exists for this user and game
    const existingControl = await this.getUserGameControlByUserAndGame(control.userId, control.gameId);
    
    if (existingControl) {
      // Update the existing control instead of creating a new one
      return await this.updateUserGameControl(existingControl.id, {
        forceOutcome: control.forceOutcome,
        outcomeType: control.outcomeType,
        durationGames: control.durationGames,
        forcedOutcomeValue: control.forcedOutcomeValue,
        gamesPlayed: 0 // Reset games played counter
      }) as UserGameControl;
    }
    
    const id = this.userGameControlIdCounter++;
    const newControl: UserGameControl = {
      ...control,
      id,
      gamesPlayed: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.userGameControls.set(id, newControl);
    return newControl;
  }
  
  async updateUserGameControl(id: number, control: Partial<UserGameControl>): Promise<UserGameControl | undefined> {
    const existingControl = this.userGameControls.get(id);
    if (!existingControl) return undefined;
    
    const updatedControl: UserGameControl = {
      ...existingControl,
      ...control,
      updatedAt: new Date()
    };
    
    this.userGameControls.set(id, updatedControl);
    return updatedControl;
  }
  
  async deleteUserGameControl(id: number): Promise<boolean> {
    return this.userGameControls.delete(id);
  }
  
  async getAllUserGameControls(): Promise<UserGameControl[]> {
    return Array.from(this.userGameControls.values());
  }
  
  async getUserGameControls(userId: number): Promise<UserGameControl[]> {
    return Array.from(this.userGameControls.values())
      .filter(control => control.userId === userId);
  }
  
  async incrementUserGameControlCounter(id: number): Promise<UserGameControl | undefined> {
    const control = this.userGameControls.get(id);
    if (!control) return undefined;
    
    // Check if control has expired
    if (control.gamesPlayed >= control.durationGames) {
      // The control has already been used for the specified number of games
      this.userGameControls.delete(id);
      return undefined;
    }
    
    // Increment the counter
    const updatedControl: UserGameControl = {
      ...control,
      gamesPlayed: control.gamesPlayed + 1,
      updatedAt: new Date()
    };
    
    this.userGameControls.set(id, updatedControl);
    
    // If the updated control has now reached its limit, clean it up
    if (updatedControl.gamesPlayed >= updatedControl.durationGames) {
      this.userGameControls.delete(id);
    }
    
    return updatedControl;
  }
  
  async resetAllUserGameControls(): Promise<boolean> {
    this.userGameControls.clear();
    return true;
  }
  
  // Transaction management (admin)
  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = { ...transaction, status };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async getAllTransactions(limit: number = 100): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getDepositTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.type === "deposit")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getWithdrawalTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.type === "withdrawal")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User game control methods
  async getUserGameControl(id: number): Promise<UserGameControl | undefined> {
    const [control] = await db.select().from(userGameControls).where(eq(userGameControls.id, id));
    return control || undefined;
  }
  
  async getUserGameControlByUserAndGame(userId: number, gameId: number): Promise<UserGameControl | undefined> {
    const [control] = await db.select()
      .from(userGameControls)
      .where(
        and(
          eq(userGameControls.userId, userId),
          eq(userGameControls.gameId, gameId)
        )
      );
    return control || undefined;
  }
  
  async createUserGameControl(control: InsertUserGameControl): Promise<UserGameControl> {
    // First, check if control already exists for this user and game
    const existingControl = await this.getUserGameControlByUserAndGame(control.userId, control.gameId);
    
    if (existingControl) {
      // Update the existing control instead of creating a new one
      return await this.updateUserGameControl(existingControl.id, {
        forceOutcome: control.forceOutcome,
        outcomeType: control.outcomeType,
        durationGames: control.durationGames,
        forcedOutcomeValue: control.forcedOutcomeValue,
        gamesPlayed: 0 // Reset games played counter
      }) as UserGameControl;
    }
    
    const [newControl] = await db
      .insert(userGameControls)
      .values({
        ...control,
        gamesPlayed: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newControl;
  }
  
  async updateUserGameControl(id: number, control: Partial<UserGameControl>): Promise<UserGameControl | undefined> {
    const [updatedControl] = await db
      .update(userGameControls)
      .set({
        ...control,
        updatedAt: new Date()
      })
      .where(eq(userGameControls.id, id))
      .returning();
      
    return updatedControl || undefined;
  }
  
  async deleteUserGameControl(id: number): Promise<boolean> {
    const result = await db
      .delete(userGameControls)
      .where(eq(userGameControls.id, id))
      .returning({ deleted: userGameControls.id });
      
    return result.length > 0;
  }
  
  async getAllUserGameControls(): Promise<UserGameControl[]> {
    return await db.select().from(userGameControls);
  }
  
  async getUserGameControls(userId: number): Promise<UserGameControl[]> {
    return await db.select()
      .from(userGameControls)
      .where(eq(userGameControls.userId, userId));
  }
  
  async incrementUserGameControlCounter(id: number): Promise<UserGameControl | undefined> {
    const control = await this.getUserGameControl(id);
    if (!control) return undefined;
    
    // Check if control has expired
    if (control.gamesPlayed >= control.durationGames) {
      // The control has already been used for the specified number of games
      // We could either delete it or disable it
      await this.deleteUserGameControl(id);
      return undefined;
    }
    
    // Increment the counter
    const [updatedControl] = await db
      .update(userGameControls)
      .set({
        gamesPlayed: control.gamesPlayed + 1,
        updatedAt: new Date()
      })
      .where(eq(userGameControls.id, id))
      .returning();
      
    // If the updated control has now reached its limit, you might want to clean it up
    if (updatedControl && updatedControl.gamesPlayed >= updatedControl.durationGames) {
      await this.deleteUserGameControl(id);
    }
    
    return updatedControl || undefined;
  }
  
  async resetAllUserGameControls(): Promise<boolean> {
    const result = await db
      .delete(userGameControls)
      .returning({ deleted: userGameControls.id });
      
    return result.length > 0;
  }
  
  // Transaction admin methods
  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.status, status))
      .orderBy(desc(transactions.createdAt));
  }
  
  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
      
    return updatedTransaction || undefined;
  }
  
  async getAllTransactions(limit: number = 100): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }
  
  async getDepositTransactions(): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.type, "deposit"))
      .orderBy(desc(transactions.createdAt));
  }
  
  async getWithdrawalTransactions(): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.type, "withdrawal"))
      .orderBy(desc(transactions.createdAt));
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
    // Add default values for the new fields
    const userWithDefaults = {
      ...insertUser,
      isAdmin: false,
      isBanned: false,
      balance: {
        BTC: 0.01,
        ETH: 0.1,
        USDT: 1000,
        INR: 10000
      },
      dateOfBirth: new Date(insertUser.dateOfBirth),
      referralCode: null,
      language: 'English'
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, currency: string, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Create a new balance object with the updated currency amount
    const newBalance = { ...user.balance };
    if (currency in newBalance) {
      newBalance[currency] += amount;
      if (newBalance[currency] < 0) newBalance[currency] = 0; // Don't allow negative balances
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUserAdmin(id: number, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  async updateUserBanned(id: number, isBanned: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isBanned })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  async setUserBalance(id: number, currency: string, exactAmount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Create a new balance object with the updated currency amount
    const newBalance = { ...user.balance };
    if (currency in newBalance) {
      newBalance[currency] = exactAmount;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Game settings methods
  async getGameSettings(gameId: number): Promise<GameSettings | undefined> {
    const [settings] = await db
      .select()
      .from(gameSettings)
      .where(eq(gameSettings.gameId, gameId));
    return settings || undefined;
  }
  
  async createGameSettings(settings: InsertGameSettings): Promise<GameSettings> {
    const [newSettings] = await db
      .insert(gameSettings)
      .values(settings)
      .returning();
    return newSettings;
  }
  
  async updateGameSettings(gameId: number, settings: Partial<GameSettings>): Promise<GameSettings | undefined> {
    const [updatedSettings] = await db
      .update(gameSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(gameSettings.gameId, gameId))
      .returning();
    return updatedSettings || undefined;
  }
  
  async getAllGameSettings(): Promise<GameSettings[]> {
    return await db.select().from(gameSettings);
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
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }
}

// Create an instance of MemStorage as a fallback in case the DB setup isn't complete
const memStorage = new MemStorage();

// Use DatabaseStorage if we have a DB connection, otherwise use MemStorage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : memStorage;
