"use client";

import { useFormStatus } from "react-dom";
import { moreLikeThisRecommendation, setRecommendationStatus } from "@/server/actions/reading";
import { MEDIA_TYPE_LABELS, type RecommendationStatus } from "@/lib/reading/constants";

function ActionButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="hover:text-ink disabled:opacity-50">
      {pending ? "…" : children}
    </button>
  );
}

interface RecommendationCardProps {
  id: string;
  entryId: string;
  title: string;
  creator: string | null;
  mediaType: string;
  url: string | null;
  whyItConnects: string;
  lengthNote: string | null;
  status: RecommendationStatus;
}

// Explore Further — every suggestion carries a specific reason tied back
// to this entry (whyItConnects), never a generic "if you liked X" blurb,
// and the user's decision (Save / Already know it / Not for me) is a real
// status on the row, not just a UI toggle.
export function RecommendationCard({
  id,
  entryId,
  title,
  creator,
  mediaType,
  url,
  whyItConnects,
  lengthNote,
  status,
}: RecommendationCardProps) {
  const mediaLabel = MEDIA_TYPE_LABELS[mediaType as keyof typeof MEDIA_TYPE_LABELS] ?? mediaType;

  return (
    <div className="border-t border-border py-4">
      <p className="text-ink">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">
            {title}
          </a>
        ) : (
          title
        )}
        {creator ? <span className="text-muted"> — {creator}</span> : null}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {mediaLabel}
        {lengthNote ? ` · ${lengthNote}` : ""}
      </p>
      <p className="mt-2 text-sm text-muted">{whyItConnects}</p>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        {status === "SUGGESTED" && (
          <>
            <form action={setRecommendationStatus.bind(null, id, entryId, "SAVED")}>
              <ActionButton>Save</ActionButton>
            </form>
            <form action={setRecommendationStatus.bind(null, id, entryId, "KNOWN")}>
              <ActionButton>Already know it</ActionButton>
            </form>
            <form action={moreLikeThisRecommendation.bind(null, id, entryId)}>
              <ActionButton>More like this</ActionButton>
            </form>
            <form action={setRecommendationStatus.bind(null, id, entryId, "DISMISSED")}>
              <ActionButton>Not for me</ActionButton>
            </form>
          </>
        )}
        {status === "SAVED" && (
          <>
            <span className="text-accent">Saved</span>
            <form action={moreLikeThisRecommendation.bind(null, id, entryId)}>
              <ActionButton>More like this</ActionButton>
            </form>
          </>
        )}
        {status === "KNOWN" && <span>Already know it</span>}
      </div>
    </div>
  );
}
