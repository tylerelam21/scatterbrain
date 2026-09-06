import Link from "next/link";
import { requireOwner } from "@/lib/auth/require-owner";
import { searchAll } from "@/lib/db/queries/search";
import { SEARCH_GROUPS, type SearchGroupKey } from "@/lib/content/content-type";
import { SearchResults } from "@/components/search/search-results";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; group?: string }>;
}

// PRD §29, Phase 7 — global ranked search across Brain, Journal, Projects,
// Photos (and their Collections), and cached Calendar events, with
// content-type filtering.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  await requireOwner();
  const { q, group } = await searchParams;
  const activeGroup = SEARCH_GROUPS.find((g) => g.key === group);

  const results = q
    ? await searchAll(q, { ownerMode: true, types: activeGroup ? [...activeGroup.types] : undefined })
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
        {activeGroup && <input type="hidden" name="group" value={activeGroup.key} />}
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link
          href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
          className={`rounded-full border border-border px-3 py-1 ${!activeGroup ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          All
        </Link>
        {SEARCH_GROUPS.map((option) => (
          <Link
            key={option.key}
            href={`/search?q=${encodeURIComponent(q ?? "")}&group=${option.key}`}
            className={`rounded-full border border-border px-3 py-1 ${activeGroup?.key === (option.key as SearchGroupKey) ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {option.label}
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
