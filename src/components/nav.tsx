import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { HeaderStatus } from "@/components/header-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { HOME_CITY } from "@/lib/home/location";
import { getCurrentTempF } from "@/lib/home/weather";

const ownerCoreLinks = [
  { href: "/", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/brain", label: "Brain" },
  { href: "/journal", label: "Journal" },
];

const publicCoreLinks = [
  { href: "/work", label: "Work" },
  { href: "/photos", label: "Photos" },
  { href: "/lab", label: "Lab" },
];

const ownerUtilityLinks = [
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export async function Nav({ session }: { session: Session | null }) {
  const isOwner = session?.user?.role === "OWNER";
  const tempF = isOwner ? await getCurrentTempF() : null;

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm tracking-tight text-ink">
          scatterbrain
        </Link>

        <nav className="flex items-center gap-6 text-sm font-light text-muted">
          {isOwner &&
            ownerCoreLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
                {link.label}
              </Link>
            ))}
          {publicCoreLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isOwner && <HeaderStatus city={HOME_CITY} tempF={tempF} />}
          <div className="flex items-center gap-3 text-xs text-muted">
            {isOwner &&
              ownerUtilityLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
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
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
