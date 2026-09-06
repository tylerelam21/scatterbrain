// Mirrors the content_type Postgres enum (src/lib/db/schema/_shared.ts).
// Kept separate from the schema for the same reason as Visibility.
export const CONTENT_TYPE_OPTIONS = [
  "BRAIN_ITEM",
  "JOURNAL_ENTRY",
  "PROJECT",
  "PHOTO",
  "PHOTO_COLLECTION",
  "CALENDAR_EVENT",
] as const;

export type ContentType = (typeof CONTENT_TYPE_OPTIONS)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  BRAIN_ITEM: "Ideas",
  JOURNAL_ENTRY: "Journal",
  PROJECT: "Work",
  PHOTO: "Photos",
  PHOTO_COLLECTION: "Photos",
  CALENDAR_EVENT: "Calendar",
};

// Search groups content by user-facing section rather than raw content
// type — PHOTO and PHOTO_COLLECTION are both just "Photos" to a searcher.
export const SEARCH_GROUPS = [
  { key: "ideas", label: "Ideas", types: ["BRAIN_ITEM"] },
  { key: "journal", label: "Journal", types: ["JOURNAL_ENTRY"] },
  { key: "work", label: "Work", types: ["PROJECT"] },
  { key: "photos", label: "Photos", types: ["PHOTO", "PHOTO_COLLECTION"] },
  { key: "calendar", label: "Calendar", types: ["CALENDAR_EVENT"] },
] as const satisfies { key: string; label: string; types: ContentType[] }[];

export type SearchGroupKey = (typeof SEARCH_GROUPS)[number]["key"];

export function searchGroupFor(contentType: ContentType) {
  return SEARCH_GROUPS.find((group) => (group.types as readonly ContentType[]).includes(contentType))!;
}
