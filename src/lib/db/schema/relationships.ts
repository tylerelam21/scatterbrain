import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { contentTypeEnum, idColumn } from "./_shared";

// PRD §43 — infrastructure for future semantic relationships; lightly used in V1.
export const relationshipTypeEnum = pgEnum("relationship_type", [
  "EXPANDED_FROM",
  "RELATED_TO",
  "REFERENCES",
]);

export const contentRelationships = pgTable("content_relationships", {
  id: idColumn(),
  sourceType: contentTypeEnum("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  targetType: contentTypeEnum("target_type").notNull(),
  targetId: text("target_id").notNull(),
  relationshipType: relationshipTypeEnum("relationship_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
