"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchGroupFor, type SearchGroupKey } from "@/lib/content/content-type";
import type { SearchResult } from "@/lib/db/queries/search";

// PRD §30 "Search results should be keyboard navigable" — applied here too,
// not just in the command palette, since this page is the same search.
export function SearchResults({ results }: { results: SearchResult[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [prevResults, setPrevResults] = useState(results);

  // Reset selection when a new results list arrives (new query). Adjusting
  // state during render, not in an effect — React's documented pattern for
  // this, since it re-renders immediately rather than cascading.
  if (results !== prevResults) {
    setPrevResults(results);
    setSelected(0);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (results.length === 0) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((i) => Math.min(i + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter") {
        const target = results[selected];
        if (target) {
          event.preventDefault();
          router.push(target.href);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [results, selected, router]);

const groups = new Map<SearchGroupKey, { label: string; entries: { result: SearchResult; index: number }[] }>();
  results.forEach((result, index) => {
    const group = searchGroupFor(result.contentType);
    const existing = groups.get(group.key);
    if (existing) {
      existing.entries.push({ result, index });
    } else {
      groups.set(group.key, { label: group.label, entries: [{ result, index }] });
    }
  });

  return (
    <div className="mt-6 space-y-8">
      {Array.from(groups.entries()).map(([groupKey, { label, entries }]) => (
        <div key={groupKey}>
          <h2 className="text-xs tracking-wide text-muted uppercase">{label}</h2>
          <ul className="mt-2 divide-y divide-border">
            {entries.map(({ result, index }) => (
              <li key={`${result.contentType}-${result.contentId}`}>
                <Link
                  href={result.href}
                  onMouseEnter={() => setSelected(index)}
                  className={`-mx-3 block rounded px-3 py-3 ${index === selected ? "bg-border" : ""}`}
                >
                  <p className="text-ink">{result.title}</p>
                  {result.excerpt && <p className="mt-1 truncate text-sm text-muted">{result.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
