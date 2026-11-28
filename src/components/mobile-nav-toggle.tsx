"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Button + collapsible panel for narrow screens. The panel is absolutely
// positioned against <Nav>'s own header element (which sets position:
// relative) so it spans the full header width regardless of where in the
// flex row this component sits — this wrapper itself stays position:static
// so it doesn't become the panel's containing block instead.
export function MobileNavToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // This lives in the root layout, so it isn't remounted on navigation —
  // without this the panel stayed open over the page you'd just tapped
  // through to. Close it whenever the route changes (React's "adjust state
  // while rendering" pattern, rather than an effect, so there's no frame
  // where the new page renders under a still-open menu).
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Escape closes it too, matching the usual disclosure-menu convention.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-ink"
      >
        {open ? (
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 2 L16 16 M16 2 L2 16" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1 4.5 H17 M1 9 H17 M1 13.5 H17" />
          </svg>
        )}
      </button>

      <div hidden={!open} className="absolute inset-x-0 top-full z-20 border-t border-border bg-paper px-6 py-6 shadow-lg">
        {children}
      </div>
    </div>
  );
}
