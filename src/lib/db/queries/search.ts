import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects, searchDocuments } from "@/lib/db/schema";
import type { ContentType } from "@/lib/content/content-type";

export interface SearchResult {
  contentType: ContentType;
  contentId: string;
  title: string;
  excerpt: string;
  updatedAt: Date;
  href: string;
}

// Projects route by slug, not id; everything else routes by id (PRD's
// URL-search-param modal pattern for Photos/Calendar).
function hrefFor(contentType: ContentType, contentId: string, projectSlug?: string): string {
  switch (contentType) {
    case "BRAIN_ITEM":
      return `/brain/${contentId}`;
    case "JOURNAL_ENTRY":
      return `/journal/${contentId}`;
    case "PROJECT":
      return projectSlug ? `/work/${projectSlug}` : "/work";
    case "PHOTO":
      return `/photos?photo=${contentId}`;
    case "CALENDAR_EVENT":
      return `/calendar?event=${contentId}`;
  }
}

export interface SearchOptions {
  ownerMode: boolean;
  types?: ContentType[];
  limit?: number;
}

// PRD §29.1 — a single word gets prefix matching (search-as-you-type), and
// multiple words are ANDed on their exact stems. Postgres's own tsquery
// parser rejects stray operator characters, so strip them before they ever
// reach the query string.
function toPrefixTsQuery(query: string): string | null {
  const words = query
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[&|!():*'"<>]/g, ""))
    .filter(Boolean);
  if (words.length === 0) return null;
  return words.map((word, i) => (i === words.length - 1 ? `${word}:*` : word)).join(" & ");
}

// PRD §29 — global search over the denormalized search_documents index
// (Brain, Journal, Projects, Photos, cached Calendar events), ranked by
// Postgres full-text search with title weighted above body.
export async function searchAll(query: string, options: SearchOptions): Promise<SearchResult[]> {
  const tsQueryString = toPrefixTsQuery(query);
  if (!tsQueryString) return [];

  const vector = sql`(setweight(to_tsvector('english', coalesce(${searchDocuments.title}, '')), 'A') || setweight(to_tsvector('english', ${searchDocuments.body}), 'B'))`;
  const tsQuery = sql`to_tsquery('english', ${tsQueryString})`;
  const rank = sql<number>`ts_rank(${vector}, ${tsQuery})`;

  const conditions: SQL[] = [sql`${vector} @@ ${tsQuery}`];
  if (!options.ownerMode) {
    conditions.push(eq(searchDocuments.visibility, "PUBLIC"));
  }
  if (options.types?.length) {
    conditions.push(inArray(searchDocuments.contentType, options.types));
  }

  const rows = await db
    .select({
      contentType: searchDocuments.contentType,
      contentId: searchDocuments.contentId,
      title: searchDocuments.title,
      body: searchDocuments.body,
      updatedAt: searchDocuments.updatedAt,
      rank,
    })
    .from(searchDocuments)
    .where(and(...conditions))
    .orderBy(desc(rank))
    .limit(options.limit ?? 30);

  const projectIds = rows.filter((r) => r.contentType === "PROJECT").map((r) => r.contentId);
  const slugById = new Map<string, string>();
  if (projectIds.length) {
    const projectRows = await db
      .select({ id: projects.id, slug: projects.slug })
      .from(projects)
      .where(inArray(projects.id, projectIds));
    for (const p of projectRows) slugById.set(p.id, p.slug);
  }

  return rows.map((row) => ({
    contentType: row.contentType,
    contentId: row.contentId,
    title: row.title || row.body.slice(0, 80) || "Untitled",
    excerpt: row.body.slice(0, 160),
    updatedAt: row.updatedAt,
    href: hrefFor(row.contentType, row.contentId, slugById.get(row.contentId)),
  }));
}
