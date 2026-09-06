"use client";

import { useEffect, useState } from "react";
import { weatherEmoji } from "@/lib/home/weather";

// The one "fun visual" flourish on Home — a big condition emoji rather
// than another line of small gray text. Ticks its own clock client-side
// for the same reason as everywhere else: the viewer's real local time,
// not the server's.
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
    <div className="shrink-0 text-right">
      <p className="text-4xl leading-none">{weatherEmoji(weatherCode)}</p>
      <p className="mt-2 text-sm text-muted">
        {city}
        {tempF !== null && ` · ${tempF}°`}
      </p>
      <p className="text-sm text-muted">{timeLabel}</p>
    </div>
  );
}
