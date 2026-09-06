import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { contentTypeEnum, visibilityEnum } from "./_shared";

// PRD §29 §39 — denormalized index kept in sync with source records so
// global search can query one table with Postgres full-text search (tsvector
// generated column) rather than fanning out across domains per request.
export const searchDocuments = pgTable(
  "search_documents",
  {
    contentType: contentTypeEnum("content_type").notNull(),
    contentId: text("content_id").notNull(),
    title: text("title"),
    body: text("body").notNull().default(""),
    visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.contentType, table.contentId] })],
);
