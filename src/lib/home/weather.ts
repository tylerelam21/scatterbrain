import { HOME_LAT, HOME_LON } from "./location";

// Open-Meteo: free, keyless. Decorative header detail, not the "weather
// integration" PRD §6 defers to V2 (that's about informing Wander/Discover
// recommendations, a different and much larger feature). Cached generously
// since it's just flavor, not something that needs to be fresh-to-the-minute.
export async function getCurrentTempF(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${HOME_LAT}&longitude=${HOME_LON}&current=temperature_2m&temperature_unit=fahrenheit`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    return typeof temp === "number" ? Math.round(temp) : null;
  } catch {
    return null;
  }
}
