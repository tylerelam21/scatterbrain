"use client";

import { useEffect, useRef, useState } from "react";
import { addCommonplaceItem, fetchCommonplaceLinkPreview } from "@/server/actions/commonplace";
import { searchBooksAction } from "@/server/actions/books";
import { BRAIN_ITEM_TYPES, type BrainItemType } from "@/lib/brain/constants";
import type { BookSearchResult } from "@/lib/reading/book-search";

const TYPE_LABELS: Record<BrainItemType, string> = {
  THOUGHT: "Thought",
  IDEA: "Idea",
  QUESTION: "Question",
  QUOTE: "Quote",
  PLACE: "Place",
  RECOMMENDATION: "Recommendation",
  PROJECT_IDEA: "Project idea",
  OTHER: "Note",
};

const URL_PATTERN = /^https?:\/\//i;
const DEBOUNCE_MS = 400;

// The "source" field is deliberately overloaded: paste a link and it
// fetches that page's og:image/og:title (works for articles, IMDb,
// Letterboxd, Goodreads — anything with Open Graph tags); type a plain
// title instead and it searches Open Library for a real book cover. Either
// way the result is a title + image attached to the quote/idea above it.
export function AddCommonplaceItemForm() {
  const [source, setSource] = useState("");
  const [matchedTitle, setMatchedTitle] = useState("");
  const [matchedImage, setMatchedImage] = useState("");
  const [matchedUrl, setMatchedUrl] = useState("");
  const [bookResults, setBookResults] = useState<BookSearchResult[]>([]);
  const [showBookResults, setShowBookResults] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const thisRequest = ++requestIdRef.current;

    const trimmed = source.trim();

    debounceRef.current = setTimeout(async () => {
      if (!trimmed) {
        setMatchedTitle("");
        setMatchedImage("");
        setMatchedUrl("");
        setBookResults([]);
        setStatus("idle");
      } else if (URL_PATTERN.test(trimmed)) {
        setStatus("loading");
        setBookResults([]);
        const preview = await fetchCommonplaceLinkPreview(trimmed);
        if (requestIdRef.current !== thisRequest) return;
        setMatchedUrl(trimmed);
        setMatchedTitle(preview.title ?? "");
        setMatchedImage(preview.imageUrl ?? "");
        setStatus("idle");
      } else if (trimmed.length >= 2) {
        setMatchedUrl("");
        const results = await searchBooksAction(trimmed);
        if (requestIdRef.current !== thisRequest) return;
        setBookResults(results);
        setShowBookResults(true);
      } else {
        setMatchedTitle("");
        setMatchedImage("");
        setBookResults([]);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [source]);

  function pickBook(result: BookSearchResult) {
    setSource(result.title);
    setMatchedTitle(result.title);
    setMatchedImage(result.coverImageUrl ?? "");
    setMatchedUrl("");
    setBookResults([]);
    setShowBookResults(false);
  }

  return (
    <form
      ref={formRef}
      action={addCommonplaceItem}
      onSubmit={() => {
        setTimeout(() => {
          setSource("");
          setMatchedTitle("");
          setMatchedImage("");
          setMatchedUrl("");
        }, 0);
      }}
      className="mt-6 space-y-3 border-b border-border pb-6"
    >
      <label className="block">
        <span className="text-xs text-muted">A quote, idea, or note</span>
        <textarea
          name="content"
          rows={2}
          required
          placeholder="What's worth keeping?"
          className="mt-1 block w-full resize-none border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-0 flex-1 basis-60">
          <label className="block">
            <span className="text-xs text-muted">Link, or a book title</span>
            <input
              type="text"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              onFocus={() => bookResults.length > 0 && setShowBookResults(true)}
              onBlur={() => setTimeout(() => setShowBookResults(false), 150)}
              autoComplete="off"
              placeholder="https://… or a book's title"
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </label>

          {showBookResults && bookResults.length > 0 && (
            <ul className="absolute top-full left-0 z-10 mt-1 w-64 border border-border bg-paper shadow-lg">
              {bookResults.map((result, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pickBook(result)}
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

        <label>
          <span className="text-xs text-muted">Type</span>
          <select
            name="type"
            defaultValue="THOUGHT"
            className="mt-1 block border-b border-border bg-transparent py-1 text-sm text-ink focus:border-ink focus:outline-none"
          >
            {BRAIN_ITEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
        >
          Add
        </button>
      </div>

      {status === "loading" && <p className="text-xs text-muted">Fetching preview…</p>}
      {(matchedImage || matchedTitle) && status === "idle" && (
        <div className="flex items-center gap-3">
          {matchedImage && (
            // eslint-disable-next-line @next/next/no-img-element -- external cover/og:image, not a static asset next/image can optimize
            <img
              src={matchedImage}
              alt=""
              className="h-12 w-12 rounded-sm border border-border object-cover"
            />
          )}
          <p className="text-xs text-muted">
            Will attach <span className="text-ink">{matchedTitle || "this image"}</span>
            {matchedUrl ? " as a linked card." : " as a cover."}
          </p>
        </div>
      )}

      <input type="hidden" name="title" value={matchedTitle} />
      <input type="hidden" name="sourceUrl" value={matchedUrl} />
      <input type="hidden" name="imageUrl" value={matchedImage} />
    </form>
  );
}
