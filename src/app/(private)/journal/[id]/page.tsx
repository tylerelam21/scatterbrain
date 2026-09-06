import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import { getJournalEntryById } from "@/lib/db/queries/journal";
import { getTagsForJournalEntry } from "@/lib/db/queries/tags";
import { JOURNAL_STATUSES, type JournalContent } from "@/lib/journal/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { addJournalTag, removeJournalTag, updateJournalMeta } from "@/server/actions/journal";
import { JournalEditor } from "@/components/journal/editor";
import { DeleteJournalEntryForm } from "@/components/journal/delete-journal-entry-form";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await requireOwner();
  const { id } = await params;

  const entry = await getJournalEntryById(owner.id, id);
  if (!entry) notFound();

  const tags = await getTagsForJournalEntry(id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Created {new Date(entry.createdAt).toLocaleDateString()} · Updated{" "}
          {new Date(entry.updatedAt).toLocaleDateString()}
        </p>
        <DeleteJournalEntryForm id={entry.id} />
      </div>

      <form action={updateJournalMeta.bind(null, entry.id)} className="mt-4 flex items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Status</span>
          <select
            name="status"
            defaultValue={entry.status}
            className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
          >
            {JOURNAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Visibility</span>
          <select
            name="visibility"
            defaultValue={entry.visibility}
            className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
        >
          Update
        </button>
      </form>

      <div className="mt-10">
        <JournalEditor
          id={entry.id}
          initialTitle={entry.title ?? ""}
          initialContent={entry.contentJson as JournalContent | null}
          initialJournalDate={entry.journalDate}
        />
      </div>

      <div className="mt-10">
        <span className="text-xs text-muted">Tags</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <form key={tag.id} action={removeJournalTag.bind(null, entry.id, tag.id)}>
              <button
                type="submit"
                className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink"
              >
                {tag.name} ×
              </button>
            </form>
          ))}
          <form action={addJournalTag.bind(null, entry.id)} className="flex items-center gap-2">
            <input
              type="text"
              name="name"
              placeholder="Add tag"
              className="w-24 border-b border-border bg-transparent py-1 text-xs text-ink focus:outline-none"
            />
            <button type="submit" className="text-xs text-muted hover:text-ink">
              Add
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
