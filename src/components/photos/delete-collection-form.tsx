"use client";

import { deleteCollection } from "@/server/actions/photos";

export function DeleteCollectionForm({ id }: { id: string }) {
  return (
    <form
      action={deleteCollection.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm("Delete this collection? Photos in it are kept, just ungrouped.")) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-muted hover:text-accent">
        Delete collection
      </button>
    </form>
  );
}
