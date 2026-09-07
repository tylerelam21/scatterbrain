"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as journalQueries from "@/lib/db/queries/journal";
import * as tagQueries from "@/lib/db/queries/tags";
import { getBrainItemById } from "@/lib/db/queries/brain";
import { createRelationship } from "@/lib/db/queries/relationships";
import { JOURNAL_STATUSES, type JournalContent, type JournalStatus } from "@/lib/journal/constants";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";

function revalidateJournal(id?: string) {
  revalidatePath("/studio");
  if (id) revalidatePath(`/journal/${id}`);
}

// PRD §12.3 — "New entry" creates an empty draft immediately; the editor
// itself is where the actual writing (and autosave) happens.
export async function createJournalEntry() {
  const owner = await requireOwner();
  const entry = await journalQueries.createJournalEntry(owner.id);
  revalidateJournal();
  redirect(`/journal/${entry.id}`);
}


export interface AutosaveState {
  ok: boolean;
  savedAt: number;
}

// PRD §12.4 — called directly from the client (not a form submit), debounced
// there. The editor is always the source of truth locally: this only ever
// pushes state out, so there's nothing to overwrite with a stale response.
export async function autosaveJournalEntry(
  id: string,
  data: { title: string; contentJson: JournalContent; plainText: string; journalDate: string },
): Promise<AutosaveState> {
  const owner = await requireOwner();
  await journalQueries.updateJournalEntry(owner.id, id, {
    title: data.title || null,
    contentJson: data.contentJson,
    plainText: data.plainText,
    journalDate: data.journalDate,
  });
  revalidatePath("/journal");
  return { ok: true, savedAt: Date.now() };
}

export async function updateJournalMeta(id: string, formData: FormData) {
  const owner = await requireOwner();

  const statusRaw = String(formData.get("status") ?? "");
  const visibilityRaw = String(formData.get("visibility") ?? "");
  const status = (JOURNAL_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as JournalStatus)
    : undefined;
  const visibility = (VISIBILITY_OPTIONS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as Visibility)
    : undefined;

  await journalQueries.updateJournalEntry(owner.id, id, {
    ...(status ? { status } : {}),
    ...(visibility ? { visibility } : {}),
  });
  revalidateJournal(id);
}

export async function deleteJournalEntry(id: string) {
  const owner = await requireOwner();
  await journalQueries.deleteJournalEntry(owner.id, id);
  revalidateJournal(id);
  redirect("/studio?tab=journal");
}

export async function addJournalTag(id: string, formData: FormData) {
  const owner = await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await tagQueries.addTagToJournalEntry(owner.id, id, name);
  revalidateJournal(id);
}

export async function removeJournalTag(id: string, tagId: string) {
  await requireOwner();
  await tagQueries.removeTagFromJournalEntry(id, tagId);
  revalidateJournal(id);
}

// PRD §11.5 — "Expand into journal entry". The Brain item is preserved, not
// destroyed; the two are linked via an EXPANDED_FROM ContentRelationship.
export async function expandBrainItemToJournal(brainItemId: string) {
  const owner = await requireOwner();

  const brainItem = await getBrainItemById(owner.id, brainItemId);
  if (!brainItem) redirect("/studio?tab=feed");

  const content = brainItem.content.trim();
  const contentJson: JournalContent = {
    type: "doc",
    content: [
      content
        ? { type: "paragraph", content: [{ type: "text", text: content }] }
        : { type: "paragraph" },
    ],
  };

  const entry = await journalQueries.createJournalEntry(owner.id, {
    title: brainItem.title ?? undefined,
    contentJson,
    plainText: content,
  });

  await createRelationship({
    sourceType: "BRAIN_ITEM",
    sourceId: brainItem.id,
    targetType: "JOURNAL_ENTRY",
    targetId: entry.id,
    relationshipType: "EXPANDED_FROM",
  });

  revalidateJournal();
  redirect(`/journal/${entry.id}`);
}
