"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as journalQueries from "@/lib/db/queries/journal";

// Public "Notes" are plain text, not a rich-text document — no editor to
// load, nothing to get out of sync with a saved Tiptap schema. The journal
// table still carries a contentJson column from an earlier design; notes
// created and edited here simply never set it and the page renders
// straight from plainText regardless of what (if anything) it holds.
export async function createNote(formData: FormData) {
  const owner = await requireOwner();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect("/notes");

  const entry = await journalQueries.createJournalEntry(owner.id, {
    title: title || undefined,
    plainText: body,
  });
  await journalQueries.updateJournalEntry(owner.id, entry.id, {
    status: "COMPLETE",
    visibility: "PUBLIC",
  });
  revalidatePath("/notes");
  revalidatePath("/");
  redirect(`/notes/${entry.id}`);
}

export async function updateNoteField(id: string, field: "title" | "body", value: string) {
  const owner = await requireOwner();
  const trimmed = value.trim();
  await journalQueries.updateJournalEntry(
    owner.id,
    id,
    field === "title" ? { title: trimmed || null } : { plainText: trimmed },
  );
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  revalidatePath("/");
}

export async function deleteNote(id: string) {
  const owner = await requireOwner();
  await journalQueries.deleteJournalEntry(owner.id, id);
  revalidatePath("/notes");
  revalidatePath("/");
  redirect("/notes");
}
