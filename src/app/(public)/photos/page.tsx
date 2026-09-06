import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPhotoById, listAllPhotos, listCollections } from "@/lib/db/queries/photos";
import { createCollection } from "@/server/actions/photos";
import { PhotoGrid } from "@/components/photos/photo-grid";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { PhotoUploader } from "@/components/photos/photo-uploader";

interface PhotosPageProps {
  searchParams: Promise<{ photo?: string }>;
}

export default async function PhotosPage({ searchParams }: PhotosPageProps) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { photo: photoId } = await searchParams;

  const [collections, photos] = await Promise.all([
    listCollections({ publicOnly: !isOwner }),
    listAllPhotos({ publicOnly: !isOwner }),
  ]);

  const openPhoto = photoId ? await getPhotoById(photoId) : null;
  const canSeeOpenPhoto =
    openPhoto && (openPhoto.visibility === "PUBLIC" || isOwner);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-tight text-ink">Photos</h1>
      </div>

      {isOwner && (
        <div className="mt-6 space-y-4">
          <PhotoUploader />
          <form action={createCollection} className="flex items-center gap-2">
            <input
              type="text"
              name="title"
              placeholder="New collection title"
              className="w-56 border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            />
            <button type="submit" className="text-xs text-muted hover:text-ink">
              Create
            </button>
          </form>
        </div>
      )}

      {collections.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/photos/${collection.slug}`}
              className="text-ink hover:text-accent"
            >
              {collection.title}
            </Link>
          ))}
        </div>
      )}

      <PhotoGrid photos={photos} basePath="/photos" />

      {canSeeOpenPhoto && openPhoto && (
        <PhotoLightbox photo={openPhoto} closeHref="/photos" isOwner={isOwner} />
      )}
    </main>
  );
}
