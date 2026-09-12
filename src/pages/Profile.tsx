import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MangaCover } from "../components/MangaCover";
import { Icon } from "../components/Icon";
import { useApp } from "../context/AppContext";
import { GENRES } from "../data/manga";
import { useMangasByIds } from "../hooks/useMangaData";
import { isNekoId } from "../api/neko";

const STATS = [
  { label: "ตอนที่อ่าน", value: 1284, icon: "bookOpen" as const },
  { label: "เรื่องที่อ่าน", value: 42, icon: "book" as const },
  { label: "ชั่วโมงที่อ่าน", value: 186, icon: "clock" as const },
  { label: "สถิติอ่านติดต่อ", value: 12, icon: "flame" as const, unit: "วัน" },
];

export function Profile() {
  const { library, isLoggedIn, login, logout } = useApp();
  const favGenres = ["Action", "Fantasy", "Romance", "Comedy"];
  const allIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...library.continueReading.map((r) => r.mangaId),
          ...library.recentlyViewed,
          ...library.bookmarks,
        ])
      ),
    [library]
  );
  const mangaMap = useMangasByIds(allIds);
  const history = library.recentlyViewed.slice(0, 6).map((id) => mangaMap[id]).filter(Boolean);

  return (
    <div className="container profile-page anim-fade-in">
      {/* Profile card */}
      <div className="profile-hero card">
        <div className="profile-glow" aria-hidden="true" />
        <div className="profile-avatar-wrap">
          <span className="profile-avatar">K</span>
          <span className="profile-avatar-ring" aria-hidden="true" />
        </div>
        <div className="profile-meta">
          <h1>คุณ_kaito</h1>
          <span className="profile-handle">@kaito.reads · สมาชิกตั้งแต่ ม.ค. 2024</span>
          <div className="profile-tags">
            <span className="badge badge-trending">
              <Icon name="flame" size={11} /> PRO Reader
            </span>
            <span className="badge badge-status">สายอ่านจริง</span>
          </div>
        </div>
        <div className="profile-actions">
          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={logout}>
              <Icon name="logOut" size={16} /> ออกจากระบบ
            </button>
          ) : (
            <button className="btn btn-primary" onClick={login}>
              <Icon name="user" size={16} /> เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats stagger">
        {STATS.map((s, i) => (
          <div key={s.label} className="profile-stat card" style={{ animationDelay: `${i * 0.06}s` }}>
            <span className="profile-stat-icon">
              <Icon name={s.icon} size={20} />
            </span>
            <span className="profile-stat-value">
              {s.value.toLocaleString()}
              {s.unit && <small>{s.unit}</small>}
            </span>
            <span className="profile-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="profile-cols">
        {/* Continue reading */}
        <section className="profile-col">
          <div className="section-head">
            <h2 className="section-title">
              <span className="tick" />
              อ่านค้างอยู่
            </h2>
            <Link to="/library" className="see-all">
              ทั้งหมด <Icon name="chevronRight" size={15} />
            </Link>
          </div>
          <div className="profile-history card">
            {library.continueReading.slice(0, 4).map((r) => {
              const manga = mangaMap[r.mangaId];
              if (!manga) return null;
              const pct = Math.round(r.progress * 100);
              return (
                <Link key={manga.id} to={`/read/${manga.id}/${r.chapter}`} className="profile-history-row">
                  <span className="profile-history-cover">
                    <MangaCover manga={manga} className="mini-cover" />
                  </span>
                  <span className="profile-history-info">
                    <span className="profile-history-title">{manga.title}</span>
                    <span className="profile-history-chapter">ตอนที่ {r.chapter}</span>
                    <span className="profile-history-bar">
                      <span style={{ width: `${pct}%` }} />
                    </span>
                  </span>
                  <span className="profile-history-pct">{pct}%</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Favorite genres */}
        <section className="profile-col">
          <div className="section-head">
            <h2 className="section-title">
              <span className="tick" />
              หมวดที่ชอบ
            </h2>
          </div>
          <div className="profile-genres card">
            {favGenres.map((g, i) => {
              const genre = GENRES.find((x) => x.name === g);
              return (
                <Link
                  key={g}
                  to={`/genres?genre=${encodeURIComponent(g)}`}
                  className="profile-genre"
                  style={
                    {
                      "--pill-color": genre?.color ?? "#8b5cf6",
                      animationDelay: `${i * 0.05}s`,
                    } as React.CSSProperties
                  }
                >
                  <span className="profile-genre-icon">
                    <Icon name={(genre?.icon as never) ?? "tags"} size={16} />
                  </span>
                  {g}
                </Link>
              );
            })}
          </div>
          <div className="section-head profile-sec-head">
            <h2 className="section-title">
              <span className="tick" />
              ประวัติล่าสุด
            </h2>
          </div>
          <div className="profile-recent card">
            {history.map((m, i) =>
              m ? (
                <Link
                  key={m.id}
                  to={isNekoId(m.id) ? `/doujin/${m.id}` : `/manga/${m.id}`}
                  className="profile-recent-row"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className="profile-recent-cover">
                    <MangaCover manga={m} className="mini-cover" />
                  </span>
                  <span className="profile-recent-info">
                    <span className="profile-recent-title">{m.title}</span>
                    <span className="profile-recent-meta">
                      <Icon name="starFilled" size={11} className="star-icon" />
                      {m.rating.toFixed(1)} · {m.genres.slice(0, 2).join(", ")}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={15} className="profile-recent-go" />
                </Link>
              ) : null
            )}
          </div>
        </section>
      </div>

      {/* Bookmarks preview */}
      <section className="profile-col profile-bookmarks-sec">
        <div className="section-head">
          <h2 className="section-title">
            <span className="tick" />
            บุ๊กมาร์กของฉัน
          </h2>
          <Link to="/library" className="see-all">
            ทั้งหมด <Icon name="chevronRight" size={15} />
          </Link>
        </div>
        <div className="library-grid">
          {library.bookmarks.slice(0, 6).map((id) => {
            const m = mangaMap[id];
            if (!m) return null;
            return (
              <Link key={m.id} to={isNekoId(m.id) ? `/doujin/${m.id}` : `/manga/${m.id}`} className="library-item">
                <span className="library-item-cover">
                  <MangaCover manga={m} className="mini-cover" />
                </span>
                <span className="library-item-title">{m.title}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
