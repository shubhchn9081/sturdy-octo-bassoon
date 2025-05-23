import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema types for the application

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  balance: jsonb("balance").default({ INR: 0, BTC: 0, ETH: 0, USDT: 0 }).notNull(), // JSONB balance with multiple currencies
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(), // Changed from dateOfBirth to fullName
  phone: text("phone").notNull(), // Made phone required
  referralCode: text("referral_code"),
  language: text("language").default('English'),
});

export const insertUserSchema = createInsertSchema(users).pick({
  password: true,
  email: true, 
  fullName: true,
  phone: true,
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // "stake_original", "stake_exclusive", etc.
  activePlayers: integer("active_players").default(0),
  rtp: real("rtp").notNull(), // Return to player percentage
  maxMultiplier: real("max_multiplier").notNull(),
  minBet: real("min_bet").notNull(),
  maxBet: real("max_bet").notNull(),
  imageUrl: text("image_url"), // URL to custom image uploaded by admin
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(), 
  amount: real("amount").notNull(),
  multiplier: real("multiplier"),
  profit: real("profit"),
  outcome: jsonb("outcome").notNull(), // Game-specific outcome data
  serverSeed: text("server_seed").notNull(),
  clientSeed: text("client_seed").notNull(),
  nonce: integer("nonce").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  gameId: true,
  amount: true,
  clientSeed: true,
  serverSeed: true,
  nonce: true,
  outcome: true,
  multiplier: true,
  profit: true,
  completed: true,
});

// Client-side bet schema (omits userId which is added server-side from session)
export const clientBetSchema = insertBetSchema.omit({ 
  userId: true,
  serverSeed: true, // These are generated server-side
  nonce: true,
  outcome: true,
  multiplier: true, // These are calculated server-side
  profit: true,
  completed: true
});

export const insertGameSchema = createInsertSchema(games).pick({
  name: true,
  slug: true,
  type: true,
  activePlayers: true,
  rtp: true,
  maxMultiplier: true,
  minBet: true,
  maxBet: true,
  imageUrl: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

// Game-specific types
export type DiceOutcome = {
  target: number;
  result: number;
  win: boolean;
};

export type MinesOutcome = {
  minePositions: number[];
  revealedPositions: number[];
  win: boolean;
};

export type PlinkoOutcome = {
  path: number[];
  multiplier: number;
  risk: string;
  rows: number;
};

export type CrashOutcome = {
  crashPoint: number;
  cashoutAt: number;
  win: boolean;
};

export type LimboOutcome = {
  targetMultiplier: number;
  result: number;
  win: boolean;
};

export type DragonTowerOutcome = {
  path: number[];
  level: number;
  win: boolean;
};

export type BlueSamuraiOutcome = {
  reels: number[][];
  paylines: number[][];
  win: boolean;
};

export type PumpOutcome = {
  maxMultiplier: number;
  cashoutAt: number;
  difficulty: string;
  win: boolean;
};

export type CrashCarOutcome = {
  crashPoint: number;
  cashoutAt: number;
  win: boolean;
  fuelLevel?: number; // Remaining fuel level at cashout (for animation)
};

export type RouletteOutcome = {
  number: number;
  color: string;
  win: boolean;
  multiplier: number;
  bets: { type: string; amount: number; won: boolean }[];
};

export type HiloOutcome = {
  initialCard: number;
  nextCard: number;
  prediction: "higher" | "lower";
  win: boolean;
};

export type SlotsOutcome = {
  reels: number[];
  win: boolean;
  luckyNumberHit?: boolean;
  luckyNumber?: number;
};

export type CupAndBallOutcome = {
  ballPosition: number; // 0, 1, or 2 for the cup index
  selectedCup: number; // Player's guess
  difficulty: string; // "easy", "medium", or "hard"
  win: boolean;
  shuffleMoves: number[]; // Array of shuffle move indices for animation replay
};

export type TowerClimbOutcome = {
  towerLayout: {
    safe: number[]; // Array of safe positions at each level
    traps: number[]; // Array of trap positions at each level
    items: {position: number, type: string}[]; // Array of special item positions and types
  };
  levelReached: number; // The highest level reached
  positionsChosen: number[]; // Positions chosen by the player
  specialItemsCollected: {type: string, level: number}[]; // Special items collected
  win: boolean;
};

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "deposit", "withdrawal", "bet_win", "bet_loss"
  amount: real("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"), // Changed default to INR
  status: varchar("status", { length: 20 }).notNull(), // "pending", "completed", "failed"
  txid: varchar("txid", { length: 100 }), // Transaction ID for reference
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  currency: true,
  status: true,
  txid: true,
  description: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Admin control tables
export const gameSettings = pgTable("game_settings", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().unique(),
  houseEdge: real("house_edge").notNull().default(1.0), // 1.0 means normal, 2.0 means double house edge
  forceOutcome: boolean("force_outcome").default(false).notNull(),
  forcedOutcomeValue: jsonb("forced_outcome_value"), // Game-specific value
  minBetAmount: real("min_bet_amount").notNull().default(0.00001),
  maxBetAmount: real("max_bet_amount").notNull().default(1.0),
  adminPassword: text("admin_password"), // Optional password to protect specific games
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameSettingsSchema = createInsertSchema(gameSettings).pick({
  gameId: true,
  houseEdge: true,
  forceOutcome: true,
  forcedOutcomeValue: true,
  minBetAmount: true,
  maxBetAmount: true,
  adminPassword: true,
});

export type GameSettings = typeof gameSettings.$inferSelect;
export type InsertGameSettings = z.infer<typeof insertGameSettingsSchema>;

// Some specific game settings schemas
export type CrashGameSettings = {
  crashPoint: number; // Force the game to crash at this point
  maxCrashPoint: number; // Maximum possible crash point
};

export type PlinkoGameSettings = {
  forcedPath: number[]; // Force a specific path
  forcedMultiplier: number; // Force a specific multiplier result
};

// Slot games specific settings
export type SlotSymbol = 'planet' | 'star' | 'rocket' | 'alien' | 'asteroid' | 'comet' | 'galaxy' | 'blackhole' | 'wild';

// GalacticSpins game has been removed

export type MinesGameSettings = {
  minePositions: number[]; // Force specific mine positions
  forceLose: boolean; // Force player to lose on next reveal
};

export type LimboGameSettings = {
  forcedMultiplier: number; // Force a specific multiplier
  maxAllowedMultiplier: number; // Max multiplier allowed (for limiting big wins)
};

export type DiceGameSettings = {
  forcedResult: number; // Force a specific dice result (0-100)
};

export type SlotsGameSettings = {
  forcedReels: number[]; // Force specific reel values
  forcedMultiplier: number; // Force a specific multiplier
  includeLuckyNumber: boolean; // Force lucky number hit
};

export type CupAndBallGameSettings = {
  forcedBallPosition: number; // Force the ball to be under a specific cup (0, 1, or 2)
  forceLose: boolean; // Force the player to lose regardless of their selection
};

export type TowerClimbGameSettings = {
  forcedTrapPositions: number[][]; // Force specific trap positions at each level
  forcedSafePositions: number[][]; // Force specific safe positions at each level
  forcedItemPositions: {level: number, position: number, type: string}[]; // Force specific item positions
  forceLose: boolean; // Force player to lose on next move
  maxSafeLevel: number; // Maximum level the player can safely reach
};

export type CrashCarGameSettings = {
  crashPoint: number; // Force the game to crash at this point
  maxCrashPoint: number; // Maximum possible crash point
  fuelEfficiency: number; // Multiplier for fuel consumption rate (higher means slower fuel consumption)
};

// User specific game outcome control table
export const userGameControls = pgTable("user_game_controls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  forceOutcome: boolean("force_outcome").default(false).notNull(),
  outcomeType: varchar("outcome_type", { length: 20 }).notNull(), // "win", "loss", or "none"
  durationGames: integer("duration_games").default(1).notNull(), // How many games this control applies to (1 = next game only)
  gamesPlayed: integer("games_played").default(0).notNull(), // Counter for how many games played under this control
  targetMultiplier: real("target_multiplier").default(2.0), // Target multiplier for wins (default 2x)
  useExactMultiplier: boolean("use_exact_multiplier").default(false), // Whether to force the exact multiplier
  forcedOutcomeValue: jsonb("forced_outcome_value"), // Game-specific settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserGameControlsSchema = createInsertSchema(userGameControls).pick({
  userId: true,
  gameId: true,
  forceOutcome: true,
  outcomeType: true,
  durationGames: true,
  targetMultiplier: true,
  useExactMultiplier: true,
  forcedOutcomeValue: true,
});

export type UserGameControl = typeof userGameControls.$inferSelect;
export type InsertUserGameControl = z.infer<typeof insertUserGameControlsSchema>;

// Global game outcome control table (affects all users)
export const globalGameControl = pgTable("global_game_control", {
  id: serial("id").primaryKey(),
  forceAllUsersLose: boolean("force_all_users_lose").default(false).notNull(),
  forceAllUsersWin: boolean("force_all_users_win").default(false).notNull(), 
  affectedGames: jsonb("affected_games").default([]).notNull(), // List of game IDs this control applies to. Empty means all games.
  targetMultiplier: real("target_multiplier").default(2.0), // Default target multiplier for wins (2x)
  useExactMultiplier: boolean("use_exact_multiplier").default(false), // Whether to force the exact multiplier or just win/lose
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGlobalGameControlSchema = createInsertSchema(globalGameControl).pick({
  forceAllUsersLose: true,
  forceAllUsersWin: true,
  affectedGames: true,
  targetMultiplier: true,
  useExactMultiplier: true,
});

export type GlobalGameControl = typeof globalGameControl.$inferSelect;
export type InsertGlobalGameControl = z.infer<typeof insertGlobalGameControlSchema>;

// Admin-specific types
export type AdminAction = {
  id: number;
  adminId: number;
  action: string; 
  targetId?: number;
  details: string;
  timestamp: Date;
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  totalVolume: number;
  houseProfit: number;
  gamesPlayed: {[key: string]: number};
};

// User Game Access Control table
export const userGameAccess = pgTable("user_game_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accessType: varchar("access_type", { length: 20 }).notNull(), // "all_games" or "specific_games"
  allowedGameIds: jsonb("allowed_game_ids").default([]).notNull(), // List of game IDs that are allowed when accessType is "specific_games"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserGameAccessSchema = createInsertSchema(userGameAccess).pick({
  userId: true,
  accessType: true,
  allowedGameIds: true,
});

export type UserGameAccess = typeof userGameAccess.$inferSelect;
export type InsertUserGameAccess = z.infer<typeof insertUserGameAccessSchema>;
