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
      <span className="text-xs text-muted">{number}</span>
      <h3 className="font-display mt-1 text-3xl tracking-tight text-ink">{heading}</h3>
      {tagline && <p className="mt-2 text-lg text-muted">{tagline}</p>}
      {body && <p className="mt-4 text-sm leading-relaxed text-muted">{body}</p>}
      <Link
        href={href}
        className="mt-4 inline-block text-sm text-ink underline decoration-1 underline-offset-4 hover:text-accent"
      >
        {linkLabel} →
      </Link>
    </div>
  );

  return (
    <div className="relative grid grid-cols-1 items-center gap-8 py-14 md:grid-cols-2">
      {annotation && (
        <p className="font-hand absolute -top-6 right-0 hidden max-w-[10rem] -rotate-2 text-right text-base text-accent/80 md:block">
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
        <div className="border-b border-border pb-2">
          <span className="text-xs tracking-widest text-muted uppercase">Featured work</span>
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
                    className="block h-auto w-full rounded-sm select-none"
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
                    className="block h-full min-h-[280px] w-full rounded-sm object-cover"
                    style={{ boxShadow: "var(--note-shadow)" }}
                  />
                ) : (
                  <div className="h-full min-h-[280px] rounded-sm border border-border" />
                )
              }
            />
          );
        })}
      </div>
    </section>
  );
}
