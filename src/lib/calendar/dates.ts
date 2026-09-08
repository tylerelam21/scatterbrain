export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// All-day events are anchored to UTC midnight (see parseCalendarDateOnly)
// regardless of what timezone the server happens to run in — that's a
// fixed, unambiguous marker for "this calendar date," not a real instant.
// The calendar UI runs client-side, in the viewer's real timezone, so
// reading that marker back with *local* getters (as isSameDay does) rolls
// it back a day for anyone west of UTC. Read all-day events with UTC
// getters instead; `day` here is a real calendar grid cell, so its local
// y/m/d already is the date being displayed.
export function isSameAllDayDate(eventStart: Date, day: Date): boolean {
  return (
    eventStart.getUTCFullYear() === day.getFullYear() &&
    eventStart.getUTCMonth() === day.getMonth() &&
    eventStart.getUTCDate() === day.getDate()
  );
}

export function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateParam(value: string | undefined): Date {
  if (!value) return new Date();
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

// Google's all-day event "date" field ("2026-09-07") has no time or
// timezone attached — it names a calendar date, not an instant. Anchor it
// to UTC midnight explicitly, as a fixed marker independent of whatever
// timezone the server process happens to run in (this only matters if
// that ever isn't UTC — Date.UTC and the local constructor agree today).
// Callers that need to know which calendar date this is must read it back
// with UTC getters (isSameAllDayDate), not local ones — local getters are
// only correct for real instants viewed in the viewer's own timezone.
export function parseCalendarDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Thin wrappers around wall-clock reads so call sites (Server Components in
// particular) don't call the impure Date.now()/new Date() directly.
export function nowDate(): Date {
  return new Date();
}

export function defaultEventEnd(start: Date): Date {
  return new Date(start.getTime() + 60 * 60 * 1000);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}
