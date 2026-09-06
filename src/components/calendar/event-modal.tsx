"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function EventModal({ closeHref, children }: { closeHref: string; children: ReactNode }) {
  const router = useRouter();
  const close = () => router.push(closeHref);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={close}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-md bg-paper p-6 shadow-lg"
      >
        <div className="flex justify-end">
          <button type="button" onClick={close} className="text-sm text-muted hover:text-ink">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
