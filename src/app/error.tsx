"use client";

import { useEffect } from "react";
import Link from "next/link";

// Root error boundary — catches anything thrown in a page/segment below
// the root layout, which keeps rendering around this (Nav stays visible).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-display text-3xl tracking-tight text-ink">Something went sideways.</h1>
      <p className="mt-3 max-w-sm text-muted">That page hit a snag. Give it another try, or head back home.</p>
      {error.digest && <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
