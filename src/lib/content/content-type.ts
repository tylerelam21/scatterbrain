// Mirrors the content_type Postgres enum (src/lib/db/schema/_shared.ts).
// Kept separate from the schema for the same reason as Visibility.
export const CONTENT_TYPE_OPTIONS = [
  "BRAIN_ITEM",
  "JOURNAL_ENTRY",
  "PROJECT",
  "PHOTO",
  "CALENDAR_EVENT",
] as const;

export type ContentType = (typeof CONTENT_TYPE_OPTIONS)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  BRAIN_ITEM: "Brain",
  JOURNAL_ENTRY: "Journal",
  PROJECT: "Work",
  PHOTO: "Photos",
  CALENDAR_EVENT: "Calendar",
};
