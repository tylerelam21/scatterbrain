import { date, jsonb, pgEnum, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { idColumn, timestamps, visibilityEnum } from "./_shared";
import { tags } from "./brain";
import { users } from "./users";

// PRD §12.2
export const journalStatusEnum = pgEnum("journal_status", ["DRAFT", "COMPLETE", "ARCHIVED"]);

export const journalEntries = pgTable("journal_entries", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  // Structured Tiptap document (PRD §12.1).
  contentJson: jsonb("content_json"),
  // Normalized plain text for search (PRD §42).
  plainText: text("plain_text").notNull().default(""),
  journalDate: date("journal_date").notNull(),
  visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
  status: journalStatusEnum("status").notNull().default("DRAFT"),
  ...timestamps,
});

export const journalEntryTags = pgTable(
  "journal_entry_tags",
  {
    journalEntryId: text("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.journalEntryId, table.tagId] })],
);
