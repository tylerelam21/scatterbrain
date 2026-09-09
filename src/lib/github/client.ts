const GITHUB_API_BASE = "https://api.github.com";

// Matches github.com/owner/repo, with or without a leading protocol/www,
// an optional trailing slash, ".git", or path segments (tree/blob/etc).
const GITHUB_REPO_URL_PATTERN = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?(?:\/.*)?$/i;

export function parseGithubRepo(repositoryUrl: string): { owner: string; repo: string } | null {
  const match = GITHUB_REPO_URL_PATTERN.exec(repositoryUrl.trim());
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// Public, unauthenticated GitHub REST call — a repo's own `pushed_at` is
// exactly "when was code last pushed here," no need to page through
// commits for it. Unauthenticated requests are capped at 60/hr total,
// which is plenty for a cron hitting a handful of repos on a schedule
// (never called from a page render). GITHUB_TOKEN is optional — set it
// later if the repo list grows enough to need a higher rate limit.
export async function getRepoLastPushedAt(repositoryUrl: string): Promise<Date | null> {
  const parsed = parseGithubRepo(repositoryUrl);
  if (!parsed) return null;

  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}`, { headers });
  if (!res.ok) return null;

  const data: { pushed_at?: string } = await res.json();
  return data.pushed_at ? new Date(data.pushed_at) : null;
}
