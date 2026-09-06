"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { captureThoughtFromPalette, searchForPalette } from "@/server/actions/search";
import { createJournalEntry } from "@/server/actions/journal";
import { CONTENT_TYPE_LABELS } from "@/lib/content/content-type";
import type { SearchResult } from "@/lib/db/queries/search";

interface StaticCommand {
  id: string;
  label: string;
  run: () => void | Promise<void>;
}

// PRD §30 — ⌘K / Ctrl+K command palette: static navigation/creation
// commands plus live, keyboard-navigable search results.
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"commands" | "capture">("commands");
  const [query, setQuery] = useState("");
  const [captureText, setCaptureText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setMode("commands");
    setQuery("");
    setCaptureText("");
    setResults([]);
    setSelected(0);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          close();
        } else {
          setOpen(true);
        }
      } else if (event.key === "Escape" && open) {
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Purely imperative (focusing a DOM node) — no setState here, so this
  // doesn't trip the set-state-in-effect rule the way a reset-on-close
  // effect would.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [open, mode]);

  useEffect(() => {
    if (mode !== "commands" || !query.trim()) {
      const id = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(id);
    }
    const handle = setTimeout(() => {
      searchForPalette(query).then(setResults);
    }, 150);
    return () => clearTimeout(handle);
  }, [query, mode]);

  const commands: StaticCommand[] = [
    {
      id: "search",
      label: query.trim() ? `Search everything for "${query.trim()}"` : "Search everything",
      run: () => router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"),
    },
    { id: "capture", label: "Capture thought", run: () => setMode("capture") },
    { id: "new-journal", label: "New journal entry", run: () => createJournalEntry() },
    { id: "new-event", label: "New calendar event", run: () => router.push("/calendar?create=1") },
    { id: "open-calendar", label: "Open Calendar", run: () => router.push("/calendar") },
    { id: "open-brain", label: "Open Brain", run: () => router.push("/brain") },
    { id: "open-journal", label: "Open Journal", run: () => router.push("/journal") },
    { id: "open-work", label: "Open Work", run: () => router.push("/work") },
    { id: "open-photos", label: "Open Photos", run: () => router.push("/photos") },
    { id: "open-settings", label: "Open Settings", run: () => router.push("/settings") },
  ];

  const filteredCommands = commands.filter(
    (command) => command.id === "search" || command.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  type Item = { kind: "command"; command: StaticCommand } | { kind: "result"; result: SearchResult };
  const items: Item[] = [
    ...filteredCommands.map((command): Item => ({ kind: "command", command })),
    ...results.map((result): Item => ({ kind: "result", result })),
  ];

  async function runSelected() {
    const item = items[selected];
    if (!item) return;
    if (item.kind === "command") {
      await item.command.run();
      if (item.command.id !== "capture") close();
    } else {
      router.push(item.result.href);
      close();
    }
  }

  async function submitCapture() {
    const text = captureText.trim();
    if (!text) return;
    await captureThoughtFromPalette(text);
    router.refresh();
    close();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24" onClick={close}>
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-paper shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {mode === "commands" ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSelected((i) => Math.min(i + 1, items.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSelected((i) => Math.max(i - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  runSelected();
                }
              }}
              placeholder="Type a command or search…"
              className="w-full border-b border-border bg-transparent px-4 py-3 text-ink placeholder:text-muted focus:outline-none"
            />
            <ul className="max-h-80 overflow-y-auto py-2">
              {items.map((item, index) => (
                <li key={item.kind === "command" ? item.command.id : `${item.result.contentType}-${item.result.contentId}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setSelected(index)}
                    onClick={runSelected}
                    className={`block w-full px-4 py-2 text-left text-sm ${index === selected ? "bg-border text-ink" : "text-muted"}`}
                  >
                    {item.kind === "command" ? (
                      item.command.label
                    ) : (
                      <span>
                        <span className="text-muted">{CONTENT_TYPE_LABELS[item.result.contentType]} · </span>
                        <span className="text-ink">{item.result.title}</span>
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {items.length === 0 && <li className="px-4 py-3 text-sm text-muted">No matches.</li>}
            </ul>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitCapture();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={captureText}
              onChange={(event) => setCaptureText(event.target.value)}
              placeholder="What's on your mind? Press Enter to save."
              className="w-full border-b border-border bg-transparent px-4 py-3 text-ink placeholder:text-muted focus:outline-none"
            />
            <p className="px-4 py-2 text-xs text-muted">Private by default. Esc to cancel.</p>
          </form>
        )}
      </div>
    </div>
  );
}
