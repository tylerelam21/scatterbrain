import { NextResponse, type NextRequest } from "next/server";
import { listAllCalendarConnections, syncCalendarConnection } from "@/lib/db/queries/calendar";

// Vercel Cron (see vercel.json) hits this on a schedule with no session —
// it authenticates itself via the CRON_SECRET the platform signs requests
// with, not a login. Refreshes every connected calendar so events (all-day
// ones especially — see dates.ts) don't go stale until someone happens to
// hit "Sync now."
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await listAllCalendarConnections();

  const results = await Promise.allSettled(
    connections.map((connection) => syncCalendarConnection(connection.id)),
  );

  const failed = results
    .map((result, i) => ({ result, connection: connections[i] }))
    .filter(({ result }) => result.status === "rejected");

  for (const { result, connection } of failed) {
    const reason = result.status === "rejected" ? result.reason : undefined;
    console.error(`[cron/sync-calendars] connection ${connection.id} failed:`, reason);
  }

  return NextResponse.json({
    synced: results.length - failed.length,
    failed: failed.length,
    total: connections.length,
  });
}
