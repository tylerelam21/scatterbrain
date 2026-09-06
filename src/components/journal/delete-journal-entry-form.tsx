"use client";

import { deleteJournalEntry } from "@/server/actions/journal";

export function DeleteJournalEntryForm({ id }: { id: string }) {
  return (
    <form
      action={deleteJournalEntry.bind(null, id)}
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
