import Link from "next/link";
import { requireOwner } from "@/lib/auth/require-owner";
import { searchAll } from "@/lib/db/queries/search";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

// PRD §29 — global search. This first pass covers Brain and Journal (the
// content that actually exists); Work/Photos/Calendar and ranked full-text
// land in Phase 7.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const owner = await requireOwner();
  const { q } = await searchParams;
  const results = q ? await searchAll(owner.id, q) : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-2xl tracking-tight text-ink">Search</h1>

      <form method="get" className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search Brain and Journal…"
          autoFocus
          className="w-full border-b border-border bg-transparent py-2 text-lg text-ink placeholder:text-muted focus:outline-none"
        />
      </form>

      {q && (
        <p className="mt-6 text-xs text-muted">
          {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {results.map((result) => (
            <li key={`${result.type}-${result.id}`} className="py-4">
              <Link href={result.type === "brain" ? `/brain/${result.id}` : `/journal/${result.id}`}>
                <span className="text-xs text-muted uppercase">{result.type}</span>
                <p className="mt-1 text-ink">{result.title}</p>
                <p className="mt-1 truncate text-sm text-muted">{result.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {q && results.length === 0 && <p className="mt-8 text-sm text-muted">Nothing found.</p>}
    </main>
  );
}
