// Outward-facing identity hero — one typographic voice (the same
// oversized-serif confidence HomeHero gives the date), one plain line of
// positioning. No second typeface, no decorative marginalia.
export function PublicIdentity() {
  return (
    <div>
      <h1 className="font-display text-7xl leading-none tracking-tight text-ink sm:text-8xl">
        Tyler Elam
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
        I make useful things and occasionally unnecessary ones.
      </p>
    </div>
  );
}
