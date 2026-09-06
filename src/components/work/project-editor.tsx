"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { useCallback, useRef, useState } from "react";
import { autosaveProject } from "@/server/actions/work";
import type { ProjectContent } from "@/lib/work/constants";

const AUTOSAVE_DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface ProjectEditorProps {
  id: string;
  slug: string;
  initialTitle: string;
  initialTagline: string;
  initialSummary: string;
  initialContent: ProjectContent | null;
}

// PRD §22 — flexible body (Problem, Approach, Screenshots, Architecture,
// Lessons, ...) as one rich-text document rather than rigid fixed fields,
// since "not every project requires every section." Autosave mirrors the
// Journal editor exactly.
export function ProjectEditor({
  id,
  slug,
  initialTitle,
  initialTagline,
  initialSummary,
  initialContent,
}: ProjectEditorProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const titleRef = useRef<HTMLInputElement>(null);
  const taglineRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (editorInstance: { getJSON: () => ProjectContent; getText: () => string }) => {
      setStatus("saving");
      try {
        await autosaveProject(id, slug, {
          title: titleRef.current?.value ?? "",
          tagline: taglineRef.current?.value ?? "",
          summary: summaryRef.current?.value ?? "",
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
    [id, slug],
  );

  const scheduleSave = useCallback(
    (editorInstance: { getJSON: () => ProjectContent; getText: () => string }) => {
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
      Placeholder.configure({ placeholder: "Problem, approach, architecture, lessons — whatever this project needs…" }),
      CharacterCount,
    ],
    content: initialContent ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => scheduleSave(e),
  });

  const words = editor?.storage.characterCount?.words?.() ?? 0;
  const triggerSave = () => editor && scheduleSave(editor);

  return (
    <div>
      <input
        ref={titleRef}
        type="text"
        defaultValue={initialTitle}
        placeholder="Project title"
        onChange={triggerSave}
        className="w-full border-none bg-transparent font-display text-3xl text-ink placeholder:text-muted focus:outline-none"
      />
      <input
        ref={taglineRef}
        type="text"
        defaultValue={initialTagline}
        placeholder="One-line tagline"
        onChange={triggerSave}
        className="mt-2 w-full border-none bg-transparent text-lg text-muted placeholder:text-muted/70 focus:outline-none"
      />
      <textarea
        ref={summaryRef}
        defaultValue={initialSummary}
        placeholder="Short summary shown on the Work list"
        rows={2}
        onChange={triggerSave}
        className="mt-3 w-full resize-none border-b border-border bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none"
      />

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
