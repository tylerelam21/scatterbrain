import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { journalEntries, journalEntryTags, tags } from "@/lib/db/schema";
import type { JournalContent, JournalStatus } from "@/lib/journal/constants";
import type { Visibility } from "@/lib/content/visibility";

export interface JournalListFilters {
  q?: string;
  tag?: string;
  status?: JournalStatus;
}

// PRD §12.3 — chronological timeline, newest first; search + tags.
export async function listJournalEntries(userId: string, filters: JournalListFilters) {
  const conditions = [eq(journalEntries.userId, userId)];

  if (filters.status) {
    conditions.push(eq(journalEntries.status, filters.status));
  }
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    conditions.push(
      or(ilike(journalEntries.plainText, pattern), ilike(journalEntries.title, pattern))!,
    );
  }
  if (filters.tag) {
    const taggedEntryIds = db
      .select({ id: journalEntryTags.journalEntryId })
      .from(journalEntryTags)
      .innerJoin(tags, eq(tags.id, journalEntryTags.tagId))
      .where(and(eq(tags.userId, userId), eq(tags.name, filters.tag)));
    conditions.push(inArray(journalEntries.id, taggedEntryIds));
  }

  return db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.journalDate), desc(journalEntries.createdAt));
}

export async function getJournalEntryById(userId: string, id: string) {
  return db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)),
  });
}

export async function createJournalEntry(
  userId: string,
  input: Partial<{
    title: string;
    journalDate: string;
    contentJson: JournalContent;
    plainText: string;
  }> = {},
) {
  const today = new Date().toISOString().slice(0, 10);
  const [created] = await db
    .insert(journalEntries)
    .values({
      userId,
      title: input.title,
      journalDate: input.journalDate ?? today,
      contentJson: input.contentJson ?? null,
      plainText: input.plainText ?? "",
    })
    .returning();
  return created;
}

export async function updateJournalEntry(
  userId: string,
  id: string,
  data: Partial<{
    title: string | null;
    contentJson: JournalContent;
    plainText: string;
    journalDate: string;
    status: JournalStatus;
    visibility: Visibility;
  }>,
) {
  await db
    .update(journalEntries)
    .set(data)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

export async function deleteJournalEntry(userId: string, id: string) {
  await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}
