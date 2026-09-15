import { requireOwner } from "@/lib/auth/require-owner";
import { listReadingEntries, listWorks } from "@/lib/db/queries/reading";
import { NewReadingEntryForm } from "@/components/reading/new-entry-form";
import { ReadingEntryCard } from "@/components/reading/entry-card";

// The Reading home page (brief's minimal version) — a find-or-create
// entry point plus a chronological list. Themes, cross-entry connections,
// and a richer browsing layer are explicit future scope; this just needs
// to exist so the entry detail page has somewhere to link back to.
export default async function ReadingPage() {
  const owner = await requireOwner();
  const [rows, works] = await Promise.all([listReadingEntries(owner.id), listWorks(owner.id)]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Reading</h1>
      <p className="mt-2 text-sm text-muted">
        What you&rsquo;re reading, watching, and listening to — and what it connects to.
      </p>

      <div className="mt-8 border-t border-border pt-8">
        <NewReadingEntryForm recentWorkTitles={works.map((w) => w.title)} />
      </div>

      {rows.length === 0 ? (
        <p className="mt-12 text-sm text-muted">Nothing logged yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {rows.map(({ entry, work }) => (
            <ReadingEntryCard
              key={entry.id}
              id={entry.id}
              entryTitle={entry.title}
              entryDate={entry.entryDate}
              status={entry.status}
              visibility={entry.visibility}
              workTitle={work.title}
              workCreator={work.creator}
              mediaType={work.mediaType}
              coverImageUrl={work.coverImageUrl}
            />
          ))}
        </div>
      )}
    </main>
  );
}
