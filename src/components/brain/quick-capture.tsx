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
    <form ref={formRef} action={formAction} className="w-full max-w-[320px]">
      <div
        className="relative -rotate-2 bg-[#f3dd8f] p-5 pb-8 shadow-[3px_6px_14px_rgba(23,20,15,0.18)] transition-transform duration-300 ease-out focus-within:rotate-0"
        style={{ color: "#3a2f10" }}
      >
        <textarea
          name="content"
          placeholder="What's on your mind?"
          rows={2}
          required
          autoComplete="off"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className="font-hand w-full resize-none bg-transparent text-xl leading-snug outline-none placeholder:text-[#3a2f10]/50"
        />
        <span aria-hidden className="absolute right-4 bottom-2 font-hand text-lg text-[#3a2f10]/40">
          ↵
        </span>
        <div aria-live="polite" className="font-hand absolute bottom-2 left-5 h-5 text-sm text-[#3a2f10]/70">
          {isPending && "saving…"}
          {!isPending && state.ok && state.savedAt > 0 && (
            <span key={state.savedAt} className="qc-saved-message">
              saved.
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
