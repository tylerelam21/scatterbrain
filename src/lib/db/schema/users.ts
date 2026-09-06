import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestamps } from "./_shared";

// PRD §40 — single OWNER role for V1; architecture leaves room for future roles.
export const userRoleEnum = pgEnum("user_role", ["OWNER"]);

export const users = pgTable("users", {
  id: idColumn(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("OWNER"),
  ...timestamps,
});

// PRD §39 §37 — generic linked OAuth identity used for sign-in (distinct from
// CalendarConnection, which grants calendar-specific scopes and may cover
// additional accounts never used to log in).
export const oauthConnections = pgTable("oauth_connections", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  email: text("email").notNull(),
  ...timestamps,
});
