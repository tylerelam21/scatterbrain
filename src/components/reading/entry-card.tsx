import Link from "next/link";
import { MEDIA_TYPE_LABELS } from "@/lib/reading/constants";

interface ReadingEntryCardProps {
  id: string;
  entryTitle: string | null;
  entryDate: string;
  status: string;
  visibility: string;
  workTitle: string;
  workCreator: string | null;
  mediaType: string;
  coverImageUrl: string | null;
}

export function ReadingEntryCard({
  id,
  entryTitle,
  entryDate,
  status,
  visibility,
  workTitle,
  workCreator,
  mediaType,
  coverImageUrl,
}: ReadingEntryCardProps) {
  const mediaLabel = MEDIA_TYPE_LABELS[mediaType as keyof typeof MEDIA_TYPE_LABELS] ?? mediaType;

  return (
    <Link href={`/reading/${id}`} className="flex items-start gap-4 py-5">
      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external Open Library cover, not a static asset next/image can optimize
        <img src={coverImageUrl} alt="" className="h-14 w-10 shrink-0 border border-border object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="truncate text-ink">{entryTitle || workTitle}</p>
          <span className="shrink-0 text-xs text-muted">
            {entryDate}
            {status === "DRAFT" && " · draft"}
            {visibility !== "PRIVATE" && ` · ${visibility}`}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-muted">
          {mediaLabel} · {workTitle}
          {workCreator ? ` by ${workCreator}` : ""}
        </p>
      </div>
    </Link>
  );
}
