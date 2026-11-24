// Keys into the appSettings key/value store for owner-editable text on the
// public homepage (see server/actions/site.ts). Split out from that file
// because a "use server" module can only export async functions — this
// constant needs to be importable from plain server components too.
// Note: home.heroPhotoId and commonplace.shelf are deliberately NOT
// listed here — neither is a hand-typed field (a photo id and a JSON
// blob, respectively), and setSiteContent's bulk form loop would wipe
// any key missing from its submitted fields to "". Both are read/written
// only through their own dedicated actions.
export const SITE_CONTENT_KEYS = [
  "home.heroIntro",
  "now.body",
  "commonplace.listening",
  "commonplace.places",
  "home.footerBio",
  "home.aboutTagline",
  "home.aboutBody",
  "home.email",
  "home.linkedin",
  "home.github",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];
