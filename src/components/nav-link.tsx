"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A nav link that knows whether it points at the page you're on. Marks the
// current section with aria-current="page" (announced by screen readers)
// and applies `activeClassName` so sighted visitors get the same "you are
// here" cue. A section counts as current on its own index and on anything
// beneath it, so /work/some-project still highlights Work.
export function isCurrentSection(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  className,
  activeClassName,
  children,
}: {
  href: string;
  className: string;
  activeClassName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = isCurrentSection(pathname, href);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`${className} ${current ? activeClassName : ""}`}
    >
      {children}
    </Link>
  );
}
