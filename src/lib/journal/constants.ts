// Mirrors the journal_status Postgres enum (src/lib/db/schema/journal.ts).
export const JOURNAL_STATUSES = ["DRAFT", "COMPLETE", "ARCHIVED"] as const;

export type JournalStatus = (typeof JOURNAL_STATUSES)[number];

// Loose alias for a Tiptap JSON document, kept dependency-free here so the
// DB layer doesn't need to import the editor package.
export type JournalContent = Record<string, unknown>;
