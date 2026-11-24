import { auth } from "@/lib/auth";
import { getOwnerUser } from "@/lib/db/queries/users";
import { getAppSettings } from "@/lib/db/queries/settings";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { setSiteContentField } from "@/server/actions/site";
import { InlineEditable } from "@/components/home/inline-editable";

const ABOUT_TAGLINE_DEFAULT = "The long way here.";
const ABOUT_BODY_DEFAULT = `I grew up in Alpharetta, studied Management Information Systems and International Business at UGA, and started my career in consulting at EY. Since then I've moved through sales, operations leadership, project management, and most recently independent software development — less a straight line than a series of jobs that kept teaching me the same thing: I like figuring out how things work, then making them work better.

I'm drawn to building — identifying a gap, a clumsy process, something nobody's bothered to fix — more than climbing toward a title. I've managed painting crews, built internal software for job costing, and started more side projects than I can count. The thread running through all of it is less "software engineer" or "operations guy" and more just: someone who likes making useful things.

I'm as interested in theology and political philosophy as I am in product design — Tim Keller and N.T. Wright sit on the same shelf as whatever I'm reading about cities or software. My faith shapes how I think about work, vocation, and what's actually worth building. I'm also fluent in Spanish and genuinely care about immigrant communities and cross-cultural life — not as a professional specialty, just as something that's shaped how I see the world.

This site is where all of that lives in one place — not a résumé, just an honest record of what I'm building, reading, and thinking about. If any of it resonates, say hello.`;

// Real content — drafted from Tyler's own brand brief, his to edit
// further (inline here or via Settings), not a placeholder.
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
          rows={14}
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
