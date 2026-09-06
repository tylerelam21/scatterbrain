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
  "Whatever today is, it's yours.",
  "Still paying attention.",
  "Onward, unhurried.",
];

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
      <p className="mt-3 text-lg text-muted">
        {timeGreeting} <span className="font-hand text-xl text-accent">{tagline}</span>
      </p>
    </div>
  );
}
