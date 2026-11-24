import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { listPublicBrainItems } from "@/lib/db/queries/brain";
import { getAppSettings } from "@/lib/db/queries/settings";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { getShelfBooks, removeShelfBook, setSiteContentField } from "@/server/actions/site";
import { addCommonplaceItem, removeCommonplaceItem } from "@/server/actions/commonplace";
import { InlineEditable } from "@/components/home/inline-editable";
import { AddShelfBookForm } from "@/components/commonplace/add-shelf-book-form";
import { BRAIN_ITEM_TYPES, type BrainItemType } from "@/lib/brain/constants";

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
// articles, ideas worth keeping. The curated list below is pulled from
// Ideas (brain items) marked Public; the "personal details" strip above it
// (shelf, listening, places) is the bit of real character the brand brief
// asked for, stored directly in appSettings rather than a new table.
export default async function CommonplacePage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const owner = await getOwnerUser();

  const [items, shelf, content] = owner
    ? await Promise.all([
        listPublicBrainItems(owner.id),
        getShelfBooks(owner.id),
        getAppSettings(owner.id, [...SITE_CONTENT_KEYS]),
      ])
    : [[], [], {} as Record<string, string>];

  const hasPersonalDetails =
    isOwner || shelf.length > 0 || !!content["commonplace.listening"] || !!content["commonplace.places"];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Commonplace</h1>
      <p className="mt-2 text-sm text-muted">
        Books, quotations, music, films, organizations, and ideas worth keeping.
      </p>

      {hasPersonalDetails && (
        <section className="mt-10 space-y-8 border-y border-border py-8">
          <div>
            <h2 className="text-xs tracking-wide text-muted uppercase">Currently on my shelf</h2>
            <div className="mt-3 flex flex-wrap items-start gap-4">
              {shelf.map((book, i) => (
                <div key={`${book.title}-${i}`} className="group relative w-20 shrink-0">
                  {book.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external Open Library cover, not a static asset next/image can optimize
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="h-28 w-20 rounded-sm border border-border object-cover"
                      style={{ boxShadow: "var(--note-shadow)" }}
                    />
                  ) : (
                    <div className="flex h-28 w-20 items-center justify-center rounded-sm border border-border bg-stone/30 p-2 text-center text-[10px] text-muted">
                      {book.title}
                    </div>
                  )}
                  <p className="mt-1.5 truncate text-[11px] text-muted" title={book.title}>
                    {book.title}
                  </p>
                  {isOwner && (
                    <form action={removeShelfBook.bind(null, i)} className="absolute -top-2 -right-2">
                      <button
                        type="submit"
                        aria-label={`Remove ${book.title}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-paper text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink"
                      >
                        ×
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {isOwner && (
                <div className="w-36 pt-1">
                  <AddShelfBookForm />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs tracking-wide text-muted uppercase">Often listening to</h2>
              <div className="mt-2 text-sm text-ink">
                <InlineEditable
                  value={content["commonplace.listening"] || ""}
                  editable={isOwner}
                  onSave={setSiteContentField.bind(null, "commonplace.listening")}
                  placeholder="Pinegrove, Hiss Golden Messenger, NPR's Tiny Desk…"
                />
              </div>
            </div>
            <div>
              <h2 className="text-xs tracking-wide text-muted uppercase">Places I care about</h2>
              <div className="mt-2 text-sm text-ink">
                <InlineEditable
                  value={content["commonplace.places"] || ""}
                  editable={isOwner}
                  onSave={setSiteContentField.bind(null, "commonplace.places")}
                  placeholder="Atlanta, Athens, the Blue Ridge foothills…"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {isOwner && (
        <form
          action={addCommonplaceItem}
          className="mt-6 flex flex-wrap items-end gap-3 border-b border-border pb-6"
        >
          <label className="min-w-0 flex-1 basis-60">
            <span className="text-xs text-muted">Add something worth keeping</span>
            <input
              type="text"
              name="content"
              placeholder="A quote, a book, a place, an idea…"
              required
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </label>
          <label>
            <span className="text-xs text-muted">Type</span>
            <select
              name="type"
              defaultValue="THOUGHT"
              className="mt-1 block border-b border-border bg-transparent py-1 text-sm text-ink focus:border-ink focus:outline-none"
            >
              {BRAIN_ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
          >
            Add
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing public yet.</p>
      ) : (
        <div className="mt-10 divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="group py-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-ink">{item.title || item.content}</p>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                  {TYPE_LABELS[item.type as BrainItemType] ?? item.type}
                  {isOwner && (
                    <form action={removeCommonplaceItem.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink"
                      >
                        Remove
                      </button>
                    </form>
                  )}
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
