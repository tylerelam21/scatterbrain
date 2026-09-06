import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { searchDocuments } from "@/lib/db/schema";
import type { ContentType } from "@/lib/content/content-type";
import type { Visibility } from "@/lib/content/visibility";

export interface IndexableDocument {
  contentType: ContentType;
  contentId: string;
  title: string | null;
  body: string;
  visibility: Visibility;
}

// PRD §29 — call this from the same query function that writes the source
// record, so the search index can never drift out of sync with a forgotten
// call site elsewhere.
export async function indexSearchDocument(doc: IndexableDocument) {
  await db
    .insert(searchDocuments)
    .values({ ...doc, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [searchDocuments.contentType, searchDocuments.contentId],
      set: { title: doc.title, body: doc.body, visibility: doc.visibility, updatedAt: new Date() },
    });
}

export async function removeSearchDocument(contentType: ContentType, contentId: string) {
  await db
    .delete(searchDocuments)
    .where(and(eq(searchDocuments.contentType, contentType), eq(searchDocuments.contentId, contentId)));
}
