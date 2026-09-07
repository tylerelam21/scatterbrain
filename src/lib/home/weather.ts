import { HOME_LAT, HOME_LON } from "./location";

export interface CurrentWeather {
  tempF: number | null;
  weatherCode: number | null;
}

// Open-Meteo: free, keyless. Decorative header/home detail, not the
// "weather integration" PRD §6 defers to V2 (that's about informing
// Wander/Discover recommendations, a different and much larger feature).
// Cached generously since it's just flavor, not something that needs to
// be fresh-to-the-minute.
export async function getCurrentWeather(): Promise<CurrentWeather> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${HOME_LAT}&longitude=${HOME_LON}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return { tempF: null, weatherCode: null };
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    return {
      tempF: typeof temp === "number" ? Math.round(temp) : null,
      weatherCode: typeof code === "number" ? code : null,
    };
  } catch {
    return { tempF: null, weatherCode: null };
  }
}
