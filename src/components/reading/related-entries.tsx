import Link from "next/link";

interface RelatedEntry {
  entry: { id: string; title: string | null; entryDate: string };
  work: { title: string };
  sharedThemeNames: string[];
}

// "Follow the thread" foundation — other entries of the user's own that
// share a theme with this one. A real theme-graph visualization is future
// scope; this is the plain list version that makes the connection visible
// today (this is the Book Club/Judges scenario the feature exists for).
export function RelatedEntries({ entries }: { entries: RelatedEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">
        Connected to your other entries
      </h2>
      <ul className="mt-3 space-y-3">
        {entries.map(({ entry, work, sharedThemeNames }) => (
          <li key={entry.id}>
            <Link href={`/reading/${entry.id}`} className="text-ink hover:text-accent">
              {entry.title || work.title}
            </Link>
            {sharedThemeNames.length > 0 && (
              <p className="mt-0.5 text-xs text-muted">via {sharedThemeNames.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
