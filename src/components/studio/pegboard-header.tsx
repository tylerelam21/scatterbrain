interface PegboardLink {
  key: string;
  href: string;
  label: string;
  color: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

// Four daily-use tools, chosen and grouped by hand (not detected from the
// artwork) — percentages are measured directly against pegboard.webp
// (921×751). Pure CSS hover, no client JS: each hit area tints in its own
// color and surfaces a small label pill on hover/focus.
const PEGBOARD_LINKS: PegboardLink[] = [
  {
    key: "paintscout",
    href: "https://app.paintscout.com/dashboard/",
    label: "PaintScout",
    color: "#4a6fa8",
    left: 1.6,
    top: 0.7,
    width: 37.2,
    height: 38.6,
  },
  {
    key: "job-costing",
    href: "https://terminusapp.tylerelam.com",
    label: "Job Costing",
    color: "#3d78a6",
    left: 63.5,
    top: 1.1,
    width: 35.3,
    height: 40.9,
  },
  {
    key: "sherwin-williams",
    href: "https://www.sherwin-williams.com/en-us/pro/pro-plus/account?myAcctMain=1&catalogId=11051&langId=-1&storeId=10151",
    label: "Sherwin Williams",
    color: "#c8102e",
    left: 1.3,
    top: 42.9,
    width: 35.8,
    height: 17.3,
  },
  {
    key: "companycam",
    href: "https://app.companycam.com/projects",
    label: "CompanyCam",
    color: "#0f9b8e",
    left: 46.1,
    top: 71.2,
    width: 52.7,
    height: 16.4,
  },
];

export function PegboardHeader() {
  return (
    <div className="pegboard-header relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
      <img
        src="/work/pegboard.webp"
        alt="An illustrated pegboard of painting and hand tools, four of them linking to daily work tools"
        className="block w-full h-auto rounded-lg select-none"
        draggable={false}
      />
      {PEGBOARD_LINKS.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="pegboard-hit absolute rounded-lg"
          style={
            {
              left: `${link.left}%`,
              top: `${link.top}%`,
              width: `${link.width}%`,
              height: `${link.height}%`,
              "--pegboard-color": link.color,
            } as React.CSSProperties
          }
        >
          <span className="pegboard-hit-label">{link.label}</span>
        </a>
      ))}
    </div>
  );
}
