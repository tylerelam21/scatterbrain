import { redirect } from "next/navigation";

// Journal now lives inside Studio's Journal tab — this list view moved,
// the detail/editor route at /journal/[id] did not. Old links and
// bookmarks to /journal (including filter query params) still land
// somewhere useful.
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ tab: "journal" });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, value);
  }
  redirect(`/studio?${query.toString()}`);
}
