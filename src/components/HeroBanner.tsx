import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useChapters } from "../hooks/useMangaData";
import type { Manga } from "../types";
import { MangaCover } from "./MangaCover";
import { Icon } from "./Icon";

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: (i * 137.5) % 100,
        delay: (i % 9) * 0.9,
        duration: 7 + (i % 6) * 1.6,
        size: 2 + (i % 3),
      })),
    []
  );
  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function HeroBanner({ manga, loading }: { manga?: Manga; loading?: boolean }) {
  const chapters = useChapters(manga?.id ?? "", 100);
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked, toast, recordProgress } = useApp();
  const bookmarked = manga ? isBookmarked(manga.id) : false;
  const genrePath = manga?.type === "manhua" ? "/manhua" : manga?.type === "manhwa" ? "/manhwa" : "/manga";

  const handleAdd = () => {
    if (!manga) return;
    const added = toggleBookmark(manga.id);
    toast(added ? "เพิ่มเข้าชั้นหนังสือแล้ว 📚" : "นำออกจากชั้นหนังสือแล้ว", added ? "success" : "info");
  };

  const readFirst = () => {
    if (!manga) return;
    const chs = chapters.data ?? [];
    const ch = chs.length ? chs[chs.length - 1] : undefined;
    if (ch) {
      recordProgress(manga.id, ch.number, 0);
      navigate(`/read/${manga.id}/${ch.externalId ?? ch.id}`);
    } else {
      // Chapters still loading — open the reader anyway; it shows a loading
      // state and picks the first chapter once ready.
      navigate(`/read/${manga.id}`);
    }
  };

  return (
    <section className="hero" aria-label="มังงะแนะนำประจำสัปดาห์">
      <div className="hero-bg">
        {manga ? (
          <>
      <MangaCover manga={manga} className="hero-cover-bg" priority />
            <div className="hero-bg-blur" />
          </>
        ) : (
          <div className="skeleton hero-skeleton" />
        )}
        <div className="hero-overlay" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
      </div>
      <Particles />

      <div className="container hero-inner">
        {loading || !manga ? (
          <>
            <div className="skeleton" style={{ height: 26, width: 220, borderRadius: 99, marginBottom: 18 }} />
            <div className="skeleton" style={{ height: 44, width: "70%", maxWidth: 480, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 16, width: "55%", maxWidth: 360, marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 60, width: "80%", maxWidth: 520, marginBottom: 20 }} />
            <div className="hero-actions">
              <div className="skeleton" style={{ height: 46, width: 170, borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 46, width: 190, borderRadius: 12 }} />
            </div>
          </>
        ) : (
          <>
            <div className="hero-badge-row">
              {manga.badge && (
                <span className={`badge badge-${manga.badge.toLowerCase()}`}>
                  <Icon name="flame" size={12} />
                  {manga.badge}
                </span>
              )}
              <span className="badge badge-status">TOP 1 รายสัปดาห์</span>
            </div>

            <h1 className="hero-title">
              <span className="hero-title-glow">ส่อง</span>
              <span className="gradient-text">{manga.title}</span>
            </h1>

            <div className="hero-tags">
              {manga.genres.slice(0, 4).map((g) => (
                <Link key={g} to={`${genrePath}?genre=${encodeURIComponent(g)}`} className="hero-genre">
                  {g}
                </Link>
              ))}
            </div>

            <div className="hero-stats">
              <span className="hero-stat">
                <Icon name="starFilled" size={15} className="star-icon" />
                <b>{manga.rating.toFixed(1)}</b> คะแนน
              </span>
              <span className="hero-dot">•</span>
              <span className="hero-stat">
                <Icon name="bookOpen" size={15} />
                <b>{chapters.data?.length || manga.chapters}</b> ตอน
              </span>
              <span className="hero-dot">•</span>
              <span className="hero-stat">
                <Icon name="eye" size={15} />
                <b>{manga.views}</b> ผู้ชม
              </span>
              <span className="hero-dot">•</span>
              <span className="hero-stat">
                <Icon name="clock" size={15} />
                {manga.status === "Ongoing" ? "อัปเดตล่าสุดวันนี้" : manga.status}
              </span>
            </div>

            <p className="hero-desc">{manga.description}</p>

            <div className="hero-actions">
              <button className="btn btn-primary hero-read" onClick={readFirst}>
                <Icon name="play" size={17} />
                อ่านตอนแรก
              </button>
              <button className={`btn btn-ghost ${bookmarked ? "hero-bookmarked" : ""}`} onClick={handleAdd}>
                <Icon name={bookmarked ? "bookmarkFilled" : "bookmark"} size={17} />
                {bookmarked ? "อยู่ในชั้นหนังสือ" : "เพิ่มเข้าชั้นหนังสือ"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
