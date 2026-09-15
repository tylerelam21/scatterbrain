import { and, asc, desc, eq, ilike, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  aiReflections,
  entryThemes,
  readingEntries,
  recommendations,
  themes,
  works,
} from "@/lib/db/schema";
import type { MediaType } from "@/lib/reading/constants";
import type { ReadingContent } from "@/lib/reading/constants";
import type { Visibility } from "@/lib/content/visibility";
import { indexSearchDocument, removeSearchDocument } from "@/lib/search";

function entrySearchBody(entry: {
  bodyPlainText: string;
  takeaways: string[];
  questions: string[];
  practicalApplication: string | null;
}) {
  return [entry.bodyPlainText, ...entry.takeaways, ...entry.questions, entry.practicalApplication]
    .filter(Boolean)
    .join("\n");
}

// -- Works -------------------------------------------------------------

// Typeahead when starting a new entry — "find or create" the media a
// reading entry is about (PRD-style: never force picking from a rigid list).
export async function searchWorks(userId: string, q: string, limit = 8) {
  const pattern = `%${q.trim()}%`;
  return db
    .select()
    .from(works)
    .where(and(eq(works.userId, userId), ilike(works.title, pattern)))
    .orderBy(desc(works.updatedAt))
    .limit(limit);
}

export async function listWorks(userId: string) {
  return db.select().from(works).where(eq(works.userId, userId)).orderBy(asc(works.title));
}

export async function getWorkById(userId: string, id: string) {
  return db.query.works.findFirst({ where: and(eq(works.id, id), eq(works.userId, userId)) });
}

// Find-or-create's "find" half — a case-insensitive exact match, so
// re-typing a work's title from the "New entry" form reuses it rather than
// creating a duplicate.
export async function findWorkByTitle(userId: string, title: string) {
  return db.query.works.findFirst({
    where: and(eq(works.userId, userId), ilike(works.title, title.trim())),
  });
}

export async function createWork(
  userId: string,
  input: {
    title: string;
    creator?: string | null;
    mediaType?: MediaType;
    url?: string | null;
    coverImageUrl?: string | null;
  },
) {
  const [created] = await db
    .insert(works)
    .values({
      userId,
      title: input.title.trim(),
      creator: input.creator || null,
      mediaType: input.mediaType ?? "OTHER",
      url: input.url || null,
      coverImageUrl: input.coverImageUrl || null,
    })
    .returning();
  return created;
}

// -- Reading entries -----------------------------------------------------

export async function listReadingEntries(userId: string) {
  return db
    .select({ entry: readingEntries, work: works })
    .from(readingEntries)
    .innerJoin(works, eq(works.id, readingEntries.workId))
    .where(eq(readingEntries.userId, userId))
    .orderBy(desc(readingEntries.entryDate), desc(readingEntries.createdAt));
}

export async function getReadingEntryById(userId: string, id: string) {
  const row = await db
    .select({ entry: readingEntries, work: works })
    .from(readingEntries)
    .innerJoin(works, eq(works.id, readingEntries.workId))
    .where(and(eq(readingEntries.id, id), eq(readingEntries.userId, userId)))
    .limit(1);
  return row[0] ?? null;
}

export async function createReadingEntry(userId: string, workId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [created] = await db
    .insert(readingEntries)
    .values({ userId, workId, entryDate: today })
    .returning();
  await indexSearchDocument({
    contentType: "READING_ENTRY",
    contentId: created.id,
    title: created.title,
    body: entrySearchBody(created),
    visibility: created.visibility,
  });
  return created;
}

export async function updateReadingEntry(
  userId: string,
  id: string,
  data: Partial<{
    title: string | null;
    entryDate: string;
    bodyJson: ReadingContent;
    bodyPlainText: string;
    takeaways: string[];
    questions: string[];
    practicalApplication: string | null;
    visibility: Visibility;
    status: "DRAFT" | "COMPLETE";
  }>,
) {
  const [updated] = await db
    .update(readingEntries)
    .set(data)
    .where(and(eq(readingEntries.id, id), eq(readingEntries.userId, userId)))
    .returning();
  if (updated) {
    await indexSearchDocument({
      contentType: "READING_ENTRY",
      contentId: updated.id,
      title: updated.title,
      body: entrySearchBody(updated),
      visibility: updated.visibility,
    });
  }
  return updated;
}

export async function deleteReadingEntry(userId: string, id: string) {
  await db
    .delete(readingEntries)
    .where(and(eq(readingEntries.id, id), eq(readingEntries.userId, userId)));
  await removeSearchDocument("READING_ENTRY", id);
}

// -- Themes ----------------------------------------------------------------

async function getOrCreateTheme(userId: string, rawName: string) {
  const name = rawName.trim();
  const existing = await db.query.themes.findFirst({
    where: and(eq(themes.userId, userId), eq(themes.name, name)),
  });
  if (existing) return existing;

  const [created] = await db.insert(themes).values({ userId, name }).returning();
  return created;
}

export async function getThemesForEntry(entryId: string) {
  return db
    .select({ id: themes.id, name: themes.name, source: entryThemes.source })
    .from(entryThemes)
    .innerJoin(themes, eq(themes.id, entryThemes.themeId))
    .where(eq(entryThemes.entryId, entryId))
    .orderBy(asc(themes.name));
}

export async function addThemeToEntry(
  userId: string,
  entryId: string,
  rawName: string,
  source: "USER" | "AI",
) {
  const name = rawName.trim();
  if (!name) return;
  const theme = await getOrCreateTheme(userId, name);
  await db.insert(entryThemes).values({ entryId, themeId: theme.id, source }).onConflictDoNothing();
}

export async function removeThemeFromEntry(entryId: string, themeId: string) {
  await db
    .delete(entryThemes)
    .where(and(eq(entryThemes.entryId, entryId), eq(entryThemes.themeId, themeId)));
}

// Called after (re)generating AI reflection — replaces only the AI-sourced
// theme links so user-added themes on this entry are never touched.
export async function replaceAIThemesForEntry(userId: string, entryId: string, themeNames: string[]) {
  await db
    .delete(entryThemes)
    .where(and(eq(entryThemes.entryId, entryId), eq(entryThemes.source, "AI")));
  for (const name of themeNames) {
    await addThemeToEntry(userId, entryId, name, "AI");
  }
}

// "Follow the thread" foundation — other entries of this user's that share
// at least one theme with this entry, newest first.
export async function getRelatedEntriesByTheme(userId: string, entryId: string) {
  const entryThemeIds = await db
    .select({ themeId: entryThemes.themeId })
    .from(entryThemes)
    .where(eq(entryThemes.entryId, entryId));
  const themeIds = entryThemeIds.map((t) => t.themeId);
  if (themeIds.length === 0) return [];

  const relatedEntryIds = await db
    .selectDistinct({ entryId: entryThemes.entryId })
    .from(entryThemes)
    .where(and(inArray(entryThemes.themeId, themeIds), ne(entryThemes.entryId, entryId)));
  const ids = relatedEntryIds.map((r) => r.entryId);
  if (ids.length === 0) return [];

  const [rows, sharedThemeRows] = await Promise.all([
    db
      .select({ entry: readingEntries, work: works })
      .from(readingEntries)
      .innerJoin(works, eq(works.id, readingEntries.workId))
      .where(and(eq(readingEntries.userId, userId), inArray(readingEntries.id, ids)))
      .orderBy(desc(readingEntries.entryDate)),
    db
      .select({ entryId: entryThemes.entryId, name: themes.name })
      .from(entryThemes)
      .innerJoin(themes, eq(themes.id, entryThemes.themeId))
      .where(and(inArray(entryThemes.entryId, ids), inArray(entryThemes.themeId, themeIds))),
  ]);

  const sharedThemesByEntry = new Map<string, string[]>();
  for (const { entryId: relatedId, name } of sharedThemeRows) {
    const names = sharedThemesByEntry.get(relatedId) ?? [];
    names.push(name);
    sharedThemesByEntry.set(relatedId, names);
  }

  return rows.map((row) => ({
    ...row,
    sharedThemeNames: sharedThemesByEntry.get(row.entry.id) ?? [],
  }));
}

// -- AI reflection -----------------------------------------------------

export async function getAIReflection(entryId: string) {
  return db.query.aiReflections.findFirst({ where: eq(aiReflections.entryId, entryId) });
}

export async function upsertAIReflection(entryId: string, bodyText: string, model: string) {
  await db
    .insert(aiReflections)
    .values({ entryId, bodyText, model })
    .onConflictDoUpdate({
      target: aiReflections.entryId,
      set: { bodyText, model, generatedAt: new Date() },
    });
}

// -- Recommendations -----------------------------------------------------

export async function listRecommendationsForEntry(entryId: string) {
  return db
    .select()
    .from(recommendations)
    .where(eq(recommendations.entryId, entryId))
    .orderBy(desc(recommendations.createdAt));
}

export interface NewRecommendation {
  title: string;
  creator?: string | null;
  mediaType: MediaType;
  url?: string | null;
  whyItConnects: string;
  lengthNote?: string | null;
}

// Regenerating recommendations only replaces ones the user hasn't acted
// on yet — SAVED/KNOWN/DISMISSED rows reflect a real decision and must
// survive a reflection regenerate.
export async function replaceSuggestedRecommendations(entryId: string, recs: NewRecommendation[]) {
  await db
    .delete(recommendations)
    .where(and(eq(recommendations.entryId, entryId), eq(recommendations.status, "SUGGESTED")));
  if (recs.length === 0) return;
  await db.insert(recommendations).values(recs.map((r) => ({ entryId, ...r })));
}

export async function addRecommendations(entryId: string, recs: NewRecommendation[]) {
  if (recs.length === 0) return;
  await db.insert(recommendations).values(recs.map((r) => ({ entryId, ...r })));
}

export async function setRecommendationStatus(
  id: string,
  status: "SUGGESTED" | "SAVED" | "KNOWN" | "DISMISSED",
) {
  await db.update(recommendations).set({ status }).where(eq(recommendations.id, id));
}

export async function getRecommendationById(id: string) {
  return db.query.recommendations.findFirst({ where: eq(recommendations.id, id) });
}
