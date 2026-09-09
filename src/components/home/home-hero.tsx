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

// A fixed signature line rather than one entry in the rotation — it carries
// too much personal weight to be sized/treated the same as "Onward,
// unhurried." and shown one day in six.
const SIGNATURE_LINE = "That there's some good in the world, and it's worth fighting for.";

// A giant day-of-month behind the date label — the editorial "big numeral"
// treatment the owner asked for, in the same gold as the Quick Capture
// sticky note (--date-gold, globals.css) paired against the green
// --accent date label, rather than one flat hue for both.
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
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-14 -left-6 -z-10 hidden font-display text-[13rem] leading-none font-bold tracking-tighter text-date-gold/60 select-none sm:block sm:text-[18rem]"
      >
        {dayNumPadded}
      </span>

      <div className="relative flex flex-wrap items-end gap-x-10 gap-y-6 pt-4 sm:pt-10">
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

      <p className="font-hand relative mt-6 max-w-xl text-xl leading-snug text-accent/80">
        {SIGNATURE_LINE}
      </p>
    </div>
  );
}
