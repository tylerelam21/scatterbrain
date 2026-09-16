import Link from "next/link";
import { notFound } from "next/navigation";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { auth } from "@/lib/auth";
import { getProjectBySlug, listProjects, listTechnologiesForProject } from "@/lib/db/queries/work";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type ProjectContent } from "@/lib/work/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { formatRelativeDate } from "@/lib/format/relative-date";
import { addProjectTechnology, removeProjectTechnology, updateProjectMeta } from "@/server/actions/work";
import { ProjectEditor } from "@/components/work/project-editor";
import { ProjectHeroUploader } from "@/components/work/project-hero-uploader";
import { SlugForm } from "@/components/work/slug-form";
import { DeleteProjectForm } from "@/components/work/delete-project-form";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { slug } = await params;

  const project = await getProjectBySlug(slug, { publicOnly: !isOwner });
  if (!project) notFound();

  const technologies = await listTechnologiesForProject(project.id);

  if (isOwner) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="flex items-center justify-between">
          <SlugForm id={project.id} slug={project.slug} />
          <DeleteProjectForm id={project.id} isLab={project.isLab} />
        </div>

        <form action={updateProjectMeta.bind(null, project.id, project.slug)} className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Status</span>
            <select
              name="status"
              defaultValue={project.status}
              className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Visibility</span>
            <select
              name="visibility"
              defaultValue={project.visibility}
              className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 pb-1.5">
            <input type="checkbox" name="featured" value="1" defaultChecked={project.featured} />
            <span className="text-xs text-muted">Featured</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Order</span>
            <input
              type="number"
              name="sortOrder"
              defaultValue={project.sortOrder}
              className="w-16 border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Repository URL</span>
            <input
              type="url"
              name="repositoryUrl"
              defaultValue={project.repositoryUrl ?? ""}
              className="w-44 border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Live URL</span>
            <input
              type="url"
              name="liveUrl"
              defaultValue={project.liveUrl ?? ""}
              className="w-44 border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
          >
            Update
          </button>
        </form>

        <div className="mt-6">
          <ProjectHeroUploader
            projectId={project.id}
            slug={project.slug}
            currentHeroImageId={project.heroImageId}
          />
        </div>

        <div className="mt-10">
          <ProjectEditor
            id={project.id}
            slug={project.slug}
            initialTitle={project.title}
            initialTagline={project.tagline ?? ""}
            initialSummary={project.summary ?? ""}
            initialContent={project.contentJson as ProjectContent | null}
          />
        </div>

        <div className="mt-10">
          <span className="text-xs text-muted">Technologies</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {technologies.map((tech) => (
              <form key={tech.id} action={removeProjectTechnology.bind(null, tech.id, project.slug)}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink"
                >
                  {tech.name} ×
                </button>
              </form>
            ))}
            <form
              action={addProjectTechnology.bind(null, project.id, project.slug)}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                name="name"
                placeholder="Add technology"
                className="w-32 border-b border-border bg-transparent py-1 text-xs text-ink focus:outline-none"
              />
              <button type="submit" className="text-xs text-muted hover:text-ink">
                Add
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const bodyHtml = project.contentJson
    ? generateHTML(project.contentJson as ProjectContent, [StarterKit, Image])
    : "";

  // Prev/next reuse the exact same ordering as the /work listing, so
  // "next project" always matches what you'd hit browsing there.
  const siblings = await listProjects({ isLab: project.isLab, publicOnly: true });
  const currentIndex = siblings.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const lastUpdated = project.githubLastPushedAt ?? project.updatedAt;

  return (
    <article className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-6 pt-16">
        <Link href="/work" className="text-xs text-muted hover:text-ink">
          ← All work
        </Link>

        {project.heroImageId && (
          // eslint-disable-next-line @next/next/no-img-element -- authorized, dynamically-owned photo served through /api/photos/[id]
          <img
            src={`/api/photos/${project.heroImageId}`}
            alt=""
            className="mt-6 block aspect-[16/9] w-full rounded-lg object-cover"
            style={{ boxShadow: "var(--note-shadow)" }}
          />
        )}

        <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="uppercase">{PROJECT_STATUS_LABELS[project.status]}</span>
              {project.featured && <span className="text-accent">★ Featured</span>}
            </div>
            <h1 className="font-display mt-2 text-4xl tracking-tight text-ink md:text-5xl">
              {project.title}
            </h1>
            {project.tagline && <p className="mt-3 text-xl text-muted">{project.tagline}</p>}

            {(project.liveUrl || project.repositoryUrl) && (
              <div className="mt-6 flex gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
                  >
                    Visit live →
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
                  >
                    Source →
                  </a>
                )}
              </div>
            )}

            {project.summary && (
              <p className="font-display mt-10 border-l-2 border-accent pl-6 text-2xl leading-snug text-ink italic">
                {project.summary}
              </p>
            )}

            {bodyHtml && (
              <div className="journal-editor mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="border-t border-border pt-4">
              <h2 className="text-xs font-medium tracking-widest text-muted uppercase">At a glance</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-muted">Status</dt>
                  <dd className="mt-0.5 text-ink">{PROJECT_STATUS_LABELS[project.status]}</dd>
                </div>
                {technologies.length > 0 && (
                  <div>
                    <dt className="text-xs text-muted">Stack</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {project.publishedAt && (
                  <div>
                    <dt className="text-xs text-muted">Published</dt>
                    <dd className="mt-0.5 text-ink">
                      {new Date(project.publishedAt).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted">Updated</dt>
                  <dd className="mt-0.5 text-ink">{formatRelativeDate(new Date(lastUpdated))}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {(prevProject || nextProject) && (
          <nav className="mt-24 flex items-center justify-between gap-4 border-t border-border py-8 text-sm">
            {prevProject ? (
              <Link href={`/work/${prevProject.slug}`} className="min-w-0 text-muted hover:text-ink">
                ← <span className="text-ink">{prevProject.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextProject && (
              <Link
                href={`/work/${nextProject.slug}`}
                className="min-w-0 text-right text-muted hover:text-ink"
              >
                <span className="text-ink">{nextProject.title}</span> →
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
