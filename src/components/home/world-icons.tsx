import type { SVGProps } from "react";

// Hand-built icon set for the homepage World section — bold single-color
// silhouettes in the same spirit as the site's brand mark, not literal
// illustrations. Each is a filled currentColor shape with a couple of
// subtractive details punched out in the page's own paper color, so they
// need no per-theme variants and no raster/blend-mode handling.
//
// The door object reuses DoorMark (src/components/brand/door-mark.tsx),
// the site's actual logo, rather than a separate glyph of its own.

export function PaintbrushIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="rotate(8 50 70)" fill="currentColor">
        <path d="M30 10 L35 2 L40 8 L45 0 L50 7 L55 0 L60 8 L65 2 L70 10 L62 30 L38 30 Z" />
        <rect x="35" y="29" width="30" height="15" rx="2" />
        <rect x="42" y="42" width="16" height="90" rx="8" />
      </g>
    </svg>
  );
}

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M55 135 C 50 100, 60 60, 65 15"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="currentColor">
        <path d="M58 100 C 40 95, 30 75, 40 60 C 55 65, 62 85, 58 100 Z" />
        <path d="M60 70 C 78 65, 88 45, 78 30 C 63 35, 56 55, 60 70 Z" />
        <path d="M64 35 C 78 25, 82 8, 72 0 C 60 8, 58 25, 64 35 Z" />
      </g>
    </svg>
  );
}

export function NotebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-10 -10 120 140" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="rotate(-6 50 60)">
        <rect x="15" y="10" width="70" height="100" rx="6" fill="currentColor" />
        <rect x="60" y="6" width="8" height="108" rx="3" fill="var(--paper)" />
        <path d="M26 110 L26 122 L33 115 L40 122 L40 110 Z" fill="var(--paper)" />
      </g>
    </svg>
  );
}
