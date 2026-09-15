"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createReadingEntry, searchBooksAction } from "@/server/actions/reading";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS, type MediaType } from "@/lib/reading/constants";
import type { BookSearchResult } from "@/lib/reading/book-search";

const SEARCH_DEBOUNCE_MS = 350;

interface NewReadingEntryFormProps {
  recentWorkTitles: string[];
}

// Find-or-create in one field: typing a title that matches an existing
// Work (case-insensitive) reuses it, server-side, regardless of whether it
// came from the datalist or a fresh book-search pick. For Book entries, a
// debounced Open Library lookup offers title/author/cover autofill — never
// required, just a shortcut (see lib/reading/book-search.ts).
export function NewReadingEntryForm({ recentWorkTitles }: NewReadingEntryFormProps) {
  const [mediaType, setMediaType] = useState<MediaType>("BOOK");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const thisRequest = ++requestIdRef.current;
    debounceRef.current = setTimeout(async () => {
      if (mediaType !== "BOOK" || title.trim().length < 2) {
        if (requestIdRef.current === thisRequest) setResults([]);
        return;
      }
      const found = await searchBooksAction(title);
      if (requestIdRef.current === thisRequest) {
        setResults(found);
        setShowResults(true);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, mediaType]);

  const pickResult = useCallback((result: BookSearchResult) => {
    setTitle(result.title);
    setCreator(result.creator ?? "");
    setCoverImageUrl(result.coverImageUrl ?? "");
    setShowResults(false);
    setResults([]);
  }, []);

  return (
    <form action={createReadingEntry} className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-0 flex-1">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">What are you reading, watching, listening to?</span>
          <input
            type="text"
            name="workTitle"
            list="reading-work-titles"
            placeholder="Title"
            required
            autoComplete="off"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setCoverImageUrl("");
            }}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            className="min-w-0 w-full border-b border-border bg-transparent py-1.5 text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <datalist id="reading-work-titles">
            {recentWorkTitles.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>

        {showResults && results.length > 0 && (
          <ul className="absolute top-full left-0 z-10 mt-1 w-full max-w-sm border border-border bg-paper shadow-lg">
            {results.map((result, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickResult(result)}
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

      <input type="hidden" name="workCoverImageUrl" value={coverImageUrl} />

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">Creator</span>
        <input
          type="text"
          name="workCreator"
          placeholder="Author, host…"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="w-36 border-b border-border bg-transparent py-1.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">Type</span>
        <select
          name="workMediaType"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as MediaType)}
          className="border-b border-border bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
        >
          {MEDIA_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEDIA_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
      >
        New entry
      </button>
    </form>
  );
}
