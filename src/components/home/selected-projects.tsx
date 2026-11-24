import Link from "next/link";
import { InlineEditable } from "./inline-editable";
import { updateProjectField } from "@/server/actions/work";

interface FeaturedProject {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  heroImageId: string | null;
}

// Homepage "01 / Selected Projects" — a simple tile grid of real featured
// work, not the old alternating-spread layout (that treatment now lives
// on each project's own case-study page). Real project data only; no
// placeholder tiles when there's nothing featured yet.
export function SelectedProjects({
  projects,
  editable,
}: {
  projects: FeaturedProject[];
  editable: boolean;
}) {
  if (projects.length === 0 && !editable) return null;

  return (
    <section className="mt-20 border-t border-border pt-8">
      <p className="text-xs tracking-[0.15em] text-muted uppercase">01 / Selected projects</p>

      {projects.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nothing marked Featured yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id}>
              <Link href={`/work/${project.slug}`} className="block">
                {project.heroImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element -- authorized, dynamically-owned photo served through /api/photos/[id]
                  <img
                    src={`/api/photos/${project.heroImageId}`}
                    alt=""
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full rounded-lg border border-border bg-stone/20" />
                )}
              </Link>
              <p className="mt-3 text-ink">
                <Link href={`/work/${project.slug}`} className="hover:text-accent">
                  {project.title}
                </Link>
              </p>
              {(project.tagline || editable) && (
                <p className="mt-0.5 text-sm text-muted">
                  <InlineEditable
                    value={project.tagline ?? ""}
                    editable={editable}
                    onSave={updateProjectField.bind(null, project.id, project.slug, "tagline")}
                    placeholder="A short tagline"
                    className="block"
                  />
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
