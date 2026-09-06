import { auth } from "@/lib/auth";
import { listProjects } from "@/lib/db/queries/work";
import { createProject } from "@/server/actions/work";
import { ProjectCard } from "@/components/work/project-card";

export default async function WorkPage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  const projects = await listProjects({ isLab: false, publicOnly: !isOwner });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-tight text-ink">Work</h1>
        {isOwner && (
          <form action={createProject.bind(null, false)}>
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
            >
              New project
            </button>
          </form>
        )}
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing published yet.</p>
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
