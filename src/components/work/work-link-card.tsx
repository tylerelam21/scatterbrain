"use client";

import { useState } from "react";
import { buildEmbedUrl, detectWorkLinkType, hostnameOf, linkTypeLabel } from "@/lib/work/link-preview";

// A compact bookmark bar that expands into a live embed for Sheets/Slides/
// PowerPoint links (Google's and Microsoft's own iframe viewers — no API
// keys), or just stays a plain external link for anything else.
export function WorkLinkCard({ url, label }: { url: string; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const type = detectWorkLinkType(url);
  const embedUrl = buildEmbedUrl(url, type);

  return (
    <div className="mt-2 overflow-hidden rounded border border-border">
      <div className="flex items-center justify-between gap-3 bg-border/40 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          disabled={!embedUrl}
          className="flex min-w-0 items-center gap-2 text-left text-sm text-ink disabled:cursor-default"
        >
          {embedUrl && (
            <span aria-hidden className="text-xs text-muted">
              {expanded ? "▾" : "▸"}
            </span>
          )}
          <span className="truncate">
            {linkTypeLabel(type)} · {hostnameOf(url)}
          </span>
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-muted transition-colors hover:text-accent"
        >
          Open ↗
        </a>
      </div>
      {expanded && embedUrl && (
        <iframe src={embedUrl} title={label} loading="lazy" className="h-[420px] w-full border-0" />
      )}
    </div>
  );
}
