import { createReadingEntry } from "@/server/actions/reading";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS } from "@/lib/reading/constants";

interface NewReadingEntryFormProps {
  recentWorkTitles: string[];
}

// Find-or-create in one field: typing a title that matches an existing
// Work (case-insensitive) reuses it — the datalist just surfaces recent
// titles so that reuse is discoverable, not a hard constraint.
export function NewReadingEntryForm({ recentWorkTitles }: NewReadingEntryFormProps) {
  return (
    <form action={createReadingEntry} className="flex flex-wrap items-end gap-3">
      <label className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs text-muted">What are you reading, watching, listening to?</span>
        <input
          type="text"
          name="workTitle"
          list="reading-work-titles"
          placeholder="Title"
          required
          autoComplete="off"
          className="min-w-0 border-b border-border bg-transparent py-1.5 text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <datalist id="reading-work-titles">
          {recentWorkTitles.map((title) => (
            <option key={title} value={title} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">Creator</span>
        <input
          type="text"
          name="workCreator"
          placeholder="Author, host…"
          className="w-36 border-b border-border bg-transparent py-1.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted">Type</span>
        <select
          name="workMediaType"
          defaultValue="BOOK"
          className="border-b border-border bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
        >
          {MEDIA_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEDIA_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
      >
        New entry
      </button>
    </form>
  );
}
