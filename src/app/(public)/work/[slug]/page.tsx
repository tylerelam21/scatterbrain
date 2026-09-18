import Link from "next/link";
import { notFound } from "next/navigation";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { auth } from "@/lib/auth";
import { getProjectBySlug, listProjects, listTechnologiesForProject } from "@/lib/db/queries/work";
import { PROJECT_STATUS_LABELS, type ProjectContent } from "@/lib/work/constants";
import { formatRelativeDate } from "@/lib/format/relative-date";
import { addProjectTechnology, removeProjectTechnology, updateProjectField } from "@/server/actions/work";
import { InlineEditable } from "@/components/home/inline-editable";
import { ProjectBodyEditor } from "@/components/work/project-body-editor";
import { ProjectHeroUploader } from "@/components/work/project-hero-uploader";
import { ProjectSettingsPanel } from "@/components/work/project-settings-panel";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}

// One page, not two — the owner sees the exact styled case study a
// visitor would (title/tagline/summary/stack all click-to-edit in place,
// same as the homepage's InlineEditable pattern), with everything that
// isn't part of the content itself (status, visibility, featured, order,
// links, slug, delete) tucked behind one Settings toggle instead of
// sitting at the top of the page. `?view=public` still strips every owner
// affordance for a literal 1:1 check of what a visitor sees.
export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { slug } = await params;
  const { view } = await searchParams;
  const forcePublicView = view === "public";
  const editable = isOwner && !forcePublicView;

  const project = await getProjectBySlug(slug, { publicOnly: !isOwner });
  if (!project) notFound();

  const technologies = await listTechnologiesForProject(project.id);

  const bodyHtml =
    !editable && project.contentJson
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
        {isOwner && forcePublicView && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-full border border-border px-4 py-2 text-xs text-muted">
            <span>This is what visitors see.</span>
            <Link href={`/work/${project.slug}`} className="hover:text-ink">
              Back to edit
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link href="/work" className="text-xs text-muted hover:text-ink">
            ← All work
          </Link>
          {editable && (
            <div className="flex items-center gap-2">
              <Link
                href={`/work/${project.slug}?view=public`}
                className="text-xs text-muted hover:text-ink"
              >
                Preview as visitor →
              </Link>
              <ProjectSettingsPanel
                id={project.id}
                slug={project.slug}
                isLab={project.isLab}
                status={project.status}
                visibility={project.visibility}
                featured={project.featured}
                sortOrder={project.sortOrder}
                repositoryUrl={project.repositoryUrl}
                liveUrl={project.liveUrl}
              />
            </div>
          )}
        </div>

        {project.heroImageId ? (
          // eslint-disable-next-line @next/next/no-img-element -- authorized, dynamically-owned photo served through /api/photos/[id]
          <img
            src={`/api/photos/${project.heroImageId}`}
            alt=""
            className="mt-6 block aspect-[16/9] w-full rounded-lg object-cover"
            style={{ boxShadow: "var(--note-shadow)" }}
          />
        ) : (
          editable && (
            <div className="mt-6 flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted">
              No cover image yet
            </div>
          )
        )}
        {editable && (
          <div className="mt-2">
            <ProjectHeroUploader
              projectId={project.id}
              slug={project.slug}
              currentHeroImageId={project.heroImageId}
            />
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="uppercase">{PROJECT_STATUS_LABELS[project.status]}</span>
              {project.featured && <span className="text-accent">★ Featured</span>}
            </div>

            <h1 className="mt-2">
              <InlineEditable
                value={project.title}
                editable={editable}
                onSave={updateProjectField.bind(null, project.id, project.slug, "title")}
                placeholder="Project title"
                className="font-display block text-4xl tracking-tight text-ink md:text-5xl"
              />
            </h1>

            {(project.tagline || editable) && (
              <p className="mt-3">
                <InlineEditable
                  value={project.tagline ?? ""}
                  editable={editable}
                  onSave={updateProjectField.bind(null, project.id, project.slug, "tagline")}
                  placeholder="One-line tagline"
                  className="block text-xl text-muted"
                />
              </p>
            )}

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

            {(project.summary || editable) && (
              <p className="mt-10 border-l-2 border-accent pl-6">
                <InlineEditable
                  value={project.summary ?? ""}
                  editable={editable}
                  onSave={updateProjectField.bind(null, project.id, project.slug, "summary")}
                  as="textarea"
                  rows={2}
                  placeholder="Short pull-quote summary"
                  className="font-display block text-2xl leading-snug text-ink italic"
                />
              </p>
            )}

            {editable ? (
              <ProjectBodyEditor
                id={project.id}
                slug={project.slug}
                initialContent={project.contentJson as ProjectContent | null}
              />
            ) : (
              bodyHtml && (
                <div className="journal-editor mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              )
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
                {(technologies.length > 0 || editable) && (
                  <div>
                    <dt className="text-xs text-muted">Stack</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {technologies.map((tech) =>
                        editable ? (
                          <form key={tech.id} action={removeProjectTechnology.bind(null, tech.id, project.slug)}>
                            <button
                              type="submit"
                              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted hover:text-accent"
                            >
                              {tech.name} ×
                            </button>
                          </form>
                        ) : (
                          <span
                            key={tech.id}
                            className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                          >
                            {tech.name}
                          </span>
                        ),
                      )}
                    </dd>
                    {editable && (
                      <form
                        action={addProjectTechnology.bind(null, project.id, project.slug)}
                        className="mt-2 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          name="name"
                          placeholder="Add"
                          autoComplete="off"
                          className="w-20 border-b border-border bg-transparent py-1 text-xs text-ink placeholder:text-muted focus:outline-none"
                        />
                        <button type="submit" className="text-xs text-muted hover:text-ink">
                          Add
                        </button>
                      </form>
                    )}
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
