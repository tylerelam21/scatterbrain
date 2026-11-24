"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as brainQueries from "@/lib/db/queries/brain";
import { BRAIN_ITEM_TYPES, type BrainItemType } from "@/lib/brain/constants";
import { fetchLinkPreview, type LinkPreview } from "@/lib/commonplace/link-preview";

// Called directly from the add-item form while the owner pastes a link —
// og:image/og:title, no API key (see lib/commonplace/link-preview.ts).
export async function fetchCommonplaceLinkPreview(url: string): Promise<LinkPreview> {
  await requireOwner();
  return fetchLinkPreview(url);
}

// Public Commonplace items are added here directly, public by default —
// there's no private "Ideas" inbox to curate from anymore, so an item
// typed in only exists to be shown. imageUrl is either a fetched
// og:image (pasted link) or an Open Library cover (book title) — see
// the add-item form and server/actions/books.ts.
export async function addCommonplaceItem(formData: FormData) {
  const owner = await requireOwner();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const title = String(formData.get("title") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const type = (BRAIN_ITEM_TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as BrainItemType)
    : undefined;

  const created = await brainQueries.createBrainItem(
    owner.id,
    content,
    sourceUrl || undefined,
    imageUrl || undefined,
  );
  await brainQueries.updateBrainItem(owner.id, created.id, {
    title: title || null,
    visibility: "PUBLIC",
    ...(type ? { type } : {}),
  });
  revalidatePath("/commonplace");
}

export async function removeCommonplaceItem(id: string) {
  const owner = await requireOwner();
  await brainQueries.deleteBrainItem(owner.id, id);
  revalidatePath("/commonplace");
}
