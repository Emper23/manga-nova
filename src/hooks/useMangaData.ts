import { useEffect, useMemo, useState } from "react";
import {
  bullyChapterId,
  bullyChapterSlug,
  bullySlug,
  fetchBullyCatalog,
  fetchBullyGenreCatalog,
  fetchBullyChapterPages,
  fetchBullyChapters,
  fetchBullyManga,
  isBullyChapterId,
  isBullyId,
  bullySummaryToManga,
  type BullySummary,
} from "../api/bully";
import {
  fetchNekoCatalogPage,
  fetchNekoChapterPages,
  fetchNekoChapters,
  fetchNekoManga,
  isNekoChapterId,
  isNekoId,
  nekoChapterSlug,
  nekoSlug,
  nekoSummaryToManga,
  type NekoCatalogPage,
} from "../api/neko";
import type { Chapter, Manga, MangaType } from "../types";

export interface LoadState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
}

function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useLoader<T>(fn: () => Promise<T>, deps: unknown[]): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ data: null, loading: true, error: false });
  // The caller supplies the complete dependency list for this generic loader.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let alive = true;
    setState({ data: null, loading: true, error: false });
    fn()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: false });
      })
      .catch((error) => {
        console.error("useLoader failed:", error);
        if (alive) setState({ data: null, loading: false, error: true, errorMessage: errorMessageOf(error) });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

/* ---------- content sources ---------- */


/** Top-level mangablackcat.com browse categories per app manga type. */
const CATEGORY_BY_TYPE: Record<"manhua" | "manhwa" | "manga", string> = {
  manhua: "Manhua",
  manhwa: "Manhwa",
  manga: "Manga",
};

function categoryOfType(type: MangaType): string {
  return CATEGORY_BY_TYPE[type as "manhua" | "manhwa" | "manga"] ?? "Manhua";
}



export function usePopularManga(limit = 18, _type: MangaType = "manhua") {
  // Use page 1 only for fast home page load
  const catalog = useBullyCatalog(1);
  const data = catalog.data
    ? catalog.data
        .map((s) => bullySummaryToManga(s))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit)
    : null;
  return { data, loading: catalog.loading, error: catalog.error };
}

/** Search across all manga from mangablackcat.com. */
export function useSearchManga(q: string, limit = 12) {
  const trimmed = q.trim().toLowerCase();
  const enabled = Boolean(trimmed);
  const catalog = useBullyCatalogAll(enabled);
  const loading = catalog.loading;
  const error = catalog.error;
  const data = useMemo(() => {
    if (!trimmed) return null;
    return (catalog.data ?? [])
      .map((summary) => bullySummaryToManga(summary))
      .filter((manga) =>
        [manga.title, manga.description, manga.author, ...manga.genres]
          .join(" ")
          .toLowerCase()
          .includes(trimmed)
      )
      .slice(0, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, limit, catalog.data]);
  return { data, loading, error };
}

export function useGenreManga(genre: string, limit = 24, _type: MangaType = "manhua") {
  if (_type === "doujin") {
    return useLoader<Manga[]>(
      () => fetchNekoCatalogPage(1).then((page) => page.items.slice(0, limit).map(nekoSummaryToManga)),
      [genre, limit]
    );
  }
  const genreQuery = useLoader<BullySummary[]>(
    () => genre ? fetchBullyGenreCatalog(genre) : Promise.resolve([]),
    [genre]
  );
  const data = genreQuery.data?.map((s) => bullySummaryToManga(s, genre)).slice(0, limit) ?? null;
  return { data, loading: genreQuery.loading, error: genreQuery.error };
}

export function useMangaList(genre: string | undefined, _limit = 60, _type: MangaType = "manhua") {
  // For genre-specific views, fetch from /genre/{slug} (page 1 only, ~60 items)
  const genreQuery = useLoader<BullySummary[]>(
    () => genre ? fetchBullyGenreCatalog(genre) : Promise.resolve([]),
    [genre]
  );
  // For "all" view, use the full catalog
  const catalog = useBullyCatalogAll(!genre);
  
  if (genre) {
    const data = genreQuery.data?.map((s) => bullySummaryToManga(s, genre)) ?? null;
    return { data, loading: genreQuery.loading, error: genreQuery.error };
  }
  const data = catalog.data?.map((s) => bullySummaryToManga(s)) ?? null;
  return { data, loading: catalog.loading, error: catalog.error };
}

export function useMangaDetail(id: string) {
  return useLoader<Manga>(
    () => {
      if (id && isBullyId(id)) return fetchBullyManga(bullySlug(id));
      if (id && isNekoId(id)) return fetchNekoManga(nekoSlug(id));
      return Promise.reject(new Error("ไม่พบเรื่องจากแหล่งข้อมูลที่รองรับ"));
    },
    [id]
  );
}

export function useChapters(mangaId: string, limit = 48) {
  return useLoader<Chapter[]>(
    () =>
      mangaId && isBullyId(mangaId)
        ? fetchBullyChapters(bullySlug(mangaId)).then((chs) => chs.slice(0, limit))
        : Promise.resolve([]),
    [mangaId, limit]
  );
}

export function useAllChapters(mangaId: string) {
  return useLoader<Chapter[]>(
    () => {
      if (mangaId && isBullyId(mangaId)) return fetchBullyChapters(bullySlug(mangaId));
      if (mangaId && isNekoId(mangaId)) return fetchNekoChapters(nekoSlug(mangaId));
      return Promise.resolve([]);
    },
    [mangaId]
  );
}

export function useChapterPages(chapterExternalId: string | undefined) {
  const id = chapterExternalId ?? "";
  return useLoader<string[]>(
    () => {
      if (id && isBullyChapterId(id)) return fetchBullyChapterPages(bullyChapterSlug(id));
      if (id && isNekoChapterId(id)) return fetchNekoChapterPages(nekoChapterSlug(id));
      return Promise.resolve([]);
    },
    [id]
  );
}

/** mangablackcat.com Manhua catalog (pass `null` to disable). */
export function useBullyCatalog(page: number | null, genre = "Manhua"): LoadState<BullySummary[]> {
  return useLoader<BullySummary[]>(() => (page ? fetchBullyCatalog(page, genre) : Promise.resolve([])), [page, genre]);
}

/** One page of the separate MIKU DOUJIN doujin catalog (pass null to disable). */
export function useNekoCatalogPage(page: number | null): LoadState<NekoCatalogPage> {
  return useLoader<NekoCatalogPage>(
    () => (page ? fetchNekoCatalogPage(page) : Promise.resolve({ items: [], hasNext: false, page: 0 })),
    [page]
  );
}

/** Load mangablackcat.com /manga catalog progressively: page 1 first, then background. */
export function useBullyCatalogAll(enabled: boolean | null = true) {
  const [state, setState] = useState<{
    data: BullySummary[] | null;
    loading: boolean;
    error: boolean;
    pagesLoaded: number;
  }>({ data: null, loading: Boolean(enabled), error: false, pagesLoaded: 0 });

  useEffect(() => {
    let alive = true;
    if (!enabled) {
      setState({ data: [], loading: false, error: false, pagesLoaded: 0 });
      return () => { alive = false; };
    }

    setState({ data: null, loading: true, error: false, pagesLoaded: 0 });
    const loadAll = async () => {
      const all: BullySummary[] = [];
      const seen = new Set<string>();
      let repeatedPages = 0;

      for (let page = 1; alive && page <= 500; page++) {
        let batch: BullySummary[] = [];
        let lastError: unknown;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            batch = await fetchBullyCatalog(page);
            lastError = undefined;
            if (batch.length || attempt === 1) break;
          } catch (error) { lastError = error; }
        }
        if (lastError && !batch.length) {
          if (page === 1) throw lastError;
          repeatedPages += 1;
          if (repeatedPages >= 3) break;
          continue;
        }
        const fresh = batch.filter((summary) => !seen.has(summary.slug));
        if (!batch.length || !fresh.length) {
          repeatedPages += 1;
          if (repeatedPages >= 3) break;
          continue;
        }
        repeatedPages = 0;
        fresh.forEach((summary) => seen.add(summary.slug));
        all.push(...fresh);
        // Show data immediately after page 1, then update progressively
        setState({ data: [...all], loading: true, error: false, pagesLoaded: page });
        // Small delay between pages to not overwhelm the server
        if (page > 1 && alive) {
          await new Promise((r) => setTimeout(r, 80));
        }
      }
      if (alive) setState((previous) => ({ ...previous, data: all, loading: false }));
    };

    loadAll().catch(() => {
      if (alive) setState((previous) => ({ ...previous, loading: false, error: true }));
    });

    return () => { alive = false; };
  }, [enabled]);

  return state;
}

export interface LatestUpdate {
  manga: Manga;
  chapter: Chapter;
}

export function useLatestUpdates(count = 6, type: MangaType = "manhua") {
  return useLoader<LatestUpdate[]>(
    async () => {
      if (count <= 0) return [];
      const category = categoryOfType(type);
      const page1 = await fetchBullyCatalog(1, category);
      return page1.slice(0, count).map((s) => {
        const manga = bullySummaryToManga(s, category);
        const slug = s.latestChapterSlug || `${s.slug}/${s.latestChapterNum || 1}.0`;
        const daysAgo = Math.max(0, (s.latestChapterNum % 7) - 1);
        const d = new Date(Date.now() - daysAgo * 86400000);
        return {
          manga,
          chapter: {
            id: bullyChapterId(slug),
            externalId: bullyChapterId(slug),
            mangaId: manga.id,
            number: s.latestChapterNum || 1,
            title: `ตอนที่ ${s.latestChapterNum || 1}`,
            date: d.toISOString().slice(0, 10),
            isNew: daysAgo <= 1,
            lang: "th",
          },
        };
      });
    },
    [count, type]
  );
}

/** Resolve one manga id to Manga (used by library / profile which store ids) */
export function useMangaById(id: string): Manga | null {
  const { data } = useMangaDetail(id);
  return data;
}

export function useMangasByIds(ids: string[]): Record<string, Manga> {
  const [map, setMap] = useState<Record<string, Manga>>({});
  useEffect(() => {
    let alive = true;
    Promise.all(
      ids.filter((id) => isBullyId(id) || isNekoId(id)).map(async (id) => {
        try {
          const manga = isBullyId(id) ? await fetchBullyManga(bullySlug(id)) : await fetchNekoManga(nekoSlug(id));
          return { id, manga };
        } catch {
          return { id, manga: null };
        }
      })
    ).then((results) => {
      if (!alive) return;
      const next: Record<string, Manga> = {};
      results.forEach((r) => {
        if (r.manga) next[r.id] = r.manga;
      });
      setMap(next);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);
  return map;
}
