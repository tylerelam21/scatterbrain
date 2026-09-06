import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { brainItems, journalEntries } from "@/lib/db/schema";

export interface SearchResult {
  type: "brain" | "journal";
  id: string;
  title: string;
  excerpt: string;
  updatedAt: Date;
}

// PRD §29 — a first pass, not the full picture. Full global search (also
// Projects, Photos, cached calendar events, Postgres ranked full-text) is
// Phase 7. This covers what actually exists today: Brain and Journal.
export async function searchAll(userId: string, query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;

  const [brainResults, journalResults] = await Promise.all([
    db
      .select()
      .from(brainItems)
      .where(
        and(
          eq(brainItems.userId, userId),
          or(ilike(brainItems.content, pattern), ilike(brainItems.title, pattern))!,
        ),
      ),
    db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          or(ilike(journalEntries.plainText, pattern), ilike(journalEntries.title, pattern))!,
        ),
      ),
  ]);

  const results: SearchResult[] = [
    ...brainResults.map((item) => ({
      type: "brain" as const,
      id: item.id,
      title: item.title || item.content.slice(0, 80),
      excerpt: item.content,
      updatedAt: item.updatedAt,
    })),
    ...journalResults.map((entry) => ({
      type: "journal" as const,
      id: entry.id,
      title: entry.title || "Untitled",
      excerpt: entry.plainText,
      updatedAt: entry.updatedAt,
    })),
  ];

  return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
