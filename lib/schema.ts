import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  started_at: timestamp("started_at", { withTimezone: true }).notNull(),
  ended_at: timestamp("ended_at", { withTimezone: true }),
  duration_mins: integer("duration_mins"),
  location_id: text("location_id").notNull(),
  location_name: text("location_name").notNull(),
  stakes_id: text("stakes_id").notNull(),
  stakes_label: text("stakes_label").notNull(),
  big_blind: integer("big_blind"),
  game_type: text("game_type").notNull().default("NLH"),
  buy_in: integer("buy_in").notNull(),
  cash_out: integer("cash_out"),
  profit_loss: integer("profit_loss"),
  notes: text("notes"),
  rating: text("rating"),
  status: text("status").notNull().default("open"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stakes = pgTable("stakes", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  label: text("label").notNull(),
  small_blind: integer("small_blind"),
  big_blind: integer("big_blind"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  user_id: text("user_id").primaryKey(),
  default_location_id: text("default_location_id"),
  default_stakes_id: text("default_stakes_id"),
});
