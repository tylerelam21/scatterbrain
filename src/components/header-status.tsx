"use client";

import { useEffect, useState } from "react";

// Ticks locally so it reflects the viewer's real clock rather than the
// server's (Vercel runs UTC) — same reasoning as the Calendar/Home time
// rendering. Renders nothing until mounted to avoid an SSR/client mismatch.
export function HeaderStatus({ city, tempF }: { city: string; tempF: number | null }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date());
    const interval = setInterval(tick, 30_000);
    const initial = setTimeout(tick, 0);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

  if (!time) return null;

  const timeLabel = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
    time,
  );

  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
      <span>{city}</span>
      {tempF !== null && (
        <>
          <span aria-hidden>·</span>
          <span>{tempF}°</span>
        </>
      )}
      <span aria-hidden>·</span>
      <span>{timeLabel}</span>
    </span>
  );
}
