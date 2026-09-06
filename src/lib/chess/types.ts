export type Side = "w" | "b";

// The only shape the rest of the app (UI, DB cache) ever deals with —
// nothing here is specific to Lichess's response format.
export interface NormalizedPuzzle {
  id: string;
  fen: string;
  sideToMove: Side;
  // UCI, e.g. "d8h8" or "e7e8q". Kept out of anything sent to the browser.
  solutionMove: string;
  rating: number | null;
  themes: string[];
  source: "lichess";
}

// The seam for swapping sources later (e.g. a locally curated/imported
// collection) without the DB cache or UI knowing the difference.
export interface PuzzleProvider {
  getEndgamePuzzle(): Promise<NormalizedPuzzle | null>;
}
