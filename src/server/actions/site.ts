"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import { getAppSetting, setAppSetting } from "@/lib/db/queries/settings";
import { updatePhoto } from "@/lib/db/queries/photos";
import { SITE_CONTENT_KEYS, type SiteContentKey } from "@/lib/site/content-keys";

export interface ShelfBook {
  title: string;
  creator: string | null;
  coverImageUrl: string | null;
}

const SHELF_KEY = "commonplace.shelf";
const SHELF_MAX = 6;

export async function getShelfBooks(ownerId: string): Promise<ShelfBook[]> {
  const raw = await getAppSetting(ownerId, SHELF_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// "Currently on my shelf" — real covers via the same Open Library lookup
// the Reading feature uses (see lib/reading/book-search.ts), stored as a
// small JSON list rather than a new table since it's just a handful of
// {title, creator, coverImageUrl} entries, newest first.
export async function addShelfBook(book: ShelfBook) {
  const owner = await requireOwner();
  const current = await getShelfBooks(owner.id);
  const next = [book, ...current].slice(0, SHELF_MAX);
  await setAppSetting(owner.id, SHELF_KEY, JSON.stringify(next));
  revalidatePath("/commonplace");
}

export async function removeShelfBook(index: number) {
  const owner = await requireOwner();
  const current = await getShelfBooks(owner.id);
  const next = current.filter((_, i) => i !== index);
  await setAppSetting(owner.id, SHELF_KEY, JSON.stringify(next));
  revalidatePath("/commonplace");
}

export async function setSiteContent(formData: FormData) {
  const owner = await requireOwner();
  for (const key of SITE_CONTENT_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    await setAppSetting(owner.id, key, value);
  }
  // Keep the /now page's "last updated" date accurate regardless of which
  // form actually changed the body (see updateNowPage).
  await setAppSetting(owner.id, "now.updatedAt", new Date().toISOString());
  revalidatePath("/");
  revalidatePath("/now");
  revalidatePath("/settings");
}

// Same store as setSiteContent, but one field at a time — for inline
// editing directly on the live homepage (InlineEditable), where resending
// every key on every keystroke would be wasteful and would risk clobbering
// fields edited in another tab.
export async function setSiteContentField(key: SiteContentKey, value: string) {
  const owner = await requireOwner();
  await setAppSetting(owner.id, key, value.trim());
  revalidatePath("/");
  revalidatePath("/settings");
}

// The homepage hero photo needs to actually be viewable by visitors, so
// force it public rather than leaving it at the upload default (PRIVATE)
// — same reasoning as setProjectHeroImage.
export async function setHomeHeroPhoto(photoId: string) {
  const owner = await requireOwner();
  await updatePhoto(photoId, { visibility: "PUBLIC" });
  await setAppSetting(owner.id, "home.heroPhotoId", photoId);
  revalidatePath("/");
}

export async function clearHomeHeroPhoto() {
  const owner = await requireOwner();
  await setAppSetting(owner.id, "home.heroPhotoId", "");
  revalidatePath("/");
}

// Bumps now.updatedAt alongside the body so the /now page can show a real
// "last updated" date — the classic nownownow.com convention — without
// the two ever drifting out of sync.
export async function updateNowPage(body: string) {
  const owner = await requireOwner();
  await setAppSetting(owner.id, "now.body", body.trim());
  await setAppSetting(owner.id, "now.updatedAt", new Date().toISOString());
  revalidatePath("/now");
}
