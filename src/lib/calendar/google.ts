import {
  CALENDAR_SCOPES,
  GOOGLE_AUTH_URL,
  GOOGLE_CALENDAR_API_BASE,
  GOOGLE_TOKEN_URL,
  getCalendarOAuthRedirectUri,
} from "./constants";

// PRD §50 — callers need to distinguish failure classes (expired auth,
// insufficient permissions, provider unavailable, read-only calendar,
// network failure) rather than a single opaque error.
export class GoogleCalendarApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Google Calendar API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

export function buildCalendarAuthUrl(state: string): string {
  const clientId = process.env.AUTH_GOOGLE_ID;
  if (!clientId) throw new Error("AUTH_GOOGLE_ID is not set");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCalendarOAuthRedirectUri(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: CALENDAR_SCOPES.join(" "),
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth client is not configured");

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getCalendarOAuthRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new GoogleCalendarApiError(res.status, body);
  return body;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<Omit<GoogleTokenResponse, "refresh_token">> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth client is not configured");

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new GoogleCalendarApiError(res.status, body);
  return body;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok) throw new GoogleCalendarApiError(res.status, body);
  return body;
}

async function googleFetch(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`${GOOGLE_CALENDAR_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new GoogleCalendarApiError(res.status, body);
  return body;
}

export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  timeZone?: string;
  accessRole: string;
  primary?: boolean;
}

export async function listGoogleCalendars(
  accessToken: string,
): Promise<GoogleCalendarListEntry[]> {
  const items: GoogleCalendarListEntry[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ maxResults: "250" });
    if (pageToken) params.set("pageToken", pageToken);
    const body = await googleFetch(accessToken, `/users/me/calendarList?${params.toString()}`);
    items.push(...(body.items ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);

  return items;
}

export interface GoogleEventTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface GoogleEvent {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GoogleEventTime;
  end: GoogleEventTime;
  recurringEventId?: string;
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ email: string; responseStatus?: string; displayName?: string }>;
  htmlLink?: string;
  etag?: string;
  updated?: string;
}

// PRD §20 — singleEvents=true expands recurring events into individual
// instances, so we never have to implement RRULE expansion ourselves.
export async function listGoogleEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<GoogleEvent[]> {
  const items: GoogleEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults: "2500",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const body = await googleFetch(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    );
    items.push(...(body.items ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);

  return items;
}

export interface GoogleEventInput {
  summary: string;
  description?: string;
  location?: string;
  start: GoogleEventTime;
  end: GoogleEventTime;
  attendees?: Array<{ email: string }>;
}

export async function insertGoogleEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleEventInput,
): Promise<GoogleEvent> {
  return googleFetch(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export async function updateGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<GoogleEventInput>,
): Promise<GoogleEvent> {
  return googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "PATCH", body: JSON.stringify(event) },
  );
}

export async function revokeGoogleToken(token: string): Promise<void> {
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch(() => {
    // Best-effort — the connection is being deleted locally regardless.
  });
}

export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  await googleFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" },
  );
}
