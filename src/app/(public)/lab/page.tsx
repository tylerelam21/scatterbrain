import { auth } from "@/lib/auth";
import { listProjects } from "@/lib/db/queries/work";
import { createProject } from "@/server/actions/work";
import { ProjectCard } from "@/components/work/project-card";

// PRD §23 — Lab reuses the Project model (isLab=true) rather than a
// separate schema, and shares /work/[slug] as the detail route — the
// PRD's own IA lists no separate /lab/[slug].
export default async function LabPage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  const projects = await listProjects({ isLab: true, publicOnly: !isOwner });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-tight text-ink">Lab</h1>
        {isOwner && (
          <form action={createProject.bind(null, true)}>
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
            >
              New experiment
            </button>
          </form>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">Experiments, prototypes, and unfinished concepts.</p>

      {projects.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <div className="mt-8 divide-y divide-border">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              title={project.title}
              tagline={project.tagline}
              status={project.status}
              featured={project.featured}
              visibility={project.visibility}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </main>
  );
}
