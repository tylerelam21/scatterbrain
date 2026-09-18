"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef, useState } from "react";
import { autosaveProjectBody } from "@/server/actions/work";
import type { ProjectContent } from "@/lib/work/constants";

const AUTOSAVE_DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface ProjectBodyEditorProps {
  id: string;
  slug: string;
  initialContent: ProjectContent | null;
}

// The case-study body only — title/tagline/summary are InlineEditable
// directly on the styled page now (see page.tsx), not part of this
// editor, so it can't clobber them. Same journal-editor CSS class as the
// read-only render, so editing looks like the real page, not a form.
export function ProjectBodyEditor({ id, slug, initialContent }: ProjectBodyEditorProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (editorInstance: { getJSON: () => ProjectContent; getText: () => string }) => {
      setStatus("saving");
      try {
        await autosaveProjectBody(id, slug, {
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
      Placeholder.configure({
        placeholder: "Problem, approach, architecture, lessons — whatever this project needs…",
      }),
    ],
    content: initialContent ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => scheduleSave(e),
  });

  return (
    <div>
      <EditorContent editor={editor} className="journal-editor mt-10" />
      <p className="mt-2 h-4 text-xs text-muted" aria-live="polite">
        {status === "pending" || status === "saving"
          ? "Saving…"
          : status === "saved"
            ? "Saved."
            : status === "error"
              ? "Couldn't save — check your connection."
              : ""}
      </p>
    </div>
  );
}
