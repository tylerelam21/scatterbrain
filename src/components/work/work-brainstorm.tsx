import { listBrainItems } from "@/lib/db/queries/brain";
import { deleteWorkItem } from "@/server/actions/brain";
import { WorkCaptureForm } from "./work-capture-form";
import { WorkLinkCard } from "./work-link-card";

// Owner-only — the parent page only renders this once it's already
// confirmed the visitor is the owner, so no auth check happens here.
// Deliberately filter-free (unlike Studio's Feed tab): just a capture box
// and a plain reverse-chronological list, tagged "Work" so it's a real
// place to jot things on a normal day, not another search UI to fight.
export async function WorkBrainstorm({ ownerId }: { ownerId: string }) {
  const items = await listBrainItems(ownerId, { tag: "Work" });

  return (
    <section className="mb-16 border-b border-border pb-16">
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Brainstorm</h2>
      <p className="mt-1 text-sm text-muted">Only you see this — ideas, tasks, links, whatever&rsquo;s useful.</p>

      <div className="mt-6">
        <WorkCaptureForm />
      </div>

      {items.length > 0 && (
        <ul className="mt-8 space-y-5">
          {items.map((item) => (
            <li key={item.id} className="group">
              <div className="flex items-start justify-between gap-4">
                <p className="text-ink">{item.content}</p>
                <form action={deleteWorkItem.bind(null, item.id)} className="shrink-0">
                  <button
                    type="submit"
                    className="text-xs text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </form>
              </div>
              {item.sourceUrl && <WorkLinkCard url={item.sourceUrl} label={item.content} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
