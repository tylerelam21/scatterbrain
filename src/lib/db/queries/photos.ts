import { createId } from "@paralleldrive/cuid2";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { photoCollectionItems, photoCollections, photos } from "@/lib/db/schema";
import type { Visibility } from "@/lib/content/visibility";
import { indexSearchDocument, removeSearchDocument } from "@/lib/search";

function photoSearchBody(photo: { caption: string | null; locationLabel: string | null }) {
  return [photo.caption, photo.locationLabel].filter(Boolean).join(" ");
}

export async function getPhotoById(id: string) {
  return db.query.photos.findFirst({ where: eq(photos.id, id) });
}

export async function listAllPhotos({ publicOnly }: { publicOnly: boolean }) {
  const conditions = publicOnly ? [eq(photos.visibility, "PUBLIC")] : [];
  return db
    .select()
    .from(photos)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(photos.sortOrder), desc(photos.createdAt));
}

export async function createPhoto(data: {
  storageKey: string;
  originalFilename: string;
  width: number;
  height: number;
}) {
  const [created] = await db.insert(photos).values(data).returning();
  await indexSearchDocument({
    contentType: "PHOTO",
    contentId: created.id,
    title: created.title,
    body: photoSearchBody(created),
    visibility: created.visibility,
  });
  return created;
}

export async function updatePhoto(
  id: string,
  data: Partial<{
    title: string | null;
    caption: string | null;
    altText: string | null;
    locationLabel: string | null;
    camera: string | null;
    lens: string | null;
    visibility: Visibility;
    sortOrder: number;
  }>,
) {
  const [updated] = await db.update(photos).set(data).where(eq(photos.id, id)).returning();
  if (updated) {
    await indexSearchDocument({
      contentType: "PHOTO",
      contentId: updated.id,
      title: updated.title,
      body: photoSearchBody(updated),
      visibility: updated.visibility,
    });
  }
}

export async function deletePhoto(id: string) {
  await db.delete(photos).where(eq(photos.id, id));
  await removeSearchDocument("PHOTO", id);
}

// --- Collections ---

export async function listCollections({ publicOnly }: { publicOnly: boolean }) {
  const conditions = publicOnly ? [eq(photoCollections.visibility, "PUBLIC")] : [];
  return db
    .select()
    .from(photoCollections)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(photoCollections.sortOrder), desc(photoCollections.createdAt));
}

export async function getCollectionBySlug(slug: string, { publicOnly }: { publicOnly: boolean }) {
  const collection = await db.query.photoCollections.findFirst({
    where: eq(photoCollections.slug, slug),
  });
  if (!collection) return null;
  if (publicOnly && collection.visibility !== "PUBLIC") return null;
  return collection;
}

export async function createCollection(title: string) {
  const slug = `${slugifyTitle(title) || "collection"}-${createId().slice(0, 6)}`;
  const [created] = await db.insert(photoCollections).values({ slug, title }).returning();
  return created;
}

export async function updateCollection(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string | null;
    visibility: Visibility;
    coverPhotoId: string | null;
    sortOrder: number;
  }>,
) {
  await db.update(photoCollections).set(data).where(eq(photoCollections.id, id));
}

export async function isCollectionSlugTaken(slug: string, excludeId: string) {
  const existing = await db.query.photoCollections.findFirst({
    where: eq(photoCollections.slug, slug),
  });
  return !!existing && existing.id !== excludeId;
}

export async function deleteCollection(id: string) {
  await db.delete(photoCollections).where(eq(photoCollections.id, id));
}

export async function listPhotosInCollection(collectionId: string, { publicOnly }: { publicOnly: boolean }) {
  const conditions = [eq(photoCollectionItems.collectionId, collectionId)];
  if (publicOnly) conditions.push(eq(photos.visibility, "PUBLIC"));

  return db
    .select({
      id: photos.id,
      storageKey: photos.storageKey,
      width: photos.width,
      height: photos.height,
      title: photos.title,
      caption: photos.caption,
      altText: photos.altText,
      visibility: photos.visibility,
      sortOrder: photoCollectionItems.sortOrder,
    })
    .from(photoCollectionItems)
    .innerJoin(photos, eq(photos.id, photoCollectionItems.photoId))
    .where(and(...conditions))
    .orderBy(asc(photoCollectionItems.sortOrder));
}

export async function listCollectionsForPhoto(photoId: string) {
  return db
    .select({ id: photoCollections.id, title: photoCollections.title, slug: photoCollections.slug })
    .from(photoCollectionItems)
    .innerJoin(photoCollections, eq(photoCollections.id, photoCollectionItems.collectionId))
    .where(eq(photoCollectionItems.photoId, photoId));
}

export async function addPhotoToCollection(collectionId: string, photoId: string) {
  const existing = await db.query.photoCollectionItems.findFirst({
    where: and(
      eq(photoCollectionItems.collectionId, collectionId),
      eq(photoCollectionItems.photoId, photoId),
    ),
  });
  if (existing) return;
  await db.insert(photoCollectionItems).values({ collectionId, photoId });
}

export async function removePhotoFromCollection(collectionId: string, photoId: string) {
  await db
    .delete(photoCollectionItems)
    .where(
      and(eq(photoCollectionItems.collectionId, collectionId), eq(photoCollectionItems.photoId, photoId)),
    );
}

function slugifyTitle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
