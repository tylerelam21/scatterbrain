import { and, desc, eq, gte, ilike, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { brainItemTags, brainItems, tags } from "@/lib/db/schema";
import type { BrainItemType } from "@/lib/brain/constants";
import type { Visibility } from "@/lib/content/visibility";

export interface BrainListFilters {
  q?: string;
  type?: BrainItemType;
  tag?: string;
  pinnedOnly?: boolean;
  includeArchived?: boolean;
  from?: string;
  to?: string;
}

// PRD §11.3 — default sort newest first; search/type/tag/pinned/archived/date filters.
export async function listBrainItems(userId: string, filters: BrainListFilters) {
  const conditions = [eq(brainItems.userId, userId)];

  if (!filters.includeArchived) {
    conditions.push(eq(brainItems.archived, false));
  }
  if (filters.pinnedOnly) {
    conditions.push(eq(brainItems.pinned, true));
  }
  if (filters.type) {
    conditions.push(eq(brainItems.type, filters.type));
  }
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    conditions.push(or(ilike(brainItems.content, pattern), ilike(brainItems.title, pattern))!);
  }
  if (filters.from) {
    conditions.push(gte(brainItems.createdAt, new Date(filters.from)));
  }
  if (filters.to) {
    conditions.push(lte(brainItems.createdAt, new Date(filters.to)));
  }

  if (filters.tag) {
    const taggedItemIds = db
      .select({ id: brainItemTags.brainItemId })
      .from(brainItemTags)
      .innerJoin(tags, eq(tags.id, brainItemTags.tagId))
      .where(and(eq(tags.userId, userId), eq(tags.name, filters.tag)));
    conditions.push(inArray(brainItems.id, taggedItemIds));
  }

  return db
    .select()
    .from(brainItems)
    .where(and(...conditions))
    .orderBy(desc(brainItems.createdAt));
}

export async function getRecentBrainItems(userId: string, limit = 5) {
  return db
    .select()
    .from(brainItems)
    .where(and(eq(brainItems.userId, userId), eq(brainItems.archived, false)))
    .orderBy(desc(brainItems.createdAt))
    .limit(limit);
}

export async function getBrainItemById(userId: string, id: string) {
  return db.query.brainItems.findFirst({
    where: and(eq(brainItems.id, id), eq(brainItems.userId, userId)),
  });
}

// PRD §10.2 — capture must never require choosing a type, tag, or title.
export async function createBrainItem(userId: string, content: string) {
  const [created] = await db.insert(brainItems).values({ userId, content }).returning();
  return created;
}

export async function updateBrainItem(
  userId: string,
  id: string,
  data: Partial<{
    title: string | null;
    content: string;
    type: BrainItemType;
    visibility: Visibility;
  }>,
) {
  await db
    .update(brainItems)
    .set(data)
    .where(and(eq(brainItems.id, id), eq(brainItems.userId, userId)));
}

export async function setBrainItemFlags(
  userId: string,
  id: string,
  flags: Partial<{ pinned: boolean; archived: boolean }>,
) {
  await db
    .update(brainItems)
    .set(flags)
    .where(and(eq(brainItems.id, id), eq(brainItems.userId, userId)));
}

export async function deleteBrainItem(userId: string, id: string) {
  await db.delete(brainItems).where(and(eq(brainItems.id, id), eq(brainItems.userId, userId)));
}

// PRD §10.6 resurfacing foundation — eligible items are older than 14 days,
// not archived, and not resurfaced in the last 14 days. Home doesn't call
// this yet (that's Phase 4); the query exists now so the exclusion rule has
// somewhere to live.
export async function getResurfacedThoughtCandidate(userId: string) {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [item] = await db
    .select()
    .from(brainItems)
    .where(
      and(
        eq(brainItems.userId, userId),
        eq(brainItems.archived, false),
        lt(brainItems.createdAt, fourteenDaysAgo),
        or(isNull(brainItems.lastResurfacedAt), lt(brainItems.lastResurfacedAt, fourteenDaysAgo)),
      ),
    )
    .orderBy(sql`random()`)
    .limit(1);

  return item ?? null;
}

export async function markBrainItemResurfaced(id: string) {
  await db.update(brainItems).set({ lastResurfacedAt: new Date() }).where(eq(brainItems.id, id));
}
