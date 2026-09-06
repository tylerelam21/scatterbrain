import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { brainItemTags, journalEntryTags, tags } from "@/lib/db/schema";

export async function listTagsForUser(userId: string) {
  return db.query.tags.findMany({
    where: eq(tags.userId, userId),
    orderBy: asc(tags.name),
  });
}

// "On My Mind" (Home) — tags ranked by how often they're actually used
// across Brain and Journal, not semantic clustering (that's V2 §63).
export async function getTopTags(userId: string, limit = 8) {
  const [brainLinks, journalLinks] = await Promise.all([
    db
      .select({ name: tags.name })
      .from(brainItemTags)
      .innerJoin(tags, eq(tags.id, brainItemTags.tagId))
      .where(eq(tags.userId, userId)),
    db
      .select({ name: tags.name })
      .from(journalEntryTags)
      .innerJoin(tags, eq(tags.id, journalEntryTags.tagId))
      .where(eq(tags.userId, userId)),
  ]);

  const counts = new Map<string, number>();
  for (const { name } of [...brainLinks, ...journalLinks]) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export async function getTagsForBrainItem(brainItemId: string) {
  const rows = await db
    .select({ id: tags.id, name: tags.name })
    .from(brainItemTags)
    .innerJoin(tags, eq(tags.id, brainItemTags.tagId))
    .where(eq(brainItemTags.brainItemId, brainItemId))
    .orderBy(asc(tags.name));
  return rows;
}

export async function getTagsForJournalEntry(journalEntryId: string) {
  const rows = await db
    .select({ id: tags.id, name: tags.name })
    .from(journalEntryTags)
    .innerJoin(tags, eq(tags.id, journalEntryTags.tagId))
    .where(eq(journalEntryTags.journalEntryId, journalEntryId))
    .orderBy(asc(tags.name));
  return rows;
}

async function getOrCreateTag(userId: string, rawName: string) {
  const name = rawName.trim();
  const existing = await db.query.tags.findFirst({
    where: and(eq(tags.userId, userId), eq(tags.name, name)),
  });
  if (existing) return existing;

  const [created] = await db.insert(tags).values({ userId, name }).returning();
  return created;
}

export async function addTagToBrainItem(userId: string, brainItemId: string, rawName: string) {
  const name = rawName.trim();
  if (!name) return;

  const tag = await getOrCreateTag(userId, name);
  const existingLink = await db.query.brainItemTags.findFirst({
    where: and(eq(brainItemTags.brainItemId, brainItemId), eq(brainItemTags.tagId, tag.id)),
  });
  if (existingLink) return;

  await db.insert(brainItemTags).values({ brainItemId, tagId: tag.id });
}

export async function removeTagFromBrainItem(brainItemId: string, tagId: string) {
  await db
    .delete(brainItemTags)
    .where(and(eq(brainItemTags.brainItemId, brainItemId), eq(brainItemTags.tagId, tagId)));
}

export async function addTagToJournalEntry(userId: string, journalEntryId: string, rawName: string) {
  const name = rawName.trim();
  if (!name) return;

  const tag = await getOrCreateTag(userId, name);
  const existingLink = await db.query.journalEntryTags.findFirst({
    where: and(
      eq(journalEntryTags.journalEntryId, journalEntryId),
      eq(journalEntryTags.tagId, tag.id),
    ),
  });
  if (existingLink) return;

  await db.insert(journalEntryTags).values({ journalEntryId, tagId: tag.id });
}

export async function removeTagFromJournalEntry(journalEntryId: string, tagId: string) {
  await db
    .delete(journalEntryTags)
    .where(
      and(eq(journalEntryTags.journalEntryId, journalEntryId), eq(journalEntryTags.tagId, tagId)),
    );
}
