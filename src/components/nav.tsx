import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { RuneMark } from "@/components/brand/rune-mark";

const ownerCoreLinks = [
  { href: "/", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/studio", label: "Studio" },
];

const visitorCoreLinks = [
  { href: "/work", label: "Work" },
  { href: "/lab", label: "Lab" },
];

export function Nav({ session }: { session: Session | null }) {
  const isOwner = session?.user?.role === "OWNER";

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3 text-sm tracking-tight text-ink">
            <RuneMark aria-hidden className="h-12 w-auto text-accent" />
            life-of-tyla
          </Link>
          {isOwner && (
            <form action="/search" method="get" className="min-w-0">
              <input
                type="search"
                name="q"
                placeholder="Search (⌘K)"
                className="w-28 border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:w-44 focus:outline-none"
              />
            </form>
          )}
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-light text-muted">
            {isOwner &&
              ownerCoreLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
                  {link.label}
                </Link>
              ))}
            {!isOwner &&
              visitorCoreLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
                  {link.label}
                </Link>
              ))}
            <Link href="/photos" className="transition-colors hover:text-ink">
              Photos
            </Link>
          </nav>

          <div className="flex items-center gap-3 text-xs text-muted">
            {isOwner && (
              <Link href="/settings" className="transition-colors hover:text-ink">
                Settings
              </Link>
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
      </div>
    </header>
  );
}
