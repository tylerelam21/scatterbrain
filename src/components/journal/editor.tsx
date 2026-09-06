"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { useCallback, useRef, useState } from "react";
import { autosaveJournalEntry } from "@/server/actions/journal";
import type { JournalContent } from "@/lib/journal/constants";

const AUTOSAVE_DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface JournalEditorProps {
  id: string;
  initialTitle: string;
  initialContent: JournalContent | null;
  initialJournalDate: string;
}

export function JournalEditor({
  id,
  initialTitle,
  initialContent,
  initialJournalDate,
}: JournalEditorProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (editorInstance: { getJSON: () => JournalContent; getText: () => string }) => {
      setStatus("saving");
      try {
        await autosaveJournalEntry(id, {
          title: titleRef.current?.value ?? "",
          journalDate: dateRef.current?.value || initialJournalDate,
          contentJson: editorInstance.getJSON(),
          plainText: editorInstance.getText(),
        });
        setStatus("saved");
        if (clearStatusRef.current) clearTimeout(clearStatusRef.current);
        clearStatusRef.current = setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    },
    [id, initialJournalDate],
  );

  const scheduleSave = useCallback(
    (editorInstance: { getJSON: () => JournalContent; getText: () => string }) => {
      setStatus("pending");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(editorInstance), AUTOSAVE_DEBOUNCE_MS);
    },
    [save],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: "Start writing…" }),
      CharacterCount,
    ],
    content: initialContent ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => scheduleSave(e),
  });

  const words = editor?.storage.characterCount?.words?.() ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          ref={titleRef}
          type="text"
          name="title"
          defaultValue={initialTitle}
          placeholder="Untitled"
          onChange={() => editor && scheduleSave(editor)}
          className="min-w-0 flex-1 border-none bg-transparent font-display text-3xl text-ink placeholder:text-muted focus:outline-none"
        />
        <input
          ref={dateRef}
          type="date"
          name="journalDate"
          defaultValue={initialJournalDate}
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

      <EditorContent editor={editor} className="journal-editor mt-6" />

      <p className="mt-6 text-xs text-muted">{words} words</p>
    </div>
  );
}
