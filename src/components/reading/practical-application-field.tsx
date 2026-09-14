"use client";

import { useCallback, useRef, useState } from "react";
import { updatePracticalApplication } from "@/server/actions/reading";

const AUTOSAVE_DEBOUNCE_MS = 800;

export function PracticalApplicationField({ id, initialText }: { id: string; initialText: string }) {
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(
    (value: string) => {
      setSaved(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await updatePracticalApplication(id, value);
        setSaved(true);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [id],
  );

  return (
    <div>
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Put It Into Practice</h2>
      <textarea
        defaultValue={initialText}
        onChange={(e) => scheduleSave(e.target.value)}
        placeholder="One concrete thing this changes about how you'll live, work, or think…"
        rows={3}
        className="mt-3 w-full resize-none border-b border-border bg-transparent py-1 text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />
      <p className="mt-1 h-4 text-xs text-muted">{saved ? "Saved." : ""}</p>
    </div>
  );
}
