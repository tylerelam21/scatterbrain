CREATE INDEX "search_documents_vector_idx" ON "search_documents" USING gin ((setweight(to_tsvector('english', coalesce("title", '')), 'A') || setweight(to_tsvector('english', "body"), 'B')));
--> statement-breakpoint
-- Backfill: search_documents didn't exist until Phase 7, so anything
-- created before this migration needs to be indexed once, here. Every
-- future write is kept in sync going forward by the application code
-- itself (src/lib/search/index.ts), not by this backfill.
INSERT INTO "search_documents" (content_type, content_id, title, body, visibility, updated_at)
SELECT 'BRAIN_ITEM', id, title, content, visibility, updated_at
FROM brain_items
WHERE archived = false
ON CONFLICT (content_type, content_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO "search_documents" (content_type, content_id, title, body, visibility, updated_at)
SELECT 'JOURNAL_ENTRY', id, title, plain_text, visibility, updated_at
FROM journal_entries
ON CONFLICT (content_type, content_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO "search_documents" (content_type, content_id, title, body, visibility, updated_at)
SELECT 'PROJECT', id, title, concat_ws(E'\n', tagline, summary, plain_text), visibility, updated_at
FROM projects
ON CONFLICT (content_type, content_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO "search_documents" (content_type, content_id, title, body, visibility, updated_at)
SELECT 'PHOTO', id, title, concat_ws(' ', caption, location_label), visibility, updated_at
FROM photos
ON CONFLICT (content_type, content_id) DO NOTHING;
--> statement-breakpoint
INSERT INTO "search_documents" (content_type, content_id, title, body, visibility, updated_at)
SELECT 'CALENDAR_EVENT', id, title, concat_ws(' ', description, location), 'PRIVATE', last_synced_at
FROM calendar_events
WHERE status != 'cancelled'
ON CONFLICT (content_type, content_id) DO NOTHING;