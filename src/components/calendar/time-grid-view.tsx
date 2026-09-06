"use client";

import Link from "next/link";
import { endOfDay, formatTime, isSameDay, startOfDay, toDateParam } from "@/lib/calendar/dates";
import { layoutTimedEvents } from "@/lib/calendar/layout";
import type { CalendarEventRow } from "@/lib/calendar/types";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function eventColor(event: CalendarEventRow): string {
  return event.calendarColor || event.calendarProviderColor || "var(--accent)";
}

function formatDayLabel(date: Date): { weekday: string; day: string } {
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
    day: new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date),
  };
}

interface TimeGridViewProps {
  days: Date[];
  events: CalendarEventRow[];
  view: "week" | "day";
  defaultCalendarId: string | null;
}

export function TimeGridView({ days, events, view, defaultCalendarId }: TimeGridViewProps) {
  const today = new Date();

  return (
    <div className="mt-6 overflow-x-auto">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `48px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((day) => {
          const { weekday, day: dayNum } = formatDayLabel(day);
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className="border-b border-border pb-2 text-center">
              <p className="text-xs text-muted">{weekday}</p>
              <p
                className={`mt-0.5 text-lg ${isToday ? "font-semibold text-accent" : "text-ink"}`}
              >
                {dayNum}
              </p>
            </div>
          );
        })}

        <div className="pt-2 text-right text-xs text-muted">All day</div>
        {days.map((day) => {
          const allDayEvents = events.filter((e) => e.allDay && isSameDay(e.start, day));
          return (
            <div key={`allday-${day.toISOString()}`} className="min-h-[28px] space-y-1 pt-2">
              {allDayEvents.map((event) => (
                <EventChip key={event.id} event={event} view={view} />
              ))}
            </div>
          );
        })}
      </div>

      <div
        className="relative mt-2 grid min-w-[640px]"
        style={{ gridTemplateColumns: `48px repeat(${days.length}, 1fr)` }}
      >
        <div>
          {HOURS.map((hour) => (
            <div key={hour} className="h-12 -translate-y-2 pr-2 text-right text-[10px] text-muted">
              {hour === 0 ? "" : formatTime(new Date(2000, 0, 1, hour))}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayEvents = events.filter(
            (e) => !e.allDay && e.start < endOfDay(day) && e.end > startOfDay(day),
          );
          const positioned = layoutTimedEvents(dayEvents);

          return (
            <div key={day.toISOString()} className="relative border-l border-border">
              {HOURS.map((hour) => (
                <Link
                  key={hour}
                  href={buildCreateHref(day, hour, view, defaultCalendarId)}
                  className="block h-12 border-b border-border/60 hover:bg-border/30"
                />
              ))}

              {positioned.map(({ event, column, columnCount }) => {
                const startMin = Math.max(0, minutesFromMidnight(event.start, day));
                const endMin = Math.min(1440, minutesFromMidnight(event.end, day, true));
                const top = (startMin / 1440) * 100;
                const height = Math.max(((endMin - startMin) / 1440) * 100, 2.2);
                const width = 100 / columnCount;

                return (
                  <Link
                    key={event.id}
                    href={buildEventHref(event.id, view, day)}
                    className="absolute overflow-hidden rounded-sm px-1.5 py-0.5 text-[11px] leading-tight text-paper shadow-sm"
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      left: `${column * width}%`,
                      width: `calc(${width}% - 2px)`,
                      backgroundColor: eventColor(event),
                    }}
                  >
                    <span className="font-medium">{event.title}</span>
                    <span className="block opacity-80">{formatTime(event.start)}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventChip({ event, view }: { event: CalendarEventRow; view: "week" | "day" }) {
  return (
    <Link
      href={buildEventHref(event.id, view, event.start)}
      className="block truncate rounded-sm px-1.5 py-0.5 text-[11px] text-paper"
      style={{ backgroundColor: eventColor(event) }}
    >
      {event.title}
    </Link>
  );
}

function minutesFromMidnight(date: Date, day: Date, isEnd = false): number {
  if (!isSameDay(date, day)) return isEnd ? 1440 : 0;
  return date.getHours() * 60 + date.getMinutes();
}

function buildCreateHref(
  day: Date,
  hour: number,
  view: "week" | "day",
  defaultCalendarId: string | null,
): string {
  const start = new Date(day);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const params = new URLSearchParams({
    view,
    date: toDateParam(day),
    create: "1",
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  });
  if (defaultCalendarId) params.set("calendarId", defaultCalendarId);
  return `/calendar?${params.toString()}`;
}

function buildEventHref(eventId: string, view: "week" | "day", day: Date): string {
  const params = new URLSearchParams({ view, date: toDateParam(day), event: eventId });
  return `/calendar?${params.toString()}`;
}
