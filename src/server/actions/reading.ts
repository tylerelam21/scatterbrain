"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as readingQueries from "@/lib/db/queries/reading";
import { generateMoreRecommendations, generateReflection } from "@/lib/reading/ai";
import { MEDIA_TYPES, type MediaType, type ReadingContent } from "@/lib/reading/constants";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";

function revalidateReading(id?: string) {
  revalidatePath("/reading");
  revalidatePath("/studio");
  if (id) revalidatePath(`/reading/${id}`);
}

function excerpt(text: string, max = 220) {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

// -- Creation --------------------------------------------------------------

// "New Entry" — find-or-create the Work first (by title, case-insensitive,
// so re-typing something you've already logged reuses it instead of
// forking into a duplicate Work), then a bare draft entry. The AI layer is
// triggered separately once there's something to reflect on, not here.
export async function createReadingEntry(formData: FormData) {
  const owner = await requireOwner();

  const title = String(formData.get("workTitle") ?? "").trim();
  if (!title) redirect("/reading");

  const existing = await readingQueries.findWorkByTitle(owner.id, title);
  let workId: string;
  if (existing) {
    workId = existing.id;
  } else {
    const creator = String(formData.get("workCreator") ?? "").trim();
    const mediaTypeRaw = String(formData.get("workMediaType") ?? "");
    const mediaType = (MEDIA_TYPES as readonly string[]).includes(mediaTypeRaw)
      ? (mediaTypeRaw as MediaType)
      : "OTHER";
    const work = await readingQueries.createWork(owner.id, { title, creator, mediaType });
    workId = work.id;
  }

  const entry = await readingQueries.createReadingEntry(owner.id, workId);
  revalidateReading();
  redirect(`/reading/${entry.id}`);
}

// -- Autosave / meta ---------------------------------------------------------

export interface AutosaveState {
  ok: boolean;
  savedAt: number;
}

export async function autosaveReadingEntry(
  id: string,
  data: { title: string; entryDate: string; bodyJson: ReadingContent; bodyPlainText: string },
): Promise<AutosaveState> {
  const owner = await requireOwner();
  await readingQueries.updateReadingEntry(owner.id, id, {
    title: data.title || null,
    entryDate: data.entryDate,
    bodyJson: data.bodyJson,
    bodyPlainText: data.bodyPlainText,
  });
  revalidateReading(id);
  return { ok: true, savedAt: Date.now() };
}

export async function updateReadingMeta(id: string, formData: FormData) {
  const owner = await requireOwner();

  const visibilityRaw = String(formData.get("visibility") ?? "");
  const visibility = (VISIBILITY_OPTIONS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as Visibility)
    : undefined;
  const status = formData.get("status") === "COMPLETE" ? "COMPLETE" : "DRAFT";

  await readingQueries.updateReadingEntry(owner.id, id, {
    status,
    ...(visibility ? { visibility } : {}),
  });
  revalidateReading(id);
}

export async function updatePracticalApplication(id: string, text: string) {
  const owner = await requireOwner();
  await readingQueries.updateReadingEntry(owner.id, id, { practicalApplication: text || null });
  revalidateReading(id);
}

export async function deleteReadingEntry(id: string) {
  const owner = await requireOwner();
  await readingQueries.deleteReadingEntry(owner.id, id);
  revalidateReading(id);
  redirect("/reading");
}

// -- Takeaways / questions (the user's own short-form lists) ---------------

export async function addTakeaway(id: string, formData: FormData) {
  const owner = await requireOwner();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const entry = await readingQueries.getReadingEntryById(owner.id, id);
  if (!entry) return;
  await readingQueries.updateReadingEntry(owner.id, id, {
    takeaways: [...entry.entry.takeaways, text],
  });
  revalidateReading(id);
}

export async function removeTakeaway(id: string, index: number) {
  const owner = await requireOwner();
  const entry = await readingQueries.getReadingEntryById(owner.id, id);
  if (!entry) return;
  await readingQueries.updateReadingEntry(owner.id, id, {
    takeaways: entry.entry.takeaways.filter((_, i) => i !== index),
  });
  revalidateReading(id);
}

export async function addQuestion(id: string, formData: FormData) {
  const owner = await requireOwner();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const entry = await readingQueries.getReadingEntryById(owner.id, id);
  if (!entry) return;
  await readingQueries.updateReadingEntry(owner.id, id, {
    questions: [...entry.entry.questions, text],
  });
  revalidateReading(id);
}

export async function removeQuestion(id: string, index: number) {
  const owner = await requireOwner();
  const entry = await readingQueries.getReadingEntryById(owner.id, id);
  if (!entry) return;
  await readingQueries.updateReadingEntry(owner.id, id, {
    questions: entry.entry.questions.filter((_, i) => i !== index),
  });
  revalidateReading(id);
}

// -- Themes ------------------------------------------------------------------

export async function addUserTheme(id: string, formData: FormData) {
  const owner = await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await readingQueries.addThemeToEntry(owner.id, id, name, "USER");
  revalidateReading(id);
}

export async function removeTheme(entryId: string, themeId: string) {
  await requireOwner();
  await readingQueries.removeThemeFromEntry(entryId, themeId);
  revalidateReading(entryId);
}

// -- AI layer ----------------------------------------------------------------

// Shared by the first "Generate reflection" and every later "Regenerate" —
// AI content is always disposable and reproducible, never the entry's
// source of truth, so regenerating just overwrites it in place.
export async function generateAIReflection(id: string) {
  const owner = await requireOwner();
  const row = await readingQueries.getReadingEntryById(owner.id, id);
  if (!row) return;
  const { entry, work } = row;

  const related = await readingQueries.getRelatedEntriesByTheme(owner.id, id);
  const relatedContext = related.slice(0, 3).map((r) => ({
    workTitle: r.work.title,
    themeNames: r.sharedThemeNames,
    excerpt: excerpt(r.entry.bodyPlainText || r.entry.title || ""),
  }));

  const result = await generateReflection({
    workTitle: work.title,
    workCreator: work.creator,
    mediaType: work.mediaType,
    entryTitle: entry.title,
    bodyPlainText: entry.bodyPlainText,
    takeaways: entry.takeaways,
    questions: entry.questions,
    practicalApplication: entry.practicalApplication,
    relatedEntries: relatedContext,
  });

  await readingQueries.upsertAIReflection(id, result.reflection, "claude-opus-5");
  await readingQueries.replaceAIThemesForEntry(owner.id, id, result.themes);
  await readingQueries.replaceSuggestedRecommendations(
    id,
    result.recommendations.map((r) => ({
      title: r.title,
      creator: r.creator,
      mediaType: r.mediaType,
      url: r.url,
      whyItConnects: r.whyItConnects,
      lengthNote: r.lengthNote,
    })),
  );

  revalidateReading(id);
}

export async function moreLikeThisRecommendation(recommendationId: string, entryId: string) {
  const owner = await requireOwner();
  const [row, recommendation] = await Promise.all([
    readingQueries.getReadingEntryById(owner.id, entryId),
    readingQueries.getRecommendationById(recommendationId),
  ]);
  if (!row || !recommendation) return;
  const { entry, work } = row;

  const more = await generateMoreRecommendations(
    {
      workTitle: work.title,
      workCreator: work.creator,
      mediaType: work.mediaType,
      entryTitle: entry.title,
      bodyPlainText: entry.bodyPlainText,
      takeaways: entry.takeaways,
      questions: entry.questions,
      practicalApplication: entry.practicalApplication,
      relatedEntries: [],
    },
    { title: recommendation.title, whyItConnects: recommendation.whyItConnects },
  );

  await readingQueries.addRecommendations(
    entryId,
    more.map((r) => ({
      title: r.title,
      creator: r.creator,
      mediaType: r.mediaType,
      url: r.url,
      whyItConnects: r.whyItConnects,
      lengthNote: r.lengthNote,
    })),
  );
  revalidateReading(entryId);
}

export async function setRecommendationStatus(
  recommendationId: string,
  entryId: string,
  status: "SAVED" | "KNOWN" | "DISMISSED" | "SUGGESTED",
) {
  await requireOwner();
  await readingQueries.setRecommendationStatus(recommendationId, status);
  revalidateReading(entryId);
}
