// Outward-facing identity hero — see docs/OUTWARD-FACING-PORTFOLIO.md §2.
// Repurposes the same oversized-serif visual confidence HomeHero gives the
// date, but for the owner's name, with one line of handwriting kept small
// and secondary — marginalia, not a second primary typeface.
export function PublicIdentity() {
  return (
    <div>
      <h1 className="font-display text-7xl leading-none tracking-tight text-ink sm:text-8xl">
        Tyler Elam
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
        I make useful things and try to make them beautiful.
      </p>
      <p className="font-hand mt-4 max-w-md text-lg leading-snug text-accent/80">
        There&rsquo;s some good in this world, and it&rsquo;s worth fighting for.
      </p>
    </div>
  );
}
