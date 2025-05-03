-- Migration to add game control tables
-- This adds the tables needed for admin game outcome control functionality

-- Global game control table (affects all users)
CREATE TABLE IF NOT EXISTS "global_game_control" (
  "id" serial PRIMARY KEY NOT NULL,
  "force_all_users_lose" boolean DEFAULT false NOT NULL,
  "force_all_users_win" boolean DEFAULT false NOT NULL,
  "affected_games" jsonb DEFAULT '[]' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- User-specific game controls
CREATE TABLE IF NOT EXISTS "user_game_controls" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "game_id" integer NOT NULL,
  "force_outcome" boolean DEFAULT false NOT NULL,
  "outcome_type" varchar(20) NOT NULL,
  "duration_games" integer DEFAULT 1 NOT NULL,
  "games_played" integer DEFAULT 0 NOT NULL,
  "forced_outcome_value" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Game settings table
CREATE TABLE IF NOT EXISTS "game_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "game_id" integer NOT NULL,
  "house_edge" real DEFAULT 1.0 NOT NULL,
  "force_outcome" boolean DEFAULT false NOT NULL,
  "forced_outcome_value" jsonb,
  "min_bet_amount" real DEFAULT 0.00001 NOT NULL,
  "max_bet_amount" real DEFAULT 1.0 NOT NULL,
  "admin_password" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "game_settings_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint