"use client";

import { useActionState } from "react";
import { captureWorkItem, type CaptureState } from "@/server/actions/brain";

const initialState: CaptureState = { ok: false, savedAt: 0 };

// Same capture-first philosophy as Home's Quick Capture — content is the
// only required field — plus an optional link, since this box is meant
// for tasks, ideas, and things to reference, not just notes.
export function WorkCaptureForm() {
  const [state, formAction, isPending] = useActionState(captureWorkItem, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <textarea
        name="content"
        placeholder="An idea, a task, a link to drop for later"
        rows={2}
        required
        autoComplete="off"
        className="w-full resize-none border-b border-border bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <input
          type="url"
          name="url"
          placeholder="Optional link — a Sheet, a deck, anything"
          className="min-w-0 flex-1 border-b border-border bg-transparent py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Add"}
        </button>
      </div>
      <p aria-live="polite" className="h-4 text-xs text-muted">
        {!isPending && state.ok && state.savedAt > 0 && (
          <span key={state.savedAt} className="qc-saved-message">
            Saved.
          </span>
        )}
      </p>
    </form>
  );
}
