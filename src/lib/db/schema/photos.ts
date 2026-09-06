import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { idColumn, timestamps, visibilityEnum } from "./_shared";

// PRD §48 §24
export const photos = pgTable("photos", {
  id: idColumn(),
  storageKey: text("storage_key").notNull(),
  thumbnailKey: text("thumbnail_key"),
  originalFilename: text("original_filename"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  title: text("title"),
  caption: text("caption"),
  altText: text("alt_text"),
  dateTaken: timestamp("date_taken", { withTimezone: true }),
  locationLabel: text("location_label"),
  camera: text("camera"),
  lens: text("lens"),
  visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// PRD §25
export const photoCollections = pgTable("photo_collections", {
  id: idColumn(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  coverPhotoId: text("cover_photo_id").references((): typeof photos.id => photos.id, {
    onDelete: "set null",
  }),
  visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const photoCollectionItems = pgTable("photo_collection_items", {
  id: idColumn(),
  collectionId: text("collection_id")
    .notNull()
    .references(() => photoCollections.id, { onDelete: "cascade" }),
  photoId: text("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});
