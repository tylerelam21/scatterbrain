import { index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { contentTypeEnum, visibilityEnum } from "./_shared";

// PRD §29 §39 — denormalized index kept in sync with source records so
// global search can query one table with Postgres full-text search (tsvector
// expression index) rather than fanning out across domains per request.
// Also the seam a later semantic/vector layer would hang off of without
// touching every domain table (PRD "build reusable infrastructure...").
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
  (table) => [
    primaryKey({ columns: [table.contentType, table.contentId] }),
    // Title-weighted ('A') over body-weighted ('B') tsvector, so title
    // matches rank above body-only matches (PRD §29.1 "ranked results").
    index("search_documents_vector_idx").using(
      "gin",
      sql`(setweight(to_tsvector('english', coalesce(${table.title}, '')), 'A') || setweight(to_tsvector('english', ${table.body}), 'B'))`,
    ),
  ],
);
