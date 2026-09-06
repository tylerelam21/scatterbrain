// PRD §13.2 — narrowest scopes that satisfy V1: read the calendar list and
// read/write events, not full calendar administration or ACLs. `openid` +
// the email scope let us identify which Google account this connection is
// (needed since a calendar connection may be a second account never used
// to log in — PRD §13.1).
export const CALENDAR_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.events",
] as const;

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export function getAppUrl(): string {
  const url = process.env.AUTH_URL;
  if (!url) {
    throw new Error("AUTH_URL is not set — required to build the OAuth redirect URI");
  }
  return url.replace(/\/$/, "");
}

export function getCalendarOAuthRedirectUri(): string {
  return `${getAppUrl()}/api/calendar/oauth/callback`;
}

export const CALENDAR_OAUTH_STATE_COOKIE = "calendar_oauth_state";
