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

// The private dashboard's whole top section: date block stacked above
// the greeting (not beside it), a dot-and-line "Up next" list, and a
// plain one-line capture input. The earlier giant background-numeral
// treatment is dropped for now — it proved fragile across different
// dates (some digit pairs, e.g. "11" or "13" at that extreme font
// weight/size, rendered as illegible shapes rather than two readable
// digits), so this went back to a simpler single-column layout with
// the same typographic personality (small tracked weekday, bold
// colored month/day, muted year) rather than chasing a per-date-fragile
// effect further.
export function HomeHeroSection({ firstName, events, city, tempF, weatherCode }: HomeHeroSectionProps) {
  const now = new Date();
  const dayName = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(now).toUpperCase();
  const monthShort = new Intl.DateTimeFormat(undefined, { month: "short" }).format(now).toUpperCase();
  const dayNum = now.getDate();
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

      <div className="relative">
        <p className="font-sans text-xs font-medium tracking-[0.2em] text-muted">{dayName}</p>
        <p className="font-display mt-1 text-2xl font-bold text-accent">
          {monthShort} {dayNum}
        </p>
        <p className="font-sans text-sm text-muted">{year}</p>

        <h1 className="font-display mt-6 text-[43px] leading-tight tracking-tight text-ink sm:text-[54px]">
          {timeGreeting}, {firstName}.
        </h1>
        <p className="font-hand mt-2 text-xl text-muted">{tagline}</p>

        {/* Dot-and-line "Up next" timeline. */}
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Up next</h2>

          {upcoming.length === 0 ? (
            <p className="mt-5 text-sm text-muted italic">{gapMessage ?? "Nothing on the calendar."}</p>
          ) : (
            <ul className="mt-6 space-y-5">
              {upcoming.map((event, index) => {
                const isLast = index === upcoming.length - 1;
                return (
                  <li key={event.id} className="relative flex items-baseline gap-4 pl-8">
                    {!isLast && (
                      <span
                        aria-hidden
                        className="absolute top-3 left-[3px] w-0.5 bg-muted/25"
                        style={{ height: "calc(100% + 1.25rem)" }}
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute top-1.5 left-0 h-2 w-2 rounded-full border-2 border-paper"
                      style={{ backgroundColor: eventColor(event) }}
                    />
                    <span className="font-hand w-20 shrink-0 text-sm text-accent">
                      {event.allDay ? "all day" : formatTime(event.start)}
                    </span>
                    <span className="text-ink">{event.title}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-5 flex items-baseline justify-between">
            {gapMessage && upcoming.length > 0 ? (
              <p className="text-sm text-muted italic">{gapMessage}</p>
            ) : (
              <span />
            )}
            <Link href="/calendar" className="text-xs text-muted hover:text-ink">
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
