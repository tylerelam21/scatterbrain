import { requireOwner } from "@/lib/auth/require-owner";
import { listCalendarConnections, listCalendarsForUser } from "@/lib/db/queries/calendar";
import { getAppSettings } from "@/lib/db/queries/settings";
import {
  connectGoogleCalendar,
  setCalendarPreferences,
  setDefaultCalendar,
} from "@/server/actions/calendar";
import { setSiteContent } from "@/server/actions/site";
import { SITE_CONTENT_KEYS } from "@/lib/site/content-keys";
import { DisconnectCalendarForm } from "@/components/calendar/disconnect-calendar-form";

interface SettingsPageProps {
  searchParams: Promise<{ calendar_connected?: string; calendar_error?: string }>;
}

const CALENDAR_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Google sign-in was cancelled.",
  invalid_state: "That connection attempt expired or was invalid. Try again.",
  exchange_failed: "Couldn't complete the connection. Try again.",
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const owner = await requireOwner();
  const params = await searchParams;

  const [connections, calendars, settings, siteContent] = await Promise.all([
    listCalendarConnections(owner.id),
    listCalendarsForUser(owner.id),
    getAppSettings(owner.id, ["defaultCalendarId", "showWeekends"]),
    getAppSettings(owner.id, [...SITE_CONTENT_KEYS]),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="font-display text-2xl tracking-tight text-ink">Settings</h1>

      {params.calendar_connected && (
        <p className="mt-4 text-sm text-accent">Calendar connected.</p>
      )}
      {params.calendar_error && (
        <p className="mt-4 text-sm text-accent">
          {CALENDAR_ERROR_MESSAGES[params.calendar_error] ?? "Something went wrong connecting Google Calendar."}
        </p>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Calendar connections</h2>
          <form action={connectGoogleCalendar}>
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
            >
              Connect Google account
            </button>
          </form>
        </div>

        {connections.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No calendars connected yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {connections.map((connection) => (
              <li key={connection.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-ink">{connection.email}</p>
                  <p className="text-xs text-muted">
                    {connection.status}
                    {connection.lastSyncedAt &&
                      ` · synced ${new Date(connection.lastSyncedAt).toLocaleString()}`}
                  </p>
                </div>
                <DisconnectCalendarForm id={connection.id} email={connection.email} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {calendars.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-ink">Default calendar</h2>
          <p className="mt-1 text-xs text-muted">Used when creating a new event from Home or the calendar grid.</p>
          <form action={setDefaultCalendar} className="mt-3 flex items-center gap-3">
            <select
              name="calendarId"
              defaultValue={settings.defaultCalendarId ?? ""}
              className="border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
            >
              {calendars
                .filter((c) => c.accessRole === "owner" || c.accessRole === "writer")
                .map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name} ({calendar.connectionEmail})
                  </option>
                ))}
            </select>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
            >
              Save
            </button>
          </form>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink">Preferences</h2>
        <form action={setCalendarPreferences} className="mt-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="showWeekends"
              value="1"
              defaultChecked={settings.showWeekends !== "0"}
            />
            Show weekends in week view
          </label>
          <button
            type="submit"
            className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
          >
            Save
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink">Homepage</h2>
        <p className="mt-1 text-xs text-muted">
          Text shown on the public homepage. Leave a field blank to hide that bit entirely rather
          than show a placeholder.
        </p>
        <form action={setSiteContent} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs text-muted">Sticky note quote</span>
            <input
              type="text"
              name="home.stickyNote"
              defaultValue={siteContent["home.stickyNote"] ?? ""}
              placeholder="A short line, pinned next to your name"
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">About annotation</span>
            <input
              type="text"
              name="home.aboutAnnotation"
              defaultValue={siteContent["home.aboutAnnotation"] ?? ""}
              placeholder="A small handwritten note next to the About spread"
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">About tagline</span>
            <input
              type="text"
              name="home.aboutTagline"
              defaultValue={siteContent["home.aboutTagline"] ?? ""}
              placeholder="The long way here."
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">About body</span>
            <textarea
              name="home.aboutBody"
              rows={3}
              defaultValue={siteContent["home.aboutBody"] ?? ""}
              placeholder="Alpharetta → Athens → Atlanta. A story about where I came from, what I care about, and why I make things."
              className="mt-1 w-full resize-none border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Footer bio line</span>
            <input
              type="text"
              name="home.footerBio"
              defaultValue={siteContent["home.footerBio"] ?? ""}
              placeholder="A sentence under 'Currently in Atlanta, Georgia.'"
              className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs text-muted">Email</span>
              <input
                type="email"
                name="home.email"
                defaultValue={siteContent["home.email"] ?? ""}
                placeholder="you@example.com"
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">LinkedIn URL</span>
              <input
                type="url"
                name="home.linkedin"
                defaultValue={siteContent["home.linkedin"] ?? ""}
                placeholder="https://linkedin.com/in/…"
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">GitHub URL</span>
              <input
                type="url"
                name="home.github"
                defaultValue={siteContent["home.github"] ?? ""}
                placeholder="https://github.com/…"
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
          >
            Save
          </button>
        </form>
      </section>
    </main>
  );
}
