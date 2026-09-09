"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as workQueries from "@/lib/db/queries/work";
import * as photoQueries from "@/lib/db/queries/photos";
import { PROJECT_STATUSES, type ProjectContent, type ProjectStatus } from "@/lib/work/constants";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";
import { slugify } from "@/lib/work/slug";

function revalidateProject(slug?: string) {
  revalidatePath("/work");
  revalidatePath("/lab");
  revalidatePath("/studio");
  revalidatePath("/");
  if (slug) revalidatePath(`/work/${slug}`);
}

// A project's hero image is shown on the public homepage's Featured Work
// spreads and the project page itself, so it needs to actually be
// viewable by visitors — force it public rather than leaving it at the
// upload default (PRIVATE), which would 404 for anyone but the owner.
export async function setProjectHeroImage(projectId: string, currentSlug: string, photoId: string) {
  await requireOwner();
  await photoQueries.updatePhoto(photoId, { visibility: "PUBLIC" });
  await workQueries.updateProject(projectId, { heroImageId: photoId });
  revalidateProject(currentSlug);
}

export async function clearProjectHeroImage(projectId: string, currentSlug: string) {
  await requireOwner();
  await workQueries.updateProject(projectId, { heroImageId: null });
  revalidateProject(currentSlug);
}

export async function createProject(isLab: boolean) {
  await requireOwner();
  const project = await workQueries.createProject(isLab);
  revalidateProject();
  redirect(`/work/${project.slug}`);
}

export interface AutosaveState {
  ok: boolean;
  savedAt: number;
}

// PRD §12.4-style autosave, reused for the project body — the editor is
// always the source of truth locally, this only ever pushes state out.
export async function autosaveProject(
  id: string,
  currentSlug: string,
  data: { title: string; tagline: string; summary: string; contentJson: ProjectContent; plainText: string },
): Promise<AutosaveState> {
  await requireOwner();
  await workQueries.updateProject(id, {
    title: data.title || "Untitled",
    tagline: data.tagline || null,
    summary: data.summary || null,
    contentJson: data.contentJson,
    plainText: data.plainText,
  });
  revalidateProject(currentSlug);
  return { ok: true, savedAt: Date.now() };
}

export interface SlugFormState {
  ok: boolean;
  error?: string;
  slug?: string;
}

export async function updateProjectSlug(
  id: string,
  currentSlug: string,
  _prev: SlugFormState,
  formData: FormData,
): Promise<SlugFormState> {
  await requireOwner();
  const raw = String(formData.get("slug") ?? "");
  const slug = slugify(raw);
  if (!slug) return { ok: false, error: "Slug can't be empty." };

  if (slug !== currentSlug && (await workQueries.isSlugTaken(slug, id))) {
    return { ok: false, error: "That slug is already in use." };
  }

  await workQueries.updateProject(id, { slug });
  revalidateProject(currentSlug);
  revalidateProject(slug);
  return { ok: true, slug };
}

export async function updateProjectMeta(id: string, currentSlug: string, formData: FormData) {
  await requireOwner();

  const statusRaw = String(formData.get("status") ?? "");
  const visibilityRaw = String(formData.get("visibility") ?? "");
  const status = (PROJECT_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as ProjectStatus)
    : undefined;
  const visibility = (VISIBILITY_OPTIONS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as Visibility)
    : undefined;
  const featured = formData.get("featured") === "1";
  const repositoryUrl = String(formData.get("repositoryUrl") ?? "").trim();
  const liveUrl = String(formData.get("liveUrl") ?? "").trim();

  const update: Parameters<typeof workQueries.updateProject>[1] = {
    featured,
    repositoryUrl: repositoryUrl || null,
    liveUrl: liveUrl || null,
    ...(status ? { status } : {}),
    ...(visibility ? { visibility } : {}),
  };

  // PRD §21 — publishedAt marks the first time a project actually went public.
  if (visibility === "PUBLIC") {
    const project = await workQueries.getProjectById(id);
    if (project && !project.publishedAt) {
      update.publishedAt = new Date();
    }
  }

  await workQueries.updateProject(id, update);
  revalidateProject(currentSlug);
}

export async function deleteProject(id: string, isLab: boolean) {
  await requireOwner();
  await workQueries.deleteProject(id);
  revalidateProject();
  redirect(isLab ? "/lab" : "/work");
}

export async function addProjectTechnology(projectId: string, currentSlug: string, formData: FormData) {
  await requireOwner();
  const name = String(formData.get("name") ?? "");
  await workQueries.addTechnology(projectId, name);
  revalidateProject(currentSlug);
}

export async function removeProjectTechnology(id: string, currentSlug: string) {
  await requireOwner();
  await workQueries.removeTechnology(id);
  revalidateProject(currentSlug);
}
