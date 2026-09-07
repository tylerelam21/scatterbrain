import Link from "next/link";
import { listBrainItems } from "@/lib/db/queries/brain";
import { listJournalEntries } from "@/lib/db/queries/journal";
import { listAllProjects } from "@/lib/db/queries/work";
import { createJournalEntry } from "@/server/actions/journal";
import { createProject } from "@/server/actions/work";
import { QuickCapture } from "@/components/brain/quick-capture";
import { ProjectCard } from "@/components/work/project-card";

// The creative side: raw ideas, real journal entries, and Lab experiments —
// deliberately filter-free (no search/type/tag/pinned chrome) so it stays a
// place to drop things, not another form to fight.
export async function FunSpaceContent({ ownerId }: { ownerId: string }) {
  const [items, entries, allProjects] = await Promise.all([
    listBrainItems(ownerId, {}),
    listJournalEntries(ownerId, {}),
    listAllProjects({ publicOnly: false }),
  ]);
  const labProjects = allProjects.filter((p) => p.isLab);

  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Ideas</h2>
        <div className="mt-6">
          <QuickCapture />
        </div>

        {items.length > 0 && (
          <ul className="mt-8 divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="py-4">
                <Link href={`/brain/${item.id}`} className="block">
                  <p className="truncate text-ink">{item.title || item.content}</p>
                  {item.title && <p className="mt-1 truncate text-sm text-muted">{item.content}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Journal</h2>
          <form action={createJournalEntry}>
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
            >
              New entry
            </button>
          </form>
        </div>

        {entries.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No entries yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="py-4">
                <Link href={`/journal/${entry.id}`} className="block">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="truncate text-ink">{entry.title || "Untitled"}</p>
                    <span className="shrink-0 text-xs text-muted">{entry.journalDate}</span>
                  </div>
                  {entry.plainText && <p className="mt-1 truncate text-sm text-muted">{entry.plainText}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Lab</h2>
          <form action={createProject.bind(null, true)}>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              New experiment
            </button>
          </form>
        </div>

        {labProjects.length === 0 ? (
          <p className="mt-8 text-sm text-muted">Nothing started yet.</p>
        ) : (
          <div className="mt-6 divide-y divide-border">
            {labProjects.map((project) => (
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
      </section>
    </div>
  );
}
