"use client";

import Link from "next/link";
import { addDays, isSameAllDayDate, isSameDay, startOfWeek, toDateParam } from "@/lib/calendar/dates";
import { eventColor, eventTextClass } from "@/lib/calendar/colors";
import type { CalendarEventRow } from "@/lib/calendar/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_PER_DAY = 3;

interface MonthViewProps {
  monthAnchor: Date;
  events: CalendarEventRow[];
}

export function MonthView({ monthAnchor, events }: MonthViewProps) {
  const monthStart = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const monthEnd = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);

  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }

  const today = new Date();

  return (
    <div className="mt-6">
      <div className="grid grid-cols-7 border-b border-border pb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs text-muted">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          const inMonth = day.getMonth() === monthAnchor.getMonth();
          const isToday = isSameDay(day, today);
          const dayEvents = events
            .filter((e) => (e.allDay ? isSameAllDayDate(e.start, day) : isSameDay(e.start, day)))
            .sort((a, b) => a.start.getTime() - b.start.getTime());
          const visible = dayEvents.slice(0, MAX_VISIBLE_PER_DAY);
          const overflow = dayEvents.length - visible.length;

          return (
            <Link
              key={day.toISOString()}
              href={`/calendar?view=day&date=${toDateParam(day)}`}
              className={`min-h-[100px] border-b border-r border-border p-1.5 ${inMonth ? "" : "opacity-40"}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday ? "bg-accent text-paper" : "text-ink"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {visible.map((event) => {
                  const color = eventColor(event);
                  return (
                    <div
                      key={event.id}
                      className={`truncate rounded-sm px-1 py-0.5 text-[10px] ${eventTextClass(color)}`}
                      style={{ backgroundColor: color }}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {overflow > 0 && <p className="text-[10px] text-muted">+{overflow} more</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
