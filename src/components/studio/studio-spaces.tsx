"use client";

import { useState } from "react";

type Space = "work" | "fun";

// Both spaces are already fully server-rendered by the parent (Studio's
// page.tsx) and handed down as `workContent`/`funContent` — switching here
// is a pure client-side visibility toggle (via `hidden`, not a conditional
// unmount), so there's no refetch, no flash, no navigation at all.
export function StudioSpaces({
  workContent,
  funContent,
  initialSpace = "work",
}: {
  workContent: React.ReactNode;
  funContent: React.ReactNode;
  initialSpace?: Space;
}) {
  const [space, setSpace] = useState<Space>(initialSpace);

  return (
    <div>
      <div className="flex justify-center gap-10">
        <button
          type="button"
          onClick={() => setSpace("work")}
          className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
            space === "work" ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Work
        </button>
        <button
          type="button"
          onClick={() => setSpace("fun")}
          className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
            space === "fun" ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Just for Fun
        </button>
      </div>

      <div hidden={space !== "work"} className="mt-12">
        {workContent}
      </div>
      <div hidden={space !== "fun"} className="mt-12">
        {funContent}
      </div>
    </div>
  );
}
