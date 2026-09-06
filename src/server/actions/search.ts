"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import { createBrainItem } from "@/lib/db/queries/brain";
import { searchAll, type SearchResult } from "@/lib/db/queries/search";

// Backs the command palette's live "search as you type" (Phase 7). A thin
// owner-gated wrapper so a client component can call it directly.
export async function searchForPalette(query: string): Promise<SearchResult[]> {
  await requireOwner();
  return searchAll(query, { ownerMode: true, limit: 8 });
}

// The palette's "Capture thought" command — same persistence as the Home
// Quick Capture, just triggered from a different surface.
export async function captureThoughtFromPalette(content: string) {
  const owner = await requireOwner();
  const trimmed = content.trim();
  if (!trimmed) return;
  await createBrainItem(owner.id, trimmed);
  revalidatePath("/");
  revalidatePath("/brain");
}
