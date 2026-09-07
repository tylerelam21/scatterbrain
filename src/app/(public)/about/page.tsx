// Placeholder shell for the About page — see docs/OUTWARD-FACING-PORTFOLIO.md.
// The real content (three short chapters: Alpharetta / Athens / Atlanta) is
// Tyler's story to write, not mine to draft. This holds the /about route so
// the map object in the World section has somewhere real to go in the
// meantime, rather than a dead link.
export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl tracking-tight text-ink">The long way here.</h1>
      <p className="mt-2 text-sm text-muted">Alpharetta → Athens → Atlanta.</p>

      {/* eslint-disable-next-line @next/next/no-img-element -- fixed static illustration, not a photo needing next/image optimization */}
      <img
        src="/about/map.webp"
        alt="A hand-drawn map tracing the route from Alpharetta through Athens to Atlanta"
        className="mt-10 block h-auto w-full rounded-sm select-none"
        style={{ boxShadow: "var(--note-shadow)" }}
        draggable={false}
      />

      <p className="font-hand mt-10 text-lg text-accent/80">The chapters are still being written.</p>
    </main>
  );
}
