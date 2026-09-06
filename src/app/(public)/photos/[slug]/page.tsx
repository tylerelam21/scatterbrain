import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCollectionBySlug, getPhotoById, listPhotosInCollection } from "@/lib/db/queries/photos";
import { updateCollectionMeta } from "@/server/actions/photos";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { PhotoUploader } from "@/components/photos/photo-uploader";
import { CollectionSlugForm } from "@/components/photos/collection-slug-form";
import { DeleteCollectionForm } from "@/components/photos/delete-collection-form";

interface PhotoCollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ photo?: string }>;
}

export default async function PhotoCollectionPage({ params, searchParams }: PhotoCollectionPageProps) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { slug } = await params;
  const { photo: photoId } = await searchParams;

  const collection = await getCollectionBySlug(slug, { publicOnly: !isOwner });
  if (!collection) notFound();

  const photos = await listPhotosInCollection(collection.id, { publicOnly: !isOwner });
  const openPhoto = photoId ? await getPhotoById(photoId) : null;
  const canSeeOpenPhoto = openPhoto && (openPhoto.visibility === "PUBLIC" || isOwner);
  const closeHref = `/photos/${collection.slug}`;

  if (!isOwner) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <h1 className="font-display text-3xl tracking-tight text-ink">{collection.title}</h1>
        {collection.description && <p className="mt-3 text-muted">{collection.description}</p>}

        <PhotoGrid photos={photos} basePath={closeHref} />

        {canSeeOpenPhoto && openPhoto && (
          <PhotoLightbox photo={openPhoto} closeHref={closeHref} isOwner={false} />
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <CollectionSlugForm id={collection.id} slug={collection.slug} />
        <DeleteCollectionForm id={collection.id} />
      </div>

      <form action={updateCollectionMeta.bind(null, collection.id, collection.slug)} className="mt-4 space-y-3">
        <input
          type="text"
          name="title"
          defaultValue={collection.title}
          className="w-full border-none bg-transparent font-display text-3xl text-ink focus:outline-none"
        />
        <textarea
          name="description"
          defaultValue={collection.description ?? ""}
          rows={2}
          placeholder="Description"
          className="w-full resize-none border-b border-border bg-transparent py-1 text-ink placeholder:text-muted focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <select
            name="visibility"
            defaultValue={collection.visibility}
            className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
          >
            Update
          </button>
        </div>
      </form>

      <div className="mt-6">
        <PhotoUploader collectionSlug={collection.slug} collectionId={collection.id} />
      </div>

      <PhotoGrid photos={photos} basePath={closeHref} />

      {canSeeOpenPhoto && openPhoto && (
        <PhotoLightbox
          photo={openPhoto}
          closeHref={closeHref}
          isOwner
          collectionContext={{ collectionId: collection.id, collectionSlug: collection.slug }}
        />
      )}
    </main>
  );
}
