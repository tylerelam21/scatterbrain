"use server";

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import {
  buildCalendarAuthUrl,
  deleteGoogleEvent,
  GoogleCalendarApiError,
  insertGoogleEvent,
  revokeGoogleToken,
  updateGoogleEvent,
  type GoogleEventTime,
} from "@/lib/calendar/google";
import { decryptToken } from "@/lib/calendar/encryption";
import { CALENDAR_OAUTH_STATE_COOKIE } from "@/lib/calendar/constants";
import { db } from "@/lib/db/client";
import { calendarEvents } from "@/lib/db/schema";
import * as calendarQueries from "@/lib/db/queries/calendar";
import { setAppSetting } from "@/lib/db/queries/settings";
import { indexSearchDocument, removeSearchDocument } from "@/lib/search";

// PRD §17 — "connect another Google account" is a distinct flow from login:
// it can add accounts never used to sign in, and always requests a fresh
// refresh token (prompt=consent) rather than reusing the session's grant.
export async function connectGoogleCalendar() {
  await requireOwner();

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(CALENDAR_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  redirect(buildCalendarAuthUrl(state));
}

export async function disconnectCalendarConnection(id: string) {
  const owner = await requireOwner();
  const connection = await calendarQueries.getCalendarConnectionById(owner.id, id);
  if (!connection) return;

  if (connection.encryptedRefreshToken) {
    await revokeGoogleToken(decryptToken(connection.encryptedRefreshToken));
  }
  await calendarQueries.deleteCalendarConnection(owner.id, id);
  revalidatePath("/settings");
  revalidatePath("/calendar");
}

export async function syncCalendarConnectionNow(id: string) {
  const owner = await requireOwner();
  const connection = await calendarQueries.getCalendarConnectionById(owner.id, id);
  if (!connection) return;

  await calendarQueries.syncCalendarConnection(id);
  revalidatePath("/calendar");
  revalidatePath("/settings");
}

export async function setCalendarEnabled(id: string, enabled: boolean) {
  const owner = await requireOwner();
  await calendarQueries.setCalendarEnabled(owner.id, id, enabled);
  revalidatePath("/calendar");
}

export async function setCalendarColor(id: string, color: string) {
  const owner = await requireOwner();
  await calendarQueries.setCalendarColor(owner.id, id, color);
  revalidatePath("/calendar");
}

export async function setDefaultCalendar(formData: FormData) {
  const owner = await requireOwner();
  const calendarId = String(formData.get("calendarId") ?? "");
  if (!calendarId) return;
  await setAppSetting(owner.id, "defaultCalendarId", calendarId);
  revalidatePath("/settings");
  revalidatePath("/calendar");
}

export interface EventFormState {
  ok: boolean;
  error?: string;
}

// PRD §50 — distinguish connection-expired / insufficient-permission /
// provider-unavailable / network failure rather than one opaque message.
function explainGoogleError(err: unknown): string {
  if (err instanceof GoogleCalendarApiError) {
    if (err.status === 401) return "Google Calendar access expired. Reconnect it in Settings.";
    if (err.status === 403) return "You don't have permission to write to this calendar.";
    if (err.status === 404) return "This calendar or event no longer exists in Google Calendar.";
    if (err.status >= 500) return "Google Calendar is temporarily unavailable. Try again shortly.";
    return "Google Calendar rejected the request.";
  }
  return "Network error reaching Google Calendar. Check your connection and try again.";
}

function buildEventTimes(formData: FormData): {
  allDay: boolean;
  googleStart: GoogleEventTime;
  googleEnd: GoogleEventTime;
  localStart: Date;
  localEnd: Date;
} {
  const allDay = formData.get("allDay") === "1";

  if (allDay) {
    const date = String(formData.get("date") ?? "");
    const endExclusive = new Date(`${date}T00:00:00Z`);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
    return {
      allDay: true,
      googleStart: { date },
      googleEnd: { date: endExclusive.toISOString().slice(0, 10) },
      localStart: new Date(`${date}T00:00:00Z`),
      localEnd: endExclusive,
    };
  }

  const startAt = String(formData.get("startAt") ?? "");
  const endAt = String(formData.get("endAt") ?? "");
  return {
    allDay: false,
    googleStart: { dateTime: startAt },
    googleEnd: { dateTime: endAt },
    localStart: new Date(startAt),
    localEnd: new Date(endAt),
  };
}

// PRD §18-19 — write to the provider first; the local cache is only ever
// updated after a confirmed provider success, so a failure never drifts
// local state away from Google (no rollback needed because nothing local
// was changed yet).
export async function createCalendarEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const owner = await requireOwner();
  const calendarId = String(formData.get("calendarId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "");
  const description = String(formData.get("description") ?? "");

  if (!title) return { ok: false, error: "Title is required." };

  const calendar = await calendarQueries.getCalendarById(owner.id, calendarId);
  if (!calendar) return { ok: false, error: "Calendar not found." };
  if (calendar.accessRole !== "owner" && calendar.accessRole !== "writer") {
    return { ok: false, error: "This calendar is read-only." };
  }

  const { allDay, googleStart, googleEnd, localStart, localEnd } = buildEventTimes(formData);

  try {
    const accessToken = await calendarQueries.getValidAccessToken(calendar.connectionId);
    const created = await insertGoogleEvent(accessToken, calendar.providerCalendarId, {
      summary: title,
      description: description || undefined,
      location: location || undefined,
      start: googleStart,
      end: googleEnd,
    });

    const [eventRow] = await db
      .insert(calendarEvents)
      .values({
        calendarId: calendar.id,
        providerEventId: created.id,
        title,
        description: description || undefined,
        location: location || undefined,
        start: localStart,
        end: localEnd,
        allDay,
        status: created.status,
        htmlLink: created.htmlLink,
        etag: created.etag,
        lastSyncedAt: new Date(),
      })
      .returning();

    await indexSearchDocument({
      contentType: "CALENDAR_EVENT",
      contentId: eventRow.id,
      title,
      body: [description, location].filter(Boolean).join(" "),
      visibility: "PRIVATE",
    });
  } catch (err) {
    return { ok: false, error: explainGoogleError(err) };
  }

  revalidatePath("/calendar");
  return { ok: true };
}

export async function updateCalendarEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const owner = await requireOwner();
  const event = await calendarQueries.getEventById(owner.id, id);
  if (!event) return { ok: false, error: "Event not found." };
  if (event.accessRole !== "owner" && event.accessRole !== "writer") {
    return { ok: false, error: "This calendar is read-only." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "");
  const description = String(formData.get("description") ?? "");
  if (!title) return { ok: false, error: "Title is required." };

  const { allDay, googleStart, googleEnd, localStart, localEnd } = buildEventTimes(formData);

  try {
    const accessToken = await calendarQueries.getValidAccessToken(event.connectionId);
    const updated = await updateGoogleEvent(
      accessToken,
      event.providerCalendarId,
      event.providerEventId,
      {
        summary: title,
        description: description || undefined,
        location: location || undefined,
        start: googleStart,
        end: googleEnd,
      },
    );

    await db
      .update(calendarEvents)
      .set({
        title,
        description: description || undefined,
        location: location || undefined,
        start: localStart,
        end: localEnd,
        allDay,
        status: updated.status,
        etag: updated.etag,
        lastSyncedAt: new Date(),
      })
      .where(eq(calendarEvents.id, id));

    await indexSearchDocument({
      contentType: "CALENDAR_EVENT",
      contentId: id,
      title,
      body: [description, location].filter(Boolean).join(" "),
      visibility: "PRIVATE",
    });
  } catch (err) {
    return { ok: false, error: explainGoogleError(err) };
  }

  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteCalendarEvent(id: string) {
  const owner = await requireOwner();
  const event = await calendarQueries.getEventById(owner.id, id);
  if (!event) return;
  if (event.accessRole !== "owner" && event.accessRole !== "writer") {
    throw new Error("This calendar is read-only.");
  }

  const accessToken = await calendarQueries.getValidAccessToken(event.connectionId);
  await deleteGoogleEvent(accessToken, event.providerCalendarId, event.providerEventId);
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  await removeSearchDocument("CALENDAR_EVENT", id);

  revalidatePath("/calendar");
}

// Only showWeekends is wired to anything today. Time zone isn't stored as a
// preference at all — every render uses the viewer's actual browser time
// zone (Intl/Date on the client), which is more correct than a manual
// setting anyway. "Hide declined events" is deferred: it needs to compare
// attendee response status against each connection's own email, which
// isn't plumbed through the sync/query layer yet.
export async function setCalendarPreferences(formData: FormData) {
  const owner = await requireOwner();
  const showWeekends = formData.get("showWeekends") === "1";
  await setAppSetting(owner.id, "showWeekends", showWeekends ? "1" : "0");
  revalidatePath("/calendar");
  revalidatePath("/settings");
}
