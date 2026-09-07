import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { DoorMark } from "@/components/brand/door-mark";
import { NotebookIcon, PaintbrushIcon } from "./world-icons";

// The "World" section of the outward-facing homepage — see
// docs/OUTWARD-FACING-PORTFOLIO.md §3. Navigation discovered by exploring
// the scene, not picked from six rectangles.
//
// Two kinds of object here:
// - WorldImage: the map, a real illustrated raster vignette with a caption.
// - WorldIcon: bold currentColor glyphs (world-icons.tsx) standing in for
//   the pegboard/door/notebook — icons rather than literal illustrations,
//   deliberately uncaptioned so they don't spell out where they lead.

interface WorldImageProps {
  href?: string;
  src: string;
  alt: string;
  label?: string;
  widthClass: string;
  rotate: number;
}

function WorldImage({ href, src, alt, label, widthClass, rotate }: WorldImageProps) {
  const card = (
    <div
      className={`group relative ${widthClass}`}
      style={{ transform: `rotate(${rotate}deg)`, boxShadow: "var(--note-shadow)" }}
    >
      <div className="transition-transform duration-300 ease-out group-hover:-translate-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
        <img src={src} alt={alt} className="block h-auto w-full rounded-sm select-none" draggable={false} />
      </div>
      {label && (
        <span className="font-hand pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 text-sm whitespace-nowrap text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

interface WorldIconProps {
  href?: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  alt: string;
  heightClass: string;
}

function WorldIcon({ href, Icon, alt, heightClass }: WorldIconProps) {
  const glyph = (
    <Icon
      aria-hidden
      className={`${heightClass} w-auto text-ink transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:text-accent`}
    />
  );

  if (!href) return <div className="group">{glyph}</div>;

  return (
    <Link href={href} aria-label={alt} className="group block">
      {glyph}
    </Link>
  );
}

export function WorldObjects() {
  return (
    <div className="relative mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-16 gap-y-16 px-4 py-10">
      <WorldImage
        href="/about"
        src="/about/map.webp"
        alt="A hand-drawn map tracing the route from Alpharetta through Athens to Atlanta"
        label="the long way here →"
        widthClass="w-64 sm:w-80"
        rotate={-2}
      />
      <WorldIcon href="/lab" Icon={NotebookIcon} alt="Notes from the workshop" heightClass="h-28 sm:h-36" />
      <WorldIcon href="/work" Icon={PaintbrushIcon} alt="Work" heightClass="h-28 sm:h-36" />
      <WorldIcon Icon={DoorMark} alt="A round door" heightClass="h-36 sm:h-48" />
    </div>
  );
}
