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

// A small cluster of paint dabs — the hero's corner accent. Personal
// rather than generic: Terminus's teal, the site's own green, and a warm
// brown, the same "old paint chips" vocabulary as the rest of the site,
// standing in for an actual painter's palette rather than stock botanical
// decoration. Colors come from theme-aware CSS vars (globals.css), not
// currentColor, since it's genuinely three distinct hues at once.
export function PaintDabsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M35 70 C 20 65, 15 45, 30 35 C 48 28, 62 40, 58 58 C 55 72, 45 75, 35 70 Z"
        fill="var(--dab-teal)"
      />
      <path
        d="M68 45 C 58 38, 58 20, 75 15 C 92 12, 100 28, 90 42 C 82 52, 74 50, 68 45 Z"
        fill="var(--dab-green)"
      />
      <path
        d="M52 92 C 44 88, 44 74, 58 70 C 70 68, 76 80, 68 90 C 62 96, 56 96, 52 92 Z"
        fill="var(--dab-brown)"
      />
      <circle cx="30" cy="98" r="4" fill="var(--dab-teal)" />
      <circle cx="94" cy="70" r="3" fill="var(--dab-green)" />
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
