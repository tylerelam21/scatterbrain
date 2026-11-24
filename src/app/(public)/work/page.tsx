import { auth } from "@/lib/auth";
import { listProjects } from "@/lib/db/queries/work";
import { getAppSetting } from "@/lib/db/queries/settings";
import { getOwnerUser } from "@/lib/db/queries/users";
import { createProject } from "@/server/actions/work";
import { ProjectCard } from "@/components/work/project-card";
import { GithubImportPanel } from "@/components/work/github-import-panel";

// Project creation happens right here (the button below) — there's no
// private Studio app behind this anymore.
export default async function WorkPage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  const owner = await getOwnerUser();
  const [projects, githubUsername] = await Promise.all([
    listProjects({ isLab: false, publicOnly: !isOwner }),
    owner ? getAppSetting(owner.id, "github.username") : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-tight text-ink">Work</h1>
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

      {isOwner && (
        <div className="mt-4">
          <GithubImportPanel initialUsername={githubUsername ?? ""} />
        </div>
      )}

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
