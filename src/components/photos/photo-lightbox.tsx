"use client";

import { useRouter } from "next/navigation";
import { deletePhoto, removePhotoFromCollection, updatePhotoMeta } from "@/server/actions/photos";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";

interface PhotoLightboxProps {
  photo: {
    id: string;
    title: string | null;
    caption: string | null;
    altText: string | null;
    locationLabel: string | null;
    visibility: string;
    width: number;
    height: number;
  };
  closeHref: string;
  isOwner: boolean;
  collectionContext?: { collectionId: string; collectionSlug: string };
}

export function PhotoLightbox({ photo, closeHref, isOwner, collectionContext }: PhotoLightboxProps) {
  const router = useRouter();
  const close = () => router.push(closeHref, { scroll: false });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center gap-8 bg-ink/70 p-4 sm:p-10"
      onClick={close}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <button
        type="button"
        onClick={close}
        className="absolute top-4 right-4 text-sm text-paper hover:text-accent"
      >
        Close
      </button>

      <div className="flex max-h-full max-w-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- served through our own authorized route */}
        <img
          src={`/api/photos/${photo.id}`}
          alt={photo.altText ?? photo.title ?? ""}
          className="max-h-[85vh] max-w-[70vw] object-contain"
        />
      </div>

      {isOwner && (
        <div
          onClick={(event) => event.stopPropagation()}
          className="w-72 shrink-0 space-y-4 bg-paper p-5 text-sm"
        >
          <form action={updatePhotoMeta.bind(null, photo.id)} className="space-y-3">
            <label className="block">
              <span className="text-xs text-muted">Title</span>
              <input
                type="text"
                name="title"
                defaultValue={photo.title ?? ""}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Caption</span>
              <textarea
                name="caption"
                defaultValue={photo.caption ?? ""}
                rows={2}
                className="mt-1 w-full resize-none border-b border-border bg-transparent py-1 text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Alt text</span>
              <input
                type="text"
                name="altText"
                defaultValue={photo.altText ?? ""}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Location</span>
              <input
                type="text"
                name="locationLabel"
                defaultValue={photo.locationLabel ?? ""}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Visibility</span>
              <select
                name="visibility"
                defaultValue={photo.visibility}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
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
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
            >
              Save
            </button>
          </form>

          {collectionContext && (
            <form
              action={removePhotoFromCollection.bind(
                null,
                collectionContext.collectionSlug,
                collectionContext.collectionId,
                photo.id,
              )}
            >
              <button type="submit" className="text-xs text-muted hover:text-ink">
                Remove from this collection
              </button>
            </form>
          )}

          <form
            action={deletePhoto.bind(null, photo.id)}
            onSubmit={(event) => {
              if (!confirm("Delete this photo? This can't be undone.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit" className="text-xs text-muted hover:text-accent">
              Delete photo
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
