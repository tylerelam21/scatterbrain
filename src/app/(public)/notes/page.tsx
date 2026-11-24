import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { listPublicJournalEntries } from "@/lib/db/queries/journal";

// Public "Notes" — essays, observations, unfinished thoughts. Only
// finished (COMPLETE), visibility=PUBLIC journal entries ever show here;
// see listPublicJournalEntries.
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
        <p className="mt-4 text-xs text-muted">
          Mark a journal entry Complete and Public from{" "}
          <Link href="/studio?space=fun" className="underline hover:text-ink">
            Studio
          </Link>{" "}
          to have it show up here.
        </p>
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
