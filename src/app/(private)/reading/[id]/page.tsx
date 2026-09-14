import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import {
  getAIReflection,
  getReadingEntryById,
  getRelatedEntriesByTheme,
  getThemesForEntry,
  listRecommendationsForEntry,
} from "@/lib/db/queries/reading";
import { MEDIA_TYPE_LABELS } from "@/lib/reading/constants";
import type { ReadingContent } from "@/lib/reading/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import {
  addQuestion,
  addTakeaway,
  generateAIReflection,
  removeQuestion,
  removeTakeaway,
  updateReadingMeta,
} from "@/server/actions/reading";
import { ReadingEntryEditor } from "@/components/reading/entry-editor";
import { ItemList } from "@/components/reading/item-list";
import { PracticalApplicationField } from "@/components/reading/practical-application-field";
import { RegenerateButton } from "@/components/reading/regenerate-button";
import { ThemeChips } from "@/components/reading/theme-chips";
import { RecommendationCard } from "@/components/reading/recommendation-card";
import { RelatedEntries } from "@/components/reading/related-entries";
import { DeleteReadingEntryForm } from "@/components/reading/delete-entry-form";

export default async function ReadingEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const { id } = await params;

  const row = await getReadingEntryById(owner.id, id);
  if (!row) notFound();
  const { entry, work } = row;

  const [reflection, themes, recommendations, related] = await Promise.all([
    getAIReflection(id),
    getThemesForEntry(id),
    listRecommendationsForEntry(id),
    getRelatedEntriesByTheme(owner.id, id),
  ]);

  const visibleRecommendations = recommendations.filter((r) => r.status !== "DISMISSED");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {MEDIA_TYPE_LABELS[work.mediaType]} · {work.title}
          {work.creator ? ` by ${work.creator}` : ""}
        </p>
        <DeleteReadingEntryForm id={entry.id} />
      </div>

      <form action={updateReadingMeta.bind(null, entry.id)} className="mt-4 flex items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Status</span>
          <select
            name="status"
            defaultValue={entry.status}
            className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="COMPLETE">COMPLETE</option>
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

      <div className="mt-10 grid gap-12 md:grid-cols-[3fr_2fr]">
        <div className="space-y-10">
          <ReadingEntryEditor
            id={entry.id}
            initialTitle={entry.title ?? ""}
            initialContent={entry.bodyJson as ReadingContent | null}
            initialEntryDate={entry.entryDate}
          />

          <ItemList
            heading="Key Takeaways (My Own)"
            placeholder="A takeaway in your own words"
            items={entry.takeaways}
            addAction={addTakeaway.bind(null, entry.id)}
            removeAction={removeTakeaway.bind(null, entry.id)}
          />

          <ItemList
            heading="Questions I'm Wrestling With"
            placeholder="Something unresolved"
            items={entry.questions}
            addAction={addQuestion.bind(null, entry.id)}
            removeAction={removeQuestion.bind(null, entry.id)}
          />

          <PracticalApplicationField id={entry.id} initialText={entry.practicalApplication ?? ""} />
        </div>

        <div className="space-y-10 border-border md:border-l md:pl-12">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium tracking-widest text-muted uppercase">AI Reflection</h2>
              <form action={generateAIReflection.bind(null, entry.id)}>
                <RegenerateButton hasReflection={!!reflection} />
              </form>
            </div>
            {reflection ? (
              <div className="mt-4 space-y-3 text-ink">
                {reflection.bodyText.split(/\n{2,}/).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Write a bit first, then generate a reflection — it works best once there&rsquo;s something
                to actually respond to.
              </p>
            )}
          </div>

          <ThemeChips entryId={entry.id} themes={themes} />

          {visibleRecommendations.length > 0 && (
            <div>
              <h2 className="text-xs font-medium tracking-widest text-muted uppercase">
                Explore Further
              </h2>
              <div>
                {visibleRecommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    id={rec.id}
                    entryId={entry.id}
                    title={rec.title}
                    creator={rec.creator}
                    mediaType={rec.mediaType}
                    url={rec.url}
                    whyItConnects={rec.whyItConnects}
                    lengthNote={rec.lengthNote}
                    status={rec.status}
                  />
                ))}
              </div>
            </div>
          )}

          <RelatedEntries entries={related} />
        </div>
      </div>
    </main>
  );
}
