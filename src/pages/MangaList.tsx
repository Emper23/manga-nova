import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { MangaCard, MangaCardSkeleton } from "../components/MangaCard";
import { GenrePills } from "../components/GenrePills";
import { Icon } from "../components/Icon";
import { MangaCover } from "../components/MangaCover";
import { useLatestUpdates, useMangaList } from "../hooks/useMangaData";
import { timeAgo } from "../data/manga";
import type { MangaType } from "../types";

type SortKey = "rating" | "latest" | "az";

export function MangaList() {
  const [params] = useSearchParams();
  const location = useLocation();
  const [sort, setSort] = useState<SortKey>("rating");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const genre = params.get("genre") ?? "";

  const contentType: MangaType = "manhua";
  const contentTypeLabel = "มังงะจาก mangablackcat.com";
  const mode = location.pathname === "/popular" ? "popular" : location.pathname === "/latest" ? "latest" : "manga";
  const heading =
    mode === "popular"
      ? "ยอดนิยม"
      : mode === "latest"
        ? "ตอนล่าสุด"
        : genre
          ? `หมวด ${genre}`
          : contentTypeLabel;

  const listQuery = useMangaList(genre || undefined, 60, contentType);
  const latest = useLatestUpdates(mode === "latest" ? 12 : 0, contentType);

  useEffect(() => {
    setPage(1);
    setQ("");
    window.scrollTo({ top: 0 });
  }, [location.search, location.pathname]);

  const filtered = useMemo(() => {
    if (mode === "latest") return [];
    let list = [...(listQuery.data ?? [])];
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.author.toLowerCase().includes(query) ||
          m.genres.some((g) => g.toLowerCase().includes(query))
      );
    }
    switch (sort) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "latest":
        list.sort((a, b) => b.chapters - a.chapters);
        break;
      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return list;
  }, [mode, listQuery.data, q, sort]);

  const shown = filtered.slice(0, page * 24);

  return (
    <div className="container list-page anim-fade-in">
      <div className="list-head">
        <h1 className="list-title">
          {mode === "latest" ? "ตอนใหม่ล่าสุด" : heading}
          <span className="list-count">
            {mode === "latest" ? latest.data?.length ?? 0 : filtered.length} รายการ
          </span>
        </h1>
        {!genre && mode === "manga" && <GenrePills compact />}
      </div>

      {mode === "latest" ? (
        <div className="latest-list card stagger">
          {latest.loading || !latest.data
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="latest-list-row" aria-hidden="true">
                  <span className="skeleton" style={{ width: 46, height: 62, borderRadius: 9 }} />
                  <span className="latest-list-info">
                    <span className="skeleton" style={{ height: 13, width: "60%" }} />
                    <span className="skeleton" style={{ height: 11, width: "40%" }} />
                  </span>
                </div>
              ))
            : latest.data.map((item, i) => (
                <Link
                  key={item.chapter.id}
                  to={`/read/${item.manga.id}/${item.chapter.externalId}`}
                  className="latest-list-row"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className="latest-list-thumb">
                    <MangaCover manga={item.manga} className="mini-cover" />
                  </span>
                  <span className="latest-list-info">
                    <span className="latest-list-title">{item.manga.title}</span>
                    <span className="latest-list-chapter">
                      ตอนที่ {item.chapter.number} — {item.chapter.title}
                    </span>
                  </span>
                  <span className="latest-list-time">
                    <Icon name="clock" size={13} />
                    {timeAgo(item.chapter.date)}
                  </span>
                  <span className="badge badge-new">NEW</span>
                  <span className="latest-list-go">
                    <Icon name="chevronRight" size={16} />
                  </span>
                </Link>
              ))}
        </div>
      ) : (
        <>
          <div className="list-tools card">
            <div className="list-search">
              <Icon name="search" size={16} />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาในรายการ..."
                aria-label="ค้นหาในรายการ"
              />
            </div>
            <div className="list-tool-group">
              <div className="list-tool">
                <Icon name="grid" size={15} />
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey);
                    setPage(1);
                  }}
                  aria-label="เรียงลำดับ"
                >
                  <option value="rating">เรตติ้งสูงสุด</option>
                  <option value="latest">ตอนล่าสุด</option>
                  <option value="az">A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {genre && <div className="genre-banner">{genre}</div>}

          {listQuery.loading && !listQuery.data ? (
            <div className="manga-grid stagger">
              {Array.from({ length: 12 }).map((_, i) => (
                <MangaCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="list-empty">
              <Icon name="search" size={40} />
              <p>ไม่พบมังงะที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            <div className="manga-grid stagger">
              {shown.map((m, i) => (
                <MangaCard key={m.id} manga={m} index={i} />
              ))}
            </div>
          )}

          {shown.length < filtered.length && (
            <div className="load-more-wrap">
              <button className="btn btn-ghost load-more" onClick={() => setPage((p) => p + 1)}>
                โหลดเพิ่มเติม ({filtered.length - shown.length} รายการ)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
