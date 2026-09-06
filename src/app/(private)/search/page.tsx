import Link from "next/link";
import { requireOwner } from "@/lib/auth/require-owner";
import { searchAll } from "@/lib/db/queries/search";
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_OPTIONS, type ContentType } from "@/lib/content/content-type";
import { SearchResults } from "@/components/search/search-results";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPE_OPTIONS as readonly string[]).includes(value);
}

// PRD §29, Phase 7 — global ranked search across Brain, Journal, Projects,
// Photos, and cached Calendar events, with content-type filtering.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  await requireOwner();
  const { q, type } = await searchParams;
  const activeType = type && isContentType(type) ? type : undefined;

  const results = q
    ? await searchAll(q, { ownerMode: true, types: activeType ? [activeType] : undefined })
    : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-2xl tracking-tight text-ink">Search</h1>

      <form method="get" className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search everything…"
          autoFocus
          className="w-full border-b border-border bg-transparent py-2 text-lg text-ink placeholder:text-muted focus:outline-none"
        />
        {activeType && <input type="hidden" name="type" value={activeType} />}
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link
          href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
          className={`rounded-full border border-border px-3 py-1 ${!activeType ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          All
        </Link>
        {CONTENT_TYPE_OPTIONS.map((option) => (
          <Link
            key={option}
            href={`/search?q=${encodeURIComponent(q ?? "")}&type=${option}`}
            className={`rounded-full border border-border px-3 py-1 ${activeType === option ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {CONTENT_TYPE_LABELS[option]}
          </Link>
        ))}
      </div>

      {q && (
        <p className="mt-6 text-xs text-muted">
          {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.length > 0 && <SearchResults results={results} />}

      {q && results.length === 0 && <p className="mt-8 text-sm text-muted">Nothing found.</p>}
    </main>
  );
}
