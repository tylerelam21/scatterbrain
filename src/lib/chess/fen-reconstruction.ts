import { Chess } from "chess.js";
import type { Side } from "./types";

export interface ReconstructedPosition {
  fen: string;
  sideToMove: Side;
}

// Lichess's JSON puzzle API doesn't include a FEN — only the full game PGN
// and `initialPly`. Community write-ups (and this app's own network sandbox
// can't reach lichess.org to double-check live) disagree on whether the
// puzzle's starting position is the one right at ply `initialPly`, or one
// move later (after the "setup" move the opponent plays to create the
// puzzle). Rather than hardcode either convention, this tries both
// candidate positions and keeps whichever one actually makes the puzzle's
// own first solution move legal, per chess.js's own move generator — that's
// ground truth regardless of which convention Lichess is using this month.
export function reconstructPuzzlePosition(
  pgn: string,
  initialPly: number,
  solutionFirstMove: string,
): ReconstructedPosition | null {
  const game = new Chess();
  try {
    game.loadPgn(pgn);
  } catch {
    return null;
  }

  const moves = game.history({ verbose: true });
  const candidates = [moves[initialPly]?.after, initialPly > 0 ? moves[initialPly - 1]?.after : new Chess().fen()];

  for (const fen of candidates) {
    if (fen && isLegalUciMove(fen, solutionFirstMove)) {
      return { fen, sideToMove: fen.split(" ")[1] === "b" ? "b" : "w" };
    }
  }
  return null;
}

function isLegalUciMove(fen: string, uci: string): boolean {
  try {
    const position = new Chess(fen);
    return position.moves({ verbose: true }).some((move) => move.lan === uci);
  } catch {
    return false;
  }
}
