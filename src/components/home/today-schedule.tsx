"use client";

import Link from "next/link";
import { addDays, endOfDay, formatTime, isSameDay } from "@/lib/calendar/dates";
import type { CalendarEventRow } from "@/lib/calendar/types";

// PRD §10.3-10.4 — today's events plus a short upcoming horizon, computed
// client-side (browser's real local time) against a wide server-fetched
// window, the same reasoning as the Calendar grid. Styled as a plain
// editorial list — no timeline dots/connectors, no card chrome.
export function TodaySchedule({ events }: { events: CalendarEventRow[] }) {
  const now = new Date();

  const todayEvents = events
    .filter((e) => isSameDay(e.start, now))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const upcomingEvents = events
    .filter((e) => e.start > endOfDay(now) && e.start <= addDays(now, 7))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);

  const gapMessage = computeGapMessage(todayEvents, now);

  return (
    <div className="space-y-14">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Today</h2>
          <span className="text-xs text-muted">
            {todayEvents.length} {todayEvents.length === 1 ? "event" : "events"}
          </span>
        </div>

        {todayEvents.length === 0 ? (
          <p className="mt-5 text-sm text-muted">Nothing on the calendar today.</p>
        ) : (
          <ul className="mt-5 space-y-5">
            {todayEvents.map((event) => (
              <li key={event.id} className="flex items-baseline gap-4">
                <span className="w-16 shrink-0 text-xs text-muted">
                  {event.allDay ? "All day" : formatTime(event.start)}
                </span>
                <span>
                  <span className="text-ink">{event.title}</span>
                  {event.location && <span className="ml-2 text-sm text-muted">{event.location}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {gapMessage && <p className="mt-5 text-sm text-muted italic">{gapMessage}</p>}
      </section>

      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-medium tracking-widest text-muted uppercase">
              Worth knowing about
            </h2>
            <Link href="/calendar" className="text-xs text-muted hover:text-ink">
              View calendar →
            </Link>
          </div>
          <ul className="mt-5 space-y-4">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 truncate text-ink">{event.title}</span>
                <span className="shrink-0 text-xs text-muted">
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }).format(event.start)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function computeGapMessage(todayEvents: CalendarEventRow[], now: Date): string | null {
  if (todayEvents.length === 0) return "Open canvas.";

  const timed = todayEvents.filter((e) => !e.allDay);
  if (timed.length === 0) return null;

  const lastEnd = new Date(Math.max(...timed.map((e) => e.end.getTime())));
  const dayEndCutoff = new Date(now);
  dayEndCutoff.setHours(21, 0, 0, 0);

  if (lastEnd <= now) return "Today's done. Evening's yours.";
  if (lastEnd < dayEndCutoff) return `Free after ${formatTime(lastEnd)}.`;
  return null;
}
