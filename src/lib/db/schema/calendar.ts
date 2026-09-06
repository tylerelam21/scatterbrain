import { boolean, jsonb, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { idColumn, timestamps } from "./_shared";
import { users } from "./users";

// PRD §44
export const calendarConnectionStatusEnum = pgEnum("calendar_connection_status", [
  "CONNECTED",
  "EXPIRED",
  "ERROR",
  "DISCONNECTED",
]);

export const calendarConnections = pgTable("calendar_connections", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("google"),
  providerAccountId: text("provider_account_id").notNull(),
  email: text("email").notNull(),
  // Encrypted at rest with an application-level key (PRD §52). Never returned to the client.
  encryptedAccessToken: text("encrypted_access_token"),
  encryptedRefreshToken: text("encrypted_refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  scopes: text("scopes").array().notNull().default([]),
  syncToken: text("sync_token"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  status: calendarConnectionStatusEnum("status").notNull().default("CONNECTED"),
  ...timestamps,
});

// PRD §45
export const calendars = pgTable("calendars", {
  id: idColumn(),
  connectionId: text("connection_id")
    .notNull()
    .references(() => calendarConnections.id, { onDelete: "cascade" }),
  providerCalendarId: text("provider_calendar_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  providerColor: text("provider_color"),
  customColor: text("custom_color"),
  timeZone: text("time_zone"),
  accessRole: text("access_role").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  isPrimary: boolean("is_primary").notNull().default(false),
  ...timestamps,
});

// PRD §46 — local cache; Google remains authoritative (PRD §15).
export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: idColumn(),
    calendarId: text("calendar_id")
      .notNull()
      .references(() => calendars.id, { onDelete: "cascade" }),
    providerEventId: text("provider_event_id").notNull(),
    recurringEventId: text("recurring_event_id"),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    status: text("status").notNull().default("confirmed"),
    organizer: text("organizer"),
    attendeesJson: jsonb("attendees_json"),
    htmlLink: text("html_link"),
    etag: text("etag"),
    providerUpdatedAt: timestamp("provider_updated_at", { withTimezone: true }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.calendarId, table.providerEventId)],
);
