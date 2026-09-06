import Link from "next/link";
import { addDays, toDateParam } from "@/lib/calendar/dates";

type View = "week" | "month" | "day";

function periodLabel(view: View, anchor: Date): string {
  if (view === "month") {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(anchor);
  }
  if (view === "day") {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(anchor);
  }
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(anchor);
}

function shift(view: View, anchor: Date, direction: 1 | -1): Date {
  if (view === "month") return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
  if (view === "day") return addDays(anchor, direction);
  return addDays(anchor, 7 * direction);
}

function hrefFor(view: View, date: Date): string {
  return `/calendar?view=${view}&date=${toDateParam(date)}`;
}

export function CalendarNav({ view, anchor }: { view: View; anchor: Date }) {
  const prev = shift(view, anchor, -1);
  const next = shift(view, anchor, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={hrefFor(view, new Date())}
          className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink"
        >
          Today
        </Link>
        <Link href={hrefFor(view, prev)} className="text-muted hover:text-ink" aria-label="Previous">
          ←
        </Link>
        <Link href={hrefFor(view, next)} className="text-muted hover:text-ink" aria-label="Next">
          →
        </Link>
        <h1 className="font-display text-xl text-ink">{periodLabel(view, anchor)}</h1>
      </div>

      <div className="flex gap-1 rounded-full border border-border p-0.5 text-xs">
        {(["day", "week", "month"] as const).map((v) => (
          <Link
            key={v}
            href={hrefFor(v, anchor)}
            className={`rounded-full px-3 py-1 capitalize ${
              v === view ? "bg-ink text-paper" : "text-muted hover:text-ink"
            }`}
          >
            {v}
          </Link>
        ))}
      </div>
    </div>
  );
}
