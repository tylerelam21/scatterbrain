"use server";

import { checkPuzzleSolution } from "@/lib/db/queries/chess";

// The board only ever sends us the move it attempted — the solution itself
// never reaches the browser, so there's nothing to check client-side.
export async function submitPuzzleMove(puzzleKey: string, uciMove: string): Promise<{ correct: boolean }> {
  const correct = await checkPuzzleSolution(puzzleKey, uciMove);
  return { correct };
}
