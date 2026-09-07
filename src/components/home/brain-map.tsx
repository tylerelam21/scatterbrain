interface Region {
  key: string;
  href: string;
  label: string;
  sub: string;
  color: string;
  // Percent-based box over the rendered illustration (image is 1586×992).
  left: number;
  top: number;
  width: number;
  height: number;
}

// The illustration itself is a static image (see public/brain/brain-map.webp)
// rather than hand-drawn SVG — a stylized paint-over of an earlier SVG
// version of this same diagram, kept for its texture and color quality.
// Each lobe still links out via an invisible, percent-positioned hit
// area over the image, so hover/click behavior survives the switch to a
// flat asset.
const REGIONS: Region[] = [
  {
    key: "paintscout",
    href: "https://paintscout.com",
    label: "PaintScout",
    sub: "Work — estimating",
    color: "#4a6fa8",
    left: 25.85,
    top: 23.19,
    width: 17.03,
    height: 21.67,
  },
  {
    key: "jobcosting",
    href: "https://terminusapp.tylerelam.com",
    label: "Job Costing",
    sub: "Work — the numbers",
    color: "#3d78a6",
    left: 24.91,
    top: 45.87,
    width: 15.13,
    height: 20.5,
  },
  {
    key: "amazon",
    href: "https://www.amazon.com",
    label: "Amazon",
    sub: "the cart is never empty",
    color: "#a97717",
    left: 44.45,
    top: 22.5,
    width: 18.6,
    height: 32.0,
  },
  {
    key: "youtube",
    href: "https://www.youtube.com",
    label: "YouTube",
    sub: "one more video",
    color: "#c1524a",
    left: 63.68,
    top: 25.71,
    width: 16.5,
    height: 36.5,
  },
  {
    key: "transfermarkt",
    href: "https://www.transfermarkt.com",
    label: "Transfermarkt",
    sub: "Futbol — the market",
    color: "#4f9268",
    left: 37.2,
    top: 55.44,
    width: 13.87,
    height: 22.18,
  },
  {
    key: "fotmob",
    href: "https://www.fotmob.com",
    label: "Fotmob",
    sub: "Futbol — the scores",
    color: "#7c68b0",
    left: 51.07,
    top: 55.44,
    width: 14.5,
    height: 22.18,
  },
];

export function BrainMap({ className }: { className?: string }) {
  return (
    <div className={`brain-map relative w-full ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
      <img
        src="/brain/brain-map.webp"
        alt="A hand-drawn brain diagram linking to Work, Futbol, Amazon, and YouTube"
        className="block w-full h-auto select-none"
        draggable={false}
      />
      {REGIONS.map((region) => (
        <a
          key={region.key}
          href={region.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${region.label} — ${region.sub}`}
          className="brain-region-hit absolute rounded-[999px]"
          style={
            {
              left: `${region.left}%`,
              top: `${region.top}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              "--region-color": region.color,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
