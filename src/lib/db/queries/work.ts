import { createId } from "@paralleldrive/cuid2";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects, projectTechnologies } from "@/lib/db/schema";
import type { ProjectContent, ProjectStatus } from "@/lib/work/constants";
import type { Visibility } from "@/lib/content/visibility";
import { indexSearchDocument, removeSearchDocument } from "@/lib/search";

function projectSearchBody(project: { tagline: string | null; summary: string | null; plainText: string | null }) {
  return [project.tagline, project.summary, project.plainText].filter(Boolean).join("\n");
}

export interface ListProjectsOptions {
  isLab: boolean;
  publicOnly: boolean;
}

// PRD §21, §23 — Work and Lab share this one query, filtered by isLab.
// Public visitors only ever see PUBLIC items; the owner sees everything.
export async function listProjects({ isLab, publicOnly }: ListProjectsOptions) {
  const conditions = [eq(projects.isLab, isLab)];
  if (publicOnly) {
    conditions.push(eq(projects.visibility, "PUBLIC"));
  }

  return db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
}

// Studio's combined Projects tab — Work and Lab together, each row still
// carrying its own isLab flag so the UI can badge experiments inline.
export async function listAllProjects({ publicOnly }: { publicOnly: boolean }) {
  const conditions = publicOnly ? [eq(projects.visibility, "PUBLIC")] : [];

  return db
    .select()
    .from(projects)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
}

export async function getProjectBySlug(slug: string, { publicOnly }: { publicOnly: boolean }) {
  const project = await db.query.projects.findFirst({ where: eq(projects.slug, slug) });
  if (!project) return null;
  if (publicOnly && project.visibility !== "PUBLIC") return null;
  return project;
}

export async function getProjectById(id: string) {
  return db.query.projects.findFirst({ where: eq(projects.id, id) });
}

// PRD §10.2-style capture-first: create a bare draft immediately, refine
// title/slug/everything else in the editor afterward.
export async function createProject(isLab: boolean) {
  const slug = `untitled-${createId().slice(0, 8)}`;
  const [created] = await db
    .insert(projects)
    .values({ slug, title: "Untitled", isLab })
    .returning();
  await indexSearchDocument({
    contentType: "PROJECT",
    contentId: created.id,
    title: created.title,
    body: projectSearchBody(created),
    visibility: created.visibility,
  });
  return created;
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    tagline: string | null;
    summary: string | null;
    contentJson: ProjectContent;
    plainText: string;
    status: ProjectStatus;
    visibility: Visibility;
    featured: boolean;
    repositoryUrl: string | null;
    liveUrl: string | null;
    heroImageId: string | null;
    sortOrder: number;
    publishedAt: Date;
  }>,
) {
  const [updated] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
  if (updated) {
    await indexSearchDocument({
      contentType: "PROJECT",
      contentId: updated.id,
      title: updated.title,
      body: projectSearchBody(updated),
      visibility: updated.visibility,
    });
  }
}

export async function isSlugTaken(slug: string, excludeId: string) {
  const existing = await db.query.projects.findFirst({ where: eq(projects.slug, slug) });
  return !!existing && existing.id !== excludeId;
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id));
  await removeSearchDocument("PROJECT", id);
}

export async function listTechnologiesForProject(projectId: string) {
  return db.query.projectTechnologies.findMany({
    where: eq(projectTechnologies.projectId, projectId),
    orderBy: asc(projectTechnologies.sortOrder),
  });
}

export async function addTechnology(projectId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  await db.insert(projectTechnologies).values({ projectId, name: trimmed });
}

export async function removeTechnology(id: string) {
  await db.delete(projectTechnologies).where(eq(projectTechnologies.id, id));
}
