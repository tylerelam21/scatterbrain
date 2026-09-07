"use client";

import { useEffect, useState } from "react";
import { WeatherIcon } from "./weather-icons";

// A compact utility readout, not a competing content block — a small
// condition icon (see weather-icons.tsx, a custom set replacing emoji,
// which render inconsistently across platforms) plus one line of muted
// text, top-aligned with the day label rather than stacked as its own
// tall element. Ticks its own clock client-side for the same reason as
// everywhere else: the viewer's real local time, not the server's.
export function WeatherMoment({
  city,
  tempF,
  weatherCode,
}: {
  city: string;
  tempF: number | null;
  weatherCode: number | null;
}) {
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
    <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
      <WeatherIcon code={weatherCode} className="h-4 w-4" />
      <span>
        {tempF !== null && `${tempF}° · `}
        {city} · {timeLabel}
      </span>
    </div>
  );
}
