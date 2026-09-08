"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { CalendarRow } from "@/lib/calendar/types";
import { setCalendarColor, setCalendarEnabled, syncCalendarConnectionNow } from "@/server/actions/calendar";
import { calendarColorFor } from "@/lib/calendar/colors";

export function CalendarSidebar({ calendars }: { calendars: CalendarRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const connections = new Map<string, string>();
  for (const calendar of calendars) {
    connections.set(calendar.connectionId, calendar.connectionEmail);
  }

  if (calendars.length === 0) {
    return (
      <aside className="w-56 shrink-0">
        <p className="text-sm text-muted">No calendars connected.</p>
        <Link href="/settings" className="mt-2 inline-block text-xs text-accent hover:underline">
          Connect Google Calendar
        </Link>
      </aside>
    );
  }

  return (
    <aside className="w-56 shrink-0 space-y-6">
      <div>
        <h2 className="text-xs font-medium text-muted">Calendars</h2>
        <ul className="mt-2 space-y-2">
          {calendars.map((calendar) => (
            <li key={calendar.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={calendar.enabled}
                disabled={isPending}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  startTransition(async () => {
                    await setCalendarEnabled(calendar.id, enabled);
                    router.refresh();
                  });
                }}
              />
              <input
                type="color"
                value={calendarColorFor({
                  name: calendar.name,
                  customColor: calendar.customColor,
                  providerColor: calendar.providerColor,
                })}
                disabled={isPending}
                onChange={(event) => {
                  const color = event.target.value;
                  startTransition(async () => {
                    await setCalendarColor(calendar.id, color);
                    router.refresh();
                  });
                }}
                className="h-4 w-4 shrink-0 cursor-pointer border-none bg-transparent p-0"
              />
              <span className="truncate text-sm text-ink" title={calendar.connectionEmail}>
                {calendar.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1.5">
        {Array.from(connections.entries()).map(([connectionId, email]) => (
          <button
            key={connectionId}
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await syncCalendarConnectionNow(connectionId);
                router.refresh();
              })
            }
            className="block text-xs text-muted hover:text-ink"
          >
            Sync {email} now
          </button>
        ))}
        <Link href="/settings" className="block text-xs text-muted hover:text-ink">
          Manage connections
        </Link>
      </div>
    </aside>
  );
}
