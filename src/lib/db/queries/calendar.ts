import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { calendarConnections, calendarEvents, calendars } from "@/lib/db/schema";
import { decryptToken, encryptToken } from "@/lib/calendar/encryption";
import {
  GoogleCalendarApiError,
  listGoogleCalendars,
  listGoogleEvents,
  refreshAccessToken,
} from "@/lib/calendar/google";
import { indexSearchDocument, removeSearchDocument } from "@/lib/search";
import { parseCalendarDateOnly } from "@/lib/calendar/dates";

const SYNC_WINDOW_PAST_MS = 90 * 24 * 60 * 60 * 1000; // ~3 months
const SYNC_WINDOW_FUTURE_MS = 180 * 24 * 60 * 60 * 1000; // ~6 months
const REFRESH_SKEW_MS = 60 * 1000; // refresh a minute before actual expiry

export async function listCalendarConnections(userId: string) {
  return db.query.calendarConnections.findMany({
    where: eq(calendarConnections.userId, userId),
    orderBy: asc(calendarConnections.createdAt),
  });
}

// Unscoped by user — for the cron sync job, which runs with no session and
// refreshes every connection in the system (there's only ever one owner
// today, but this doesn't assume that).
export async function listAllCalendarConnections() {
  return db.query.calendarConnections.findMany({
    where: eq(calendarConnections.status, "CONNECTED"),
  });
}

export async function getCalendarConnectionById(userId: string, id: string) {
  return db.query.calendarConnections.findFirst({
    where: and(eq(calendarConnections.id, id), eq(calendarConnections.userId, userId)),
  });
}

export async function upsertCalendarConnection(input: {
  userId: string;
  providerAccountId: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
}) {
  const existing = await db.query.calendarConnections.findFirst({
    where: and(
      eq(calendarConnections.userId, input.userId),
      eq(calendarConnections.providerAccountId, input.providerAccountId),
    ),
  });

  const values = {
    userId: input.userId,
    provider: "google",
    providerAccountId: input.providerAccountId,
    email: input.email,
    encryptedAccessToken: encryptToken(input.accessToken),
    expiresAt: input.expiresAt,
    scopes: input.scopes,
    status: "CONNECTED" as const,
    ...(input.refreshToken ? { encryptedRefreshToken: encryptToken(input.refreshToken) } : {}),
  };

  if (existing) {
    const [updated] = await db
      .update(calendarConnections)
      .set(values)
      .where(eq(calendarConnections.id, existing.id))
      .returning();
    return updated;
  }

  if (!input.refreshToken) {
    throw new Error("No refresh token returned on first connection");
  }
  const [created] = await db.insert(calendarConnections).values(values).returning();
  return created;
}

export async function deleteCalendarConnection(userId: string, id: string) {
  await db
    .delete(calendarConnections)
    .where(and(eq(calendarConnections.id, id), eq(calendarConnections.userId, userId)));
  // The connection's calendars/events cascade-delete at the DB level, which
  // doesn't touch search_documents — sweep out whatever it left behind.
  await db.execute(
    sql`delete from search_documents where content_type = 'CALENDAR_EVENT' and content_id not in (select id from calendar_events)`,
  );
}

// Returns a live access token, transparently refreshing (and persisting)
// when it's expired or about to be. Marks the connection EXPIRED if the
// refresh token itself has been revoked (PRD §50).
export async function getValidAccessToken(connectionId: string): Promise<string> {
  const connection = await db.query.calendarConnections.findFirst({
    where: eq(calendarConnections.id, connectionId),
  });
  if (!connection) throw new Error("Calendar connection not found");

  const isExpired =
    !connection.expiresAt || connection.expiresAt.getTime() - REFRESH_SKEW_MS <= Date.now();

  if (!isExpired && connection.encryptedAccessToken) {
    return decryptToken(connection.encryptedAccessToken);
  }

  if (!connection.encryptedRefreshToken) {
    await db
      .update(calendarConnections)
      .set({ status: "EXPIRED" })
      .where(eq(calendarConnections.id, connectionId));
    throw new Error("Calendar connection has no refresh token; reconnect required");
  }

  try {
    const refreshToken = decryptToken(connection.encryptedRefreshToken);
    const tokens = await refreshAccessToken(refreshToken);
    await db
      .update(calendarConnections)
      .set({
        encryptedAccessToken: encryptToken(tokens.access_token),
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        status: "CONNECTED",
      })
      .where(eq(calendarConnections.id, connectionId));
    return tokens.access_token;
  } catch (err) {
    const status = err instanceof GoogleCalendarApiError && err.status === 400 ? "EXPIRED" : "ERROR";
    await db
      .update(calendarConnections)
      .set({ status })
      .where(eq(calendarConnections.id, connectionId));
    throw err;
  }
}

export async function listCalendarsForUser(userId: string) {
  return db
    .select({
      id: calendars.id,
      connectionId: calendars.connectionId,
      name: calendars.name,
      providerColor: calendars.providerColor,
      customColor: calendars.customColor,
      timeZone: calendars.timeZone,
      accessRole: calendars.accessRole,
      enabled: calendars.enabled,
      isPrimary: calendars.isPrimary,
      connectionEmail: calendarConnections.email,
    })
    .from(calendars)
    .innerJoin(calendarConnections, eq(calendarConnections.id, calendars.connectionId))
    .where(eq(calendarConnections.userId, userId))
    .orderBy(asc(calendars.name));
}

export async function getCalendarById(userId: string, calendarId: string) {
  const [row] = await db
    .select({
      id: calendars.id,
      connectionId: calendars.connectionId,
      providerCalendarId: calendars.providerCalendarId,
      name: calendars.name,
      accessRole: calendars.accessRole,
      timeZone: calendars.timeZone,
    })
    .from(calendars)
    .innerJoin(calendarConnections, eq(calendarConnections.id, calendars.connectionId))
    .where(and(eq(calendars.id, calendarId), eq(calendarConnections.userId, userId)));
  return row ?? null;
}

export async function setCalendarEnabled(userId: string, calendarId: string, enabled: boolean) {
  const calendar = await getCalendarById(userId, calendarId);
  if (!calendar) return;
  await db.update(calendars).set({ enabled }).where(eq(calendars.id, calendarId));
}

export async function setCalendarColor(userId: string, calendarId: string, customColor: string) {
  const calendar = await getCalendarById(userId, calendarId);
  if (!calendar) return;
  await db.update(calendars).set({ customColor }).where(eq(calendars.id, calendarId));
}

export async function listEventsInRange(userId: string, rangeStart: Date, rangeEnd: Date) {
  return db
    .select({
      id: calendarEvents.id,
      calendarId: calendarEvents.calendarId,
      providerEventId: calendarEvents.providerEventId,
      recurringEventId: calendarEvents.recurringEventId,
      title: calendarEvents.title,
      description: calendarEvents.description,
      location: calendarEvents.location,
      start: calendarEvents.start,
      end: calendarEvents.end,
      allDay: calendarEvents.allDay,
      status: calendarEvents.status,
      htmlLink: calendarEvents.htmlLink,
      calendarName: calendars.name,
      calendarColor: calendars.customColor,
      calendarProviderColor: calendars.providerColor,
      calendarEnabled: calendars.enabled,
      accessRole: calendars.accessRole,
    })
    .from(calendarEvents)
    .innerJoin(calendars, eq(calendars.id, calendarEvents.calendarId))
    .innerJoin(calendarConnections, eq(calendarConnections.id, calendars.connectionId))
    .where(
      and(
        eq(calendarConnections.userId, userId),
        eq(calendars.enabled, true),
        lte(calendarEvents.start, rangeEnd),
        gte(calendarEvents.end, rangeStart),
      ),
    )
    .orderBy(asc(calendarEvents.start));
}

export async function getEventById(userId: string, id: string) {
  const [row] = await db
    .select({
      id: calendarEvents.id,
      calendarId: calendarEvents.calendarId,
      providerEventId: calendarEvents.providerEventId,
      recurringEventId: calendarEvents.recurringEventId,
      title: calendarEvents.title,
      description: calendarEvents.description,
      location: calendarEvents.location,
      start: calendarEvents.start,
      end: calendarEvents.end,
      allDay: calendarEvents.allDay,
      htmlLink: calendarEvents.htmlLink,
      providerCalendarId: calendars.providerCalendarId,
      connectionId: calendars.connectionId,
      accessRole: calendars.accessRole,
    })
    .from(calendarEvents)
    .innerJoin(calendars, eq(calendars.id, calendarEvents.calendarId))
    .innerJoin(calendarConnections, eq(calendarConnections.id, calendars.connectionId))
    .where(and(eq(calendarEvents.id, id), eq(calendarConnections.userId, userId)));
  return row ?? null;
}

// PRD §15 — initial + refresh sync: fetch calendar list, then events in a
// fixed window, upserting local cache. Google remains authoritative.
export async function syncCalendarConnection(connectionId: string) {
  const accessToken = await getValidAccessToken(connectionId);

  const googleCalendars = await listGoogleCalendars(accessToken);
  const now = new Date();
  const timeMin = new Date(now.getTime() - SYNC_WINDOW_PAST_MS).toISOString();
  const timeMax = new Date(now.getTime() + SYNC_WINDOW_FUTURE_MS).toISOString();

  for (const gcal of googleCalendars) {
    const existing = await db.query.calendars.findFirst({
      where: and(
        eq(calendars.connectionId, connectionId),
        eq(calendars.providerCalendarId, gcal.id),
      ),
    });

    let calendarRow;
    if (existing) {
      const [updated] = await db
        .update(calendars)
        .set({
          name: gcal.summary,
          description: gcal.description,
          providerColor: gcal.backgroundColor,
          timeZone: gcal.timeZone,
          accessRole: gcal.accessRole,
          isPrimary: !!gcal.primary,
        })
        .where(eq(calendars.id, existing.id))
        .returning();
      calendarRow = updated;
    } else {
      const [created] = await db
        .insert(calendars)
        .values({
          connectionId,
          providerCalendarId: gcal.id,
          name: gcal.summary,
          description: gcal.description,
          providerColor: gcal.backgroundColor,
          timeZone: gcal.timeZone,
          accessRole: gcal.accessRole,
          isPrimary: !!gcal.primary,
        })
        .returning();
      calendarRow = created;
    }

    const events = await listGoogleEvents(accessToken, gcal.id, timeMin, timeMax);
    for (const event of events) {
      if (event.status === "cancelled") {
        const existingEvent = await db.query.calendarEvents.findFirst({
          where: and(
            eq(calendarEvents.calendarId, calendarRow.id),
            eq(calendarEvents.providerEventId, event.id),
          ),
        });
        if (existingEvent) {
          await db.delete(calendarEvents).where(eq(calendarEvents.id, existingEvent.id));
          await removeSearchDocument("CALENDAR_EVENT", existingEvent.id);
        }
        continue;
      }

      const allDay = !!event.start.date;
      const start = event.start.dateTime
        ? new Date(event.start.dateTime)
        : parseCalendarDateOnly(event.start.date!);
      const end = event.end.dateTime
        ? new Date(event.end.dateTime)
        : parseCalendarDateOnly(event.end.date!);
      const title = event.summary || "(untitled)";

      const [eventRow] = await db
        .insert(calendarEvents)
        .values({
          calendarId: calendarRow.id,
          providerEventId: event.id,
          recurringEventId: event.recurringEventId,
          title,
          description: event.description,
          location: event.location,
          start,
          end,
          allDay,
          status: event.status,
          organizer: event.organizer?.email,
          attendeesJson: event.attendees ?? null,
          htmlLink: event.htmlLink,
          etag: event.etag,
          providerUpdatedAt: event.updated ? new Date(event.updated) : undefined,
          lastSyncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [calendarEvents.calendarId, calendarEvents.providerEventId],
          set: {
            recurringEventId: event.recurringEventId,
            title,
            description: event.description,
            location: event.location,
            start,
            end,
            allDay,
            status: event.status,
            organizer: event.organizer?.email,
            attendeesJson: event.attendees ?? null,
            htmlLink: event.htmlLink,
            etag: event.etag,
            providerUpdatedAt: event.updated ? new Date(event.updated) : undefined,
            lastSyncedAt: new Date(),
          },
        })
        .returning();

      // PRD §29 — cached calendar events are searchable, always PRIVATE
      // (calendar has no public surface).
      await indexSearchDocument({
        contentType: "CALENDAR_EVENT",
        contentId: eventRow.id,
        title: eventRow.title,
        body: [eventRow.description, eventRow.location].filter(Boolean).join(" "),
        visibility: "PRIVATE",
      });
    }
  }

  await db
    .update(calendarConnections)
    .set({ lastSyncedAt: new Date(), status: "CONNECTED" })
    .where(eq(calendarConnections.id, connectionId));
}
