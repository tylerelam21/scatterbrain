import { notFound } from "next/navigation";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { auth } from "@/lib/auth";
import { getProjectBySlug, listTechnologiesForProject } from "@/lib/db/queries/work";
import { PROJECT_STATUSES, type ProjectContent } from "@/lib/work/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { addProjectTechnology, removeProjectTechnology, updateProjectMeta } from "@/server/actions/work";
import { ProjectEditor } from "@/components/work/project-editor";
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

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <p className="text-xs text-muted uppercase">{project.status}</p>
      <h1 className="font-display mt-2 text-4xl tracking-tight text-ink">{project.title}</h1>
      {project.tagline && <p className="mt-3 text-lg text-muted">{project.tagline}</p>}

      {technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span key={tech.id} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {tech.name}
            </span>
          ))}
        </div>
      )}

      {(project.liveUrl || project.repositoryUrl) && (
        <div className="mt-4 flex gap-4 text-sm">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              Visit →
            </a>
          )}
          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              Source →
            </a>
          )}
        </div>
      )}

      {bodyHtml && (
        <div className="journal-editor mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      )}
    </main>
  );
}
