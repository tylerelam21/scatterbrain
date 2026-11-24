import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getAppSettings } from "@/lib/db/queries/settings";
import { listProjects } from "@/lib/db/queries/work";
import { listPublicJournalEntries } from "@/lib/db/queries/journal";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { PublicIdentity, HERO_INTRO_DEFAULT } from "@/components/home/public-identity";
import { SelectedProjects } from "@/components/home/selected-projects";
import { RecentNotes } from "@/components/home/recent-notes";
import { SiteFooter } from "@/components/home/site-footer";

// One site, one view: the owner sees exactly what visitors see, just with
// inline editing unlocked (see PublicIdentity/SelectedProjects/SiteFooter's
// `editable` prop) — no separate private dashboard to maintain.
export default async function Home() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  const owner = await getOwnerUser();
  const [content, featuredProjects, recentNotes] = await Promise.all([
    owner
      ? getAppSettings(owner.id, [...SITE_CONTENT_KEYS])
      : Promise.resolve({} as Record<string, string>),
    listProjects({ isLab: false, publicOnly: true }),
    owner ? listPublicJournalEntries(owner.id, 5) : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-24">
      {isOwner && (
        <Link
          href="/settings"
          className="mb-10 self-start rounded-full border border-border px-4 py-2 text-xs text-muted hover:text-ink"
        >
          Edit homepage text
        </Link>
      )}

      <PublicIdentity
        intro={content["home.heroIntro"] || HERO_INTRO_DEFAULT}
        heroPhotoId={content["home.heroPhotoId"] || null}
        editable={isOwner}
      />

      <SelectedProjects projects={featuredProjects.filter((p) => p.featured)} editable={isOwner} />

      <RecentNotes notes={recentNotes} />

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
