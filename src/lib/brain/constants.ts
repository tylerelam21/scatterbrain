// Mirrors the brain_item_type Postgres enum (src/lib/db/schema/brain.ts).
// Kept as a plain array (not imported from the schema) so client components
// can use it without pulling in server-only DB/driver code.
export const BRAIN_ITEM_TYPES = [
  "THOUGHT",
  "IDEA",
  "QUESTION",
  "QUOTE",
  "PLACE",
  "RECOMMENDATION",
  "PROJECT_IDEA",
  "OTHER",
] as const;

export type BrainItemType = (typeof BRAIN_ITEM_TYPES)[number];
