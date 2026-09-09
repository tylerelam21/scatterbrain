import { NextResponse, type NextRequest } from "next/server";
import { listProjectsWithRepo, setGithubLastPushedAt } from "@/lib/db/queries/work";
import { getRepoLastPushedAt } from "@/lib/github/client";

// Vercel Cron (see vercel.json) hits this on a schedule with no session —
// authenticated the same way as sync-calendars, via CRON_SECRET. Keeps
// each project's githubLastPushedAt fresh so the homepage's "Lately"
// signal reflects real coding activity, not just site edits, without
// ever calling GitHub from a page render (unauthenticated calls are
// capped at 60/hr — fine for a scheduled job, not for live traffic).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withRepo = await listProjectsWithRepo();

  const results = await Promise.allSettled(
    withRepo.map(async (project) => {
      const pushedAt = await getRepoLastPushedAt(project.repositoryUrl!);
      await setGithubLastPushedAt(project.id, pushedAt);
    }),
  );

  const failed = results
    .map((result, i) => ({ result, project: withRepo[i] }))
    .filter(({ result }) => result.status === "rejected");

  for (const { result, project } of failed) {
    const reason = result.status === "rejected" ? result.reason : undefined;
    console.error(`[cron/sync-github] project ${project.id} failed:`, reason);
  }

  return NextResponse.json({
    synced: results.length - failed.length,
    failed: failed.length,
    total: withRepo.length,
  });
}
