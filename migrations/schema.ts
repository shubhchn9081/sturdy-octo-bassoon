import { pgTable, serial, integer, real, jsonb, text, boolean, timestamp, unique, index, varchar, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const bets = pgTable("bets", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	gameId: integer("game_id").notNull(),
	amount: real().notNull(),
	multiplier: real(),
	profit: real(),
	outcome: jsonb().notNull(),
	serverSeed: text("server_seed").notNull(),
	clientSeed: text("client_seed").notNull(),
	nonce: integer().notNull(),
	completed: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const games = pgTable("games", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	type: text().notNull(),
	activePlayers: integer("active_players").default(0),
	rtp: real().notNull(),
	maxMultiplier: real("max_multiplier").notNull(),
	minBet: real("min_bet").notNull(),
	maxBet: real("max_bet").notNull(),
	imageUrl: text("image_url"),
}, (table) => [
	unique("games_slug_unique").on(table.slug),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	balance: real().default(1000).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	email: text().notNull(),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }).notNull(),
	phone: text(),
	referralCode: text("referral_code"),
	language: text().default('English'),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);
