"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as brainQueries from "@/lib/db/queries/brain";
import * as tagQueries from "@/lib/db/queries/tags";
import { BRAIN_ITEM_TYPES, type BrainItemType } from "@/lib/brain/constants";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";

function revalidateBrain(id?: string) {
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/work");
  if (id) revalidatePath(`/brain/${id}`);
}

// Tag every item captured from the Work page's Brainstorm box, so it's
// filterable there via the same tag system Ideas/Journal already use —
// no new content model needed, just a consistent tag.
const WORK_TAG = "Work";

export interface CaptureState {
  ok: boolean;
  savedAt: number;
}

// PRD §10.2 Quick Capture — persist immediately, no required metadata.
export async function captureBrainItem(
  _prevState: CaptureState,
  formData: FormData,
): Promise<CaptureState> {
  const owner = await requireOwner();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { ok: false, savedAt: Date.now() };

  await brainQueries.createBrainItem(owner.id, content);
  revalidateBrain();
  return { ok: true, savedAt: Date.now() };
}

// The Work page's Brainstorm box — same capture-first philosophy as Quick
// Capture, plus an optional link. Google Sheets/Slides and PowerPoint
// links get a rich expandable preview in WorkLinkCard; anything else is
// just a plain bookmark. Always tagged "Work" so it lists separately from
// the general Ideas feed without a second content model.
export async function captureWorkItem(
  _prevState: CaptureState,
  formData: FormData,
): Promise<CaptureState> {
  const owner = await requireOwner();
  const content = String(formData.get("content") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!content) return { ok: false, savedAt: Date.now() };

  const created = await brainQueries.createBrainItem(owner.id, content, url || undefined);
  await tagQueries.addTagToBrainItem(owner.id, created.id, WORK_TAG);
  revalidateBrain();
  return { ok: true, savedAt: Date.now() };
}

// Inline delete from the Work page's list — unlike deleteBrainItem (used
// from the Brain detail page), this has nowhere to redirect to: the list
// just re-renders without the item.
export async function deleteWorkItem(id: string) {
  const owner = await requireOwner();
  await brainQueries.deleteBrainItem(owner.id, id);
  revalidateBrain(id);
}

export async function updateBrainItem(id: string, formData: FormData) {
  const owner = await requireOwner();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const visibilityRaw = String(formData.get("visibility") ?? "");

  if (!content) return;

  const type = (BRAIN_ITEM_TYPES as readonly string[]).includes(typeRaw)
    ? (typeRaw as BrainItemType)
    : undefined;
  const visibility = (VISIBILITY_OPTIONS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as Visibility)
    : undefined;

  await brainQueries.updateBrainItem(owner.id, id, {
    title: title || null,
    content,
    ...(type ? { type } : {}),
    ...(visibility ? { visibility } : {}),
  });
  revalidateBrain(id);
}

export async function setPinned(id: string, pinned: boolean) {
  const owner = await requireOwner();
  await brainQueries.setBrainItemFlags(owner.id, id, { pinned });
  revalidateBrain(id);
}

export async function setArchived(id: string, archived: boolean) {
  const owner = await requireOwner();
  await brainQueries.setBrainItemFlags(owner.id, id, { archived });
  revalidateBrain(id);
}

export async function deleteBrainItem(id: string) {
  const owner = await requireOwner();
  await brainQueries.deleteBrainItem(owner.id, id);
  revalidateBrain(id);
  redirect("/studio?space=fun");
}

export async function addTag(id: string, formData: FormData) {
  const owner = await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await tagQueries.addTagToBrainItem(owner.id, id, name);
  revalidateBrain(id);
}

export async function removeTag(id: string, tagId: string) {
  await requireOwner();
  await tagQueries.removeTagFromBrainItem(id, tagId);
  revalidateBrain(id);
}
