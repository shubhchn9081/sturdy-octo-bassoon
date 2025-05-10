import { pgTable, serial, integer, boolean, varchar, timestamp, jsonb, numeric, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Schema for advanced game control system
// This allows for precise control over game outcomes for specific users and sessions

// Enhanced user game control table with more specific control capabilities
export const advancedUserGameControl = pgTable('advanced_user_game_control', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  gameId: integer('game_id').notNull(),
  
  // Control flags
  forceOutcome: boolean('force_outcome').notNull().default(false),
  
  // Enhanced control options
  outcomeType: varchar('outcome_type', { length: 20 }).notNull().default('win'),
  
  // Outcome value details - allows setting exact multipliers or ranges
  exactMultiplier: numeric('exact_multiplier', { precision: 12, scale: 2 }),
  minMultiplier: numeric('min_multiplier', { precision: 12, scale: 2 }),
  maxMultiplier: numeric('max_multiplier', { precision: 12, scale: 2 }),
  
  // Special events that can be triggered
  triggerNearMiss: boolean('trigger_near_miss').default(false),
  nearMissValue: numeric('near_miss_value', { precision: 12, scale: 2 }),
  
  // Game-specific configuration (JSON for flexibility)
  gameSpecificConfig: jsonb('game_specific_config').default({}),
  
  // Duration settings
  durationGames: integer('duration_games').default(1), // Number of games this control applies to
  gamesPlayed: integer('games_played').default(0),    // Counter for games played under this control
  
  // Timestamps for auditing
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Schema for tracking game sessions with admin controls
export const gameSessionControl = pgTable('game_session_control', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  gameId: integer('game_id').notNull(),
  
  // Session identifier (useful for tracking multiple devices or browser tabs)
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  
  // Connected status
  isConnected: boolean('is_connected').default(true),
  
  // Current game state
  currentState: varchar('current_state', { length: 50 }).default('waiting'),
  
  // Last game outcome for this session
  lastOutcome: jsonb('last_outcome'),
  
  // Admin message that can be displayed to the user
  adminMessage: text('admin_message'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
});

// Types for the advanced user game control
export type AdvancedUserGameControl = typeof advancedUserGameControl.$inferSelect;
export type InsertAdvancedUserGameControl = typeof advancedUserGameControl.$inferInsert;
export const insertAdvancedUserGameControlSchema = createInsertSchema(advancedUserGameControl)
  .omit({ id: true, createdAt: true, updatedAt: true, gamesPlayed: true });

// Types for the game session control
export type GameSessionControl = typeof gameSessionControl.$inferSelect;
export type InsertGameSessionControl = typeof gameSessionControl.$inferInsert;
export const insertGameSessionControlSchema = createInsertSchema(gameSessionControl)
  .omit({ id: true, createdAt: true, updatedAt: true, lastActivity: true });

// Type for WebSocket messages related to game control
export type GameControlMessage = {
  type: 'control_update' | 'game_state' | 'admin_message' | 'forced_outcome';
  payload: {
    userId?: number;
    gameId?: number;
    sessionId?: string;
    // For control_update
    controlSettings?: Partial<AdvancedUserGameControl>;
    // For game_state
    gameState?: string;
    currentMultiplier?: number;
    crashPoint?: number;
    // For admin_message
    message?: string;
    // For forced_outcome
    forcedOutcome?: {
      outcomeType: string;
      multiplier?: number;
      winAmount?: number;
    }
  }
};