"use client";

import { deleteReadingEntry } from "@/server/actions/reading";

export function DeleteReadingEntryForm({ id }: { id: string }) {
  return (
    <form
      action={deleteReadingEntry.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm("Delete this entry? This can't be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-muted hover:text-accent">
        Delete
      </button>
    </form>
  );
}
