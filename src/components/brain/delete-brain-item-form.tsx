"use client";

import { deleteBrainItem } from "@/server/actions/brain";

export function DeleteBrainItemForm({ id }: { id: string }) {
  return (
    <form
      action={deleteBrainItem.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm("Delete this thought? This can't be undone.")) {
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
