import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getJournalEntryById } from "@/lib/db/queries/journal";
import { updateNoteField, deleteNote } from "@/server/actions/notes";
import { InlineEditable } from "@/components/home/inline-editable";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { id } = await params;

  const owner = await getOwnerUser();
  const entry = owner ? await getJournalEntryById(owner.id, id) : null;
  if (!entry) notFound();
  if (!isOwner && (entry.visibility !== "PUBLIC" || entry.status !== "COMPLETE")) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/notes" className="text-xs text-muted hover:text-ink">
          ← All notes
        </Link>
        {isOwner && (
          <form action={deleteNote.bind(null, entry.id)}>
            <button type="submit" className="text-xs text-muted hover:text-ink">
              Delete
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        {new Date(entry.journalDate).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <h1 className="font-display mt-2 text-4xl tracking-tight text-ink">
        <InlineEditable
          value={entry.title ?? ""}
          editable={isOwner}
          onSave={updateNoteField.bind(null, entry.id, "title")}
          placeholder="Untitled"
        />
      </h1>

      <div className="mt-10 text-lg leading-8 text-muted">
        {isOwner ? (
          <InlineEditable
            value={entry.plainText}
            editable
            onSave={updateNoteField.bind(null, entry.id, "body")}
            as="textarea"
            rows={12}
            placeholder="Write something…"
            className="block whitespace-pre-wrap"
          />
        ) : (
          entry.plainText
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i} className="mt-4 first:mt-0">
                {paragraph}
              </p>
            ))
        )}
      </div>
    </main>
  );
}
