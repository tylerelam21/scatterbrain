import Link from "next/link";
import { requireOwner } from "@/lib/auth/require-owner";
import { listBrainItems } from "@/lib/db/queries/brain";
import { listJournalEntries } from "@/lib/db/queries/journal";
import { listAllProjects } from "@/lib/db/queries/work";
import { listTagsForUser } from "@/lib/db/queries/tags";
import { BRAIN_ITEM_TYPES } from "@/lib/brain/constants";
import { JOURNAL_STATUSES } from "@/lib/journal/constants";
import { createJournalEntry } from "@/server/actions/journal";
import { createProject } from "@/server/actions/work";
import { QuickCapture } from "@/components/brain/quick-capture";
import { ProjectCard } from "@/components/work/project-card";

type StudioTab = "feed" | "journal" | "projects";

interface StudioPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    type?: string;
    tag?: string;
    pinned?: string;
    archived?: string;
    status?: string;
  }>;
}

const TABS: { key: StudioTab; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "journal", label: "Journal" },
  { key: "projects", label: "Projects" },
];

// Ideas, Journal, and Work/Lab consolidated into one creative space: a raw
// feed for whatever gets dropped in from Quick Capture, a proper journal
// for actual writing, and the projects underway — three views on the same
// desk rather than three separate rooms. Each tab still calls the same
// queries and server actions those standalone pages always did.
export default async function StudioPage({ searchParams }: StudioPageProps) {
  const owner = await requireOwner();
  const params = await searchParams;
  const tab: StudioTab =
    params.tab === "journal" ? "journal" : params.tab === "projects" ? "projects" : "feed";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-2xl tracking-tight text-ink">Studio</h1>
      <p className="mt-1 text-sm text-muted">Raw notes, real entries, and whatever&rsquo;s in progress.</p>

      <nav className="mt-8 flex gap-6 border-b border-border text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/studio?tab=${t.key}`}
            className={`-mb-px border-b-2 pb-3 transition-colors ${
              tab === t.key ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "feed" && <FeedTab ownerId={owner.id} params={params} />}
      {tab === "journal" && <JournalTab ownerId={owner.id} params={params} />}
      {tab === "projects" && <ProjectsTab />}
    </main>
  );
}

async function FeedTab({
  ownerId,
  params,
}: {
  ownerId: string;
  params: { q?: string; type?: string; tag?: string; pinned?: string; archived?: string };
}) {
  const type = BRAIN_ITEM_TYPES.find((t) => t === params.type);
  const [items, allTags] = await Promise.all([
    listBrainItems(ownerId, {
      q: params.q,
      type,
      tag: params.tag || undefined,
      pinnedOnly: params.pinned === "1",
      includeArchived: params.archived === "1",
    }),
    listTagsForUser(ownerId),
  ]);

  return (
    <div className="mt-8">
      <QuickCapture />

      <form className="mt-10 flex flex-wrap items-end gap-3 text-sm" method="get">
        <input type="hidden" name="tab" value="feed" />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Search</span>
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            className="w-48 border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Type</span>
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {BRAIN_ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Tag</span>
          <select
            name="tag"
            defaultValue={params.tag ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 pb-1.5">
          <input type="checkbox" name="pinned" value="1" defaultChecked={params.pinned === "1"} />
          <span className="text-muted">Pinned only</span>
        </label>
        <label className="flex items-center gap-1.5 pb-1.5">
          <input type="checkbox" name="archived" value="1" defaultChecked={params.archived === "1"} />
          <span className="text-muted">Include archived</span>
        </label>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
        >
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <Link href={`/brain/${item.id}`} className="block">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-ink">{item.title || item.content}</p>
                  <span className="shrink-0 text-xs text-muted">{item.type}</span>
                </div>
                {item.title && <p className="mt-1 truncate text-sm text-muted">{item.content}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function JournalTab({
  ownerId,
  params,
}: {
  ownerId: string;
  params: { q?: string; tag?: string; status?: string };
}) {
  const status = JOURNAL_STATUSES.find((s) => s === params.status);
  const [entries, allTags] = await Promise.all([
    listJournalEntries(ownerId, { q: params.q, tag: params.tag || undefined, status }),
    listTagsForUser(ownerId),
  ]);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
        <form action={createJournalEntry}>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
          >
            New entry
          </button>
        </form>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3 text-sm" method="get">
        <input type="hidden" name="tab" value="journal" />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Search</span>
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            className="w-48 border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Tag</span>
          <select
            name="tag"
            defaultValue={params.tag ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Status</span>
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="border-b border-border bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {JOURNAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
        >
          Filter
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No entries yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.id} className="py-4">
              <Link href={`/journal/${entry.id}`} className="block">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-ink">{entry.title || "Untitled"}</p>
                  <span className="shrink-0 text-xs text-muted">{entry.journalDate}</span>
                </div>
                {entry.plainText && <p className="mt-1 truncate text-sm text-muted">{entry.plainText}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function ProjectsTab() {
  const projects = await listAllProjects({ publicOnly: false });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        <div className="flex gap-2">
          <form action={createProject.bind(null, false)}>
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-accent"
            >
              New project
            </button>
          </form>
          <form action={createProject.bind(null, true)}>
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              New experiment
            </button>
          </form>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing started yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-border">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              title={project.title}
              tagline={project.tagline}
              status={project.status}
              featured={project.featured}
              visibility={project.visibility}
              isOwner
              isLab={project.isLab}
            />
          ))}
        </div>
      )}
    </div>
  );
}
