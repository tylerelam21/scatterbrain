import { boolean, pgEnum, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { idColumn, timestamps, visibilityEnum } from "./_shared";
import { users } from "./users";

// PRD §11.2 — optional; capture must never require picking one.
export const brainItemTypeEnum = pgEnum("brain_item_type", [
  "THOUGHT",
  "IDEA",
  "QUESTION",
  "QUOTE",
  "PLACE",
  "RECOMMENDATION",
  "PROJECT_IDEA",
  "OTHER",
]);

// PRD §41
export const brainItems = pgTable("brain_items", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(),
  type: brainItemTypeEnum("type").notNull().default("THOUGHT"),
  visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
  pinned: boolean("pinned").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  sourceUrl: text("source_url"),
  ...timestamps,
});

// Shared free-form tags, reused across Brain and Journal (PRD §11.3, §12.2).
export const tags = pgTable("tags", {
  id: idColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ...timestamps,
});

export const brainItemTags = pgTable(
  "brain_item_tags",
  {
    brainItemId: text("brain_item_id")
      .notNull()
      .references(() => brainItems.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.brainItemId, table.tagId] })],
);
