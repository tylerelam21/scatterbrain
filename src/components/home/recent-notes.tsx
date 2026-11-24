import Link from "next/link";

interface RecentNote {
  id: string;
  title: string | null;
  plainText: string;
}

// Homepage "02 / Recent Notes" — the most recent public essays, pulled
// from the same PUBLIC journal entries the /notes page lists.
export function RecentNotes({ notes }: { notes: RecentNote[] }) {
  if (notes.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-8">
      <p className="text-xs tracking-[0.15em] text-muted uppercase">02 / Recent notes</p>
      <div className="mt-2 divide-y divide-border">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="flex items-center justify-between gap-4 py-5 text-ink hover:text-accent"
          >
            <span className="truncate">{note.title || note.plainText.slice(0, 60) || "Untitled"}</span>
            <span aria-hidden className="shrink-0">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
