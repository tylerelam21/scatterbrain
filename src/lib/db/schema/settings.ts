import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { users } from "./users";

// Simple owner-scoped key/value store (PRD §17 default calendar, time zone, etc.).
export const appSettings = pgTable(
  "app_settings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.userId, table.key] })],
);
