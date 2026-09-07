import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { chessPuzzles } from "@/lib/db/schema";
import { LichessPuzzleProvider } from "@/lib/chess/lichess-provider";
import type { NormalizedPuzzle, Side } from "@/lib/chess/types";

export interface HourlyPuzzle {
  // Identifies which row was actually served — normally the current hour,
  // but the stale-fallback row's own key when Lichess is unreachable.
  puzzleKey: string;
  puzzle: NormalizedPuzzle;
  nextAt: Date;
}

function currentHourKey(date: Date): string {
  return date.toISOString().slice(0, 13); // "2026-09-06T14"
}

function nextHourBoundary(date: Date): Date {
  const next = new Date(date);
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(next.getUTCHours() + 1);
  return next;
}

function toNormalized(row: typeof chessPuzzles.$inferSelect): NormalizedPuzzle {
  return {
    id: row.puzzleId,
    fen: row.fen,
    sideToMove: (row.sideToMove === "b" ? "b" : "w") as Side,
    solutionMove: row.solutionMove,
    rating: row.rating,
    themes: row.themes,
    source: "lichess",
  };
}

// Server-controlled hourly rotation (PRD-adjacent "Find the best move"):
// the first request in a given UTC hour selects and persists that hour's
// puzzle; every request after that — from any visitor — reads the same
// row. If Lichess can't be reached for a new hour, this falls back to the
// most recent puzzle already cached rather than showing nothing.
export async function getPuzzleForCurrentHour(): Promise<HourlyPuzzle | null> {
  const now = new Date();
  const hourKey = currentHourKey(now);
  const nextAt = nextHourBoundary(now);

  const existing = await db.query.chessPuzzles.findFirst({ where: eq(chessPuzzles.hourKey, hourKey) });
  if (existing) {
    return { puzzleKey: existing.hourKey, nextAt, puzzle: toNormalized(existing) };
  }

  const token = process.env.LICHESS_API_TOKEN;
  if (!token) {
    console.error("[chess] LICHESS_API_TOKEN is not set — skipping fetch, falling back to cache if any");
  }
  if (token) {
    const fresh = await new LichessPuzzleProvider(token).getEndgamePuzzle();
    if (!fresh) {
      console.error("[chess] LichessPuzzleProvider returned no usable puzzle after retries");
    }
    if (fresh) {
      const [inserted] = await db
        .insert(chessPuzzles)
        .values({
          hourKey,
          puzzleId: fresh.id,
          fen: fresh.fen,
          sideToMove: fresh.sideToMove,
          solutionMove: fresh.solutionMove,
          rating: fresh.rating,
          themes: fresh.themes,
          source: fresh.source,
        })
        .onConflictDoNothing({ target: chessPuzzles.hourKey })
        .returning();

      if (inserted) return { puzzleKey: inserted.hourKey, nextAt, puzzle: toNormalized(inserted) };

      // A concurrent request already inserted this hour's puzzle — use it.
      const raced = await db.query.chessPuzzles.findFirst({ where: eq(chessPuzzles.hourKey, hourKey) });
      if (raced) return { puzzleKey: raced.hourKey, nextAt, puzzle: toNormalized(raced) };
    }
  }

  const [latest] = await db.select().from(chessPuzzles).orderBy(desc(chessPuzzles.hourKey)).limit(1);
  if (!latest) {
    console.error("[chess] no cached puzzle to fall back to — section will not render");
    return null;
  }
  return { puzzleKey: latest.hourKey, nextAt, puzzle: toNormalized(latest) };
}

export async function checkPuzzleSolution(puzzleKey: string, uciMove: string): Promise<boolean> {
  const row = await db.query.chessPuzzles.findFirst({ where: eq(chessPuzzles.hourKey, puzzleKey) });
  if (!row) return false;
  return row.solutionMove === uciMove;
}
