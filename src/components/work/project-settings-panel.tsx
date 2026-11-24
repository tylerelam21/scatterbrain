"use client";

import { useRef, useState, useTransition } from "react";
import { PROJECT_STATUSES } from "@/lib/work/constants";
import { VISIBILITY_OPTIONS } from "@/lib/content/visibility";
import { updateProjectMetaField, type ProjectMetaField } from "@/server/actions/work";
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
//
// Every field here saves itself the moment it changes (select/checkbox
// onChange, text input onBlur) with a visible "Saving…"/"Saved" status —
// there used to be one shared "Save" button for all six fields, which
// made it unclear whether a click had actually done anything, and which
// field it had saved.
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
  const [values, setValues] = useState({
    status,
    visibility,
    featured,
    sortOrder: String(sortOrder),
    repositoryUrl: repositoryUrl ?? "",
    liveUrl: liveUrl ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const clearSavedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function save(field: ProjectMetaField, value: string) {
    startTransition(async () => {
      await updateProjectMetaField(id, slug, field, value);
      setSaveStatus("saved");
      if (clearSavedRef.current) clearTimeout(clearSavedRef.current);
      clearSavedRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
    });
  }

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

          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-xs tracking-wide text-muted uppercase">Project settings</h4>
            <span className="shrink-0 text-xs text-muted">
              {isPending ? "Saving…" : saveStatus === "saved" ? "Saved" : ""}
            </span>
          </div>

          <div className="mt-3 space-y-4">
            <label className="block">
              <span className="text-xs text-muted">Status</span>
              <select
                value={values.status}
                onChange={(event) => {
                  const next = event.target.value;
                  setValues((v) => ({ ...v, status: next }));
                  save("status", next);
                }}
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
                value={values.visibility}
                onChange={(event) => {
                  const next = event.target.value;
                  setValues((v) => ({ ...v, visibility: next }));
                  save("visibility", next);
                }}
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
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(event) => {
                  const next = event.target.checked;
                  setValues((v) => ({ ...v, featured: next }));
                  save("featured", next ? "1" : "0");
                }}
              />
              <span className="text-xs text-muted">Featured</span>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Order</span>
              <input
                type="number"
                value={values.sortOrder}
                onChange={(event) => setValues((v) => ({ ...v, sortOrder: event.target.value }))}
                onBlur={(event) => save("sortOrder", event.target.value)}
                className="mt-1 w-20 border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Repository URL</span>
              <input
                type="url"
                value={values.repositoryUrl}
                onChange={(event) => setValues((v) => ({ ...v, repositoryUrl: event.target.value }))}
                onBlur={(event) => save("repositoryUrl", event.target.value)}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Live URL</span>
              <input
                type="url"
                value={values.liveUrl}
                onChange={(event) => setValues((v) => ({ ...v, liveUrl: event.target.value }))}
                onBlur={(event) => save("liveUrl", event.target.value)}
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-sm text-ink focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end border-t border-border pt-4">
            <DeleteProjectForm id={id} isLab={isLab} />
          </div>
        </div>
      )}
    </div>
  );
}
