import Link from "next/link";
import { InlineEditable } from "./inline-editable";
import { setSiteContentField } from "@/server/actions/site";
import { updateProjectField } from "@/server/actions/work";

interface FeaturedProject {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  summary: string | null;
  heroImageId: string | null;
}

const ABOUT_TAGLINE_DEFAULT = "The long way here.";
const ABOUT_BODY_DEFAULT =
  "Alpharetta → Athens → Atlanta. A story about where I came from, what I care about, and why I make things.";

interface SpreadProps {
  number: string;
  heading: string;
  onSaveHeading?: (value: string) => Promise<void>;
  tagline?: string;
  onSaveTagline?: (value: string) => Promise<void>;
  body?: string;
  onSaveBody?: (value: string) => Promise<void>;
  href: string;
  linkLabel: string;
  imageSide: "left" | "right";
  image: React.ReactNode;
  annotation?: string;
  onSaveAnnotation?: (value: string) => Promise<void>;
  editable: boolean;
}

function Spread({
  number,
  heading,
  onSaveHeading,
  tagline,
  onSaveTagline,
  body,
  onSaveBody,
  href,
  linkLabel,
  imageSide,
  image,
  annotation,
  onSaveAnnotation,
  editable,
}: SpreadProps) {
  const textBlock = (
    <div className="min-w-0">
      <span className="text-xs tracking-widest text-muted">{number}</span>
      <h3 className="font-display mt-2 text-4xl tracking-tight text-ink md:text-5xl">
        {onSaveHeading ? (
          <InlineEditable value={heading} editable={editable} onSave={onSaveHeading} placeholder="Untitled" />
        ) : (
          heading
        )}
      </h3>
      {(tagline || (editable && onSaveTagline)) &&
        (onSaveTagline ? (
          <InlineEditable
            value={tagline ?? ""}
            editable={editable}
            onSave={onSaveTagline}
            placeholder="A short tagline"
            className="mt-3 text-xl text-muted"
          />
        ) : (
          tagline && <p className="mt-3 text-xl text-muted">{tagline}</p>
        ))}
      {(body || (editable && onSaveBody)) &&
        (onSaveBody ? (
          <InlineEditable
            value={body ?? ""}
            editable={editable}
            onSave={onSaveBody}
            as="textarea"
            rows={3}
            placeholder="A short description"
            className="mt-5 max-w-md text-sm leading-relaxed text-muted"
          />
        ) : (
          body && <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">{body}</p>
        ))}
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
      {(annotation || (editable && onSaveAnnotation)) &&
        (onSaveAnnotation ? (
          <div className="font-hand absolute -top-8 right-0 hidden max-w-[11rem] -rotate-2 text-right text-lg text-accent/80 md:block">
            <InlineEditable
              value={annotation ?? ""}
              editable={editable}
              onSave={onSaveAnnotation}
              placeholder="A handwritten note"
              className="font-hand text-lg text-accent/80"
            />
          </div>
        ) : (
          annotation && (
            <p className="font-hand absolute -top-8 right-0 hidden max-w-[11rem] -rotate-2 text-right text-lg text-accent/80 md:block">
              {annotation}
            </p>
          )
        ))}
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
// rather than a stock photo standing in for real work. When `editable`
// (owner viewing ?view=public), every heading/tagline/body/annotation is
// click-to-edit inline via InlineEditable, saving straight through
// setSiteContentField (About) or updateProjectField (each project).
export function FeaturedWork({
  projects,
  aboutAnnotation,
  aboutTagline,
  aboutBody,
  editable,
}: {
  projects: FeaturedProject[];
  aboutAnnotation: string;
  aboutTagline: string;
  aboutBody: string;
  editable: boolean;
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
                tagline={aboutTagline || ABOUT_TAGLINE_DEFAULT}
                onSaveTagline={(value) => setSiteContentField("home.aboutTagline", value)}
                body={aboutBody || ABOUT_BODY_DEFAULT}
                onSaveBody={(value) => setSiteContentField("home.aboutBody", value)}
                href="/about"
                linkLabel="Read the story"
                imageSide={imageSide}
                annotation={aboutAnnotation}
                onSaveAnnotation={(value) => setSiteContentField("home.aboutAnnotation", value)}
                editable={editable}
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
              onSaveHeading={(value) => updateProjectField(project.id, project.slug, "title", value)}
              tagline={project.tagline ?? ""}
              onSaveTagline={(value) => updateProjectField(project.id, project.slug, "tagline", value)}
              body={project.summary ?? ""}
              onSaveBody={(value) => updateProjectField(project.id, project.slug, "summary", value)}
              href={`/work/${project.slug}`}
              linkLabel="View project"
              imageSide={imageSide}
              editable={editable}
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
