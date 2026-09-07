interface Region {
  key: string;
  href: string;
  label: string;
  sub: string;
  fill: string;
  labelColor?: string;
  clip: "cerebrum" | "temporal";
  ellipse: { cx: number; cy: number; rx: number; ry: number };
  leaderD: string;
  anchor: { cx: number; cy: number };
  labelPos: { x: number; y: number };
  subPos: { x: number; y: number };
  anchorText?: "start" | "middle" | "end";
}

// Six personal shortcuts on an anatomically-shaped side-profile brain:
// Work splits the frontal lobe (PaintScout up top, Job Costing below),
// Amazon takes the parietal top, YouTube the occipital back, and Futbol
// splits the hanging temporal lobe (Transfermarkt front, Fotmob back).
// Labels sit outside the silhouette on their own leader lines, colored to
// match their region — a nod to the "labeled anatomy poster" genre, kept
// in the site's own hand-drawn ink-on-paper voice rather than a clean
// vector one. Pure CSS hover — no client JS needed.
const REGIONS: Region[] = [
  {
    key: "paintscout",
    href: "https://paintscout.com",
    label: "PaintScout",
    sub: "Work — estimating",
    fill: "#4a6fa8",
    clip: "cerebrum",
    ellipse: { cx: 337.5, cy: 186.5, rx: 91, ry: 62 },
    leaderD: "M 285,160 Q 190,120 120,100",
    anchor: { cx: 285, cy: 160 },
    labelPos: { x: 113, y: 98 },
    subPos: { x: 113, y: 117 },
    anchorText: "end",
  },
  {
    key: "jobcosting",
    href: "https://terminusapp.tylerelam.com",
    label: "Job Costing",
    sub: "Work — the numbers",
    fill: "#9fc3dd",
    labelColor: "#3d78a6",
    clip: "cerebrum",
    ellipse: { cx: 305, cy: 290.5, rx: 84.5, ry: 59.8 },
    leaderD: "M 255,300 Q 165,318 105,330",
    anchor: { cx: 255, cy: 300 },
    labelPos: { x: 98, y: 334 },
    subPos: { x: 98, y: 353 },
    anchorText: "end",
  },
  {
    key: "amazon",
    href: "https://www.amazon.com",
    label: "Amazon",
    sub: "the cart is never empty",
    fill: "#d9a441",
    labelColor: "#a97717",
    clip: "cerebrum",
    ellipse: { cx: 539, cy: 186.5, rx: 117, ry: 65 },
    leaderD: "M 539,135 Q 539,75 539,40",
    anchor: { cx: 539, cy: 135 },
    labelPos: { x: 539, y: 25 },
    subPos: { x: 539, y: 44 },
    anchorText: "middle",
  },
  {
    key: "youtube",
    href: "https://www.youtube.com",
    label: "YouTube",
    sub: "one more video",
    fill: "#c1524a",
    clip: "cerebrum",
    ellipse: { cx: 721, cy: 245, rx: 97.5, ry: 84.5 },
    leaderD: "M 800,225 Q 850,195 895,175",
    anchor: { cx: 800, cy: 225 },
    labelPos: { x: 902, y: 173 },
    subPos: { x: 902, y: 192 },
    anchorText: "start",
  },
  {
    key: "transfermarkt",
    href: "https://www.transfermarkt.com",
    label: "Transfermarkt",
    sub: "Futbol — the market",
    fill: "#4f9268",
    clip: "temporal",
    ellipse: { cx: 428.5, cy: 440, rx: 71.5, ry: 58.5 },
    leaderD: "M 400,495 Q 355,555 335,600",
    anchor: { cx: 400, cy: 495 },
    labelPos: { x: 330, y: 620 },
    subPos: { x: 330, y: 639 },
    anchorText: "middle",
  },
  {
    key: "fotmob",
    href: "https://www.fotmob.com",
    label: "Fotmob",
    sub: "Futbol — the scores",
    fill: "#7c68b0",
    clip: "temporal",
    ellipse: { cx: 545.5, cy: 440, rx: 71.5, ry: 58.5 },
    leaderD: "M 565,498 Q 590,558 605,602",
    anchor: { cx: 565, cy: 498 },
    labelPos: { x: 608, y: 622 },
    subPos: { x: 608, y: 641 },
    anchorText: "middle",
  },
];

const CEREBRUM_WRINKLES = [
  "M 292.0,193.0 Q 311.5,219.0 298.5,245.0",
  "M 350.5,173.5 Q 370.0,199.5 357.0,229.4",
  "M 415.5,160.5 Q 432.4,186.5 419.4,216.4",
  "M 480.5,156.6 Q 497.4,182.6 484.4,211.2",
  "M 545.5,154.0 Q 562.4,180.0 549.4,208.6",
  "M 610.5,160.5 Q 627.4,186.5 614.4,216.4",
  "M 669.0,173.5 Q 688.5,199.5 672.9,229.4",
  "M 721.0,206.0 Q 740.5,232.0 721.0,258.0",
  "M 305.0,277.5 Q 337.5,290.5 324.5,316.5",
  "M 396.0,271.0 Q 428.5,284.0 415.5,312.6",
  "M 500.0,268.4 Q 532.5,281.4 519.5,310.0",
  "M 604.0,273.6 Q 636.5,286.6 623.5,315.2",
  "M 695.0,284.0 Q 721.0,299.6 705.4,325.6",
  "M 266.0,245.0 Q 279.0,271.0 263.4,297.0",
  "M 318.0,219.0 Q 333.6,245.0 318.0,271.0",
  "M 448.0,128.0 Q 463.6,154.0 448.0,180.0",
  "M 513.0,125.4 Q 528.6,151.4 513.0,177.4",
  "M 578.0,125.4 Q 593.6,151.4 578.0,177.4",
  "M 643.0,130.6 Q 658.6,156.6 643.0,182.6",
  "M 701.5,154.0 Q 718.4,180.0 701.5,206.0",
  "M 753.5,180.0 Q 770.4,206.0 753.5,232.0",
  "M 357.0,316.5 Q 383.0,329.5 370.0,355.5",
  "M 448.0,342.5 Q 480.5,351.6 467.5,380.2",
  "M 552.0,336.0 Q 584.5,346.4 571.5,375.0",
  "M 656.0,338.6 Q 688.5,349.0 675.5,377.6",
  "M 337.5,238.5 Q 357.0,258.0 344.0,284.0",
];

const TEMPORAL_WRINKLES = [
  "M 415,440 Q 428,458 417,477",
  "M 455,447 Q 468,465 457,484",
  "M 497,447 Q 510,465 499,484",
  "M 540,443 Q 553,461 542,480",
  "M 435,483 Q 452,493 444,510",
  "M 510,483 Q 527,493 519,510",
];

const CEREBELLUM_STRIATIONS = [
  "M 710,403 Q 725,409 717,423",
  "M 723,413 Q 738,419 730,433",
  "M 736,423 Q 751,429 743,443",
  "M 749,435 Q 764,441 756,455",
  "M 717,441 Q 732,447 724,461",
  "M 730,451 Q 745,457 737,471",
];

export function BrainMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1040 700"
      className={`brain-map w-full overflow-visible ${className ?? ""}`}
      role="img"
      aria-label="A hand-drawn brain diagram linking to Work, Futbol, Amazon, and YouTube"
    >
      <filter id="brain-sketchy" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves={2} seed={9} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={6} xChannelSelector="R" yChannelSelector="G" />
      </filter>

      <defs>
        <clipPath id="brain-cerebrum-clip">
          <use href="#brain-cerebrum" />
        </clipPath>
        <clipPath id="brain-temporal-clip">
          <use href="#brain-temporal" />
        </clipPath>
      </defs>

      <g filter="url(#brain-sketchy)">
        <path
          id="brain-cerebellum"
          style={{ fill: "#9caf6e", stroke: "var(--ink)", fillOpacity: 0.25 }}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M 700,395 Q 690,415 697,437 Q 687,457 704,473 Q 717,487 737,477
             Q 757,487 770,469 Q 784,457 776,437 Q 788,419 772,407
             Q 777,391 757,387 Q 737,377 720,387 Q 710,381 700,395 Z"
        />

        <path
          id="brain-cerebrum"
          style={{ fill: "var(--paper)", stroke: "var(--ink)" }}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M 233.5,277.5 Q 214.0,232.0 240.0,186.5 Q 259.5,154.0 298.5,160.5 Q 311.5,128.0 350.5,138.4 Q 376.5,108.5 409.0,134.5
             Q 435.0,104.6 461.0,131.9 Q 489.6,102.0 516.9,130.6 Q 545.5,102.0 574.1,128.0 Q 604.0,104.6 623.5,134.5
             Q 656.0,115.0 682.0,143.6 Q 714.5,128.0 734.0,160.5 Q 766.5,151.4 779.5,186.5 Q 799.0,219.0 779.5,251.5
             Q 805.5,271.0 786.0,297.0 Q 799.0,323.0 773.0,336.0 Q 786.0,362.0 753.5,372.4 Q 760.0,398.4 727.5,403.6
             Q 701.5,427.0 669.0,407.5 Q 643.0,433.5 610.5,414.0 Q 578.0,437.4 552.0,411.4 Q 519.5,429.6 493.5,403.6
             Q 461.0,420.5 435.0,394.5 Q 402.5,407.5 376.5,381.5 Q 344.0,388.0 324.5,362.0 Q 292.0,368.5 272.5,338.6
             Q 240.0,336.0 233.5,303.5 Z"
        />

        <path
          id="brain-temporal"
          style={{ fill: "var(--paper)", stroke: "var(--ink)" }}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M 383.0,381.5 Q 363.5,401.0 370.0,433.5 Q 357.0,459.5 383.0,485.5 Q 396.0,511.5 428.5,515.4 Q 454.5,528.4 480.5,507.6
             Q 506.5,518.0 526.0,498.5 Q 545.5,507.6 565.0,485.5 Q 584.5,492.0 593.6,466.0 Q 610.5,446.5 597.5,420.5
             Q 604.0,394.5 578.0,385.4 Z"
        />
      </g>

      <g filter="url(#brain-sketchy)">
        <path
          d="M 375,395 Q 450,375 520,382 Q 570,386 598,400"
          fill="none"
          style={{ stroke: "var(--ink)" }}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.5}
        />
      </g>

      <g filter="url(#brain-sketchy)" fill="none" style={{ stroke: "var(--ink)" }} strokeWidth={1.4} strokeLinecap="round" opacity={0.45}>
        {CEREBRUM_WRINKLES.map((d) => (
          <path key={d} d={d} />
        ))}
        {TEMPORAL_WRINKLES.map((d) => (
          <path key={d} d={d} />
        ))}
        {CEREBELLUM_STRIATIONS.map((d) => (
          <path key={d} d={d} strokeWidth={1.1} />
        ))}
      </g>

      {REGIONS.map((region) => (
        <a
          key={region.key}
          href={region.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${region.label} — ${region.sub}`}
          style={
            {
              "--region-color": region.fill,
              ...(region.labelColor ? { "--label-color": region.labelColor } : {}),
            } as React.CSSProperties
          }
        >
          <ellipse
            className="brain-region-fill"
            cx={region.ellipse.cx}
            cy={region.ellipse.cy}
            rx={region.ellipse.rx}
            ry={region.ellipse.ry}
            fill={region.fill}
            clipPath={`url(#brain-${region.clip}-clip)`}
          />
          <path className="brain-leader" d={region.leaderD} fill="none" strokeWidth={1.3} />
          <circle className="brain-anchor-dot" cx={region.anchor.cx} cy={region.anchor.cy} r={3.5} />
          <text
            className="brain-region-label font-hand"
            x={region.labelPos.x}
            y={region.labelPos.y}
            textAnchor={region.anchorText ?? "start"}
            fontSize={23}
          >
            {region.label}
          </text>
          <text
            className="brain-region-sub"
            x={region.subPos.x}
            y={region.subPos.y}
            textAnchor={region.anchorText ?? "start"}
            fontSize={12}
            style={{ fill: "var(--muted)" }}
          >
            {region.sub}
          </text>
        </a>
      ))}
    </svg>
  );
}
