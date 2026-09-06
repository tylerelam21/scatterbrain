import { createId } from "@paralleldrive/cuid2";
import { pgEnum, text, timestamp } from "drizzle-orm/pg-core";

export const idColumn = () => text("id").primaryKey().$defaultFn(() => createId());

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

// PRD §27 — shared visibility model across all content.
export const visibilityEnum = pgEnum("visibility", ["PRIVATE", "UNLISTED", "PUBLIC"]);

// PRD §43 — content types that can participate in a ContentRelationship or SearchDocument.
export const contentTypeEnum = pgEnum("content_type", [
  "BRAIN_ITEM",
  "JOURNAL_ENTRY",
  "PROJECT",
  "PHOTO",
  "PHOTO_COLLECTION",
  "CALENDAR_EVENT",
]);
