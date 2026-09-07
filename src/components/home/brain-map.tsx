interface Region {
  key: string;
  href: string;
  label: string;
  color: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  clip: "cerebrum" | "temporal";
  labelY?: number;
}

// Six personal shortcuts, laid out like a phrenology chart: Work sits in
// the frontal lobe (split into two adjacent patches), Amazon and YouTube
// take the parietal/occipital top, and the two football sites share the
// hanging temporal lobe underneath. Pure CSS hover — no client JS needed.
const REGIONS: Region[] = [
  { key: "paintscout", href: "https://paintscout.com", label: "PaintScout", color: "#3b6fd6", cx: 175, cy: 105, rx: 70, ry: 48, clip: "cerebrum" },
  { key: "jobcosting", href: "https://terminusapp.tylerelam.com", label: "Job Costing", color: "#8ec9f2", cx: 150, cy: 185, rx: 65, ry: 46, clip: "cerebrum", labelY: 189 },
  { key: "amazon", href: "https://www.amazon.com", label: "Amazon", color: "#f2b90c", cx: 330, cy: 105, rx: 90, ry: 50, clip: "cerebrum" },
  { key: "youtube", href: "https://www.youtube.com", label: "YouTube", color: "#d64545", cx: 470, cy: 150, rx: 75, ry: 65, clip: "cerebrum" },
  { key: "transfermarkt", href: "https://www.transfermarkt.com", label: "Transfermarkt", color: "#2f8f5b", cx: 245, cy: 300, rx: 55, ry: 45, clip: "temporal" },
  { key: "fotmob", href: "https://www.fotmob.com", label: "Fotmob", color: "#6d4fc4", cx: 335, cy: 300, rx: 55, ry: 45, clip: "temporal" },
];

const WRINKLES = [
  "M 140,110 Q 155,130 145,150",
  "M 185,95 Q 200,115 190,138",
  "M 235,85 Q 248,105 238,128",
  "M 285,82 Q 298,102 288,124",
  "M 335,80 Q 348,100 338,122",
  "M 385,85 Q 398,105 388,128",
  "M 430,95 Q 445,115 433,138",
  "M 470,120 Q 485,140 470,160",
  "M 150,175 Q 175,185 165,205",
  "M 220,170 Q 245,180 235,202",
  "M 300,168 Q 325,178 315,200",
  "M 380,172 Q 405,182 395,204",
  "M 450,180 Q 470,192 458,212",
];

export function BrainMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      className={`brain-map w-full overflow-visible ${className ?? ""}`}
      role="img"
      aria-label="A hand-drawn brain diagram linking to Work, Futbol, Amazon, and YouTube"
    >
      <filter id="brain-sketchy" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={2} seed={7} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={7} xChannelSelector="R" yChannelSelector="G" />
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
          id="brain-cerebrum"
          style={{ fill: "var(--paper)", stroke: "var(--ink)" }}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M 95,175 Q 80,140 100,105 Q 115,80 145,85 Q 155,60 185,68 Q 205,45 230,65
             Q 250,42 270,63 Q 292,40 313,62 Q 335,40 357,60 Q 380,42 395,65
             Q 420,50 440,72 Q 465,60 480,85 Q 505,78 515,105 Q 530,130 515,155
             Q 535,170 520,190 Q 530,210 510,220 Q 520,240 495,248 Q 500,268 475,272
             Q 455,290 430,275 Q 410,295 385,280 Q 360,298 340,278 Q 315,292 295,272
             Q 270,285 250,265 Q 225,275 205,255 Q 180,260 165,240 Q 140,245 125,222
             Q 100,220 95,195 Z"
        />
        <path
          id="brain-temporal"
          style={{ fill: "var(--paper)", stroke: "var(--ink)" }}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          d="M 210,255 Q 195,270 200,295 Q 190,315 210,335 Q 220,355 245,358 Q 265,368 285,352
             Q 305,360 320,345 Q 335,352 350,335 Q 365,340 372,320 Q 385,305 375,285
             Q 380,265 360,258 Z"
        />
      </g>

      <g filter="url(#brain-sketchy)" style={{ stroke: "var(--ink)" }} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.55}>
        {WRINKLES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {REGIONS.map((region) => (
        <a key={region.key} href={region.href} target="_blank" rel="noopener noreferrer" aria-label={region.label}>
          <ellipse
            className="brain-region-fill"
            cx={region.cx}
            cy={region.cy}
            rx={region.rx}
            ry={region.ry}
            fill={region.color}
            stroke={region.color}
            strokeWidth={1.5}
            clipPath={`url(#brain-${region.clip}-clip)`}
          />
          <text
            className="brain-region-label font-hand"
            x={region.cx}
            y={region.labelY ?? region.cy + 3}
            textAnchor="middle"
            fontSize={16}
            style={{ fill: "var(--ink)" }}
          >
            {region.label}
          </text>
        </a>
      ))}
    </svg>
  );
}
