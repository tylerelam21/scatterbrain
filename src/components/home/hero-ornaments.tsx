import { PaintDabsIcon } from "./world-icons";

// A small pinned note next to the hero — the one place on the outward
// homepage the owner's own words show up unprompted, rather than
// something I drafted. Only ever rendered when home.stickyNote is set
// (see Settings → Homepage); no placeholder text pretending to be final.
export function StickyNote({ text }: { text: string }) {
  return (
    <div className="w-56 shrink-0 -rotate-2" style={{ boxShadow: "var(--note-shadow)" }}>
      <span
        aria-hidden
        className="mx-auto block h-5 w-14 rotate-1 translate-y-2"
        style={{ backgroundColor: "rgba(216, 205, 176, 0.85)" }}
      />
      <div className="px-5 pt-6 pb-7" style={{ backgroundColor: "#f3ead2" }}>
        <p className="font-hand text-lg leading-snug text-ink">{text}</p>
        <span aria-hidden className="mt-3 block h-0.5 w-10 bg-ink/25" />
      </div>
    </div>
  );
}

export function HeroAccent() {
  return <PaintDabsIcon aria-hidden className="h-24 w-auto shrink-0" />;
}

export function ScrollCue() {
  return (
    <div className="mt-14 flex items-center gap-2 text-sm text-muted">
      <span aria-hidden className="text-base">
        ↓
      </span>
      <span className="font-hand text-base">Take a look around.</span>
    </div>
  );
}
