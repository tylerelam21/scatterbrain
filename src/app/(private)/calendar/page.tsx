import { requireOwner } from "@/lib/auth/require-owner";
import { listCalendarsForUser, listEventsInRange } from "@/lib/db/queries/calendar";
import { getAppSettings } from "@/lib/db/queries/settings";
import {
  addDays,
  defaultEventEnd,
  endOfMonth,
  nowDate,
  parseDateParam,
  startOfMonth,
  startOfWeek,
  toDateParam,
} from "@/lib/calendar/dates";
import { CalendarNav } from "@/components/calendar/calendar-nav";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";
import { TimeGridView } from "@/components/calendar/time-grid-view";
import { MonthView } from "@/components/calendar/month-view";
import { EventModal } from "@/components/calendar/event-modal";
import { EventForm } from "@/components/calendar/event-form";

interface CalendarPageProps {
  searchParams: Promise<{
    view?: string;
    date?: string;
    create?: string;
    event?: string;
    calendarId?: string;
    startAt?: string;
    endAt?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const owner = await requireOwner();
  const params = await searchParams;

  const view = params.view === "month" || params.view === "day" ? params.view : "week";
  const anchor = parseDateParam(params.date);

  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === "day") {
    rangeStart = new Date(anchor);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = addDays(rangeStart, 1);
  } else if (view === "month") {
    rangeStart = startOfWeek(startOfMonth(anchor));
    rangeEnd = addDays(startOfWeek(endOfMonth(anchor)), 7);
  } else {
    rangeStart = startOfWeek(anchor);
    rangeEnd = addDays(rangeStart, 7);
  }

  const [calendars, events, settings] = await Promise.all([
    listCalendarsForUser(owner.id),
    listEventsInRange(owner.id, rangeStart, rangeEnd),
    getAppSettings(owner.id, ["defaultCalendarId", "showWeekends"]),
  ]);

  const showWeekends = settings.showWeekends !== "0";
  const defaultCalendarId =
    settings.defaultCalendarId ?? calendars.find((c) => c.isPrimary)?.id ?? calendars[0]?.id ?? null;

  const weekStart = startOfWeek(anchor);
  const days = showWeekends
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : Array.from({ length: 5 }, (_, i) => addDays(weekStart, i + 1));

  const closeHref = `/calendar?view=${view}&date=${toDateParam(anchor)}`;
  const showCreateModal = params.create === "1";
  const editingEvent = params.event ? events.find((e) => e.id === params.event) : undefined;
  const createStart = params.startAt ? new Date(params.startAt) : nowDate();
  const createEnd = params.endAt ? new Date(params.endAt) : defaultEventEnd(createStart);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <CalendarNav view={view} anchor={anchor} />

      <div className="mt-6 flex gap-8">
        <CalendarSidebar calendars={calendars} />

        <div className="min-w-0 flex-1">
          {view === "month" ? (
            <MonthView monthAnchor={anchor} events={events} />
          ) : (
            <TimeGridView
              days={view === "day" ? [anchor] : days}
              events={events}
              view={view}
              defaultCalendarId={defaultCalendarId}
            />
          )}
        </div>
      </div>

      {showCreateModal && (
        <EventModal closeHref={closeHref}>
          <EventForm
            mode="create"
            calendars={calendars}
            closeHref={closeHref}
            initialCalendarId={params.calendarId ?? defaultCalendarId ?? undefined}
            initialStart={createStart}
            initialEnd={createEnd}
          />
        </EventModal>
      )}

      {editingEvent && (
        <EventModal closeHref={closeHref}>
          <EventForm
            mode="edit"
            calendars={calendars}
            closeHref={closeHref}
            initialStart={editingEvent.start}
            initialEnd={editingEvent.end}
            event={editingEvent}
          />
        </EventModal>
      )}
    </main>
  );
}
