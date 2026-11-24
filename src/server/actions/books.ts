"use server";

import { requireOwner } from "@/lib/auth/require-owner";
import { searchBooks, type BookSearchResult } from "@/lib/reading/book-search";

// Open Library lookup, used by the Commonplace shelf's "add a book" control.
export async function searchBooksAction(query: string): Promise<BookSearchResult[]> {
  await requireOwner();
  return searchBooks(query);
}
