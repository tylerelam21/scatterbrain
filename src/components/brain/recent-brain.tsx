import Link from "next/link";
import { getRecentBrainItems } from "@/lib/db/queries/brain";
import { setArchived, setPinned } from "@/server/actions/brain";

// PRD §10.5 — 3-5 recent thoughts, click to open, quick pin, quick archive.
export async function RecentBrain({ userId }: { userId: string }) {
  const items = await getRecentBrainItems(userId, 5);

  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing captured yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-4 py-3">
          <Link href={`/brain/${item.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{item.title || item.content}</p>
          </Link>
          <div className="flex shrink-0 gap-3 text-xs text-muted">
            <form action={setPinned.bind(null, item.id, !item.pinned)}>
              <button type="submit" className="hover:text-ink">
                {item.pinned ? "Unpin" : "Pin"}
              </button>
            </form>
            <form action={setArchived.bind(null, item.id, true)}>
              <button type="submit" className="hover:text-ink">
                Archive
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
