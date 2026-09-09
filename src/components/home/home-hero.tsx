"use client";

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

// A giant day-of-month behind the date label — the editorial "big numeral"
// treatment the owner asked for, in the same gold as the Quick Capture
// sticky note (--date-gold, globals.css) paired against the green
// --accent date label, rather than one flat hue for both. The numeral
// sits inside its own bounded, overflow-hidden box (sized for its two
// stacked digits at this font size) rather than the whole hero — an
// unbounded absolute element has no natural height, so without a box to
// clip against it bled straight through the sections below it.
export function HomeHero({ firstName }: { firstName: string }) {
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

  return (
    <div className="relative flex flex-wrap items-end gap-x-10 gap-y-6 pt-4 sm:pt-10">
      <div className="relative hidden h-[260px] w-[180px] shrink-0 overflow-hidden sm:block">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 -left-4 font-display text-[10rem] leading-[0.85] font-bold tracking-tighter text-date-gold/60 select-none"
        >
          {dayNumPadded}
        </span>
        <div className="relative pt-6">
          <p className="text-xs font-medium tracking-[0.2em] text-muted">{dayName}</p>
          <p className="font-display mt-1 text-2xl font-bold text-accent">
            {monthShort} {dayNum}
          </p>
          <p className="text-sm text-muted">{year}</p>
        </div>
      </div>

      <div className="shrink-0 sm:hidden">
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
  );
}
