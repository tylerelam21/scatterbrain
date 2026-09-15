export interface BookSearchResult {
  title: string;
  creator: string | null;
  coverImageUrl: string | null;
}

// Open Library — free, no API key, used only to autofill title/author/cover
// when starting a Book entry. Can be swapped for Google Books later without
// touching any caller: this module's return shape is the whole contract.
export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=6&fields=title,author_name,cover_i`;

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    return [];
  }
  if (!response.ok) return [];

  const data = (await response.json()) as {
    docs?: { title?: string; author_name?: string[]; cover_i?: number }[];
  };

  return (data.docs ?? [])
    .filter((doc) => !!doc.title)
    .map((doc) => ({
      title: doc.title!,
      creator: doc.author_name?.[0] ?? null,
      coverImageUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    }));
}
