import { listBrainItems } from "@/lib/db/queries/brain";
import { deleteWorkItem } from "@/server/actions/brain";
import { WorkCaptureForm } from "./work-capture-form";
import { WorkLinkNote } from "./work-link-note";

// A handful of fixed tilts, cycled by index — enough variety to read as
// "pinned by hand" without any randomness (which would shift on every
// re-render/revalidation).
const ROTATIONS = [-3, 2, -1.5, 2.5, -2, 1.5, -2.5, 3];

// Owner-only — the parent page only renders this once it's already
// confirmed the visitor is the owner, so no auth check happens here.
// Deliberately filter-free (unlike Studio's old Feed tab): just a capture
// box and a plain reverse-chronological list, tagged "Work" so it's a real
// place to jot things on a normal day, not another search UI to fight.
// Anything with a link gets pulled out into its own "Other Links"
// corkboard instead of sitting in the plain list.
export async function WorkBrainstorm({ ownerId }: { ownerId: string }) {
  const items = await listBrainItems(ownerId, { tag: "Work" });
  const linkItems = items.filter((item) => item.sourceUrl);
  const noteItems = items.filter((item) => !item.sourceUrl);

  return (
    <section className="mb-16 border-b border-border pb-16">
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Brainstorm</h2>
      <p className="mt-1 text-sm text-muted">Only you see this — ideas, tasks, links, whatever&rsquo;s useful.</p>

      <div className="mt-6">
        <WorkCaptureForm />
      </div>

      {linkItems.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xs font-medium tracking-widest text-muted uppercase">Other Links</h3>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-8 px-1 pt-2">
            {linkItems.map((item, index) => (
              <div key={item.id} className="group relative">
                <WorkLinkNote
                  url={item.sourceUrl!}
                  label={item.content}
                  rotation={ROTATIONS[index % ROTATIONS.length]}
                />
                <form
                  action={deleteWorkItem.bind(null, item.id)}
                  className="absolute -top-2 -right-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <button
                    type="submit"
                    aria-label="Remove"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-paper hover:bg-accent"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {noteItems.length > 0 && (
        <ul className="mt-10 space-y-5">
          {noteItems.map((item) => (
            <li key={item.id} className="group flex items-start justify-between gap-4">
              <p className="text-ink">{item.content}</p>
              <form action={deleteWorkItem.bind(null, item.id)} className="shrink-0">
                <button
                  type="submit"
                  className="text-xs text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
