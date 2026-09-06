"use client";

import { useActionState, useRef } from "react";
import { captureBrainItem, type CaptureState } from "@/server/actions/brain";

const initialState: CaptureState = { ok: false, savedAt: 0 };

// PRD §10.2 — type something, hit Enter, it's saved. No folder, no tags, no
// title, no navigation. Shift+Enter allows multiline before submitting.
export function QuickCapture() {
  const [state, formAction, isPending] = useActionState(captureBrainItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="w-full">
      <textarea
        name="content"
        placeholder="What's on your mind?"
        rows={1}
        required
        autoComplete="off"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        className="w-full resize-none border-b border-border bg-transparent py-3 font-display text-2xl text-ink placeholder:text-muted focus:outline-none"
      />
      <div aria-live="polite" className="mt-1 h-4 text-xs text-muted">
        {isPending && "Saving…"}
        {!isPending && state.ok && state.savedAt > 0 && (
          <span key={state.savedAt} className="qc-saved-message">
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}
