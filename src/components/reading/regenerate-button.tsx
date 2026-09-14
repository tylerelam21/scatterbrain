"use client";

import { useFormStatus } from "react-dom";

export function RegenerateButton({ hasReflection }: { hasReflection: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50"
    >
      {pending ? "Thinking…" : hasReflection ? "Regenerate" : "Generate reflection"}
    </button>
  );
}
