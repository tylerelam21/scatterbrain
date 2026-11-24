// Mirrors the project_status Postgres enum (src/lib/db/schema/work.ts).
// The underlying enum values are unchanged (no migration) — only the
// *display* labels shift toward the new identity's Built/In progress/
// Exploring vocabulary.
export const PROJECT_STATUSES = ["LIVE", "IN_PROGRESS", "EXPERIMENT", "ARCHIVED"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  LIVE: "Built",
  IN_PROGRESS: "In progress",
  EXPERIMENT: "Exploring",
  ARCHIVED: "Archived",
};

// Same loose alias pattern as Journal — dependency-free here so the DB
// layer doesn't need to import the editor package.
export type ProjectContent = Record<string, unknown>;
