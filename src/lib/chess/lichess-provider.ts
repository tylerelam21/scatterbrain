import { reconstructPuzzlePosition } from "./fen-reconstruction";
import type { NormalizedPuzzle, PuzzleProvider, Side } from "./types";

const PUZZLE_NEXT_URL = "https://lichess.org/api/puzzle/next";
const MAX_ATTEMPTS = 3;

interface LichessPuzzleResponse {
  game: { pgn: string };
  puzzle: {
    id: string;
    rating?: number;
    themes?: string[];
    solution: string[];
    initialPly: number;
    // Not present in current documented responses, but check for it in
    // case Lichess adds it later — cheaper than reconstructing from PGN.
    fen?: string;
  };
}

// PRD-adjacent "Find the best move" feature. Requires the puzzle:read OAuth
// scope, so this must only ever run server-side with a personal API token
// (lichess.org/account/oauth/token) — never exposed to the browser.
export class LichessPuzzleProvider implements PuzzleProvider {
  constructor(private readonly apiToken: string) {}

  async getEndgamePuzzle(): Promise<NormalizedPuzzle | null> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const raw = await this.fetchOne();
      if (!raw) continue;
      const normalized = normalize(raw);
      if (normalized) return normalized;
      // Puzzle data couldn't be reconstructed cleanly — skip it, try another.
    }
    return null;
  }

  private async fetchOne(): Promise<LichessPuzzleResponse | null> {
    try {
      const url = new URL(PUZZLE_NEXT_URL);
      url.searchParams.set("angle", "endgame");
      url.searchParams.set("difficulty", "normal");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      return (await res.json()) as LichessPuzzleResponse;
    } catch {
      return null;
    }
  }
}

function normalize(raw: LichessPuzzleResponse): NormalizedPuzzle | null {
  const solutionMove = raw.puzzle.solution?.[0];
  if (!solutionMove) return null;

  if (raw.puzzle.fen) {
    return {
      id: raw.puzzle.id,
      fen: raw.puzzle.fen,
      sideToMove: sideFromFen(raw.puzzle.fen),
      solutionMove,
      rating: raw.puzzle.rating ?? null,
      themes: raw.puzzle.themes ?? [],
      source: "lichess",
    };
  }

  const position = reconstructPuzzlePosition(raw.game.pgn, raw.puzzle.initialPly, solutionMove);
  if (!position) return null;

  return {
    id: raw.puzzle.id,
    fen: position.fen,
    sideToMove: position.sideToMove,
    solutionMove,
    rating: raw.puzzle.rating ?? null,
    themes: raw.puzzle.themes ?? [],
    source: "lichess",
  };
}

function sideFromFen(fen: string): Side {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}
