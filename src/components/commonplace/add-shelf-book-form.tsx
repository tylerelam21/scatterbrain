"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { searchBooksAction } from "@/server/actions/reading";
import { addShelfBook } from "@/server/actions/site";
import type { BookSearchResult } from "@/lib/reading/book-search";

const SEARCH_DEBOUNCE_MS = 350;

// Owner-only "add a book to the shelf" control — reuses the same Open
// Library search the Reading feature's New Entry form uses, so shelf
// covers are always real, never fabricated.
export function AddShelfBookForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const thisRequest = ++requestIdRef.current;
    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        if (requestIdRef.current === thisRequest) setResults([]);
        return;
      }
      const found = await searchBooksAction(query);
      if (requestIdRef.current === thisRequest) {
        setResults(found);
        setShowResults(true);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function pick(result: BookSearchResult) {
    setShowResults(false);
    setResults([]);
    setQuery("");
    startTransition(async () => {
      await addShelfBook(result);
    });
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 150)}
        placeholder={isPending ? "Adding…" : "+ Add a book"}
        disabled={isPending}
        autoComplete="off"
        className="w-full border-b border-dashed border-border bg-transparent py-1.5 text-xs text-muted placeholder:text-muted focus:border-ink focus:text-ink focus:outline-none"
      />
      {showResults && results.length > 0 && (
        <ul className="absolute top-full left-0 z-10 mt-1 w-56 border border-border bg-paper shadow-lg">
          {results.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(result)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-border/40"
              >
                {result.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external Open Library cover, not a static asset next/image can optimize
                  <img
                    src={result.coverImageUrl}
                    alt=""
                    className="h-10 w-7 shrink-0 border border-border object-cover"
                  />
                ) : (
                  <span className="h-10 w-7 shrink-0 border border-border bg-border/30" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{result.title}</span>
                  {result.creator && (
                    <span className="block truncate text-xs text-muted">{result.creator}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
