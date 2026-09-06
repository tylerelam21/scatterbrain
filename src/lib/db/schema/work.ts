import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { idColumn, timestamps, visibilityEnum } from "./_shared";
import { photos } from "./photos";

// PRD §21
export const projectStatusEnum = pgEnum("project_status", [
  "LIVE",
  "IN_PROGRESS",
  "EXPERIMENT",
  "ARCHIVED",
]);

// PRD §47 §23 — Lab reuses the Project model via isLab rather than a separate schema.
export const projects = pgTable("projects", {
  id: idColumn(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  summary: text("summary"),
  contentJson: jsonb("content_json"),
  plainText: text("plain_text"),
  status: projectStatusEnum("status").notNull().default("IN_PROGRESS"),
  visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
  isLab: boolean("is_lab").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  heroImageId: text("hero_image_id").references(() => photos.id, { onDelete: "set null" }),
  repositoryUrl: text("repository_url"),
  liveUrl: text("live_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

// Ordered media attached to a project's case study (PRD §22).
export const projectMedia = pgTable("project_media", {
  id: idColumn(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  photoId: text("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// Free-form technology tags shown on a project (PRD §21 technologies field).
export const projectTechnologies = pgTable("project_technologies", {
  id: idColumn(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
