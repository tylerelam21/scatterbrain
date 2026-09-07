"use client";

import Link from "next/link";
import { addDays, endOfDay, formatTime, isSameDay } from "@/lib/calendar/dates";
import { eventColor } from "@/lib/calendar/colors";
import type { CalendarEventRow } from "@/lib/calendar/types";

// PRD §10.3-10.4 — today's events plus a short upcoming horizon, computed
// client-side (browser's real local time) against a wide server-fetched
// window, the same reasoning as the Calendar grid.
//
// Today's list renders as a timeline thread rather than a plain list: a
// hand-drawn connecting line, past events fading out, and whatever's next
// picked out in the accent color — the day visibly progressing rather than
// a static printout. Each dot picks up its own calendar's color (same
// source as the Calendar grid views) rather than one flat gray, so the
// list isn't monochrome.
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
  const nextEventId = todayEvents.find((e) => !e.allDay && e.end > now)?.id;

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
          <ul className="mt-6 space-y-7">
            {todayEvents.map((event, index) => {
              const isPast = !event.allDay && event.end <= now;
              const isNext = event.id === nextEventId;
              const isLast = index === todayEvents.length - 1;
              return (
                <li key={event.id} className={`relative pl-8 ${isPast ? "opacity-40" : ""}`}>
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute top-3 left-[3px] w-0.5 bg-muted/25"
                      style={{ height: "calc(100% + 1.75rem)" }}
                    />
                  )}
                  <span
                    className={`absolute top-1 left-0 h-2 w-2 rounded-full border-2 border-paper ${
                      isNext ? "ring-4 ring-accent/15" : ""
                    }`}
                    style={{ backgroundColor: eventColor(event) }}
                  />
                  <span className={`font-hand block text-sm ${isNext ? "text-accent" : "text-muted"}`}>
                    {event.allDay ? "all day" : formatTime(event.start)}
                  </span>
                  <span className={isNext ? "font-semibold text-ink" : "text-ink"}>{event.title}</span>
                  {event.location && <span className="ml-2 text-sm text-muted">{event.location}</span>}
                </li>
              );
            })}
          </ul>
        )}

        {gapMessage && <p className="mt-5 text-sm text-muted italic">{gapMessage}</p>}
      </section>

      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Up next</h2>
            <Link href="/calendar" className="text-xs text-muted hover:text-ink">
              View calendar →
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/calendar?event=${event.id}`}
                  className="group -mx-3 flex items-baseline justify-between gap-4 rounded px-3 py-3 transition-colors hover:bg-border"
                >
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
                      style={{ backgroundColor: eventColor(event) }}
                    />
                    <span className="min-w-0 truncate text-ink transition-colors group-hover:text-accent">
                      {event.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted transition-colors group-hover:text-accent">
                    {new Intl.DateTimeFormat(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }).format(event.start)}
                  </span>
                </Link>
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
