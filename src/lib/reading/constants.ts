// Mirrors the media_type Postgres enum (src/lib/db/schema/reading.ts).
export const MEDIA_TYPES = ["BOOK", "PODCAST", "ARTICLE", "MOVIE", "SHOW", "MUSIC", "VIDEO", "OTHER"] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  BOOK: "Book",
  PODCAST: "Podcast",
  ARTICLE: "Article",
  MOVIE: "Movie",
  SHOW: "Show",
  MUSIC: "Music",
  VIDEO: "Video",
  OTHER: "Other",
};

// Mirrors reading_entry_status.
export const READING_ENTRY_STATUSES = ["DRAFT", "COMPLETE"] as const;

export type ReadingEntryStatus = (typeof READING_ENTRY_STATUSES)[number];

// Mirrors recommendation_status.
export const RECOMMENDATION_STATUSES = ["SUGGESTED", "SAVED", "KNOWN", "DISMISSED"] as const;

export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

// Same loose alias pattern as Journal/Work — dependency-free here so the DB
// layer doesn't need to import the editor package.
export type ReadingContent = Record<string, unknown>;
