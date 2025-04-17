import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: real("balance").notNull().default(1000),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
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

export type HiloOutcome = {
  initialCard: number;
  nextCard: number;
  prediction: "higher" | "lower";
  win: boolean;
};
