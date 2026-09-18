"use client";

import { useState } from "react";
import { PROJECT_STATUSES } from "@/lib/work/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { updateProjectMeta } from "@/server/actions/work";
import { SlugForm } from "./slug-form";
import { DeleteProjectForm } from "./delete-project-form";

interface ProjectSettingsPanelProps {
  id: string;
  slug: string;
  isLab: boolean;
  status: string;
  visibility: string;
  featured: boolean;
  sortOrder: number;
  repositoryUrl: string | null;
  liveUrl: string | null;
}

// Everything that isn't part of the case-study's actual content — status,
// visibility, featured, order, links, slug, delete — tucked behind one
// toggle instead of sitting at the top of the page. The content itself
// (title/tagline/summary/cover/body/stack) is edited directly in place on
// the styled page, not here.
export function ProjectSettingsPanel({
  id,
  slug,
  isLab,
  status,
  visibility,
  featured,
  sortOrder,
  repositoryUrl,
  liveUrl,
}: ProjectSettingsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-ink"
      >
        {open ? "Close settings" : "Settings"}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-80 rounded-lg border border-border bg-paper p-5 shadow-lg">
          <SlugForm id={id} slug={slug} />

          <form action={updateProjectMeta.bind(null, id, slug)} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs text-muted">Status</span>
              <select
                name="status"
                defaultValue={status}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Visibility</span>
              <select
                name="visibility"
                defaultValue={visibility}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              >
                {VISIBILITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" value="1" defaultChecked={featured} />
              <span className="text-xs text-muted">Featured</span>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Order</span>
              <input
                type="number"
                name="sortOrder"
                defaultValue={sortOrder}
                className="mt-1 w-20 border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Repository URL</span>
              <input
                type="url"
                name="repositoryUrl"
                defaultValue={repositoryUrl ?? ""}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Live URL</span>
              <input
                type="url"
                name="liveUrl"
                defaultValue={liveUrl ?? ""}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full border border-border py-1.5 text-xs text-muted hover:text-ink"
            >
              Save
            </button>
          </form>

          <div className="mt-5 flex justify-end border-t border-border pt-4">
            <DeleteProjectForm id={id} isLab={isLab} />
          </div>
        </div>
      )}
    </div>
  );
}
