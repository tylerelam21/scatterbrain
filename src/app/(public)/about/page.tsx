import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getAppSettings } from "@/lib/db/queries/settings";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { setSiteContentField } from "@/server/actions/site";
import { InlineEditable } from "@/components/home/inline-editable";

const ABOUT_TAGLINE_DEFAULT = "The long way here.";
const ABOUT_BODY_DEFAULT =
  "Alpharetta → Athens → Atlanta. A story about where I came from, what I care about, and why I make things.";

// The real content here — Tyler's actual story, more autobiographical
// than a LinkedIn summary — is his to write, not mine to draft. This is
// the structural shell with sensible defaults, fully owner-editable.
export default async function AboutPage() {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const owner = await getOwnerUser();
  const content = owner
    ? await getAppSettings(owner.id, [...SITE_CONTENT_KEYS])
    : ({} as Record<string, string>);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-4xl tracking-tight text-ink">
        <InlineEditable
          value={content["home.aboutTagline"] || ABOUT_TAGLINE_DEFAULT}
          editable={isOwner}
          onSave={setSiteContentField.bind(null, "home.aboutTagline")}
          placeholder={ABOUT_TAGLINE_DEFAULT}
          className="block"
        />
      </h1>

      <div className="mt-6 text-lg leading-8 text-muted">
        <InlineEditable
          value={content["home.aboutBody"] || ABOUT_BODY_DEFAULT}
          editable={isOwner}
          onSave={setSiteContentField.bind(null, "home.aboutBody")}
          as="textarea"
          rows={6}
          placeholder={ABOUT_BODY_DEFAULT}
          className="block whitespace-pre-wrap"
        />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
      <img
        src="/about/map.webp"
        alt="A hand-drawn map tracing the route from Alpharetta through Athens to Atlanta"
        className="mt-10 block h-auto w-full rounded-lg select-none"
        style={{ boxShadow: "var(--note-shadow)" }}
        draggable={false}
      />
    </main>
  );
}
