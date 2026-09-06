// Mirrors the visibility Postgres enum (src/lib/db/schema/_shared.ts).
// Kept separate from the schema for the same reason as BRAIN_ITEM_TYPES.
export const VISIBILITY_OPTIONS = ["PRIVATE", "UNLISTED", "PUBLIC"] as const;

export type Visibility = (typeof VISIBILITY_OPTIONS)[number];
