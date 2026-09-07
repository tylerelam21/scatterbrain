import { listAllProjects } from "@/lib/db/queries/work";
import { createProject } from "@/server/actions/work";
import { ProjectCard } from "@/components/work/project-card";
import { WorkBrainstorm } from "@/components/work/work-brainstorm";

// Everything work-related in one place, reachable from the owner's own
// nav (Studio) instead of only on the public /work page, which the
// owner's nav doesn't even link to anymore.
export async function WorkSpaceContent({ ownerId }: { ownerId: string }) {
  const allProjects = await listAllProjects({ publicOnly: false });
  const projects = allProjects.filter((p) => !p.isLab);

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
      <img
        src="/work/pegboard.webp"
        alt="An illustrated pegboard of painting and hand tools"
        className="mb-10 block w-full h-auto rounded-lg select-none"
        draggable={false}
      />

      <WorkBrainstorm ownerId={ownerId} />

      <div className="mt-16 flex items-center justify-between">
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Projects</h2>
        <form action={createProject.bind(null, false)}>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
          >
            New project
          </button>
        </form>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing started yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-border">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              title={project.title}
              tagline={project.tagline}
              status={project.status}
              featured={project.featured}
              visibility={project.visibility}
              isOwner
            />
          ))}
        </div>
      )}
    </div>
  );
}
