import type { SVGProps } from "react";

// Hand-built icon set for the homepage World section — bold single-color
// silhouettes in the same spirit as RuneMark, not literal illustrations.
// Each is a filled currentColor shape with a couple of subtractive details
// punched out in the page's own paper color, so they need no per-theme
// variants and no raster/blend-mode handling.

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

export function DoorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="52" r="46" fill="currentColor" />
      <g stroke="var(--paper)" strokeWidth="2.5" strokeLinecap="round">
        <line x1="34" y1="14" x2="34" y2="90" />
        <line x1="50" y1="8" x2="50" y2="96" />
        <line x1="66" y1="14" x2="66" y2="90" />
      </g>
      <circle cx="38" cy="52" r="5" fill="var(--paper)" />
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
