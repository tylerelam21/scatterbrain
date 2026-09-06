"use client";

import { disconnectCalendarConnection } from "@/server/actions/calendar";

export function DisconnectCalendarForm({ id, email }: { id: string; email: string }) {
  return (
    <form
      action={disconnectCalendarConnection.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm(`Disconnect ${email}? Its calendars and cached events will be removed.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-muted hover:text-accent">
        Disconnect
      </button>
    </form>
  );
}
