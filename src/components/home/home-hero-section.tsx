"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatTime, isSameAllDayDate, isSameDay } from "@/lib/calendar/dates";
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

// The private dashboard's whole top section. Structural notes from the
// second-pass revision:
//
// - The outer wrapper needs an explicit z-index (z-0), not just
//   `relative` — without one, `relative` alone doesn't establish a
//   stacking context, so the numeral's negative z-index escapes all the
//   way to the document root and paints *underneath* <body>'s own
//   background, i.e. invisible, despite existing with the right size
//   and color. Verified with a standalone Playwright repro before
//   porting this back (this bug is easy to trip and easy to miss since
//   the element "exists" in the DOM the whole time).
// - The numeral is one text node (not two independently-positioned
//   digits) inside a width-constrained, overflow-hidden box; at this
//   font size the digits wrap onto their own line naturally (no
//   manual <br/> or split spans), which is what gives it enough
//   height to bleed past both the top and bottom of the section while
//   still reading as one connected shape.
// - Schedule is a single horizontal band (UP NEXT | event | event |
//   Full calendar), not a vertical timeline — at most two events, no
//   dots, no connecting line.
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
    .slice(0, 2);
  const gapMessage = computeGapMessage(todayTimed, now);

  const [captureState, captureAction, capturePending] = useActionState(captureBrainItem, initialCaptureState);

  return (
    <div className="relative z-0">
      <div className="absolute top-0 right-0">
        <WeatherMoment city={city} tempF={tempF} weatherCode={weatherCode} />
      </div>

      {/* Left column is reserved for the date label sitting over the
          numeral — everything else (greeting, up next, capture) lives in
          the right column, indented past the numeral. */}
      <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-[340px_1fr]">
        <div className="relative pt-1">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-[230px] -left-[30px] -z-10 hidden h-full w-[320px] overflow-hidden font-display text-[29rem] leading-[0.76] font-black tracking-tighter break-all text-date-gold select-none sm:block"
          >
            {dayNumPadded}
          </span>

          <p className="relative font-sans text-xs font-medium tracking-[0.2em] text-muted">{dayName}</p>
          <p className="relative font-display mt-1 text-2xl font-bold text-accent">
            {monthShort} {dayNum}
          </p>
          <p className="relative font-sans text-sm text-muted">{year}</p>
        </div>

        <div className="relative min-w-0">
          <h1 className="font-display text-[43px] leading-tight tracking-tight whitespace-nowrap text-ink sm:text-[54px]">
            {timeGreeting}, {firstName}.
          </h1>
          <p className="font-hand mt-2 text-xl text-muted">{tagline}</p>

          {/* Horizontal schedule band: UP NEXT | event | event | Full
              calendar, thin vertical dividers, no timeline dots. */}
          <div className="mt-10 flex min-h-[80px] items-stretch divide-x divide-border border-t border-border pt-8 font-sans">
            <div className="flex items-center pr-8">
              <span className="text-xs font-medium tracking-widest text-muted uppercase">Up next</span>
            </div>

            {upcoming.length === 0 ? (
              <div className="flex items-center px-8">
                <p className="text-sm text-muted italic">{gapMessage ?? "Nothing on the calendar."}</p>
              </div>
            ) : (
              upcoming.map((event) => (
                <div key={event.id} className="flex min-w-0 flex-col justify-center px-8">
                  <span className="text-xs font-semibold text-accent">
                    {event.allDay ? "All day" : formatTime(event.start)}
                  </span>
                  <span className="font-display mt-1 truncate text-base text-ink">{event.title}</span>
                </div>
              ))
            )}

            <div className="ml-auto flex items-center pl-8">
              <Link href="/calendar" className="text-xs whitespace-nowrap text-accent hover:text-ink">
                Full calendar →
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <form action={captureAction} className="relative">
              <input
                name="content"
                type="text"
                placeholder="What's on your mind?"
                required
                autoComplete="off"
                className="font-sans placeholder:font-hand w-full border-b border-border bg-transparent py-2 pr-8 text-lg text-ink placeholder:text-lg placeholder:text-muted focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Save"
                className="absolute right-0 bottom-2 text-muted hover:text-ink"
              >
                ↵
              </button>
              <p aria-live="polite" className="mt-1 h-4 font-sans text-xs text-muted">
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
