import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { photoCollectionItems, photoCollections, photos, projects } from "@/lib/db/schema";

// Below this, the site says nothing rather than point at something you
// abandoned months ago.
const MIN_ACTIVITY_DAYS = 14;

export interface RecentActivity {
  kind: "project" | "album";
  title: string;
  href: string;
  lastActiveAt: Date;
}

// The public homepage's "Lately" signal — whichever PUBLIC project or
// photo album you've most recently actually been active on, picked from
// real timestamps already tracked elsewhere rather than anything new to
// maintain. A project's activity is the later of its own updatedAt (site
// edits — including inline editing) and githubLastPushedAt (real coding,
// cached by the sync-github cron). An album's activity can't come from
// photoCollections.updatedAt — adding a photo only touches the join
// table, never the collection row — so it's the most recent createdAt
// among the photos actually inside it.
export async function getRecentActivity(): Promise<RecentActivity | null> {
  const threshold = new Date(Date.now() - MIN_ACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const [publicProjects, albumActivity] = await Promise.all([
    db
      .select({
        title: projects.title,
        slug: projects.slug,
        updatedAt: projects.updatedAt,
        githubLastPushedAt: projects.githubLastPushedAt,
      })
      .from(projects)
      .where(eq(projects.visibility, "PUBLIC")),
    db
      .select({
        title: photoCollections.title,
        slug: photoCollections.slug,
        lastActiveAt: sql<Date>`max(${photos.createdAt})`,
      })
      .from(photoCollections)
      .innerJoin(photoCollectionItems, eq(photoCollectionItems.collectionId, photoCollections.id))
      .innerJoin(photos, eq(photos.id, photoCollectionItems.photoId))
      .where(and(eq(photoCollections.visibility, "PUBLIC"), eq(photos.visibility, "PUBLIC")))
      .groupBy(photoCollections.id, photoCollections.title, photoCollections.slug),
  ]);

  const candidates: RecentActivity[] = [
    ...publicProjects.map((p) => ({
      kind: "project" as const,
      title: p.title,
      href: `/work/${p.slug}`,
      lastActiveAt:
        p.githubLastPushedAt && p.githubLastPushedAt > p.updatedAt ? p.githubLastPushedAt : p.updatedAt,
    })),
    ...albumActivity.map((a) => ({
      kind: "album" as const,
      title: a.title,
      href: `/photos/${a.slug}`,
      lastActiveAt: new Date(a.lastActiveAt),
    })),
  ];

  const best = candidates
    .filter((item) => item.lastActiveAt >= threshold)
    .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())[0];

  return best ?? null;
}
