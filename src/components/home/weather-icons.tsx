import type { ReactNode, SVGProps } from "react";

// A small custom line-icon set (24x24, stroke-based) replacing raw weather
// emoji — emoji render differently per OS and sat oddly next to the site's
// otherwise custom iconography (the rune mark). Kept deliberately plain and
// geometric rather than brush-styled like the rune: one hand-drawn mark on
// a page is a signature, ten of them is clutter.

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

const CLOUD_PATH = "M17 18.5H8a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.44 2.05A4 4 0 0 1 17 18.5z";

export function SunIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4" />
    </Base>
  );
}

export function PartlyCloudyIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="8" cy="7.5" r="2.8" />
      <path d="M8 2.7v1.4M3.6 7.5H5M11 7.5h1.4M4.9 4.4l1 1M4.9 10.6l1-1" />
      <path d="M16.5 20.5h-6a3.7 3.7 0 0 1-.4-7.4 5 5 0 0 1 9.5 1.7A3.3 3.3 0 0 1 16.5 20.5z" />
    </Base>
  );
}

export function CloudyIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d={CLOUD_PATH} />
    </Base>
  );
}

export function FogIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 9.5h9a3.5 3.5 0 1 0-1-6.86A5 5 0 0 0 5 6" />
      <path d="M3.5 13.5h17M3.5 17h17M6 20.5h12" />
    </Base>
  );
}

export function DrizzleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d={CLOUD_PATH} />
      <path d="M9.5 20.2l-.8 1.5M14.5 20.2l-.8 1.5" />
    </Base>
  );
}

export function RainIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d={CLOUD_PATH} />
      <path d="M8 19.8l-1 2M12.5 19.8l-1 2M17 19.8l-1 2" />
    </Base>
  );
}

export function SnowIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d={CLOUD_PATH} />
      <path d="M8.7 19.3v3M7.3 20.1l2.8 1.4M10.1 20.1l-2.8 1.4" />
      <path d="M16.2 19.3v3M14.8 20.1l2.8 1.4M17.6 20.1l-2.8 1.4" />
    </Base>
  );
}

export function ThunderstormIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d={CLOUD_PATH} />
      <path d="M13 18.8l-2.6 3.6h3l-2 3" />
    </Base>
  );
}

export function ThermometerIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 14.8V5a2 2 0 1 0-4 0v9.8a3.5 3.5 0 1 0 4 0z" />
      <circle cx="10" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </Base>
  );
}

// WMO weather codes (Open-Meteo's `weather_code`), collapsed to one icon
// per condition family. Written as a chain of JSX returns (rather than
// resolving a component reference and instantiating that) so each icon is
// statically referenced at its call site.
export function WeatherIcon({ code, ...props }: IconProps & { code: number | null }) {
  if (code === 0) return <SunIcon {...props} />;
  if (code === 1 || code === 2) return <PartlyCloudyIcon {...props} />;
  if (code === 3) return <CloudyIcon {...props} />;
  if (code === 45 || code === 48) return <FogIcon {...props} />;
  if (code !== null && [51, 53, 55, 56, 57].includes(code)) return <DrizzleIcon {...props} />;
  if (code !== null && [61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <RainIcon {...props} />;
  if (code !== null && [71, 73, 75, 77, 85, 86].includes(code)) return <SnowIcon {...props} />;
  if (code !== null && [95, 96, 99].includes(code)) return <ThunderstormIcon {...props} />;
  return <ThermometerIcon {...props} />;
}
