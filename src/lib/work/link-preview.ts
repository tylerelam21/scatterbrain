export type WorkLinkType = "google-sheet" | "google-slides" | "office" | "generic";

// PRD-adjacent (Studio/Work brainstorm) — no API keys, no scraping: these
// are all publicly documented embed viewers. Google's own iframe preview
// works for any sheet/deck the viewer has access to (they just need to be
// signed in to Google in that browser tab); Microsoft's Office Online
// viewer works for any publicly reachable .pptx URL, OneDrive/SharePoint
// share links included.
export function detectWorkLinkType(url: string): WorkLinkType {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return "generic";
  }

  if (host.includes("docs.google.com") && url.includes("/spreadsheets/")) return "google-sheet";
  if (host.includes("docs.google.com") && url.includes("/presentation/")) return "google-slides";
  if (
    /\.pptx?($|[?#])/i.test(url) ||
    host.includes("sharepoint.com") ||
    host.includes("1drv.ms") ||
    host.includes("onedrive.live.com")
  ) {
    return "office";
  }
  return "generic";
}

export function buildEmbedUrl(url: string, type: WorkLinkType): string | null {
  switch (type) {
    case "google-sheet": {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? `https://docs.google.com/spreadsheets/d/${match[1]}/preview` : null;
    }
    case "google-slides": {
      const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
      return match ? `https://docs.google.com/presentation/d/${match[1]}/embed?rm=minimal` : null;
    }
    case "office":
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    case "generic":
      return null;
  }
}

export function linkTypeLabel(type: WorkLinkType): string {
  switch (type) {
    case "google-sheet":
      return "Google Sheet";
    case "google-slides":
      return "Google Slides";
    case "office":
      return "Slide deck";
    case "generic":
      return "Link";
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
