import type { CalendarEventRow } from "./types";

// A calendar's own color (custom override, else Google's), falling back to
// the site accent for calendars that never got one. Shared by every place
// that renders events with their calendar's color — the grid views and
// Home's schedule.
export function eventColor(event: CalendarEventRow): string {
  return event.calendarColor || event.calendarProviderColor || "var(--accent)";
}
