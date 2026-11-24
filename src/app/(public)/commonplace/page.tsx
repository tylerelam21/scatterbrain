import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { listPublicBrainItems } from "@/lib/db/queries/brain";
import type { BrainItemType } from "@/lib/brain/constants";

const TYPE_LABELS: Record<BrainItemType, string> = {
  THOUGHT: "Thought",
  IDEA: "Idea",
  QUESTION: "Question",
  QUOTE: "Quote",
  PLACE: "Place",
  RECOMMENDATION: "Recommendation",
  PROJECT_IDEA: "Project idea",
  OTHER: "Note",
};

// Public "Commonplace" — books, quotations, music, films, organizations,
// articles, ideas worth keeping. Pulled from Ideas (brain items) marked
// Public — a curated collection, not a blog.
export default async function CommonplacePage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const owner = await getOwnerUser();
  const items = owner ? await listPublicBrainItems(owner.id) : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Commonplace</h1>
      <p className="mt-2 text-sm text-muted">
        Books, quotations, music, films, organizations, and ideas worth keeping.
      </p>

      {isOwner && (
        <p className="mt-4 text-xs text-muted">
          Mark any idea Public from Studio to have it show up here.
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing public yet.</p>
      ) : (
        <div className="mt-10 divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="py-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-ink">{item.title || item.content}</p>
                <span className="shrink-0 text-xs text-muted">
                  {TYPE_LABELS[item.type as BrainItemType] ?? item.type}
                </span>
              </div>
              {item.title && <p className="mt-1 text-sm text-muted">{item.content}</p>}
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-accent hover:underline"
                >
                  {item.sourceUrl}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
