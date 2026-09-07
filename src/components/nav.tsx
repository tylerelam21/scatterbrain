import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { RuneMark } from "@/components/brand/rune-mark";
import { MobileNavToggle } from "@/components/mobile-nav-toggle";

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
  const coreLinks = isOwner ? ownerCoreLinks : visitorCoreLinks;

  return (
    <header className="relative border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3 text-sm tracking-tight text-ink">
            <RuneMark aria-hidden className="h-12 w-auto text-accent" />
            {isOwner ? "life-of-tyla" : "Tyler Elam"}
          </Link>
          {isOwner && (
            <form action="/search" method="get" className="hidden min-w-0 md:block">
              <input
                type="search"
                name="q"
                placeholder="Search (⌘K)"
                className="w-28 border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:w-44 focus:outline-none"
              />
            </form>
          )}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6 text-sm font-light text-muted">
            {coreLinks.map((link) => (
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

        <MobileNavToggle>
          {isOwner && (
            <form action="/search" method="get" className="mb-6">
              <input
                type="search"
                name="q"
                placeholder="Search"
                className="w-full border-b border-border bg-transparent py-1.5 text-ink placeholder:text-muted focus:outline-none"
              />
            </form>
          )}

          <nav className="flex flex-col gap-4 text-ink">
            {coreLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            ))}
            <Link href="/photos" className="transition-colors hover:text-accent">
              Photos
            </Link>
            {isOwner && (
              <Link href="/settings" className="transition-colors hover:text-accent">
                Settings
              </Link>
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
