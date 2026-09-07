import { redirect } from "next/navigation";

// Ideas now lives inside Studio's Feed tab — this list view moved, the
// detail/editor route at /brain/[id] did not. Old links and bookmarks to
// /brain (including filter query params) still land somewhere useful.
export default async function BrainPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ tab: "feed" });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, value);
  }
  redirect(`/studio?${query.toString()}`);
}
