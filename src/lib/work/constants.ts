// Mirrors the project_status Postgres enum (src/lib/db/schema/work.ts).
export const PROJECT_STATUSES = ["LIVE", "IN_PROGRESS", "EXPERIMENT", "ARCHIVED"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Same loose alias pattern as Journal — dependency-free here so the DB
// layer doesn't need to import the editor package.
export type ProjectContent = Record<string, unknown>;
