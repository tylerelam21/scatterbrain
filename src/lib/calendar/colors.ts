import type { CalendarEventRow } from "./types";

// Curated fallback so the calendars that actually matter read as one
// cohesive set instead of whatever near-identical teal Google happened to
// assign — same paint-chip/field-notebook family as the rest of the site.
// Matched by a case-insensitive pattern against the calendar's own name,
// which for a personal Google account's primary calendar is just its
// inbox address (that's why "gmail.com" works as the personal match).
// Work gets the site's own accent green — the color you're already most
// used to seeing and least likely to miss.
const NAME_COLOR_HINTS: { match: RegExp; bg: string }[] = [
  { match: /terminus|work/i, bg: "#2c502c" },
  { match: /gmail\.com/i, bg: "#3d5a73" },
  { match: /christ|covenant|church/i, bg: "#7a4a2e" },
  { match: /holiday/i, bg: "#c9982f" },
];

// Calendars with no explicit color, no name match, and no color from
// Google land here — a neutral graphite rather than colliding with one of
// the real categories above (reuses the site's own --muted token value).
const UNCATEGORIZED_COLOR = "#6b6558";

function curatedColorFor(calendarName: string): string | undefined {
  return NAME_COLOR_HINTS.find((hint) => hint.match.test(calendarName))?.bg;
}

// A calendar's own color (custom override in Settings), else a curated
// default keyed by calendar name, else Google's own color, else neutral.
// Shared by every place that renders events with their calendar's color —
// the grid views and Home's schedule.
export function eventColor(event: CalendarEventRow): string {
  return (
    event.calendarColor ||
    curatedColorFor(event.calendarName) ||
    event.calendarProviderColor ||
    UNCATEGORIZED_COLOR
  );
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(a: number, b: number): number {
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

const INK_LUMINANCE = relativeLuminance(hexToRgb("#17140f")!);
const PAPER_LUMINANCE = relativeLuminance(hexToRgb("#faf9f6")!);

// Which text color actually reads against a given event color — calendar
// colors range from a pale holiday gold to a near-black override, so a
// single fixed text color (the old behavior: always text-paper) doesn't
// hold up across all of them. Works for any hex color, including ones
// picked by hand in the calendar color picker, not just the curated set
// above.
export function eventTextClass(bg: string): "text-ink" | "text-paper" {
  const rgb = hexToRgb(bg);
  if (!rgb) return "text-paper";
  const bgLuminance = relativeLuminance(rgb);
  const inkContrast = contrastRatio(bgLuminance, INK_LUMINANCE);
  const paperContrast = contrastRatio(bgLuminance, PAPER_LUMINANCE);
  return inkContrast >= paperContrast ? "text-ink" : "text-paper";
}
