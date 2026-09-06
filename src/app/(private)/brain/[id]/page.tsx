import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import { getBrainItemById } from "@/lib/db/queries/brain";
import { getTagsForBrainItem } from "@/lib/db/queries/tags";
import { BRAIN_ITEM_TYPES } from "@/lib/brain/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { addTag, removeTag, setArchived, setPinned, updateBrainItem } from "@/server/actions/brain";
import { expandBrainItemToJournal } from "@/server/actions/journal";
import { DeleteBrainItemForm } from "@/components/brain/delete-brain-item-form";

export default async function BrainItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await requireOwner();
  const { id } = await params;

  const item = await getBrainItemById(owner.id, id);
  if (!item) notFound();

  const tags = await getTagsForBrainItem(id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {new Date(item.createdAt).toLocaleString()}
        </p>
        <div className="flex items-center gap-4">
          <form action={expandBrainItemToJournal.bind(null, item.id)}>
            <button type="submit" className="text-sm text-muted hover:text-ink">
              Expand into journal entry
            </button>
          </form>
          <form action={setPinned.bind(null, item.id, !item.pinned)}>
            <button type="submit" className="text-sm text-muted hover:text-ink">
              {item.pinned ? "Unpin" : "Pin"}
            </button>
          </form>
          <form action={setArchived.bind(null, item.id, !item.archived)}>
            <button type="submit" className="text-sm text-muted hover:text-ink">
              {item.archived ? "Unarchive" : "Archive"}
            </button>
          </form>
          <DeleteBrainItemForm id={item.id} />
        </div>
      </div>

      <form action={updateBrainItem.bind(null, item.id)} className="mt-6 space-y-5">
        <label className="block">
          <span className="text-xs text-muted">Title</span>
          <input
            type="text"
            name="title"
            defaultValue={item.title ?? ""}
            className="mt-1 w-full border-b border-border bg-transparent py-1 font-display text-xl text-ink focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Content</span>
          <textarea
            name="content"
            defaultValue={item.content}
            required
            rows={8}
            className="mt-1 w-full resize-y border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>

        <div className="flex gap-6">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Type</span>
            <select
              name="type"
              defaultValue={item.type}
              className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            >
              {BRAIN_ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Visibility</span>
            <select
              name="visibility"
              defaultValue={item.visibility}
              className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
        >
          Save changes
        </button>
      </form>

      <div className="mt-10">
        <span className="text-xs text-muted">Tags</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <form key={tag.id} action={removeTag.bind(null, item.id, tag.id)}>
              <button
                type="submit"
                className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink"
              >
                {tag.name} ×
              </button>
            </form>
          ))}
          <form action={addTag.bind(null, item.id)} className="flex items-center gap-2">
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
