import type { Chapter, Manga } from "../types";

/* ============================================================
   miku-doujin.com — separate adult doujin source
   - Every id is prefixed with neko:: / nekoch:: so it can never
     be sent to the mangablackcat.com parser by accident.
   - HTML and images go through the same-origin /neko proxy so the
     deployed site works consistently on other devices.
   ============================================================ */

export const NEKO_ID_PREFIX = "neko::";
export const NEKO_CH_ID_PREFIX = "nekoch::";
const SITE = "https://miku-doujin.com";
const PROXY_PREFIX = "/neko";

export interface NekoSummary {
  slug: string;
  title: string;
  coverUrl: string;
  updatedLabel: string;
  isNew: boolean;
  sourceUrl: string;
  externalOnly?: boolean;
}

export interface NekoCatalogPage {
  items: NekoSummary[];
  hasNext: boolean;
  page: number;
}

function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function hashStr(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

/** Keep Neko assets same-origin for the deployed reader and cover cards. */
export function nekoAssetUrl(value: string) {
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value, SITE);
    if (url.origin === SITE) return `${PROXY_PREFIX}${url.pathname}${url.search}`;
  } catch {
    /* keep an unexpected URL unchanged */
  }
  return value;
}

export function isNekoId(id: string) {
  return id.startsWith(NEKO_ID_PREFIX);
}

export function isNekoChapterId(id: string) {
  return id.startsWith(NEKO_CH_ID_PREFIX);
}

export function nekoSlug(id: string) {
  return id.slice(NEKO_ID_PREFIX.length);
}

export function nekoChapterSlug(id: string) {
  return id.slice(NEKO_CH_ID_PREFIX.length);
}

export function nekoMangaId(slug: string) {
  return `${NEKO_ID_PREFIX}${slug}`;
}

export function nekoChapterId(slug: string) {
  return `${NEKO_CH_ID_PREFIX}${slug}`;
}

export function nekoSourceUrl(slug: string) {
  return `${SITE}/${slug}/`;
}

const HTML_TTL = 60 * 1000;
const htmlCache = new Map<string, { html: string; expires: number }>();
const htmlInFlight = new Map<string, Promise<string>>();
let fallbackCatalogPromise: Promise<NekoCatalogPage | null> | null = null;

async function getFallbackCatalog() {
  if (!fallbackCatalogPromise) {
    fallbackCatalogPromise = fetch("/doujin-catalog.json")
      .then((response) => (response.ok ? (response.json() as Promise<NekoCatalogPage>) : null))
      .catch(() => null);
  }
  return fallbackCatalogPromise;
}

async function getHtml(path: string) {
  const cached = htmlCache.get(path);
  if (cached && cached.expires > Date.now()) return cached.html;

  const pending = htmlInFlight.get(path);
  if (pending) return pending;

  const request = (async () => {
    try {
      const response = await fetch(`${PROXY_PREFIX}${path}`, { headers: { Accept: "text/html" } });
      if (!response.ok) throw new Error(`neko ${response.status}`);
      const html = await response.text();
      if (/Just a moment|Enable JavaScript and cookies to continue|cf-chl-/i.test(html)) {
        throw new Error("neko anti-bot challenge");
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

function sourceUrlFromHref(href: string | null) {
  if (!href) return null;
  try {
    const url = new URL(href, SITE);
    if (url.origin !== SITE || !/^\/[a-z0-9-]+\/?$/i.test(url.pathname)) return null;
    const slug = url.pathname.replace(/^\//, "").replace(/\/$/, "");
    return slug ? { slug, url: `${SITE}/${slug}/` } : null;
  } catch {
    return null;
  }
}

function parseCatalogPage(html: string): NekoCatalogPage {
  const doc = parseDocument(html);
  const items = Array.from(doc.querySelectorAll(".inz-col"))
    .map((item) => {
      const anchor = item.querySelector<HTMLAnchorElement>("a.inz-a[href], a[href]");
      const source = sourceUrlFromHref(anchor?.getAttribute("href") ?? null);
      if (!source) return null;

      const title = cleanText(item.querySelector(".inz-title")?.textContent) || anchor?.title || source.slug;
      const cover = item.querySelector("img")?.getAttribute("src") ?? "";
      if (!cover) return null;

      const updatedLabel = cleanText(item.querySelector(".inz-detail small")?.textContent);
      return {
        slug: source.slug,
        title,
        coverUrl: nekoAssetUrl(cover),
        updatedLabel,
        isNew: /วินาที|นาที|ชั่วโมง/i.test(updatedLabel),
        sourceUrl: source.url,
      } satisfies NekoSummary;
    })
    .filter((item): item is NekoSummary => Boolean(item));

  // miku-doujin lists 24 items per page; a full page implies an older page exists.
  return { items, hasNext: items.length >= 20, page: 1 };
}

/** Read one source page. Page 1 is the homepage; later pages use ?page=N. */
export async function fetchNekoCatalogPage(page = 1): Promise<NekoCatalogPage> {
  try {
    const html = await getHtml(page > 1 ? `/?page=${page}` : "/");
    const parsed = parseCatalogPage(html);
    if (!parsed.items.length) throw new Error("neko catalog is empty");
    return { ...parsed, page };
  } catch (error) {
    const fallback = page === 1 ? await getFallbackCatalog() : null;
    if (!fallback?.items.length) throw error;
    return {
      ...fallback,
      page,
      hasNext: false,
      items: fallback.items.map((item) => ({ ...item, externalOnly: true })),
    };
  }
}

export async function fetchNekoCatalog(page = 1) {
  return (await fetchNekoCatalogPage(page)).items;
}

interface NekoDetailParsed {
  title: string;
  coverUrl: string;
  updatedLabel: string;
  views: string;
  artist: string;
  year: number;
  genres: string[];
  pages: string[];
}

function parseNekoDetail(html: string): NekoDetailParsed {
  const doc = parseDocument(html);
  const body = doc.querySelector(".sr-card-body");
  const card = body?.closest(".card");
  const title =
    cleanText(card?.querySelector(".card-header")?.textContent) ||
    cleanText(doc.querySelector("h1")?.textContent) ||
    "ไม่มีชื่อ";
  const updatedLabel = cleanText(doc.querySelector(".sr-post-header small")?.textContent);
  const views = updatedLabel.match(/อ่าน\s*([\d,.]+\s*[KMB]?)/i)?.[1]?.replace(/\s+/g, "") ?? "—";

  const cover = body?.querySelector("img")?.getAttribute("src") ?? "";
  const infoRows = Array.from(body?.querySelectorAll("p") ?? []);
  const rowByLabel = (label: string) => infoRows.find((row) => cleanText(row.textContent).startsWith(label));

  const artist = cleanText(rowByLabel("นักเขียน")?.querySelector("a")?.textContent) || "—";
  // miku-doujin has no release-year field; fall back to a year found in the title.
  const year = Number(title.match(/(?:19|20)\d{2}/)?.[0] ?? 0) || new Date().getFullYear();
  const genres = Array.from(body?.querySelectorAll('a[href*="/genre/"]') ?? [])
    .map((tag) => cleanText(tag.textContent))
    .filter(Boolean)
    .slice(0, 4);
  const pages = Array.from(doc.querySelectorAll<HTMLImageElement>("#manga-content img"))
    .map((image) => image.getAttribute("data-src") || image.getAttribute("src") || "")
    .filter((url) => url.includes("/uploads/") && !url.includes("/thumbnail"))
    .map(nekoAssetUrl)
    .filter((url, index, all) => all.indexOf(url) === index);

  return {
    title,
    coverUrl: nekoAssetUrl(cover),
    updatedLabel,
    views,
    artist,
    year,
    genres,
    pages,
  };
}

export async function fetchNekoManga(slug: string): Promise<Manga> {
  const parsed = parseNekoDetail(await getHtml(`/${slug}/`));
  const displayGenres = ["โดจิน", "18+", ...parsed.genres].slice(0, 5);
  return {
    id: nekoMangaId(slug),
    type: "doujin",
    title: parsed.title,
    description: "เนื้อหาสำหรับผู้ใหญ่จาก MIKU DOUJIN — อ่านผ่าน MANGA NOVA และสนับสนุนแหล่งข้อมูลต้นทาง",
    author: parsed.artist,
    artist: parsed.artist,
    genres: displayGenres,
    rating: 0,
    views: parsed.views,
    status: "Completed",
    year: parsed.year,
    chapters: parsed.pages.length ? 1 : 0,
    seed: (hashStr(slug) % 100000) + 1,
    coverUrl: parsed.coverUrl,
    sourceUrl: nekoSourceUrl(slug),
  };
}

export async function fetchNekoChapters(slug: string): Promise<Chapter[]> {
  const parsed = parseNekoDetail(await getHtml(`/${slug}/`));
  if (!parsed.pages.length) return [];
  return [
    {
      id: nekoChapterId(slug),
      externalId: nekoChapterId(slug),
      mangaId: nekoMangaId(slug),
      number: 1,
      title: "หน้าเดียว",
      date: new Date().toISOString().slice(0, 10),
      lang: "th",
      views: parsed.views,
    },
  ];
}

export async function fetchNekoChapterPages(slug: string) {
  return parseNekoDetail(await getHtml(`/${slug}/`)).pages;
}

export function nekoSummaryToManga(summary: NekoSummary): Manga {
  return {
    id: nekoMangaId(summary.slug),
    type: "doujin",
    title: summary.title,
    description: "โดจินสำหรับผู้ใหญ่จาก MIKU DOUJIN — แยกจากคลังมังงะของ mangablackcat.com",
    author: "—",
    artist: "—",
    genres: ["โดจิน", "18+"],
    rating: 0,
    views: "—",
    status: "Completed",
    year: new Date().getFullYear(),
    chapters: 1,
    seed: (hashStr(summary.slug) % 100000) + 1,
    coverUrl: summary.coverUrl,
    isNew: summary.isNew,
    sourceUrl: summary.sourceUrl,
    externalOnly: summary.externalOnly,
  };
}
