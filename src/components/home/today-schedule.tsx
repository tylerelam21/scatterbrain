"use client";

import Link from "next/link";
import { addDays, endOfDay, formatTime, isSameDay } from "@/lib/calendar/dates";
import type { CalendarEventRow } from "@/lib/calendar/types";

function eventColor(event: CalendarEventRow): string {
  return event.calendarColor || event.calendarProviderColor || "var(--accent)";
}

// PRD §10.3-10.4 — today's events plus a short upcoming horizon, computed
// client-side (browser's real local time) against a wide server-fetched
// window, the same reasoning as the Calendar grid.
export function TodaySchedule({ events }: { events: CalendarEventRow[] }) {
  const now = new Date();

  const todayEvents = events
    .filter((e) => isSameDay(e.start, now))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const upcomingEvents = events
    .filter((e) => e.start > endOfDay(now) && e.start <= addDays(now, 7))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const gapMessage = computeGapMessage(todayEvents, now);

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Today</h2>
          <span className="text-xs text-muted">
            {todayEvents.length} {todayEvents.length === 1 ? "event" : "events"}
          </span>
        </div>

        {todayEvents.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing on the calendar today.</p>
        ) : (
          <ol className="mt-4 space-y-4 border-l border-border pl-4">
            {todayEvents.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full"
                  style={{ backgroundColor: eventColor(event) }}
                />
                <p className="text-xs text-muted">{event.allDay ? "All day" : formatTime(event.start)}</p>
                <p className="text-ink">{event.title}</p>
                {event.location && <p className="text-sm text-muted">{event.location}</p>}
              </li>
            ))}
          </ol>
        )}

        {gapMessage && <p className="font-hand mt-4 text-lg text-accent">{gapMessage}</p>}
      </section>

      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Upcoming</h2>
            <Link href="/calendar" className="text-xs text-muted hover:text-ink">
              View calendar →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="min-w-0 truncate text-ink">{event.title}</span>
                <span className="shrink-0 text-xs text-muted">
                  {new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(
                    event.start,
                  )}
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
