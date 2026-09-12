import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { MangaCover } from "../components/MangaCover";
import { useApp } from "../context/AppContext";
import { GENRES } from "../data/manga";
import { useSearchManga } from "../hooks/useMangaData";

export function SearchPage() {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addRecentSearch, library } = useApp();
  const results = useSearchManga(q, 12);
  const show = q.trim().length > 0;

  const open = (id: string) => {
    if (q.trim()) addRecentSearch(q);
    navigate(`/manga/${id}`);
  };

  return (
    <div className="container search-page anim-fade-in">
      <h1 className="list-title">ค้นหา</h1>
      <div className="search-big card">
        <Icon name="search" size={20} />
        <input
          ref={inputRef}
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหามังงะจาก mangablackcat.com..."
          aria-label="ค้นหา"
        />
        {q && (
          <button className="search-clear-btn" onClick={() => setQ("")} aria-label="ล้างคำค้นหา">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {show ? (
        results.loading && !results.data ? (
          <div className="search-results-page stagger">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="search-page-row" aria-hidden="true">
                <span className="skeleton" style={{ width: 46, height: 62, borderRadius: 9 }} />
                <span className="search-page-info">
                  <span className="skeleton" style={{ height: 13, width: "60%" }} />
                  <span className="skeleton" style={{ height: 10, width: "40%" }} />
                </span>
              </div>
            ))}
          </div>
        ) : (results.data?.length ?? 0) > 0 ? (
          <div className="search-results-page stagger">
            {results.data!.map((m, i) => (
              <button
                key={m.id}
                className="search-page-row"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => open(m.id)}
              >
                <span className="search-page-cover">
                  <MangaCover manga={{ title: m.title, seed: m.seed, status: m.status, coverUrl: m.coverUrl }} />
                </span>
                <span className="search-page-info">
                  <span className="search-page-title">{m.title}</span>
                  <span className="search-page-meta">
                    {m.author} · {m.genres.slice(0, 3).join(" · ")}
                  </span>
                </span>
                <span className="search-page-rating">
                  <Icon name="starFilled" size={12} className="star-icon" />
                  {m.rating.toFixed(1)}
                </span>
                <Icon name="chevronRight" size={16} className="search-page-go" />
              </button>
            ))}
          </div>
        ) : (
          <div className="list-empty">
            <Icon name="search" size={40} />
            <p>ไม่พบผลลัพธ์สำหรับ “{q}”</p>
          </div>
        )
      ) : (
        <>
          {library.recentSearches.length > 0 && (
            <div className="search-idle-section">
              <span className="search-idle-title">การค้นหาล่าสุด</span>
              <div className="search-recent-row">
                {library.recentSearches.map((s) => (
                  <button
                    key={s}
                    className="search-recent-chip"
                    onClick={() => {
                      setQ(s);
                      inputRef.current?.focus();
                    }}
                  >
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
              {GENRES.map((g) => (
                <button
                  key={g.name}
                  className="search-recent-chip"
                  onClick={() => navigate(`/genres?genre=${encodeURIComponent(g.name)}`)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
