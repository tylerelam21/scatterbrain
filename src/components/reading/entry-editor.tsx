"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef, useState } from "react";
import { autosaveReadingEntry } from "@/server/actions/reading";
import type { ReadingContent } from "@/lib/reading/constants";

const AUTOSAVE_DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface ReadingEntryEditorProps {
  id: string;
  initialTitle: string;
  initialContent: ReadingContent | null;
  initialEntryDate: string;
}

// Same autosave shape as the Journal editor (components/journal/editor.tsx)
// — this is "My Journal Entry", the user's own unpolished reflection, kept
// deliberately plain (no image/character-count chrome the journal has).
export function ReadingEntryEditor({
  id,
  initialTitle,
  initialContent,
  initialEntryDate,
}: ReadingEntryEditorProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (editorInstance: { getJSON: () => ReadingContent; getText: () => string }) => {
      setStatus("saving");
      try {
        await autosaveReadingEntry(id, {
          title: titleRef.current?.value ?? "",
          entryDate: dateRef.current?.value || initialEntryDate,
          bodyJson: editorInstance.getJSON(),
          bodyPlainText: editorInstance.getText(),
        });
        setStatus("saved");
        if (clearStatusRef.current) clearTimeout(clearStatusRef.current);
        clearStatusRef.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    },
    [id, initialEntryDate],
  );

  const scheduleSave = useCallback(
    (editorInstance: { getJSON: () => ReadingContent; getText: () => string }) => {
      setStatus("pending");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(editorInstance), AUTOSAVE_DEBOUNCE_MS);
    },
    [save],
  );

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Start writing…" })],
    content: initialContent ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => scheduleSave(e),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          ref={titleRef}
          type="text"
          name="title"
          defaultValue={initialTitle}
          placeholder="Untitled entry"
          onChange={() => editor && scheduleSave(editor)}
          className="min-w-0 flex-1 border-none bg-transparent font-display text-2xl text-ink placeholder:text-muted focus:outline-none"
        />
        <input
          ref={dateRef}
          type="date"
          name="entryDate"
          defaultValue={initialEntryDate}
          onChange={() => editor && scheduleSave(editor)}
          className="shrink-0 border-b border-border bg-transparent py-1 text-sm text-muted focus:outline-none"
        />
      </div>

      <div className="mt-1 h-4 text-xs text-muted" aria-live="polite">
        {status === "pending" || status === "saving"
          ? "Saving…"
          : status === "saved"
            ? "Saved."
            : status === "error"
              ? "Couldn't save — check your connection."
              : ""}
      </div>

      <div className="mt-4">
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">My Journal Entry</h2>
        <EditorContent editor={editor} className="journal-editor mt-4" />
      </div>
    </div>
  );
}
