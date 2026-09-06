"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  type EventFormState,
} from "@/server/actions/calendar";
import type { CalendarEventRow, CalendarRow } from "@/lib/calendar/types";

const initialState: EventFormState = { ok: false };

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function combineLocal(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0);
}

interface EventFormProps {
  mode: "create" | "edit";
  calendars: CalendarRow[];
  closeHref: string;
  initialCalendarId?: string;
  initialStart: Date;
  initialEnd: Date;
  event?: CalendarEventRow;
}

export function EventForm({
  mode,
  calendars,
  closeHref,
  initialCalendarId,
  initialStart,
  initialEnd,
  event,
}: EventFormProps) {
  const router = useRouter();
  const action =
    mode === "edit" && event
      ? updateCalendarEvent.bind(null, event.id)
      : createCalendarEvent;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [date, setDate] = useState(toDateInputValue(initialStart));
  const [startTime, setStartTime] = useState(toTimeInputValue(initialStart));
  const [endTime, setEndTime] = useState(toTimeInputValue(initialEnd));

  useEffect(() => {
    if (state.ok) router.push(closeHref);
  }, [state.ok, router, closeHref]);

  const startAt = combineLocal(date, startTime).toISOString();
  const endAt = combineLocal(date, endTime).toISOString();

  const writableCalendars = calendars.filter(
    (c) => c.accessRole === "owner" || c.accessRole === "writer",
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <h2 className="font-display text-xl text-ink">
        {mode === "create" ? "New event" : "Edit event"}
      </h2>

      <label className="block">
        <span className="text-xs text-muted">Title</span>
        <input
          type="text"
          name="title"
          required
          defaultValue={event?.title}
          className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
        />
      </label>

      {mode === "create" ? (
        <label className="block">
          <span className="text-xs text-muted">Calendar</span>
          <select
            name="calendarId"
            defaultValue={initialCalendarId}
            className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
          >
            {writableCalendars.map((calendar) => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-xs text-muted">on {calendars.find((c) => c.id === event?.calendarId)?.name}</p>
      )}

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
        />
        All day
      </label>
      <input type="hidden" name="allDay" value={allDay ? "1" : "0"} />

      {allDay ? (
        <label className="block">
          <span className="text-xs text-muted">Date</span>
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>
      ) : (
        <div className="flex gap-4">
          <label className="flex-1">
            <span className="text-xs text-muted">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
            />
          </label>
          <label>
            <span className="text-xs text-muted">Start</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
            />
          </label>
          <label>
            <span className="text-xs text-muted">End</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
            />
          </label>
        </div>
      )}
      <input type="hidden" name="startAt" value={startAt} />
      <input type="hidden" name="endAt" value={endAt} />

      <label className="block">
        <span className="text-xs text-muted">Location</span>
        <input
          type="text"
          name="location"
          defaultValue={event?.location ?? ""}
          className="mt-1 w-full border-b border-border bg-transparent py-1 text-ink focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-xs text-muted">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={event?.description ?? ""}
          className="mt-1 w-full resize-y border-b border-border bg-transparent py-1 text-ink focus:outline-none"
        />
      </label>

      {state.error && <p className="text-sm text-accent">{state.error}</p>}

      {event?.htmlLink && event.recurringEventId && (
        <p className="text-xs text-muted">
          This is part of a recurring series.{" "}
          <a href={event.htmlLink} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Edit the series in Google Calendar
          </a>
          .
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {mode === "edit" && event ? (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Delete this event? This can't be undone.")) return;
              await deleteCalendarEvent(event.id);
              router.push(closeHref);
            }}
            className="text-sm text-muted hover:text-accent"
          >
            Delete
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
