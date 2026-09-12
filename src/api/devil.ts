/* ============================================================
   devil69porn.tv — adult video source (18+)
   - Video ids look like video_40394 and map to /video_40394/.
   - Listings and thumbnails go through the same-origin /devil
     proxy; the player itself is an iframe (/sys/yaho.php?...)
   ============================================================ */

const SITE = "https://www.devil69porn.tv";
const PROXY_PREFIX = "/devil";

export interface DevilVideoSummary {
  id: string;
  title: string;
  thumbUrl: string;
  sourceUrl: string;
}

export interface DevilCatalogPage {
  items: DevilVideoSummary[];
  hasNext: boolean;
  page: number;
}

export interface DevilVideo {
  id: string;
  title: string;
  embedUrl: string;
  tags: string[];
  sourceUrl: string;
}

function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/** Keep devil assets same-origin for the deployed site. */
export function devilAssetUrl(value: string) {
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value, SITE);
    if (url.origin === SITE) return `${PROXY_PREFIX}${url.pathname}${url.search}`;
  } catch {
    /* keep an unexpected URL unchanged */
  }
  return value;
}

const HTML_TTL = 60 * 1000;
const htmlCache = new Map<string, { html: string; expires: number }>();
const htmlInFlight = new Map<string, Promise<string>>();

async function getHtml(path: string): Promise<string> {
  const cached = htmlCache.get(path);
  if (cached && cached.expires > Date.now()) return cached.html;

  const pending = htmlInFlight.get(path);
  if (pending) return pending;

  const request = (async () => {
    try {
      const response = await fetch(`${PROXY_PREFIX}${path}`, { headers: { Accept: "text/html" } });
      if (!response.ok) throw new Error(`devil ${response.status}`);
      const html = await response.text();
      if (/Just a moment|Enable JavaScript and cookies to continue|cf-chl-/i.test(html)) {
        throw new Error("devil anti-bot challenge");
      }
      htmlCache.set(path, { html, expires: Date.now() + HTML_TTL });
      return html;
    } finally {
      htmlInFlight.delete(path);
    }
  })();
  htmlInFlight.set(path, request);
  return request;
}

function parseDocument(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

function parseCatalog(html: string): DevilVideoSummary[] {
  const doc = parseDocument(html);
  return Array.from(doc.querySelectorAll<HTMLDivElement>('div[id^="post-"]'))
    .map((card) => {
      const anchor = card.querySelector<HTMLAnchorElement>('a[href*="/video_"]');
      const match = anchor?.getAttribute("href")?.match(/\/video_(\d+)/);
      if (!match) return null;
      const id = `video_${match[1]}`;
      const title =
        cleanText(card.querySelector(".shockx-title a")?.textContent) ||
        cleanText(card.querySelector("img")?.getAttribute("alt")) ||
        `Video ${match[1]}`;
      const thumb = card.querySelector("img")?.getAttribute("src") ?? "";
      if (!thumb) return null;
      return {
        id,
        title,
        thumbUrl: devilAssetUrl(thumb),
        sourceUrl: `${SITE}/${id}/`,
      } satisfies DevilVideoSummary;
    })
    .filter((item): item is DevilVideoSummary => Boolean(item));
}

/** Read one listing page. Page 1 is the homepage; later pages use /page/N/. */
export async function fetchDevilCatalogPage(page = 1, query = ""): Promise<DevilCatalogPage> {
  const path = query
    ? `/?s=${encodeURIComponent(query)}`
    : page > 1
      ? `/page/${page}/`
      : "/";
  const items = parseCatalog(await getHtml(path));
  if (!items.length) throw new Error("devil catalog is empty");
  // Search results have no known depth, so pagination only applies to the main list.
  return { items, hasNext: !query && items.length >= 30, page };
}

export async function fetchDevilVideo(id: string): Promise<DevilVideo> {
  const html = await getHtml(`/${id}/`);
  const doc = parseDocument(html);
  const title = cleanText(doc.querySelector("h1")?.textContent) || id;

  const iframeSrc =
    html.match(/<div class="screen[^"]*"[^>]*>\s*<iframe[^>]+src=["']([^"']+)["']/i)?.[1] ??
    html.match(/<iframe[^>]+src=["']([^"']*(?:yaho|\bsys\b)[^"']*)["']/i)?.[1] ??
    "";
  if (!iframeSrc) throw new Error("devil player not found");

  // The wrapper page nests the real player (player.hlsbroadcast.com).
  // Embedding that player directly with an empty referrer passes the
  // source's own anti-hotlink check (it allows a missing referrer),
  // while our origin would be rejected.
  let embedUrl = devilAssetUrl(iframeSrc);
  try {
    const wrapperPath = iframeSrc.startsWith(SITE) ? iframeSrc.slice(SITE.length) : iframeSrc;
    const wrapperHtml = await getHtml(wrapperPath);
    const inner =
      wrapperHtml.match(/<iframe[^>]+src=["']([^"']*hlsbroadcast[^"']*)["']/i)?.[1] ??
      wrapperHtml.match(/<iframe[^>]+src=["'](https:\/\/[^"']+)["']/i)?.[1];
    if (inner) embedUrl = inner;
  } catch {
    /* keep the proxied wrapper as fallback */
  }

  const tags = [
    ...new Set(
      Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href*="/video_tag/"]'))
        .map((tag) => cleanText(tag.textContent))
        .filter(Boolean)
    ),
  ].slice(0, 8);

  return {
    id,
    title,
    embedUrl,
    tags,
    sourceUrl: `${SITE}/${id}/`,
  };
}

/** Related grid shown under the player — reuse as recommendations. */
export async function fetchDevilRelated(id: string): Promise<DevilVideoSummary[]> {
  const items = parseCatalog(await getHtml(`/${id}/`)).filter((item) => item.id !== id);
  return items.slice(0, 12);
}
