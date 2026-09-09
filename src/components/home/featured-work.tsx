import Link from "next/link";

interface FeaturedProject {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  summary: string | null;
  heroImageId: string | null;
}

interface SpreadProps {
  number: string;
  heading: string;
  tagline?: string | null;
  body?: string | null;
  href: string;
  linkLabel: string;
  imageSide: "left" | "right";
  image: React.ReactNode;
  annotation?: string;
}

function Spread({ number, heading, tagline, body, href, linkLabel, imageSide, image, annotation }: SpreadProps) {
  const textBlock = (
    <div className="min-w-0">
      <span className="text-xs tracking-widest text-muted">{number}</span>
      <h3 className="font-display mt-2 text-4xl tracking-tight text-ink md:text-5xl">{heading}</h3>
      {tagline && <p className="mt-3 text-xl text-muted">{tagline}</p>}
      {body && <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">{body}</p>}
      <Link
        href={href}
        className="mt-6 inline-block text-sm text-ink underline decoration-1 underline-offset-4 hover:text-accent"
      >
        {linkLabel} →
      </Link>
    </div>
  );

  return (
    <div className="relative grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:gap-14 md:py-24">
      {annotation && (
        <p className="font-hand absolute -top-8 right-0 hidden max-w-[11rem] -rotate-2 text-right text-lg text-accent/80 md:block">
          {annotation}
        </p>
      )}
      {imageSide === "right" ? (
        <>
          {textBlock}
          <div className="min-w-0">{image}</div>
        </>
      ) : (
        <>
          <div className="min-w-0">{image}</div>
          {textBlock}
        </>
      )}
    </div>
  );
}

type SpreadItem = { kind: "about" } | { kind: "project"; project: FeaturedProject };

// The outward homepage's "Selected Work" — real featured projects and the
// About page (via the same map illustration used there) interleaved as
// one numbered, alternating-image list rather than a card grid or a
// separate icon row. About always renders (real content, no missing
// asset); projects with no cover image yet get a plain blank placeholder
// rather than a stock photo standing in for real work.
export function FeaturedWork({
  projects,
  aboutAnnotation,
}: {
  projects: FeaturedProject[];
  aboutAnnotation: string;
}) {
  const items: SpreadItem[] = projects.map((project) => ({ kind: "project", project }));
  items.splice(Math.min(1, items.length), 0, { kind: "about" });

  return (
    <section className="mt-24">
      {projects.length > 0 && (
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <span className="text-xs tracking-widest text-muted uppercase">Featured work</span>
          <span className="text-xs text-muted">{String(items.length).padStart(2, "0")} total</span>
        </div>
      )}

      <div className="divide-y divide-border">
        {items.map((item, index) => {
          const number = String(index + 1).padStart(2, "0");
          const imageSide = index % 2 === 0 ? "right" : "left";

          if (item.kind === "about") {
            return (
              <Spread
                key="about"
                number={number}
                heading="About"
                tagline="The long way here."
                body="Alpharetta → Athens → Atlanta. A story about where I came from, what I care about, and why I make things."
                href="/about"
                linkLabel="Read the story"
                imageSide={imageSide}
                annotation={aboutAnnotation || undefined}
                image={
                  // eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization
                  <img
                    src="/about/map.webp"
                    alt="A hand-drawn map tracing the route from Alpharetta through Athens to Atlanta"
                    className="block h-auto w-full rounded-lg select-none"
                    style={{ boxShadow: "var(--note-shadow)" }}
                    draggable={false}
                  />
                }
              />
            );
          }

          const { project } = item;
          return (
            <Spread
              key={project.id}
              number={number}
              heading={project.title}
              tagline={project.tagline}
              body={project.summary}
              href={`/work/${project.slug}`}
              linkLabel="View project"
              imageSide={imageSide}
              image={
                project.heroImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element -- authorized, dynamically-owned photo served through /api/photos/[id]
                  <img
                    src={`/api/photos/${project.heroImageId}`}
                    alt=""
                    className="block h-full min-h-[360px] w-full rounded-lg object-cover md:min-h-[420px]"
                    style={{ boxShadow: "var(--note-shadow)" }}
                  />
                ) : (
                  <div className="h-full min-h-[360px] rounded-lg border border-border md:min-h-[420px]" />
                )
              }
            />
          );
        })}
      </div>
    </section>
  );
}
