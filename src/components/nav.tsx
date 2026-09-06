import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

const ownerLinks = [
  { href: "/calendar", label: "Calendar" },
  { href: "/brain", label: "Brain" },
  { href: "/journal", label: "Journal" },
];

const publicLinks = [
  { href: "/work", label: "Work" },
  { href: "/photos", label: "Photos" },
];

const secondaryOwnerLinks = [
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export function Nav({ session }: { session: Session | null }) {
  const isOwner = session?.user?.role === "OWNER";

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight text-ink">
          scatterbrain
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          {isOwner &&
            ownerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/lab" className="transition-colors hover:text-ink">
            Lab
          </Link>
          {isOwner &&
            secondaryOwnerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
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
        </nav>
      </div>
    </header>
  );
}
