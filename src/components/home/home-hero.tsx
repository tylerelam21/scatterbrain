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

export function HomeHero() {
  const now = new Date();
  const dayName = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(now);
  const monthDay = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(now);
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";

  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const tagline = TAGLINES[dayOfYear % TAGLINES.length];

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-muted uppercase">{dayName}</p>
      <h1 className="font-display text-7xl leading-none tracking-tight text-ink sm:text-8xl">
        {monthDay}
      </h1>
      <p className="mt-4 text-lg text-muted">
        {timeGreeting} <span className="font-hand text-lg text-muted/80">{tagline}</span>
      </p>
      <p className="font-hand mt-2 max-w-xl text-2xl leading-snug text-accent sm:text-3xl">
        {SIGNATURE_LINE}
      </p>
    </div>
  );
}
