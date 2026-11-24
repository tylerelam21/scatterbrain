"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import * as workQueries from "@/lib/db/queries/work";
import * as photoQueries from "@/lib/db/queries/photos";
import { getAppSetting, setAppSetting } from "@/lib/db/queries/settings";
import { PROJECT_STATUSES, type ProjectContent, type ProjectStatus } from "@/lib/work/constants";
import { VISIBILITY_OPTIONS, type Visibility } from "@/lib/content/visibility";
import { slugify } from "@/lib/work/slug";
import { listPublicRepos, parseGithubRepo, type GithubRepoSummary } from "@/lib/github/client";

const GITHUB_USERNAME_KEY = "github.username";

function repoKey(repositoryUrl: string): string | null {
  const parsed = parseGithubRepo(repositoryUrl);
  return parsed ? `${parsed.owner}/${parsed.repo}`.toLowerCase() : null;
}

function revalidateProject(slug?: string) {
  revalidatePath("/work");
  revalidatePath("/lab");
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

type InlineProjectField = "title" | "tagline" | "summary";

// A lighter partial update than autosaveProject — just one field, for
// inline editing on the homepage's Featured Work spreads, without needing
// (and risking clobbering) the full Tiptap contentJson/plainText body that
// the real project editor also saves.
export async function updateProjectField(
  projectId: string,
  currentSlug: string,
  field: InlineProjectField,
  value: string,
) {
  await requireOwner();
  const trimmed = value.trim();
  await workQueries.updateProject(projectId, {
    [field]: field === "title" ? trimmed || "Untitled" : trimmed || null,
  });
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

// Body-only autosave for the unified case-study page — title/tagline/
// summary are saved independently via updateProjectField (InlineEditable),
// so this must never touch them, or a body keystroke could stomp an
// inline edit made moments earlier from stale ref values.
export async function autosaveProjectBody(
  id: string,
  currentSlug: string,
  data: { contentJson: ProjectContent; plainText: string },
): Promise<AutosaveState> {
  await requireOwner();
  await workQueries.updateProject(id, {
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

export type ProjectMetaField =
  | "status"
  | "visibility"
  | "featured"
  | "sortOrder"
  | "repositoryUrl"
  | "liveUrl";

// One field, saved the moment it changes (select onChange, checkbox
// onChange, text input onBlur) — see ProjectSettingsPanel. Replaces an
// earlier single big form with one "Save" button for all six fields,
// which made it unclear whether a click had actually saved anything.
export async function updateProjectMetaField(
  id: string,
  currentSlug: string,
  field: ProjectMetaField,
  value: string,
) {
  await requireOwner();

  const update: Parameters<typeof workQueries.updateProject>[1] = {};

  switch (field) {
    case "status": {
      if (!(PROJECT_STATUSES as readonly string[]).includes(value)) return;
      update.status = value as ProjectStatus;
      break;
    }
    case "visibility": {
      if (!(VISIBILITY_OPTIONS as readonly string[]).includes(value)) return;
      update.visibility = value as Visibility;
      // PRD §21 — publishedAt marks the first time a project actually went public.
      if (value === "PUBLIC") {
        const project = await workQueries.getProjectById(id);
        if (project && !project.publishedAt) update.publishedAt = new Date();
      }
      break;
    }
    case "featured":
      update.featured = value === "1";
      break;
    case "sortOrder": {
      const parsed = Number(value);
      update.sortOrder = Number.isFinite(parsed) ? parsed : 0;
      break;
    }
    case "repositoryUrl":
      update.repositoryUrl = value.trim() || null;
      break;
    case "liveUrl":
      update.liveUrl = value.trim() || null;
      break;
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

export async function setGithubUsername(formData: FormData) {
  const owner = await requireOwner();
  const username = String(formData.get("githubUsername") ?? "").trim();
  await setAppSetting(owner.id, GITHUB_USERNAME_KEY, username);
  revalidatePath("/work");
}

export type ImportableGithubRepo = GithubRepoSummary;

export type ListImportableReposResult =
  | { ok: true; repos: ImportableGithubRepo[] }
  | { ok: false; error: "no-username" };

// Public repos only (unauthenticated GitHub call), forks excluded, and
// anything already pointed at by an existing project (any visibility —
// see listProjectsWithRepo) filtered out so re-scanning never offers a
// duplicate.
export async function listImportableGithubRepos(): Promise<ListImportableReposResult> {
  const owner = await requireOwner();
  const username = (await getAppSetting(owner.id, GITHUB_USERNAME_KEY))?.trim();
  if (!username) return { ok: false, error: "no-username" };

  const [repos, existing] = await Promise.all([
    listPublicRepos(username),
    workQueries.listProjectsWithRepo(),
  ]);
  const existingKeys = new Set(
    existing.map((p) => (p.repositoryUrl ? repoKey(p.repositoryUrl) : null)).filter(Boolean),
  );

  return {
    ok: true,
    repos: repos.filter((repo) => !repo.fork && !existingKeys.has(repoKey(repo.htmlUrl))),
  };
}

// Creates one PRIVATE draft project per selected repo, pre-filled with
// title/tagline/repositoryUrl — the owner reviews and publishes each one
// individually from its own page, same as any other draft.
export async function importGithubRepos(repoUrls: string[]) {
  const owner = await requireOwner();
  const username = (await getAppSetting(owner.id, GITHUB_USERNAME_KEY))?.trim();
  if (!username || repoUrls.length === 0) return;

  const repos = await listPublicRepos(username);
  const byKey = new Map(repos.map((repo) => [repoKey(repo.htmlUrl), repo]));
  const wanted = new Set(repoUrls.map(repoKey).filter(Boolean));

  for (const key of wanted) {
    const repo = byKey.get(key!);
    if (!repo) continue;

    let slug = slugify(repo.name);
    if (await workQueries.getProjectBySlug(slug, { publicOnly: false })) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    await workQueries.createProjectFromGithubRepo({
      slug,
      title: repo.name,
      tagline: repo.description,
      repositoryUrl: repo.htmlUrl,
      liveUrl: repo.homepage || null,
    });
  }
  revalidateProject();
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
