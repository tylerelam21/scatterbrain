import Link from "next/link";
import type { RecentActivity } from "@/lib/home/activity";

// A single honest pointer at whatever you've actually been doing lately —
// derived from real activity (site edits, GitHub pushes, new photos in an
// album), never picked by hand. Renders nothing if nothing's been active
// recently enough (see MIN_ACTIVITY_DAYS in lib/home/activity) rather
// than show something stale.
export function Lately({ activity }: { activity: RecentActivity | null }) {
  if (!activity) return null;

  const verb = activity.kind === "album" ? "adding to" : "working on";

  return (
    <p className="font-hand mt-4 text-lg text-muted">
      Lately, {verb}{" "}
      <Link
        href={activity.href}
        className="text-ink underline decoration-1 underline-offset-4 hover:text-accent"
      >
        {activity.title}
      </Link>
      .
    </p>
  );
}
