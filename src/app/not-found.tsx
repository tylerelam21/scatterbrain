import Link from "next/link";
import { DoorMark } from "@/components/brand/door-mark";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <DoorMark aria-hidden className="h-16 w-auto text-accent opacity-70" />
      <h1 className="font-display mt-6 text-3xl tracking-tight text-ink">Nothing here.</h1>
      <p className="mt-3 max-w-sm text-muted">
        Whatever you were looking for isn&rsquo;t at this address anymore — or never was.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent"
      >
        Back home
      </Link>
    </main>
  );
}
