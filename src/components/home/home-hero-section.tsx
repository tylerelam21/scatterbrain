"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatTime, isSameAllDayDate, isSameDay } from "@/lib/calendar/dates";
import { eventColor } from "@/lib/calendar/colors";
import type { CalendarEventRow } from "@/lib/calendar/types";
import { captureBrainItem, type CaptureState } from "@/server/actions/brain";
import { WeatherMoment } from "./weather-moment";

// PRD §10.1, §66 — date + a contextual line with personality: dry, curious,
// understated, never motivational. Computed entirely client-side so the
// greeting and "today" match the viewer's actual local time, not the
// server's (Vercel runs UTC).
const TAGLINES = [
  "Same curious mind, different day.",
  "Let's see what today has for you.",
  "Nothing figured out yet. Good.",
  "Today's blank enough to fill.",
  "Still paying attention.",
  "Onward, unhurried.",
];

const initialCaptureState: CaptureState = { ok: false, savedAt: 0 };

interface HomeHeroSectionProps {
  firstName: string;
  events: CalendarEventRow[];
  city: string;
  tempF: number | null;
  weatherCode: number | null;
}

// The private dashboard's whole top section — date/greeting, a giant
// background day-of-month bleeding behind it AND the schedule preview
// below, one consolidated "Up next" list (rather than a separate Today
// section plus a second Up-next list), and a plain one-line capture
// input — built to match the owner's own mockup for this page. Bundled
// into a single component (rather than composed from siblings in
// page.tsx) because the numeral needs one shared positioning/overflow
// context with everything it bleeds behind; splitting it back across
// HomeHero/WeatherMoment/TodaySchedule/QuickCapture the way it used to
// be would clip the numeral at whichever component's box it lived in.
export function HomeHeroSection({ firstName, events, city, tempF, weatherCode }: HomeHeroSectionProps) {
  const now = new Date();
  const dayName = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(now).toUpperCase();
  const monthShort = new Intl.DateTimeFormat(undefined, { month: "short" }).format(now).toUpperCase();
  const dayNum = now.getDate();
  const dayNumPadded = String(dayNum).padStart(2, "0");
  const year = now.getFullYear();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const tagline = TAGLINES[dayOfYear % TAGLINES.length];

  const todayTimed = events.filter((e) => !e.allDay && isSameDay(e.start, now));
  const upcoming = events
    .filter((e) => (e.allDay ? isSameAllDayDate(e.start, now) || e.start > now : e.end > now))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);
  const gapMessage = computeGapMessage(todayTimed, now);

  const [captureState, captureAction, capturePending] = useActionState(captureBrainItem, initialCaptureState);

  return (
    <div className="relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 -left-6 -z-10 hidden font-display text-[19rem] leading-[0.8] font-bold tracking-tighter text-date-gold/60 select-none sm:block"
      >
        {dayNumPadded}
      </span>

      <div className="relative flex items-start justify-between gap-8">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
          <div className="shrink-0">
            <p className="text-xs font-medium tracking-[0.2em] text-muted">{dayName}</p>
            <p className="font-display mt-1 text-2xl font-bold text-accent">
              {monthShort} {dayNum}
            </p>
            <p className="text-sm text-muted">{year}</p>
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
              {timeGreeting}, {firstName}.
            </h1>
            <p className="font-hand mt-2 text-xl text-muted">{tagline}</p>
          </div>
        </div>

        <WeatherMoment city={city} tempF={tempF} weatherCode={weatherCode} />
      </div>

      <div className="relative mt-10 border-t border-border pt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Up next</h2>
          <Link href="/calendar" className="text-xs text-muted hover:text-ink">
            Full calendar →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-5 text-sm text-muted italic">{gapMessage ?? "Nothing on the calendar."}</p>
        ) : (
          <ul className="mt-6 space-y-7">
            {upcoming.map((event, index) => {
              const isLast = index === upcoming.length - 1;
              return (
                <li key={event.id} className="relative pl-8">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute top-3 left-[3px] w-0.5 bg-muted/25"
                      style={{ height: "calc(100% + 1.75rem)" }}
                    />
                  )}
                  <span
                    className="absolute top-1 left-0 h-2 w-2 rounded-full border-2 border-paper"
                    style={{ backgroundColor: eventColor(event) }}
                  />
                  <span className="font-hand block text-sm text-accent">
                    {event.allDay ? "all day" : formatTime(event.start)}
                  </span>
                  <span className="text-ink">{event.title}</span>
                  {event.location && <span className="ml-2 text-sm text-muted">{event.location}</span>}
                </li>
              );
            })}
          </ul>
        )}

        {gapMessage && upcoming.length > 0 && (
          <p className="mt-5 text-sm text-muted italic">{gapMessage}</p>
        )}
      </div>

      <div className="relative mt-10 border-t border-border pt-8">
        <form action={captureAction} className="relative">
          <input
            name="content"
            type="text"
            placeholder="What's on your mind?"
            required
            autoComplete="off"
            className="font-hand w-full border-b border-border bg-transparent py-2 pr-8 text-xl text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Save"
            className="absolute right-0 bottom-2 text-muted hover:text-ink"
          >
            ↵
          </button>
          <p aria-live="polite" className="mt-1 h-4 text-xs text-muted">
            {capturePending && "saving…"}
            {!capturePending && captureState.ok && captureState.savedAt > 0 && (
              <span key={captureState.savedAt} className="qc-saved-message">
                saved.
              </span>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

function computeGapMessage(todayTimed: CalendarEventRow[], now: Date): string | null {
  if (todayTimed.length === 0) return null;

  const lastEnd = new Date(Math.max(...todayTimed.map((e) => e.end.getTime())));
  const dayEndCutoff = new Date(now);
  dayEndCutoff.setHours(21, 0, 0, 0);

  if (lastEnd <= now) return "Today's done. Evening's yours.";
  if (lastEnd < dayEndCutoff) return `Free after ${formatTime(lastEnd)}.`;
  return null;
}
