import type { Chapter, Manga, MangaType } from "../types";

/* ============================================================
   mangablackcat.com — Thai manga source
   - Pages are read through the Vite dev proxy (/blackcat/...) which
     strips the Origin header.
   - Page images are loaded directly via <img> (no CORS needed).
   ============================================================ */

export const BULLY_ID_PREFIX = "bully::";
export const BULLY_CH_ID_PREFIX = "bullych::";
const SITE = "https://mangablackcat.com";
const PROXY_PREFIX = "/blackcat";

/** Keep source images same-origin so every device uses the deployed proxy. */
function sourceAssetUrl(value: string): string {
  try {
    const url = new URL(value, SITE);
    if (url.origin === SITE) return `${PROXY_PREFIX}${url.pathname}${url.search}`;
  } catch {
    /* keep an unexpected URL unchanged */
  }
  return value;
}

export function isBullyId(id: string) {
  return id.startsWith(BULLY_ID_PREFIX);
}
export function isBullyChapterId(id: string) {
  return id.startsWith(BULLY_CH_ID_PREFIX);
}
export function bullySlug(id: string) {
  return id.slice(BULLY_ID_PREFIX.length);
}
export function bullyChapterSlug(id: string) {
  return id.slice(BULLY_CH_ID_PREFIX.length);
}
export function bullyMangaId(slug: string) {
  return BULLY_ID_PREFIX + slug;
}
export function bullyChapterId(slug: string) {
  return BULLY_CH_ID_PREFIX + slug;
}
export function bullyCoverUrl(slug: string) {
  return `${PROXY_PREFIX}/manga/${slug}`;
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
      const res = await fetch(`${PROXY_PREFIX}${path}`, { headers: { Accept: "text/html" } });
      if (!res.ok) throw new Error(`blackcat ${res.status}`);
      const html = await res.text();
      htmlCache.set(path, { html, expires: Date.now() + HTML_TTL });
      return html;
    } finally {
      htmlInFlight.delete(path);
    }
  })();
  htmlInFlight.set(path, request);
  return request;
}

/** deterministic hash for fallback art seed / pseudo rating */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const TH_GENRE_MAP: Record<string, string> = {
  "ต่อสู้": "Action",
  "ผจญภัย": "Adventure",
  "โรแมนติก": "Romance",
  "แฟนตาซี": "Fantasy",
  "ตลก": "Comedy",
  "ดราม่า": "Drama",
  "สยองขวัญ": "Horror",
  "สืบสวน": "Mystery",
  "โรงเรียน": "School Life",
  "กีฬา": "Sports",
  "ไซไฟ": "Sci-Fi",
  "กำลังภายใน": "Martial Arts",
  "เหนือธรรมชาติ": "Supernatural",
  "ย้อนยุค": "Historical",
  "ชีวิตประจำวัน": "Slice of Life",
  "จิตวิทยา": "Psychological",
  "ฮาเร็ม": "Harem",
  "เกม": "Game",
  "โชเน็น": "Shounen",
  "โรแมนซ์": "Romance",
  "ลึกลับ": "Mysterious",
  "เกิดใหม่": "Reborn",
  "มังงะจีน": "Manhua",
};

/** English UI genre names mapped to the source site's genre slugs. */
export const BULLY_GENRE_SLUGS: Record<string, string> = {
  Manhua: "manhua",
  Manhwa: "manhwa",
  Manga: "manga",
  Action: "action",
  Adventure: "adventure",
  Romance: "romance",
  Fantasy: "fantasy",
  Comedy: "comedy",
  Isekai: "isekai",
  Drama: "drama",
  Horror: "horror",
  Mystery: "mystery",
  "Sci-Fi": "sci-fi",
  "Martial Arts": "martial-arts",
  Supernatural: "supernatural",
  Historical: "historical",
  "Slice of Life": "slice-of-life",
  Psychological: "psychological",
  Harem: "harem",
  Game: "system",
  Shounen: "shounen",
  Reborn: "reincarnation",
};

export function isBullyGenreSupported(genre: string) {
  return Boolean(BULLY_GENRE_SLUGS[genre]);
}

/** Top-level browse category (Manhua/Manhwa/Manga) → app manga type. */
export function bullyTypeFromGenre(genre: string): MangaType {
  if (genre === "Manhwa") return "manhwa";
  if (genre === "Manga") return "manga";
  return "manhua";
}

const TYPE_LABEL_TH: Record<MangaType, string> = {
  manhua: "มังงะจีน (Manhua)",
  manhwa: "มังฮวาเกาหลี (Manhwa)",
  manga: "มังงะญี่ปุ่น (Manga)",
  doujin: "โดจิน",
};

export function mapThaiGenre(th: string): string {
  return TH_GENRE_MAP[th] ?? th;
}

/* ---------- catalog (genre page) ---------- */

export interface BullySummary {
  slug: string;
  title: string;
  coverUrl: string;
  latestChapterSlug: string;
  latestChapterNum: number;
  genre: string;
}

function htmlAttr(source: string, name: string) {
  return source.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function cleanHtmlText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract manga slug from a full URL or relative path like /manga/{slug} */
function slugFromMangaUrl(href: string): string {
  try {
    const url = new URL(href, SITE);
    const match = url.pathname.match(/^\/manga\/([^/]+)\/?$/);
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

function parseCatalogPage(html: string): BullySummary[] {
  // mangablackcat.com cards: <article class="manga-card group ...">
  const cards = html.split(/<article\b[^>]*class=["'][^"']*\bmanga-card\b[^"']*["'][^>]*>/i).slice(1);
  return cards
    .map((card) => {
      // Manga link: <a href="https://mangablackcat.com/manga/{slug}">
      const mangaLink = [...card.matchAll(/<a\b[^>]*href=["']([^"']*\/manga\/[^"']+)["'][^>]*>/gi)]
        .map((m) => m[1])
        .find((href) => slugFromMangaUrl(href));
      const slug = mangaLink ? slugFromMangaUrl(mangaLink) : "";
      if (!slug) return null;

      // Title: <h3> text
      const h3 = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
      const title = h3 ? cleanHtmlText(h3[1]) : slug.replace(/-/g, " ");

      // Cover image: first <img> with a storage URL
      const imgMatch = card.match(/<img\b[^>]*>/i);
      const coverUrl = imgMatch
        ? (["data-src", "data-original", "src"]
            .map((attr) => htmlAttr(imgMatch[0], attr))
            .find((v) => v && (v.includes("/storage/") || v.includes("cdn.mangablackcat.com"))) ?? "")
        : "";

      // Chapter count: span with "ตอน" text
      const chMatch = card.match(/(\d+)\s*ตอน/);
      const latestChapterNum = chMatch ? Number(chMatch[1]) : 0;
      const latestChapterSlug = latestChapterNum > 0 ? `${slug}/${latestChapterNum}.0` : "";

      // Genre: from <p> tag text before middot
      const pTag = card.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const genreRaw = pTag ? cleanHtmlText(pTag[1].split('·')[0]) : '';
      const genre = genreRaw || 'Action';

      return {
        slug,
        title: title || slug,
        coverUrl: coverUrl ? sourceAssetUrl(coverUrl) : `${PROXY_PREFIX}/manga/${slug}`,
        latestChapterSlug,
        latestChapterNum,
        genre,
      };
    })
    .filter((x): x is BullySummary => Boolean(x));
}

/**
 * Fetch one page of manga from mangablackcat.com.
 * The /manga page supports server-side pagination (60 items/page, ~24 pages).
 * Genre-specific pages (/genre/{slug}) only work for page 1 due to Livewire.
 */
export async function fetchBullyCatalog(page = 1, _genre = "Manhua"): Promise<BullySummary[]> {
  const path = `/manga?page=${page}`;
  const html = await getHtml(path);
  return parseCatalogPage(html);
}

/**
 * Fetch one page of a genre catalog (page 1 only — pagination is Livewire-based).
 */
export async function fetchBullyGenreCatalog(genre: string): Promise<BullySummary[]> {
  const genreSlug = BULLY_GENRE_SLUGS[genre];
  if (!genreSlug) return [];
  const html = await getHtml(`/genre/${genreSlug}`);
  return parseCatalogPage(html);
}

/* ---------- manga detail + chapter list ---------- */

function pseudoRating(slug: string): number {
  const h = hashStr(slug);
  return Math.round((7.6 + (h % 19) / 10) * 10) / 10; // 7.6 – 9.5
}

export async function fetchBullyManga(slug: string): Promise<Manga> {
  const html = await getHtml(`/manga/${slug}`);

  // Title: <h1> text
  const titleRaw =
    html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ??
    slug.replace(/-/g, " ");
  const title = titleRaw.replace(/^มังงะ\s*เรื่อง\s*/i, "").trim();

  // Cover: og:image meta tag
  const cover = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];

  // Genres: <a href="/genre/{slug}">GenreName</a>
  const genresTh = [
    ...new Set(
      [...html.matchAll(/<a\b[^>]*href=["'][^"']*\/genre\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(
        (m) => cleanHtmlText(m[2])
      ).filter((g) => g && !g.includes("ตอน") && g.length < 30)
    ),
  ];
  const genres = genresTh.map(mapThaiGenre).filter(Boolean);

  // Views: look for view count pattern (e.g., "4K", "12K")
  const viewsMatch = html.match(/>\s*(\d[\d,.]*K?)\s*<\/span>/);

  // Status
  const statusText = html.match(/กำลังอัพเดท/) ? "Ongoing" : "Ongoing";

  // Year from datePublished
  const yearMatch = html.match(/datePublished["']:\s*["'](\d{4})/);

  // Chapters: <a href="/manga/{slug}/{num}.0">
  const chLinks = [
    ...new Set(
      [...html.matchAll(new RegExp(`href=["'][^"']*\\/manga\\/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/(\\d+\\.0)["']`, "gi"))]
        .map((m) => m[1])
    ),
  ];

  return {
    id: bullyMangaId(slug),
    type: "manhua",
    title,
    description: `มังงะแปลไทย อ่านออนไลน์ฟรีทุกตอนที่ MANGA NOVA · ${genres.join(", ") || "มังงะภาพสี"}`,
    author: "—",
    artist: "—",
    genres: genres.length ? genres : ["Manhua"],
    rating: pseudoRating(slug),
    views: viewsMatch ? viewsMatch[1] : "—",
    status: statusText,
    year: yearMatch ? Number(yearMatch[1]) : 2023,
    chapters: chLinks.length,
    seed: (hashStr(slug) % 100000) + 1,
    coverUrl: cover ? sourceAssetUrl(cover) : `${PROXY_PREFIX}/manga/${slug}`,
  };
}

export async function fetchBullyChapters(slug: string): Promise<Chapter[]> {
  const html = await getHtml(`/manga/${slug}`);

  // Chapters: <a href="/manga/{slug}/{num}.0">
  const hrefs = [
    ...new Set(
      [...html.matchAll(new RegExp(`href=["'][^"']*\\/manga\\/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/(\\d+\\.0)["']`, "gi"))]
        .map((m) => `${slug}/${m[1]}`)
    ),
  ];
  const links = hrefs.map((href) => ({
    slug: href,
    num: Number(href.split("/").pop()),
  }));
  const max = Math.max(...links.map((l) => l.num), 1);
  // newest first, dates derived from chapter number (most recent = today)
  return links
    .sort((a, b) => b.num - a.num)
    .map((l) => {
      const daysAgo = Math.max(0, max - l.num);
      const d = new Date(Date.now() - daysAgo * 86400000);
      return {
        id: bullyChapterId(l.slug),
        externalId: bullyChapterId(l.slug),
        mangaId: bullyMangaId(slug),
        number: l.num,
        title: `ตอนที่ ${l.num}`,
        date: d.toISOString().slice(0, 10),
        isNew: daysAgo <= 1,
        lang: "th",
      };
    });
}

/* ---------- chapter pages (IMAGE_MAP / boot JSON) ---------- */

export async function fetchBullyChapterPages(chapterSlug: string): Promise<string[]> {
  const html = await getHtml(`/${chapterSlug}`);

  // mangablackcat.com uses boot: JSON.parse('{...}') with {mode: "plain", image: "..."}
  const bootMatches = [...html.matchAll(/boot:\s*JSON\.parse\(['"](.+?)['"]\)/g)];
  if (bootMatches.length > 0) {
    return bootMatches.map((m) => {
      try {
        const decoded = m[1]
          .replace(/\\u0022/g, '"')
          .replace(/\\\//g, "/");
        const parsed = JSON.parse(decoded);
        const imageUrl = parsed.image;
        if (imageUrl) {
          return imageUrl.startsWith("http") ? imageUrl : sourceAssetUrl(imageUrl);
        }
      } catch {
        /* fall through */
      }
      return "";
    }).filter((url) => Boolean(url));
  }

  // Fallback: look for IMAGE_MAP (some pages may still use this)
  const block = html.match(/const IMAGE_MAP\s*=\s*(\[[\s\S]*?\]);/)?.[1];
  if (block) {
    return [...block.matchAll(/["']([^"']+.(?:jpg|jpeg|png|webp))["']/g)].map((m) => {
      const u = m[1];
      return sourceAssetUrl(u.startsWith("http") || u.startsWith("/") ? u : `/${u}`);
    });
  }

  return [];
}

/** Map a catalog summary to a full Manga object (for grids/cards). */
export function bullySummaryToManga(s: BullySummary, genre?: string): Manga {
  const genreLabel = genre || s.genre || 'Manhua';
  const type = bullyTypeFromGenre(genreLabel);
  return {
    id: bullyMangaId(s.slug),
    type,
    title: s.title,
    description: `${TYPE_LABEL_TH[type]} ภาพสีแปลไทย อ่านออนไลน์ฟรีทุกตอนที่ MANGA NOVA`,
    author: "—",
    artist: "—",
    genres: [genreLabel],
    rating: pseudoRating(s.slug),
    views: "—",
    status: "Ongoing",
    year: 2023,
    chapters: s.latestChapterNum,
    seed: (hashStr(s.slug) % 100000) + 1,
    coverUrl: s.coverUrl,
    isNew: true,
  };
}
