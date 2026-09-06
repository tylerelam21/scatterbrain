import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { brainItemTags, tags } from "@/lib/db/schema";

export async function listTagsForUser(userId: string) {
  return db.query.tags.findMany({
    where: eq(tags.userId, userId),
    orderBy: asc(tags.name),
  });
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
