"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireOwner } from "@/lib/auth/require-owner";
import * as photoQueries from "@/lib/db/queries/photos";
import { generateStorageKey, deleteStorageObject } from "@/lib/storage/presign";
import { getStorageBucket, getStorageClient } from "@/lib/storage/client";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";

function revalidatePhotos(slug?: string) {
  revalidatePath("/photos");
  if (slug) revalidatePath(`/photos/${slug}`);
}

// The file passes through this Server Action and gets PUT to R2 with our
// own credentials — no direct browser-to-R2 request, so no CORS policy to
// get right. (An earlier version uploaded straight from the browser via a
// presigned URL; that depended on the storage bucket's CORS config
// matching the site's exact origin, which turned out to be a persistent
// source of broken uploads.) Payload size is capped by
// experimental.serverActions.bodySizeLimit in next.config.ts.
export async function uploadPhotoFile(formData: FormData): Promise<{
  id: string;
  storageKey: string;
}> {
  await requireOwner();

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided.");

  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));
  const storageKey = generateStorageKey(file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const client = getStorageClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getStorageBucket(),
      Key: storageKey,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  const photo = await photoQueries.createPhoto({
    storageKey,
    originalFilename: file.name,
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0,
  });
  revalidatePhotos();
  return { id: photo.id, storageKey: photo.storageKey };
}

export async function updatePhotoMeta(id: string, formData: FormData) {
  await requireOwner();

  const visibilityRaw = String(formData.get("visibility") ?? "");
  const visibility = (VISIBILITY_OPTIONS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as Visibility)
    : undefined;

  await photoQueries.updatePhoto(id, {
    title: String(formData.get("title") ?? "").trim() || null,
    caption: String(formData.get("caption") ?? "").trim() || null,
    altText: String(formData.get("altText") ?? "").trim() || null,
    locationLabel: String(formData.get("locationLabel") ?? "").trim() || null,
    ...(visibility ? { visibility } : {}),
  });
  revalidatePhotos();
}

export async function deletePhoto(id: string) {
  await requireOwner();
  const photo = await photoQueries.getPhotoById(id);
  if (!photo) return;
  await photoQueries.deletePhoto(id);
  await deleteStorageObject(photo.storageKey);
  revalidatePhotos();
}

// --- Collections ---

export async function createCollection(formData: FormData) {
  await requireOwner();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const collection = await photoQueries.createCollection(title);
  revalidatePhotos();
  redirect(`/photos/${collection.slug}`);
}

export interface SlugFormState {
  ok: boolean;
  error?: string;
  slug?: string;
}

export async function updateCollectionSlug(
  id: string,
  currentSlug: string,
  _prev: SlugFormState,
  formData: FormData,
): Promise<SlugFormState> {
  await requireOwner();
  const raw = String(formData.get("slug") ?? "");
  const slug = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return { ok: false, error: "Slug can't be empty." };

  if (slug !== currentSlug && (await photoQueries.isCollectionSlugTaken(slug, id))) {
    return { ok: false, error: "That slug is already in use." };
  }

  await photoQueries.updateCollection(id, { slug });
  revalidatePhotos(currentSlug);
  revalidatePhotos(slug);
  return { ok: true, slug };
}

export async function updateCollectionMeta(id: string, currentSlug: string, formData: FormData) {
  await requireOwner();

  const visibilityRaw = String(formData.get("visibility") ?? "");
  const visibility = (VISIBILITY_OPTIONS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as Visibility)
    : undefined;

  await photoQueries.updateCollection(id, {
    title: String(formData.get("title") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || null,
    ...(visibility ? { visibility } : {}),
  });
  revalidatePhotos(currentSlug);
}

export async function deleteCollection(id: string) {
  await requireOwner();
  await photoQueries.deleteCollection(id);
  revalidatePhotos();
  redirect("/photos");
}

export async function addPhotoToCollection(collectionSlug: string, collectionId: string, formData: FormData) {
  await requireOwner();
  const photoId = String(formData.get("photoId") ?? "");
  if (!photoId) return;
  await photoQueries.addPhotoToCollection(collectionId, photoId);
  revalidatePhotos(collectionSlug);
}

export async function removePhotoFromCollection(collectionSlug: string, collectionId: string, photoId: string) {
  await requireOwner();
  await photoQueries.removePhotoFromCollection(collectionId, photoId);
  revalidatePhotos(collectionSlug);
}
