"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  setGithubUsername,
  listImportableGithubRepos,
  importGithubRepos,
  type ImportableGithubRepo,
} from "@/server/actions/work";

// Owner-only. Scans the given GitHub account's public repos (unauthenticated
// GitHub REST call, same client the sync-github cron already uses) and
// lets the owner pick which ones to bring in as private draft projects —
// nothing publishes automatically.
export function GithubImportPanel({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [repos, setRepos] = useState<ImportableGithubRepo[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "scanning" | "importing">("idle");
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setStatus("scanning");
    setError(null);
    const result = await listImportableGithubRepos();
    if (!result.ok) {
      setError("Add your GitHub username below, then scan.");
      setRepos(null);
    } else {
      setRepos(result.repos);
      setSelected(new Set());
    }
    setStatus("idle");
  }

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function doImport() {
    setStatus("importing");
    await importGithubRepos([...selected]);
    setRepos((prev) => prev?.filter((repo) => !selected.has(repo.htmlUrl)) ?? null);
    setSelected(new Set());
    setStatus("idle");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (username) scan();
        }}
        className="rounded-full border border-border px-4 py-1.5 text-xs text-muted hover:text-ink"
      >
        Import from GitHub
      </button>
    );
  }

  return (
    <div className="mt-6 w-full border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-wide text-muted uppercase">Import from GitHub</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-ink">
          Close
        </button>
      </div>

      <form
        action={async (formData) => {
          await setGithubUsername(formData);
          const next = String(formData.get("githubUsername") ?? "").trim();
          setUsername(next);
          if (next) scan();
        }}
        className="mt-3 flex flex-wrap items-end gap-3"
      >
        <label className="min-w-0 flex-1 basis-40">
          <span className="text-xs text-muted">GitHub username</span>
          <input
            type="text"
            name="githubUsername"
            defaultValue={username}
            placeholder="octocat"
            className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink"
        >
          Save
        </button>
        <button
          type="button"
          onClick={scan}
          disabled={!username || status === "scanning"}
          className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink disabled:opacity-40"
        >
          {status === "scanning" ? "Scanning…" : "Scan"}
        </button>
      </form>

      {error && <p className="mt-3 text-xs text-accent">{error}</p>}

      {repos &&
        (repos.length === 0 ? (
          <p className="mt-4 text-xs text-muted">No new repos found — everything&rsquo;s already imported.</p>
        ) : (
          <>
            <ul className="mt-4 max-h-80 divide-y divide-border overflow-y-auto">
              {repos.map((repo) => (
                <li key={repo.htmlUrl} className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(repo.htmlUrl)}
                    onChange={() => toggle(repo.htmlUrl)}
                    className="mt-1"
                  />
                  <button type="button" onClick={() => toggle(repo.htmlUrl)} className="min-w-0 flex-1 text-left">
                    <p className="text-sm text-ink">{repo.name}</p>
                    {repo.description && <p className="text-xs text-muted">{repo.description}</p>}
                    <p className="mt-0.5 text-[11px] text-muted">
                      {[repo.language, repo.stargazersCount > 0 ? `★ ${repo.stargazersCount}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={doImport}
              disabled={selected.size === 0 || status === "importing"}
              className="mt-3 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent disabled:opacity-40"
            >
              {status === "importing" ? "Importing…" : `Import ${selected.size || ""} selected`.trim()}
            </button>
            <p className="mt-2 text-[11px] text-muted">
              Imported as private drafts — review and publish each one from its own page.
            </p>
          </>
        ))}
    </div>
  );
}
