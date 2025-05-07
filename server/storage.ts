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
  type InsertUserGameControl,
  globalGameControl,
  type GlobalGameControl,
  type InsertGlobalGameControl
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
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number, currency?: string): Promise<User | undefined>;
  setUserBalance(id: number, exactAmount: number, currency?: string): Promise<User | undefined>;
  
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
  deleteBet(id: number): Promise<boolean>;
  getBetHistory(userId: number, gameId?: number): Promise<Bet[]>;
  getBetsByGameId(gameId: number, status?: string): Promise<Bet[]>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  updateUserAdmin(id: number, isAdmin: boolean): Promise<User | undefined>;
  updateUserBanned(id: number, isBanned: boolean): Promise<User | undefined>;
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
  
  // Global game control methods (affects all users)
  getGlobalGameControl(): Promise<GlobalGameControl | undefined>;
  updateGlobalGameControl(settings: Partial<GlobalGameControl>): Promise<GlobalGameControl>;
  makeAllUsersLose(affectedGames?: number[]): Promise<GlobalGameControl>;
  makeAllUsersWin(affectedGames?: number[], targetMultiplier?: number, useExactMultiplier?: boolean): Promise<GlobalGameControl>;
  resetGlobalGameControl(): Promise<GlobalGameControl>;
  
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
  private globalControl: GlobalGameControl | null;
  
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
    this.globalControl = null;
    
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
      fullName: "Demo User",
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
      fullName: "Admin User",
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
  
  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser & { username: string }): Promise<User> {
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
        INR: 0 // No starting balance for new users
      },
      createdAt: new Date(),
      email: insertUser.email,
      fullName: insertUser.fullName,
      phone: insertUser.phone,
      referralCode: null,
      language: 'English'
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(id: number, amount: number, currency: string = 'INR'): Promise<User | undefined> {
    // Ensure amount is a valid number
    amount = parseFloat(amount as any);
    if (isNaN(amount)) {
      console.error(`Invalid amount passed to updateUserBalance: ${amount}`);
      return this.getUser(id);
    }
    
    // For this platform, we only support INR
    if (currency !== 'INR') {
      console.warn('Only INR currency is supported. Ignoring request for:', currency);
      return this.getUser(id);
    }
    
    console.log(`[Balance Update] Starting update for user ${id}, amount: ${amount} ${currency}`);
    
    const user = this.users.get(id);
    if (!user) {
      console.error(`User with ID ${id} not found when updating balance`);
      return undefined;
    }
    
    // Handle different balance formats - important to maintain format consistency
    let updatedBalance: number | Record<string, number>;
    
    if (typeof user.balance === 'number') {
      // Standard numeric balance format
      console.log(`[Balance Update] User has numeric balance: ${user.balance}`);
      let newBalance = user.balance + amount;
      if (newBalance < 0) newBalance = 0; // Don't allow negative balances
      updatedBalance = newBalance;
      console.log(`[Balance Update] New numeric balance: ${updatedBalance}`);
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      // Object-based balance - preserve the structure but update INR value
      console.log(`[Balance Update] User has object balance: ${JSON.stringify(user.balance)}`);
      const currentBalance = { ...user.balance as Record<string, number> };
      const currentAmount = currentBalance['INR'] || 0;
      
      // Calculate new amount
      let newAmount = currentAmount + amount;
      if (newAmount < 0) newAmount = 0;
      
      // Preserve the object structure and update INR
      currentBalance['INR'] = newAmount;
      updatedBalance = currentBalance; 
      console.log(`[Balance Update] New object balance: ${JSON.stringify(updatedBalance)}`);
    } else {
      // Handle unexpected format - create a new numeric balance
      console.error(`[Balance Update] User ${id} has invalid balance format: ${typeof user.balance}`);
      updatedBalance = Math.max(0, amount);
      console.log(`[Balance Update] Created new numeric balance: ${updatedBalance}`);
    }
    
    // Log balance change
    const oldBalanceVal = typeof user.balance === 'number' 
      ? user.balance 
      : (typeof user.balance === 'object' && user.balance !== null 
          ? (user.balance as Record<string, number>)['INR'] || 0 
          : 0);
          
    const newBalanceVal = typeof updatedBalance === 'number' 
      ? updatedBalance 
      : updatedBalance['INR'];
      
    console.log(`[Balance Update] User ${id} balance changed from ${oldBalanceVal} to ${newBalanceVal} (format: ${typeof updatedBalance})`);
    
    // Update the user record with the new balance
    const updatedUser = { ...user, balance: updatedBalance };
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
  
  async deleteBet(id: number): Promise<boolean> {
    return this.bets.delete(id);
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
      currency: "INR", // Only use INR for all transactions
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
  
  async setUserBalance(id: number, exactAmount: number, currency: string = 'INR'): Promise<User | undefined> {
    // Ensure amount is a valid number
    exactAmount = parseFloat(exactAmount as any);
    if (isNaN(exactAmount)) {
      console.error(`Invalid amount passed to setUserBalance: ${exactAmount}`);
      return this.getUser(id);
    }
    
    // For this platform, we only support INR
    if (currency !== 'INR') {
      console.warn('Only INR currency is supported. Ignoring request for:', currency);
      return this.getUser(id);
    }
    
    console.log(`[Balance Set] Setting user ${id} balance to exact amount: ${exactAmount} ${currency}`);
    
    const user = this.users.get(id);
    if (!user) {
      console.error(`User with ID ${id} not found when setting balance`);
      return undefined;
    }
    
    // Ensure amount is not negative
    const safeAmount = Math.max(0, exactAmount);
    
    // Handle different balance formats - maintain the same structure
    let updatedBalance: number | Record<string, number>;
    
    if (typeof user.balance === 'number') {
      // Simple number format
      console.log(`[Balance Set] User has numeric balance: ${user.balance}`);
      updatedBalance = safeAmount;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      // Object format - preserve structure but update INR
      console.log(`[Balance Set] User has object balance: ${JSON.stringify(user.balance)}`);
      const currentBalance = { ...user.balance as Record<string, number> };
      currentBalance['INR'] = safeAmount;
      updatedBalance = currentBalance;
    } else {
      // Invalid format - use numeric
      console.error(`[Balance Set] User ${id} has invalid balance format: ${typeof user.balance}`);
      updatedBalance = safeAmount;
    }
    
    // Log the change
    const oldBalanceVal = typeof user.balance === 'number' 
      ? user.balance 
      : (typeof user.balance === 'object' && user.balance !== null 
          ? (user.balance as Record<string, number>)['INR'] || 0 
          : 0);
          
    const newBalanceVal = typeof updatedBalance === 'number' 
      ? updatedBalance 
      : updatedBalance['INR'];
          
    console.log(`[Balance Set] User ${id} balance changed from ${oldBalanceVal} to ${newBalanceVal} (format: ${typeof updatedBalance})`);
    
    // Update user record
    const updatedUser = { ...user, balance: updatedBalance };
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
  
  // Global game control methods
  async getGlobalGameControl(): Promise<GlobalGameControl | undefined> {
    return this.globalControl || undefined;
  }
  
  async updateGlobalGameControl(settings: Partial<GlobalGameControl>): Promise<GlobalGameControl> {
    if (this.globalControl) {
      // Update existing control
      this.globalControl = {
        ...this.globalControl,
        ...settings,
        updatedAt: new Date()
      };
    } else {
      // Create new control
      this.globalControl = {
        id: 1,
        forceAllUsersLose: settings.forceAllUsersLose || false,
        forceAllUsersWin: settings.forceAllUsersWin || false,
        targetMultiplier: settings.targetMultiplier || 2.0,
        useExactMultiplier: settings.useExactMultiplier || false,
        affectedGames: settings.affectedGames || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return this.globalControl;
  }
  
  async makeAllUsersLose(affectedGames: number[] = []): Promise<GlobalGameControl> {
    return this.updateGlobalGameControl({
      forceAllUsersLose: true,
      forceAllUsersWin: false,
      affectedGames,
      targetMultiplier: 2.0,
      useExactMultiplier: false
    });
  }
  
  async makeAllUsersWin(
    affectedGames: number[] = [],
    targetMultiplier: number = 2.0,
    useExactMultiplier: boolean = false
  ): Promise<GlobalGameControl> {
    return this.updateGlobalGameControl({
      forceAllUsersLose: false,
      forceAllUsersWin: true,
      affectedGames,
      targetMultiplier,
      useExactMultiplier
    });
  }
  
  async resetGlobalGameControl(): Promise<GlobalGameControl> {
    return this.updateGlobalGameControl({
      forceAllUsersLose: false,
      forceAllUsersWin: false,
      affectedGames: [],
      targetMultiplier: 2.0,
      useExactMultiplier: false
    });
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
  
  // Global game control methods
  async getGlobalGameControl(): Promise<GlobalGameControl | undefined> {
    const controls = await db.select().from(globalGameControl);
    return controls.length > 0 ? controls[0] : undefined;
  }
  
  async updateGlobalGameControl(settings: Partial<GlobalGameControl>): Promise<GlobalGameControl> {
    // Get existing control or create a new one
    const existingControl = await this.getGlobalGameControl();
    
    if (existingControl) {
      // Update existing control
      const [updatedControl] = await db
        .update(globalGameControl)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(globalGameControl.id, existingControl.id))
        .returning();
      return updatedControl;
    } else {
      // Create new control with default values
      const [newControl] = await db
        .insert(globalGameControl)
        .values({
          forceAllUsersLose: settings.forceAllUsersLose || false,
          forceAllUsersWin: settings.forceAllUsersWin || false,
          targetMultiplier: settings.targetMultiplier || 2.0,
          useExactMultiplier: settings.useExactMultiplier || false,
          affectedGames: settings.affectedGames || [],
        })
        .returning();
      return newControl;
    }
  }
  
  async makeAllUsersLose(affectedGames: number[] = []): Promise<GlobalGameControl> {
    return this.updateGlobalGameControl({
      forceAllUsersLose: true,
      forceAllUsersWin: false,
      affectedGames,
      targetMultiplier: 2.0,
      useExactMultiplier: false
    });
  }
  
  async makeAllUsersWin(
    affectedGames: number[] = [],
    targetMultiplier: number = 2.0,
    useExactMultiplier: boolean = false
  ): Promise<GlobalGameControl> {
    return this.updateGlobalGameControl({
      forceAllUsersLose: false,
      forceAllUsersWin: true,
      affectedGames,
      targetMultiplier,
      useExactMultiplier
    });
  }
  
  async resetGlobalGameControl(): Promise<GlobalGameControl> {
    return this.updateGlobalGameControl({
      forceAllUsersLose: false,
      forceAllUsersWin: false,
      affectedGames: [],
      targetMultiplier: 2.0,
      useExactMultiplier: false
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
  
  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { username: string }): Promise<User> {
    // Add default values for the new fields
    const userWithDefaults = {
      ...insertUser,
      isAdmin: false,
      isBanned: false,
      balance: { INR: 0, BTC: 0.01, ETH: 0.1, USDT: 1000 }, // Default balance
      referralCode: null,
      language: 'English',
      dateOfBirth: null // Keep for backward compatibility
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, amount: number, currency: string = 'INR'): Promise<User | undefined> {
    // Ensure amount is a proper number by using explicit conversion
    // This fixes issues where string values might be passed in
    const originalAmount = amount;
    amount = Number(amount);
    
    // Additional safeguard against NaN
    if (isNaN(amount)) {
      console.error(`Invalid amount value passed to updateUserBalance: ${originalAmount}`);
      // Use a default of 0 to prevent errors
      amount = 0;
    }
    
    // For this platform, we only support INR
    if (currency !== 'INR') {
      console.warn('Only INR currency is supported. Ignoring request for:', currency);
      return this.getUser(id);
    }
    
    // Log the balance update for troubleshooting
    console.log(`Balance update initiated for user ${id} - Amount: ${amount} (original: ${originalAmount}), Currency: ${currency}`);
    
    try {
      const user = await this.getUser(id);
      if (!user) {
        console.error(`User with ID ${id} not found during balance update`);
        return undefined;
      }
      
      // Handle different balance formats
      let updatedBalance: any; // Can be number or object based on current balance
      let currentBalance: number = 0;
      
      if (typeof user.balance === 'number') {
        // Standard numeric balance format - use explicit conversion
        currentBalance = Number(user.balance);
        console.log(`Current balance for user ${id} (numeric): ${currentBalance}`);
        
        let newBalance = currentBalance + amount;
        if (newBalance < 0) newBalance = 0; // Don't allow negative balances
        updatedBalance = newBalance;
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        // Handle object-based balance (JSON)
        const balanceObj = { ...user.balance as Record<string, number> };
        // Get current INR balance with safeguards
        currentBalance = Number(balanceObj['INR'] || 0);
        console.log(`Current balance for user ${id} (object): ${currentBalance}`);
        
        // Calculate new amount
        let newAmount = currentBalance + amount;
        if (newAmount < 0) newAmount = 0;
        
        // Update the INR value in the object
        balanceObj['INR'] = newAmount;
        updatedBalance = balanceObj;
      } else {
        // Handle unexpected format - create a new numeric balance
        console.log(`No existing balance found for user ${id}, creating new balance`);
        updatedBalance = Math.max(0, amount);
      }
      
      console.log(`Balance update details - User: ${id}, Current: ${currentBalance}, Change: ${amount}, New balance: ${typeof updatedBalance === 'object' ? updatedBalance['INR'] : updatedBalance}`);
      
      // Update the user record with the proper balance format
      const [updatedUser] = await db
        .update(users)
        .set({ balance: updatedBalance })
        .where(eq(users.id, id))
        .returning();
      
      if (!updatedUser) {
        console.error(`Failed to update balance for user ${id}`);
        return undefined;
      }
      
      console.log(`Successfully updated balance for user ${id}`);
      return updatedUser;
    } catch (error) {
      console.error(`Error updating balance for user ${id}:`, error);
      return undefined;
    }
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
  
  async updateAdminStatus(id: number, isAdmin: boolean): Promise<User | undefined> {
    // This is an alias for updateUserAdmin for backward compatibility
    return this.updateUserAdmin(id, isAdmin);
  }
  
  async setUserBalance(id: number, exactAmount: number, currency: string = 'INR'): Promise<User | undefined> {
    // Ensure exactAmount is a proper number by using explicit conversion
    // This fixes issues where string values might be passed in
    const originalAmount = exactAmount;
    exactAmount = Number(exactAmount);
    
    // Additional safeguard against NaN
    if (isNaN(exactAmount)) {
      console.error(`Invalid amount value passed to setUserBalance: ${originalAmount}`);
      // Use a default of 0 to prevent errors
      exactAmount = 0;
    }
    
    // For this platform, we only support INR
    if (currency !== 'INR') {
      console.warn('Only INR currency is supported. Ignoring request for:', currency);
      return this.getUser(id);
    }
    
    // Log the balance update for troubleshooting
    console.log(`Setting exact balance for user ${id} - Amount: ${exactAmount} (original: ${originalAmount}), Currency: ${currency}`);
    
    try {
      const user = await this.getUser(id);
      if (!user) {
        console.error(`User with ID ${id} not found during balance set operation`);
        return undefined;
      }
      
      // Get current balance for logging
      let currentBalance = 0;
      let updatedBalance: any; // Can be number or object based on current balance
      
      if (typeof user.balance === 'number') {
        currentBalance = Number(user.balance);
        // Keep same format for the updated balance (number)
        updatedBalance = Math.max(0, exactAmount);
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        const balanceObj = { ...user.balance as Record<string, number> };
        currentBalance = Number(balanceObj['INR'] || 0);
        
        // Keep the object format but update the INR value
        balanceObj['INR'] = Math.max(0, exactAmount);
        updatedBalance = balanceObj;
      } else {
        // Default to number if unknown format
        currentBalance = 0;
        updatedBalance = Math.max(0, exactAmount);
      }
      
      console.log(`Current balance for user ${id}: ${currentBalance}, Setting to exact amount: ${exactAmount}`);
      
      // Update the user record with the appropriate balance format
      const [updatedUser] = await db
        .update(users)
        .set({ balance: updatedBalance })
        .where(eq(users.id, id))
        .returning();
      
      if (!updatedUser) {
        console.error(`Failed to set balance for user ${id}`);
        return undefined;
      }
      
      console.log(`Balance set operation complete. Old: ${currentBalance}, New: ${typeof updatedBalance === 'object' ? updatedBalance['INR'] : updatedBalance}`);
      return updatedUser;
    } catch (error) {
      console.error(`Error setting balance for user ${id}:`, error);
      return undefined;
    }
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

  async deleteBet(id: number): Promise<boolean> {
    const result = await db
      .delete(bets)
      .where(eq(bets.id, id))
      .returning({ deleted: bets.id });
    return result.length > 0;
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
    // Always set currency to INR regardless of what was provided
    const transactionData = {
      ...insertTransaction,
      currency: "INR" // Only use INR for all transactions
    };
    
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
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
