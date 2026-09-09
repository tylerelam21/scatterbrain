"use client";

import { useRef, useState, useTransition } from "react";

interface InlineEditableProps {
  value: string;
  editable: boolean;
  onSave: (value: string) => Promise<void>;
  as?: "input" | "textarea";
  placeholder: string;
  className?: string;
  rows?: number;
}

// Owner-only click-to-edit text, used directly on the live public
// homepage (via nav's "Public site" view) instead of routing every small
// wording change through Settings or the project editor. Visitors never
// see any of this — `editable` is only ever true once the viewer is
// already the signed-in owner (page.tsx), and the underlying server
// action re-checks that independently regardless.
export function InlineEditable({
  value,
  editable,
  onSave,
  as = "input",
  placeholder,
  className = "",
  rows = 3,
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();
  const clearStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!editable) {
    return value ? <span className={className}>{value}</span> : null;
  }

  function commit(nextDraft: string) {
    setEditing(false);
    if (nextDraft === value) return;
    setStatus("saving");
    startTransition(async () => {
      await onSave(nextDraft);
      setStatus("saved");
      if (clearStatusRef.current) clearTimeout(clearStatusRef.current);
      clearStatusRef.current = setTimeout(() => setStatus("idle"), 1500);
    });
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    const fieldClassName = `${className} block w-full resize-none rounded border border-accent/40 bg-transparent px-1 py-0.5 focus:outline-none`;
    return as === "textarea" ? (
      <textarea
        autoFocus
        rows={rows}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === "Escape") cancel();
        }}
        className={fieldClassName}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(draft);
          }
          if (event.key === "Escape") cancel();
        }}
        className={fieldClassName}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`${className} block w-full rounded px-1 py-0.5 text-left underline decoration-dashed decoration-accent/50 underline-offset-4 hover:bg-accent/5 ${
        value ? "" : "text-muted italic"
      }`}
    >
      {value || placeholder}
      {status === "saving" && <span className="ml-2 text-xs text-muted not-italic">Saving…</span>}
      {status === "saved" && <span className="ml-2 text-xs text-accent not-italic">Saved</span>}
    </button>
  );
}
