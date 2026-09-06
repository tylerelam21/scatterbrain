import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// "Find the best move" — one endgame puzzle per hour, shared by every
// visitor (not owner-scoped like app_settings, since everyone sees the
// same one). hourKey is a UTC-hour bucket ("2026-09-06T14") so picking
// "this hour's puzzle" is a primary-key read, and picking the fallback
// when a source is unreachable is just "the newest row."
export const chessPuzzles = pgTable("chess_puzzles", {
  hourKey: text("hour_key").primaryKey(),
  puzzleId: text("puzzle_id").notNull(),
  fen: text("fen").notNull(),
  sideToMove: text("side_to_move").notNull(),
  // Kept server-side only — never sent to the browser as part of the
  // puzzle payload. Checked via a server action instead.
  solutionMove: text("solution_move").notNull(),
  rating: integer("rating"),
  themes: text("themes").array().notNull().default([]),
  source: text("source").notNull().default("lichess"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
