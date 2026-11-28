import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNavToggle } from "@/components/mobile-nav-toggle";
import { NavLink } from "@/components/nav-link";

// "You are here": underline (not colour alone — WCAG 1.4.1) in the accent.
const current = "text-ink underline decoration-accent decoration-1 underline-offset-[6px]";
const currentMobile = "text-accent underline decoration-1 underline-offset-[6px]";

// The site's five public sections (see the brand/IA brief) — the same ones
// a visitor sees are what the owner sees too; there's no separate private
// dashboard anymore. Calendar is the one owner-only exception, appended
// below rather than mixed into this shared list.
const coreLinks = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/notes", label: "Notes" },
  { href: "/commonplace", label: "Commonplace" },
  { href: "/now", label: "Now" },
];

export function Nav({ session }: { session: Session | null }) {
  const isOwner = session?.user?.role === "OWNER";

  return (
    <header className="relative z-50 border-b border-border bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-sm tracking-tight text-ink">
          tyler elam.
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6 text-sm font-light text-muted">
            {coreLinks.map((link) => (
              <NavLink key={link.href} href={link.href} className="transition-colors hover:text-ink" activeClassName={current}>
                {link.label}
              </NavLink>
            ))}
            {isOwner && (
              <NavLink href="/calendar" className="transition-colors hover:text-ink" activeClassName={current}>
                Calendar
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3 text-xs text-muted">
            {isOwner && (
              <NavLink href="/settings" className="transition-colors hover:text-ink" activeClassName={current}>
                Settings
              </NavLink>
            )}
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className="transition-colors hover:text-ink">
                  Sign out
                </button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button type="submit" className="transition-colors hover:text-ink">
                  Sign in
                </button>
              </form>
            )}
            <ThemeToggle />
          </div>
        </div>

        <MobileNavToggle>
          <nav className="flex flex-col gap-4 text-ink">
            {coreLinks.map((link) => (
              <NavLink key={link.href} href={link.href} className="transition-colors hover:text-accent" activeClassName={currentMobile}>
                {link.label}
              </NavLink>
            ))}
            {isOwner && (
              <NavLink href="/calendar" className="transition-colors hover:text-accent" activeClassName={currentMobile}>
                Calendar
              </NavLink>
            )}
            {isOwner && (
              <NavLink href="/settings" className="transition-colors hover:text-accent" activeClassName={currentMobile}>
                Settings
              </NavLink>
            )}
          </nav>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5 text-sm text-muted">
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className="transition-colors hover:text-ink">
                  Sign out
                </button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button type="submit" className="transition-colors hover:text-ink">
                  Sign in
                </button>
              </form>
            )}
            <ThemeToggle />
          </div>
        </MobileNavToggle>
      </div>
    </header>
  );
}
