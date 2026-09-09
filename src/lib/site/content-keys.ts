// Keys into the appSettings key/value store for owner-editable text on the
// public homepage (see server/actions/site.ts). Split out from that file
// because a "use server" module can only export async functions — this
// constant needs to be importable from plain server components too.
export const SITE_CONTENT_KEYS = [
  "home.stickyNote",
  "home.footerBio",
  "home.aboutAnnotation",
  "home.email",
  "home.linkedin",
  "home.github",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];
