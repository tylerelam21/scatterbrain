"use client";

import { useState } from "react";
import { buildEmbedUrl, detectWorkLinkType, linkTypeLabel } from "@/lib/work/link-preview";

// A little sticky note tacked to the "Other Links" corkboard — same paper,
// shadow, and Kalam handwriting as Home's Quick Capture, so a link reads
// as part of the same workshop-wall language as the pegboard above it.
// Clicking the note itself expands a live embed below it (Google's and
// Microsoft's own iframe viewers) for Sheets/Slides/PowerPoint links;
// "Open" always jumps straight to the real file.
export function WorkLinkNote({
  url,
  label,
  rotation,
}: {
  url: string;
  label: string;
  rotation: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const type = detectWorkLinkType(url);
  const embedUrl = buildEmbedUrl(url, type);

  return (
    <div className="w-44">
      <div
        role={embedUrl ? "button" : undefined}
        tabIndex={embedUrl ? 0 : undefined}
        onClick={() => embedUrl && setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (embedUrl && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className={`relative px-4 pt-5 pb-3.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 ${embedUrl ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: "#f3dd8f",
          color: "#3a2f10",
          boxShadow: "var(--note-shadow)",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <span
          aria-hidden
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #e8564f, #b5342e 70%)",
            boxShadow: "0 2px 3px rgba(0,0,0,0.35)",
          }}
        />
        <span className="block text-[9px] tracking-wide uppercase opacity-55">{linkTypeLabel(type)}</span>
        <span className="font-hand mt-1 block text-lg leading-snug break-words">{label}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 block text-[11px] opacity-60 hover:opacity-100"
        >
          Open ↗
        </a>
      </div>
      {expanded && embedUrl && (
        <div className="mt-2 overflow-hidden rounded border border-border">
          <iframe src={embedUrl} title={label} loading="lazy" className="h-[360px] w-full border-0" />
        </div>
      )}
    </div>
  );
}
