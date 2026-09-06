-- Run this AFTER 0003 has been executed and committed on its own — a new
-- enum value isn't visible to statements in the same transaction that added
-- it, so this can't be safely combined with 0003 into one script run.
INSERT INTO "search_documents" (content_type, content_id, title, body, visibility, updated_at)
SELECT 'PHOTO_COLLECTION', id, title, coalesce(description, ''), visibility, updated_at
FROM photo_collections
ON CONFLICT (content_type, content_id) DO NOTHING;
