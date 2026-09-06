"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as photoQueries from "@/lib/db/queries/photos";
import { generateStorageKey, getPresignedUploadUrl, deleteStorageObject } from "@/lib/storage/presign";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";

function revalidatePhotos(slug?: string) {
  revalidatePath("/photos");
  if (slug) revalidatePath(`/photos/${slug}`);
}

// PRD §26 — the client uploads directly to R2 with this presigned URL; the
// file body never passes through our server (Vercel function body limits,
// and no reason to pay for that bandwidth twice).
export async function requestPhotoUpload(filename: string, contentType: string) {
  await requireOwner();
  const storageKey = generateStorageKey(filename);
  const uploadUrl = await getPresignedUploadUrl(storageKey, contentType);
  return { storageKey, uploadUrl };
}

export async function createPhoto(input: {
  storageKey: string;
  originalFilename: string;
  width: number;
  height: number;
}) {
  await requireOwner();
  const photo = await photoQueries.createPhoto(input);
  revalidatePhotos();
  return photo;
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
