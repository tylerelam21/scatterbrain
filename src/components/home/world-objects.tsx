import Link from "next/link";

interface WorldObjectProps {
  href?: string;
  src: string;
  alt: string;
  label?: string;
  widthClass: string;
  rotate: number;
  offsetClass?: string;
  blend?: boolean;
}

// The "World" section of the outward-facing homepage — see
// docs/OUTWARD-FACING-PORTFOLIO.md §3. Each object is a self-contained
// illustrated vignette (own baked-in backdrop, same format as pegboard.webp)
// rather than a card — navigation discovered by exploring the scene, not
// six rectangles. Objects without an href (the door, for now) are
// decorative until their destination page has real content.
//
// The map and pegboard already paint edge-to-edge (parchment/wood), so they
// sit fine on any page background. The notebook and door were illustrated
// on a near-white ground, which reads as a stray box in dark mode — `blend`
// puts mix-blend-mode: multiply on just the img (shadow stays on the
// wrapper, unblended) so that near-white ground disappears into whatever
// page background is actually behind it, light or dark.
function WorldObject({ href, src, alt, label, widthClass, rotate, offsetClass, blend }: WorldObjectProps) {
  const card = (
    <div
      className={`group relative ${widthClass} ${offsetClass ?? ""}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        boxShadow: "var(--note-shadow)",
        // `transform` here creates a new stacking context, which isolates
        // any mix-blend-mode img inside it from the real page background —
        // it would blend against nothing rather than the page. Painting
        // this wrapper's own background to match the page gives the blend
        // a real color to composite against instead.
        ...(blend ? { backgroundColor: "var(--paper)" } : null),
      }}
    >
      {/* The hover-lift transform lives on this wrapper, not the img itself
          — a transitioning transform promotes the img to its own compositing
          layer in Chromium, which silently breaks mix-blend-mode (it ends up
          blending against its own layer instead of the page behind it). */}
      <div className="transition-transform duration-300 ease-out group-hover:-translate-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
        <img
          src={src}
          alt={alt}
          className="block h-auto w-full rounded-sm select-none"
          style={blend ? { mixBlendMode: "multiply" } : undefined}
          draggable={false}
        />
      </div>
      {label && (
        <span className="font-hand pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rotate-0 text-sm whitespace-nowrap text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block" aria-label={alt}>
      {card}
    </Link>
  );
}

export function WorldObjects() {
  return (
    <div className="relative mx-auto flex max-w-3xl flex-wrap items-start justify-center gap-x-10 gap-y-16 px-4 py-10">
      <WorldObject
        href="/about"
        src="/about/map.webp"
        alt="A hand-drawn map tracing the route from Alpharetta through Athens to Atlanta"
        label="the long way here →"
        widthClass="w-64 sm:w-80"
        rotate={-2}
      />
      <WorldObject
        href="/lab"
        src="/lab/notebook.webp"
        alt="An illustrated, well-worn notebook"
        label="from the workshop →"
        widthClass="w-36 sm:w-44"
        rotate={3}
        offsetClass="mt-6 sm:mt-10"
        blend
      />
      <WorldObject
        href="/work"
        src="/work/pegboard.webp"
        alt="An illustrated pegboard of painting and hand tools"
        label="work →"
        widthClass="w-64 sm:w-80"
        rotate={1.5}
      />
      <WorldObject
        src="/contact/door.webp"
        alt="A small green round door"
        widthClass="w-24 sm:w-28"
        rotate={-3}
        offsetClass="mt-4"
        blend
      />
    </div>
  );
}
