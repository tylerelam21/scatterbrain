import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { listPublicJournalEntries } from "@/lib/db/queries/journal";
import { createNote } from "@/server/actions/notes";

// Public "Notes" — essays, observations, unfinished thoughts. Only
// finished (COMPLETE), visibility=PUBLIC journal entries ever show here;
// see listPublicJournalEntries. Owner can publish a new one right here —
// no separate private app to go write it in.
export default async function NotesPage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const owner = await getOwnerUser();
  const notes = owner ? await listPublicJournalEntries(owner.id) : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Notes</h1>
      <p className="mt-2 text-sm text-muted">
        Essays, observations, and unfinished thoughts — no pressure to publish on a schedule.
      </p>

      {isOwner && (
        <form action={createNote} className="mt-8 space-y-2 border-b border-border pb-8">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="block w-full border-b border-border bg-transparent py-1 text-lg text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <textarea
            name="body"
            rows={4}
            placeholder="Write something…"
            className="block w-full resize-none bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
          >
            Publish note
          </button>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing published yet.</p>
      ) : (
        <div className="mt-10 divide-y divide-border">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} className="block py-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-lg text-ink">{note.title || "Untitled"}</p>
                <span className="shrink-0 text-xs text-muted">
                  {new Date(note.journalDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {note.plainText && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{note.plainText}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
