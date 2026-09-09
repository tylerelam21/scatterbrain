import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireOwner } from "@/lib/auth/require-owner";
import { addDays, nowDate, startOfDay } from "@/lib/calendar/dates";
import { listEventsInRange } from "@/lib/db/queries/calendar";
import { getResurfacedThoughtCandidate, markBrainItemResurfaced } from "@/lib/db/queries/brain";
import { getTopTags } from "@/lib/db/queries/tags";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getAppSettings } from "@/lib/db/queries/settings";
import { listProjects } from "@/lib/db/queries/work";
import { getRecentActivity } from "@/lib/home/activity";
import { getCurrentWeather } from "@/lib/home/weather";
import { HOME_CITY } from "@/lib/home/location";
import { getPuzzleForCurrentHour } from "@/lib/db/queries/chess";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { QuickCapture } from "@/components/brain/quick-capture";
import { HomeHero } from "@/components/home/home-hero";
import { TodaySchedule } from "@/components/home/today-schedule";
import { WeatherMoment } from "@/components/home/weather-moment";
import { BestMove } from "@/components/chess/best-move";
import { BrainMap } from "@/components/home/brain-map";
import { PublicIdentity } from "@/components/home/public-identity";
import { StickyNote, HeroAccent, ScrollCue } from "@/components/home/hero-ornaments";
import { Lately } from "@/components/home/lately";
import { FeaturedWork } from "@/components/home/featured-work";
import { SiteFooter } from "@/components/home/site-footer";

interface HomeProps {
  searchParams: Promise<{ view?: string }>;
}

// PRD §1, §10 — same URL, two identities: an authenticated owner gets the
// private Home dashboard; anyone else gets the public landing. ?view=public
// lets the owner see (and jump off to edit) the exact page visitors see,
// without signing out — see nav.tsx's "Public site" link.
export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const params = await searchParams;
  const forcePublicView = params.view === "public";

  if (isOwner && !forcePublicView) {
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

  const owner = await getOwnerUser();
  const [content, featuredProjects, recentActivity] = await Promise.all([
    owner
      ? getAppSettings(owner.id, [...SITE_CONTENT_KEYS])
      : Promise.resolve({} as Record<string, string>),
    listProjects({ isLab: false, publicOnly: true }),
    getRecentActivity(),
  ]);
  const stickyNote = content["home.stickyNote"] ?? "";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-24">
      {isOwner && (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-full border border-border px-4 py-2 text-xs text-muted">
          <span>This is what visitors see.</span>
          <span className="flex gap-4">
            <Link href="/settings" className="hover:text-ink">
              Edit homepage text
            </Link>
            <Link href="/" className="hover:text-ink">
              Back to dashboard
            </Link>
          </span>
        </div>
      )}

      <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-start sm:justify-between">
        <PublicIdentity />
        {(stickyNote || isOwner) && (
          <div className="flex items-start gap-6">
            <StickyNote text={stickyNote} editable={isOwner} />
            <HeroAccent />
          </div>
        )}
      </div>

      <Lately activity={recentActivity} />
      <ScrollCue />

      <FeaturedWork
        projects={featuredProjects.filter((p) => p.featured)}
        aboutAnnotation={content["home.aboutAnnotation"] ?? ""}
        aboutTagline={content["home.aboutTagline"] ?? ""}
        aboutBody={content["home.aboutBody"] ?? ""}
        editable={isOwner}
      />

      <SiteFooter
        bio={content["home.footerBio"] ?? ""}
        email={content["home.email"] ?? ""}
        linkedin={content["home.linkedin"] ?? ""}
        github={content["home.github"] ?? ""}
        editable={isOwner}
      />
    </main>
  );
}
