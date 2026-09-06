import Link from "next/link";
import { requireOwner } from "@/lib/auth/require-owner";
import { listBrainItems } from "@/lib/db/queries/brain";
import { listTagsForUser } from "@/lib/db/queries/tags";
import { BRAIN_ITEM_TYPES } from "@/lib/brain/constants";

interface BrainPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    tag?: string;
    pinned?: string;
    archived?: string;
    from?: string;
    to?: string;
  }>;
}

// PRD §11.3 — newest first; search, type filter, tag filter, pinned-only,
// archived, date range. Filters are plain GET params so the page works
// without client JS.
export default async function BrainPage({ searchParams }: BrainPageProps) {
  const owner = await requireOwner();
  const params = await searchParams;

  const type = BRAIN_ITEM_TYPES.find((t) => t === params.type);
  const items = await listBrainItems(owner.id, {
    q: params.q,
    type,
    tag: params.tag || undefined,
    pinnedOnly: params.pinned === "1",
    includeArchived: params.archived === "1",
    from: params.from,
    to: params.to,
  });
  const allTags = await listTagsForUser(owner.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-2xl tracking-tight text-ink">Ideas</h1>

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
          <span className="text-xs text-muted">Type</span>
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {BRAIN_ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
          <span className="text-xs text-muted">From</span>
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">To</span>
          <input
            type="date"
            name="to"
            defaultValue={params.to}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 pb-1.5">
          <input type="checkbox" name="pinned" value="1" defaultChecked={params.pinned === "1"} />
          <span className="text-muted">Pinned only</span>
        </label>
        <label className="flex items-center gap-1.5 pb-1.5">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={params.archived === "1"}
          />
          <span className="text-muted">Include archived</span>
        </label>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
        >
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <Link href={`/brain/${item.id}`} className="block">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-ink">{item.title || item.content}</p>
                  <span className="shrink-0 text-xs text-muted">{item.type}</span>
                </div>
                {item.title && (
                  <p className="mt-1 truncate text-sm text-muted">{item.content}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
