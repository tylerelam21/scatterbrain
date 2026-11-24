export interface LinkPreview {
  title: string | null;
  imageUrl: string | null;
}

const FETCH_TIMEOUT_MS = 5000;
// Enough to reach </head> on the vast majority of real pages without
// pulling down a whole article body just to read two meta tags.
const MAX_BYTES = 300_000;

function extractMetaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Reads just enough of a page to pull its Open Graph / Twitter Card title
// and image — no API key, and it works for far more than news articles:
// IMDb, Letterboxd, Goodreads, and most blogs all set these tags, so
// pasting almost any link gets a real cover/poster/thumbnail for free.
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { title: null, imageUrl: null };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { title: null, imageUrl: null };
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; scatterbrain-link-preview/1.0)" },
    });
  } catch {
    return { title: null, imageUrl: null };
  }
  if (!response.ok || !response.body) return { title: null, imageUrl: null };

  let html = "";
  const reader = response.body.getReader();
  try {
    while (html.length < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += Buffer.from(value).toString("utf-8");
      if (/<\/head>/i.test(html)) break;
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  const title = extractMetaContent(html, "og:title") ?? extractMetaContent(html, "twitter:title");
  const rawImage = extractMetaContent(html, "og:image") ?? extractMetaContent(html, "twitter:image");

  let imageUrl: string | null = null;
  if (rawImage) {
    try {
      imageUrl = new URL(rawImage, url).toString();
    } catch {
      imageUrl = null;
    }
  }

  return { title, imageUrl };
}
