import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { GENRES } from "../data/manga";
import { useSearchManga } from "../hooks/useMangaData";
import type { Manga } from "../types";
import { Icon } from "./Icon";
import { MangaCover } from "./MangaCover";

type Result = Manga | { genre: string };

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, library, addRecentSearch, clearRecentSearches } = useApp();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useSearchManga(query, 6);

  const list = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const genreMatches = GENRES.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 3);
    return [...(results.data ?? []), ...genreMatches.map((g) => ({ genre: g.name }))];
  }, [results.data, query]);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, list.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && list[active]) {
        e.preventDefault();
        go(list[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen, list, active]);

  if (!searchOpen) return null;

  const go = (item: Result) => {
    if ("id" in item) {
      addRecentSearch(query);
      setSearchOpen(false);
      navigate(`/manga/${item.id}`);
    } else {
      addRecentSearch(query);
      setSearchOpen(false);
      navigate(`/genres?genre=${encodeURIComponent(item.genre)}`);
    }
  };

  const goRecent = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="ค้นหา">
      <div className="search-backdrop" onClick={() => setSearchOpen(false)} />
      <div className="search-panel glass-strong anim-scale-in">
        <div className="search-input-row">
          <Icon name="search" size={20} className="search-input-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="ค้นหามังงะจาก mangablackcat.com..."
            className="search-input"
            aria-label="ค้นหา"
          />
          <kbd className="kbd">ESC</kbd>
        </div>

        {query.trim() ? (
          <div className="search-results">
            {results.loading && list.length === 0 && (
              <div className="search-idle">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="search-result" aria-hidden="true">
                    <span className="skeleton" style={{ width: 42, height: 58, borderRadius: 8 }} />
                    <span className="search-result-info">
                      <span className="skeleton" style={{ height: 13, width: "60%" }} />
                      <span className="skeleton" style={{ height: 10, width: "40%" }} />
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!results.loading && list.length === 0 && (
              <div className="search-empty">
                <Icon name="search" size={34} />
                <p>ไม่พบผลลัพธ์สำหรับ “{query}”</p>
              </div>
            )}
            {list.map((r, i) =>
              "id" in r ? (
                <button
                  key={r.id}
                  className={`search-result ${i === active ? "search-result-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                >
                  <span className="search-result-cover">
                    <MangaCover manga={{ title: r.title, seed: r.seed, status: r.status, coverUrl: r.coverUrl }} />
                  </span>
                  <span className="search-result-info">
                    <span className="search-result-title">{r.title}</span>
                    <span className="search-result-sub">
                      {r.genres.slice(0, 3).join(" · ") || r.author} — ★ {r.rating.toFixed(1)}
                    </span>
                  </span>
                  <span className="search-result-go">
                    <Icon name="chevronRight" size={16} />
                  </span>
                </button>
              ) : (
                <button
                  key={"g" + r.genre}
                  className={`search-result search-result-genre ${i === active ? "search-result-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                >
                  <span className="search-result-icon">
                    <Icon name="tags" size={16} />
                  </span>
                  <span className="search-result-info">
                    <span className="search-result-title">หมวด {r.genre}</span>
                    <span className="search-result-sub">ดูมังงะทั้งหมดในหมวดนี้</span>
                  </span>
                  <span className="search-result-go">
                    <Icon name="chevronRight" size={16} />
                  </span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="search-idle">
            {library.recentSearches.length > 0 && (
              <div className="search-idle-section">
                <div className="search-idle-head">
                  <span className="search-idle-title">การค้นหาล่าสุด</span>
                  <button className="search-clear" onClick={clearRecentSearches}>
                    ล้างทั้งหมด
                  </button>
                </div>
                <div className="search-recent-row">
                  {library.recentSearches.map((s) => (
                    <button key={s} className="search-recent-chip" onClick={() => goRecent(s)}>
                      <Icon name="history" size={13} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="search-idle-section">
              <span className="search-idle-title">หมวดยอดนิยม</span>
              <div className="search-recent-row">
                {GENRES.slice(0, 8).map((g) => (
                  <button key={g.name} className="search-recent-chip" onClick={() => go({ genre: g.name })}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-hint">
              <kbd className="kbd">↑↓</kbd> เลือกผลลัพธ์ · <kbd className="kbd">Enter</kbd> เปิด ·{" "}
              <kbd className="kbd">Esc</kbd> ปิด
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
