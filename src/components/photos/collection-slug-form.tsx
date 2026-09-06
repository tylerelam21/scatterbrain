"use client";

import { useActionState } from "react";
import { updateCollectionSlug, type SlugFormState } from "@/server/actions/photos";

const initialState: SlugFormState = { ok: false };

export function CollectionSlugForm({ id, slug }: { id: string; slug: string }) {
  const [state, formAction, isPending] = useActionState(
    updateCollectionSlug.bind(null, id, slug),
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <span className="text-xs text-muted">/photos/</span>
      <input
        type="text"
        name="slug"
        defaultValue={state.slug ?? slug}
        className="w-40 border-b border-border bg-transparent py-1 text-xs text-ink focus:outline-none"
      />
      <button type="submit" disabled={isPending} className="text-xs text-muted hover:text-ink">
        {isPending ? "Saving…" : "Save"}
      </button>
      {state.error && <span className="text-xs text-accent">{state.error}</span>}
    </form>
  );
}
