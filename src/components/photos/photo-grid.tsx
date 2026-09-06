import Link from "next/link";

export interface PhotoGridItem {
  id: string;
  width: number;
  height: number;
  title: string | null;
  altText: string | null;
}

// PRD §55 — aspect-ratio reserved per photo avoids layout shift as images
// lazy-load; no cropping/cards, just the images themselves.
export function PhotoGrid({ photos, basePath }: { photos: PhotoGridItem[]; basePath: string }) {
  if (photos.length === 0) {
    return <p className="mt-10 text-sm text-muted">No photos yet.</p>;
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <Link
          key={photo.id}
          href={`${basePath}?photo=${photo.id}`}
          scroll={false}
          className="block overflow-hidden bg-border/30"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- served through our own authorized route, not a static asset next/image can optimize */}
          <img
            src={`/api/photos/${photo.id}`}
            alt={photo.altText ?? photo.title ?? ""}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </Link>
      ))}
    </div>
  );
}
