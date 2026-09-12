import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { MangaCover } from "../components/MangaCover";
import { useApp } from "../context/AppContext";
import { useMangasByIds } from "../hooks/useMangaData";
import { isNekoId } from "../api/neko";
import type { Manga } from "../types";

type Tab = "continue" | "bookmarks" | "recent";

const TABS: { id: Tab; label: string; icon: "play" | "bookmark" | "history" }[] = [
  { id: "continue", label: "อ่านต่อ", icon: "play" },
  { id: "bookmarks", label: "บุ๊กมาร์ก", icon: "bookmark" },
  { id: "recent", label: "ดูล่าสุด", icon: "history" },
];

const dateLabel = (timestamp: number) =>
  new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(timestamp));

export function Library() {
  const navigate = useNavigate();
  const { library, toggleBookmark, toast, recordProgress } = useApp();
  const [tab, setTab] = useState<Tab>("continue");
  const [query, setQuery] = useState("");

  const allIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...library.continueReading.map((r) => r.mangaId),
          ...library.bookmarks,
          ...library.recentlyViewed,
        ])
      ),
    [library]
  );
  const mangaMap = useMangasByIds(allIds);
  const byId = (ids: string[]) => ids.map((id) => mangaMap[id]).filter(Boolean) as Manga[];
  const continueList = library.continueReading
    .map((r) => ({ r, manga: mangaMap[r.mangaId] }))
    .filter((x): x is { r: (typeof library.continueReading)[number]; manga: Manga } => Boolean(x.manga));
  const lists: Record<Tab, Manga[] | typeof continueList> = {
    continue: continueList,
    bookmarks: byId(library.bookmarks),
    recent: byId(library.recentlyViewed),
  };

  const activeList = lists[tab];
  const filtered = activeList.filter((item) => {
    const manga = "manga" in item ? item.manga : item;
    return !query.trim() || manga.title.toLowerCase().includes(query.toLowerCase());
  });

  const handleContinue = (manga: Manga, chapter: number, progress: number) => {
    recordProgress(manga.id, chapter, progress);
    navigate(`/read/${manga.id}/${chapter}`);
  };

  const handleRemoveBookmark = (manga: Manga) => {
    toggleBookmark(manga.id);
    toast("นำออกจากบุ๊กมาร์กแล้ว", "info");
  };

  return (
    <div className="page-shell library-page">
      <div className="container">
        <div className="section-head library-head">
          <div>
            <p className="eyebrow">MANGA NOVA</p>
            <h1 className="page-title">ชั้นหนังสือ</h1>
            <p className="list-sub">รวมเรื่องที่คุณกำลังอ่านและบันทึกไว้</p>
          </div>
          <span className="list-count">{library.bookmarks.length + library.continueReading.length} รายการ</span>
        </div>

        <div className="library-tabs" role="tablist" aria-label="ชั้นหนังสือ">
          {TABS.map((item) => {
            const count = item.id === "continue"
              ? library.continueReading.length
              : item.id === "bookmarks"
                ? library.bookmarks.length
                : library.recentlyViewed.length;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`library-tab ${tab === item.id ? "library-tab-active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                <small className="library-tab-count">{count}</small>
              </button>
            );
          })}
        </div>

        <div className="list-tools glass">
          <label className="list-search">
            <Icon name="search" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาในชั้นหนังสือ..."
              aria-label="ค้นหาในชั้นหนังสือ"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="ล้างการค้นหา">
                <Icon name="close" size={15} />
              </button>
            )}
          </label>
          <span className="list-count">{filtered.length} เรื่อง</span>
        </div>

        {filtered.length === 0 ? (
          <div className="list-empty glass">
            <Icon name={tab === "bookmarks" ? "bookmark" : "bookOpen"} size={30} />
            <h2>{query ? "ไม่พบเรื่องที่ค้นหา" : tab === "continue" ? "ยังไม่มีเรื่องที่กำลังอ่าน" : tab === "bookmarks" ? "ยังไม่มีบุ๊กมาร์ก" : "ยังไม่มีประวัติการอ่าน"}</h2>
            <p>{query ? "ลองใช้คำค้นหาอื่นดูนะ" : "เลือกเรื่องที่สนใจแล้วกลับมาอ่านต่อได้ที่นี่"}</p>
            {!query && (
              <Link className="btn btn-primary" to="/manhua">
                <Icon name="compass" size={17} />
                ไปเลือกมังงะ
              </Link>
            )}
          </div>
        ) : tab === "continue" ? (
          <div className="library-continue">
            {(filtered as typeof continueList).map(({ r, manga }, index) => (
              <article className="continue-card glass" key={`${manga.id}-${r.chapter}`} style={{ animationDelay: `${index * 0.05}s` }}>
                <Link to={`/read/${manga.id}/${r.chapter}`} className="continue-cover" aria-label={`อ่านต่อ ${manga.title}`}>
                  <MangaCover manga={manga} priority={index === 0} />
                  <span className="continue-badge"><Icon name="play" size={12} /> อ่านต่อ</span>
                </Link>
                <div className="continue-info">
                  <Link to={isNekoId(manga.id) ? `/doujin/${manga.id}` : `/manga/${manga.id}`} className="continue-title">{manga.title}</Link>
                  <span className="continue-sub">ตอนที่ {r.chapter} · อ่านไปแล้ว {Math.round(r.progress * 100)}% · {dateLabel(r.updatedAt)}</span>
                  <div className="continue-progress-track" aria-label={`อ่านไปแล้ว ${Math.round(r.progress * 100)} เปอร์เซ็นต์`}>
                    <div className="continue-progress-fill" style={{ width: `${Math.max(4, Math.round(r.progress * 100))}%` }} />
                  </div>
                  <div className="continue-actions">
                    <button type="button" className="btn btn-primary continue-read" onClick={() => handleContinue(manga, r.chapter, r.progress)}>
                      <Icon name="play" size={15} /> อ่านต่อ
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => handleContinue(manga, r.chapter, 0)}>
                      <Icon name="rotateCcw" size={15} /> เริ่มตอนนี้
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="library-grid">
            {(filtered as Manga[]).map((manga, index) => (
              <article className="library-item" key={manga.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <Link to={isNekoId(manga.id) ? `/doujin/${manga.id}` : `/manga/${manga.id}`} className="library-item-cover">
                  <MangaCover manga={manga} priority={index < 2} />
                  {manga.badge && <span className={`badge badge-${manga.badge.toLowerCase()} library-badge`}>{manga.badge}</span>}
                </Link>
                <Link to={isNekoId(manga.id) ? `/doujin/${manga.id}` : `/manga/${manga.id}`} className="library-item-title" title={manga.title}>{manga.title}</Link>
                <span className="library-item-meta"><Icon name="starFilled" size={12} className="star-icon" /> {manga.rating.toFixed(1)} · {manga.chapters} ตอน</span>
                {tab === "bookmarks" && (
                  <button type="button" className="library-remove" onClick={() => handleRemoveBookmark(manga)}>
                    <Icon name="bookmark" size={13} /> นำออก
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
