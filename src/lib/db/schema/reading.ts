import { date, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { idColumn, timestamps, visibilityEnum } from "./_shared";
import { users } from "./users";

// A piece of media a reading entry is about — book, podcast episode/series,
// article, film, etc. One Work can anchor multiple entries (e.g. revisiting
// the same book later), and recommendations reuse the same media-type set.
export const mediaTypeEnum = pgEnum("media_type", [
  "BOOK",
  "PODCAST",
  "ARTICLE",
  "MOVIE",
  "SHOW",
  "MUSIC",
  "VIDEO",
  "OTHER",
]);

export const works = pgTable("works", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  creator: text("creator"),
  mediaType: mediaTypeEnum("media_type").notNull().default("OTHER"),
  url: text("url"),
  ...timestamps,
});

export const readingEntryStatusEnum = pgEnum("reading_entry_status", ["DRAFT", "COMPLETE"]);

// The reflection journal entry itself — "My Journal Entry" is the rich-text
// body; takeaways/questions are the user's own short-form lists (never
// silently merged with anything AI-generated, see entryThemes/aiReflections
// below for where the AI layer lives instead).
export const readingEntries = pgTable("reading_entries", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workId: text("work_id")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  title: text("title"),
  entryDate: date("entry_date").notNull(),
  bodyJson: jsonb("body_json"),
  bodyPlainText: text("body_plain_text").notNull().default(""),
  takeaways: text("takeaways").array().notNull().default([]),
  questions: text("questions").array().notNull().default([]),
  practicalApplication: text("practical_application"),
  visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
  status: readingEntryStatusEnum("status").notNull().default("DRAFT"),
  ...timestamps,
});

// Free-form themes, scoped per-user like tags — but linked to entries via
// entryThemes below (with a source) rather than a plain join table, since
// whether a theme came from the user or from AI is meaningful here.
export const themes = pgTable(
  "themes",
  {
    id: idColumn(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => [unique().on(table.userId, table.name)],
);

export const entryThemeSourceEnum = pgEnum("entry_theme_source", ["USER", "AI"]);

export const entryThemes = pgTable(
  "entry_themes",
  {
    entryId: text("entry_id")
      .notNull()
      .references(() => readingEntries.id, { onDelete: "cascade" }),
    themeId: text("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
    source: entryThemeSourceEnum("source").notNull().default("AI"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.themeId] })],
);

// One reflection per entry — "Regenerate" overwrites rather than versions,
// matching the brief's editing workflow (AI content is always disposable
// and reproducible, never the entry's source of truth).
export const aiReflections = pgTable("ai_reflections", {
  entryId: text("entry_id")
    .primaryKey()
    .references(() => readingEntries.id, { onDelete: "cascade" }),
  bodyText: text("body_text").notNull(),
  model: text("model").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "SUGGESTED",
  "SAVED",
  "KNOWN",
  "DISMISSED",
]);

export const recommendations = pgTable("recommendations", {
  id: idColumn(),
  entryId: text("entry_id")
    .notNull()
    .references(() => readingEntries.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  creator: text("creator"),
  mediaType: mediaTypeEnum("media_type").notNull().default("OTHER"),
  url: text("url"),
  whyItConnects: text("why_it_connects").notNull(),
  lengthNote: text("length_note"),
  status: recommendationStatusEnum("status").notNull().default("SUGGESTED"),
  ...timestamps,
});
