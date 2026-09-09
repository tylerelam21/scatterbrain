import { PaintDabsIcon } from "./world-icons";
import { InlineEditable } from "./inline-editable";
import { setSiteContentField } from "@/server/actions/site";

// A small pinned note next to the hero — the one place on the outward
// homepage the owner's own words show up unprompted, rather than
// something I drafted. Rendered whenever home.stickyNote is set, or the
// owner is looking at the public view and can click to add one — no
// placeholder text pretending to be final for anyone else.
export function StickyNote({ text, editable }: { text: string; editable: boolean }) {
  return (
    <div className="w-56 shrink-0 -rotate-2" style={{ boxShadow: "var(--note-shadow)" }}>
      <span
        aria-hidden
        className="mx-auto block h-5 w-14 rotate-1 translate-y-2"
        style={{ backgroundColor: "rgba(216, 205, 176, 0.85)" }}
      />
      <div className="px-5 pt-6 pb-7" style={{ backgroundColor: "#f3ead2" }}>
        <InlineEditable
          value={text}
          editable={editable}
          onSave={(value) => setSiteContentField("home.stickyNote", value)}
          as="textarea"
          rows={3}
          placeholder="A short line, pinned next to your name"
          className="font-hand text-lg leading-snug text-ink"
        />
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
