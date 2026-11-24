import Link from "next/link";
import { InlineEditable } from "./inline-editable";
import { setSiteContentField } from "@/server/actions/site";
import { HomeHeroPhotoUploader } from "./home-hero-photo-uploader";

export const HERO_INTRO_DEFAULT =
  "I'm Tyler — an Atlanta-based builder, curious generalist, and aspiring entrepreneur interested in the intersection of business, technology, and community.";

interface PublicIdentityProps {
  intro: string;
  heroPhotoId: string | null;
  editable: boolean;
}

// The new public identity's hero — one typographic voice (Newsreader),
// a three-line statement headline with the last line in the accent
// olive italic, a short intro, and a real photo anchoring the page
// rather than an illustration or decorative widget.
export function PublicIdentity({ intro, heroPhotoId, editable }: PublicIdentityProps) {
  return (
    <div>
      <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">Atlanta, Georgia</p>

      <h1 className="font-display mt-4 text-5xl leading-[1.08] tracking-tight text-ink sm:text-6xl">
        Building things.
        <br />
        Exploring ideas.
        <br />
        <em className="text-accent">Investing in people.</em>
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-7 text-muted">
        <InlineEditable
          value={intro}
          editable={editable}
          onSave={setSiteContentField.bind(null, "home.heroIntro")}
          as="textarea"
          rows={3}
          placeholder="A short intro paragraph"
          className="block"
        />
      </p>

      <div className="mt-6 flex items-center gap-8 text-sm">
        <Link href="/work" className="text-ink underline decoration-1 underline-offset-4 hover:text-accent">
          Explore my work →
        </Link>
        <Link href="/about" className="text-muted underline decoration-1 underline-offset-4 hover:text-ink">
          More about me →
        </Link>
      </div>

      {heroPhotoId ? (
        // eslint-disable-next-line @next/next/no-img-element -- authorized, dynamically-owned photo served through /api/photos/[id]
        <img
          src={`/api/photos/${heroPhotoId}`}
          alt=""
          className="mt-10 block aspect-[16/9] w-full rounded-lg object-cover"
          style={{ boxShadow: "var(--note-shadow)" }}
        />
      ) : (
        editable && (
          <div className="mt-10 flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted">
            No hero photo yet
          </div>
        )
      )}
      {editable && <HomeHeroPhotoUploader currentPhotoId={heroPhotoId} />}
    </div>
  );
}
