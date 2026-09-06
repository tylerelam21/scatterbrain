"use client";

import { useEffect, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type SquareHandlerArgs } from "react-chessboard";
import { submitPuzzleMove } from "@/server/actions/chess";
import type { Side } from "@/lib/chess/types";

interface BestMoveProps {
  puzzleKey: string;
  fen: string;
  sideToMove: Side;
  nextAt: string;
}

type Status = "playing" | "checking" | "correct" | "wrong";

// PRD-adjacent "Find the best move" — a small personality piece on Today,
// not a chess app: solve the one correct move in a real endgame position.
// Reusable by design: takes only the normalized puzzle fields as props, so
// nothing here knows or cares where the puzzle came from.
export function BestMove({ puzzleKey, fen: originalFen, sideToMove, nextAt }: BestMoveProps) {
  const [fen, setFen] = useState(originalFen);
  const [status, setStatus] = useState<Status>("playing");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const minutesRemaining = Math.max(0, Math.round((new Date(nextAt).getTime() - now) / 60_000));

  function attemptMove(from: Square, to: Square): boolean {
    if (status === "correct" || status === "checking") return false;

    const chess = new Chess(fen);
    const piece = chess.get(from);
    if (!piece || piece.color !== sideToMove) return false;

    const isPromotion = piece.type === "p" && (to[1] === "8" || to[1] === "1");
    let move;
    try {
      move = chess.move({ from, to, ...(isPromotion ? { promotion: "q" as const } : {}) });
    } catch {
      return false;
    }

    setFen(chess.fen());
    setStatus("checking");
    setMessage(null);

    submitPuzzleMove(puzzleKey, move.lan).then(({ correct }) => {
      if (correct) {
        setStatus("correct");
        setMessage("That's it.");
      } else {
        setStatus("wrong");
        setMessage("Not quite.");
        setFen(originalFen);
      }
    });

    return true;
  }

  function onPieceDrop({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
    if (!targetSquare || piece.pieceType[0].toLowerCase() !== sideToMove) return false;
    return attemptMove(sourceSquare as Square, targetSquare as Square);
  }

  function onSquareClick({ piece, square }: SquareHandlerArgs) {
    if (status === "correct" || status === "checking") return;

    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null);
        return;
      }
      if (piece && piece.pieceType[0].toLowerCase() === sideToMove) {
        setSelectedSquare(square as Square);
        return;
      }
      attemptMove(selectedSquare, square as Square);
      setSelectedSquare(null);
      return;
    }

    if (piece && piece.pieceType[0].toLowerCase() === sideToMove) {
      setSelectedSquare(square as Square);
    }
  }

  return (
    <section className="mt-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Find the best move</h2>
        <p className="text-xs text-muted">
          {minutesRemaining <= 0 ? "New position any moment" : `New position in ${minutesRemaining} min`}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">{sideToMove === "w" ? "White to move" : "Black to move"}</p>

      <div className="mx-auto mt-6 w-full max-w-[420px]">
        <Chessboard
          options={{
            id: "best-move",
            position: fen,
            boardOrientation: sideToMove === "w" ? "white" : "black",
            showNotation: false,
            showAnimations: true,
            allowDragging: status !== "correct" && status !== "checking",
            canDragPiece: ({ piece }) => piece.pieceType[0].toLowerCase() === sideToMove,
            lightSquareStyle: { backgroundColor: "var(--chess-light)" },
            darkSquareStyle: { backgroundColor: "var(--chess-dark)" },
            squareStyles: selectedSquare
              ? { [selectedSquare]: { boxShadow: "inset 0 0 0 3px var(--accent)" } }
              : {},
            onPieceDrop,
            onSquareClick,
          }}
        />
      </div>

      <div className="mt-4 min-h-6 text-center">
        {message &&
          (status === "correct" ? (
            <p className="font-hand text-2xl text-accent">{message}</p>
          ) : (
            <p className="text-sm text-muted">{message}</p>
          ))}
      </div>
    </section>
  );
}
