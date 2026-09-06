import Link from "next/link";
import { requireOwner } from "@/lib/auth/require-owner";
import { listJournalEntries } from "@/lib/db/queries/journal";
import { listTagsForUser } from "@/lib/db/queries/tags";
import { JOURNAL_STATUSES } from "@/lib/journal/constants";
import { createJournalEntry } from "@/server/actions/journal";

interface JournalPageProps {
  searchParams: Promise<{ q?: string; tag?: string; status?: string }>;
}

// PRD §12.3 — chronological timeline, search, tags.
export default async function JournalPage({ searchParams }: JournalPageProps) {
  const owner = await requireOwner();
  const params = await searchParams;

  const status = JOURNAL_STATUSES.find((s) => s === params.status);
  const entries = await listJournalEntries(owner.id, {
    q: params.q,
    tag: params.tag || undefined,
    status,
  });
  const allTags = await listTagsForUser(owner.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-tight text-ink">Journal</h1>
        <form action={createJournalEntry}>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
          >
            New entry
          </button>
        </form>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Search</span>
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            className="w-48 border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Tag</span>
          <select
            name="tag"
            defaultValue={params.tag ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Status</span>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {JOURNAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
        >
          Filter
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No entries yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.id} className="py-4">
              <Link href={`/journal/${entry.id}`} className="block">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-ink">{entry.title || "Untitled"}</p>
                  <span className="shrink-0 text-xs text-muted">{entry.journalDate}</span>
                </div>
                {entry.plainText && (
                  <p className="mt-1 truncate text-sm text-muted">{entry.plainText}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
