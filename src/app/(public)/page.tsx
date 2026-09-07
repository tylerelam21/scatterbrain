import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireOwner } from "@/lib/auth/require-owner";
import { addDays, nowDate, startOfDay } from "@/lib/calendar/dates";
import { listEventsInRange } from "@/lib/db/queries/calendar";
import { getResurfacedThoughtCandidate, markBrainItemResurfaced } from "@/lib/db/queries/brain";
import { getTopTags } from "@/lib/db/queries/tags";
import { getCurrentWeather } from "@/lib/home/weather";
import { HOME_CITY } from "@/lib/home/location";
import { getPuzzleForCurrentHour } from "@/lib/db/queries/chess";
import { QuickCapture } from "@/components/brain/quick-capture";
import { HomeHero } from "@/components/home/home-hero";
import { TodaySchedule } from "@/components/home/today-schedule";
import { WeatherMoment } from "@/components/home/weather-moment";
import { BestMove } from "@/components/chess/best-move";
import { BrainMap } from "@/components/home/brain-map";
import { PublicIdentity } from "@/components/home/public-identity";

// PRD §1, §10 — same URL, two identities: an authenticated owner gets the
// private Home dashboard; anyone else gets the public landing.
export default async function Home() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  if (isOwner) {
    const owner = await requireOwner();
    const today = nowDate();

    const [events, resurfaced, topTags, weather, hourlyPuzzle] = await Promise.all([
      listEventsInRange(owner.id, addDays(startOfDay(today), -1), addDays(today, 8)),
      getResurfacedThoughtCandidate(owner.id),
      getTopTags(owner.id, 8),
      getCurrentWeather(),
      getPuzzleForCurrentHour(),
    ]);

    if (resurfaced) {
      await markBrainItemResurfaced(resurfaced.id);
    }
    const daysAgo = resurfaced
      ? Math.floor((today.getTime() - resurfaced.createdAt.getTime()) / 86_400_000)
      : null;

    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-20">
        <div className="flex items-baseline justify-between gap-8">
          <HomeHero />
          <WeatherMoment city={HOME_CITY} tempF={weather.tempF} weatherCode={weather.weatherCode} />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-[360px_1fr]">
          <div className="min-w-0">
            <QuickCapture />

            {resurfaced && daysAgo !== null && (
              <Link href={`/brain/${resurfaced.id}`} className="mt-10 block">
                <p className="text-xs text-muted">From {daysAgo} days ago</p>
                <p className="mt-1 truncate text-ink">{resurfaced.title || resurfaced.content}</p>
              </Link>
            )}

            {topTags.length > 0 && (
              <section className="mt-16">
                <h2 className="text-xs font-medium tracking-widest text-muted uppercase">On my mind</h2>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-lg">
                  {topTags.map((tag, index) => (
                    <Link
                      key={tag.name}
                      href="/studio?space=fun"
                      className={
                        index === 0
                          ? "text-accent underline decoration-1 underline-offset-4"
                          : "text-ink/70 hover:text-ink"
                      }
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="min-w-0">
            <TodaySchedule events={events} />
          </div>
        </div>

        {hourlyPuzzle && (
          <BestMove
            key={hourlyPuzzle.puzzleKey}
            puzzleKey={hourlyPuzzle.puzzleKey}
            fen={hourlyPuzzle.puzzle.fen}
            sideToMove={hourlyPuzzle.puzzle.sideToMove}
            nextAt={hourlyPuzzle.nextAt.toISOString()}
          />
        )}

        <section className="mt-16">
          <BrainMap />
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24">
      <PublicIdentity />
    </main>
  );
}
