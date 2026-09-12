import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MangaCover } from "../components/MangaCover";
import { Icon } from "../components/Icon";
import { MangaCard, MangaCardSkeleton } from "../components/MangaCard";
import { useApp } from "../context/AppContext";
import { bullySummaryToManga, isBullyGenreSupported } from "../api/bully";
import { isNekoId, nekoSlug, nekoSourceUrl, nekoSummaryToManga } from "../api/neko";
import { useAllChapters, useBullyCatalog, useMangaDetail, useNekoCatalogPage } from "../hooks/useMangaData";
import { formatDate } from "../data/manga";

const PAGE_SIZE = 12;

export function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: manga, loading, error } = useMangaDetail(id ?? "");
  const chapters = useAllChapters(manga?.id ?? "");
  const isDoujin = manga?.type === "doujin" || isNekoId(id ?? "");
  const bullyRecos = useBullyCatalog(isDoujin ? null : 1);
  const nekoRecos = useNekoCatalogPage(isDoujin ? 1 : null);
  const { toggleBookmark, isBookmarked, recordProgress, recordView, toast, library } = useApp();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setQuery("");
    setStatusFilter("all");
    window.scrollTo({ top: 0 });
    if (manga) recordView(manga.id);
  }, [id, manga, recordView]);

  if (loading && !manga) {
    return (
      <div className="container list-page anim-fade-in">
        <div className="detail-head">
          <div className="skeleton" style={{ width: 240, height: 336, borderRadius: 18 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 38, width: "70%", marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 18 }} />
            <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "85%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 46, width: 200, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!manga || error) {
    return (
      <div className="container not-found anim-fade-in">
        <h1>ไม่พบมังงะนี้</h1>
        {isDoujin && id && (
          <p className="list-sub">ต้นทางป้องกันการอ่านผ่าน proxy ของเดโม กรุณาเปิดเรื่องจาก miku-doujin.com โดยตรง</p>
        )}
        {isDoujin && id ? (
          <Link to={nekoSourceUrl(nekoSlug(id))} target="_blank" rel="noreferrer" className="btn btn-primary">
            <Icon name="externalLink" size={16} /> เปิดต้นฉบับ
          </Link>
        ) : (
          <Link to={isDoujin ? "/doujin" : "/manga"} className="btn btn-primary">
            กลับไปรายชื่อมังงะ
          </Link>
        )}
      </div>
    );
  }

  const bookmarked = isBookmarked(manga.id);
  const continueReading = library.continueReading.find((r) => r.mangaId === manga.id);
  const chapterList = chapters.data ?? [];
  const filtered = chapterList.filter((c) => {
    const okQ = !query || `${c.number} ${c.title}`.toLowerCase().includes(query.toLowerCase());
    const okS =
      statusFilter === "all" ||
      (statusFilter === "new" && c.isNew) ||
      (statusFilter === "read" && continueReading && c.number <= continueReading.chapter);
    return okQ && okS;
  });
  const shown = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < filtered.length;

  const read = (ch: (typeof chapterList)[number]) => {
    if (!ch) return;
    recordProgress(manga.id, ch.number, 0);
    navigate(`/read/${manga.id}/${ch.externalId ?? ch.id}`);
  };

  const handleBookmark = () => {
    const added = toggleBookmark(manga.id);
    toast(added ? "เพิ่มเข้าชั้นหนังสือแล้ว 📚" : "นำออกจากชั้นหนังสือแล้ว", added ? "success" : "info");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: manga.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("คัดลอกลิงก์แล้ว 🔗", "success");
      }
    } catch {
      toast("ไม่สามารถแชร์ได้", "error");
    }
  };

  const infoItems = [
    { label: "คะแนน", value: `★ ${manga.rating.toFixed(1)}`, icon: "star" as const, accent: true },
    { label: "ยอดดู", value: manga.views, icon: "eye" as const },
    { label: "สถานะ", value: manga.status, icon: "target" as const },
    { label: "ผู้เขียน", value: manga.author, icon: "edit" as const },
    { label: "ผู้วาด", value: manga.artist, icon: "palette" as const },
    { label: "ปีที่เริ่ม", value: String(manga.year), icon: "clock" as const },
  ];

  const recos = (isDoujin
    ? (nekoRecos.data?.items ?? []).map(nekoSummaryToManga)
    : (bullyRecos.data ?? []).map((summary) => bullySummaryToManga(summary)))
    .filter((m) => m.id !== manga.id)
    .slice(0, 6);
  const readFirstCh = chapterList[chapterList.length - 1];
  const chapterLang = chapterList[0]?.lang;
  const chapterLangLabel = chapterLang ? (chapterLang === "th" ? "ไทย" : chapterLang.toUpperCase()) : null;
  const listPath =
    manga.type === "manhwa" ? "/manhwa" : manga.type === "manga" ? "/manga" : isDoujin ? "/doujin" : "/manhua";
  const genrePath = listPath;

  return (
    <div className="detail-page anim-fade-in">
      <div className="detail-backdrop" aria-hidden="true">
        <MangaCover manga={manga} className="detail-backdrop-art" />
        <div className="detail-backdrop-blur" />
        <div className="detail-backdrop-overlay" />
      </div>

      <div className="container detail-main">
        <button className="detail-back" onClick={() => navigate(listPath)}>
          <Icon name="arrowLeft" size={16} /> ย้อนกลับ
        </button>

        <div className="detail-head">
          <div className="detail-cover-wrap anim-scale-in">
            <MangaCover manga={manga} className="detail-cover" />
            {manga.badge && (
              <span className={`badge badge-${manga.badge.toLowerCase()} detail-badge`}>{manga.badge}</span>
            )}
          </div>

          <div className="detail-info anim-fade-up">
            <h1 className="detail-title">{manga.title}</h1>
            <div className="detail-alt">
              {manga.japaneseTitle && <span>{manga.japaneseTitle}</span>}
              {manga.altTitle && <span> / {manga.altTitle}</span>}
            </div>

            <div className="detail-genres">
              {manga.genres.slice(0, 5).map((g) => (
                (manga.type === "manhua" && isBullyGenreSupported(g)) ? (
                  <Link key={g} to={`${genrePath}?genre=${encodeURIComponent(g)}`} className="genre-chip">
                    {g}
                  </Link>
                ) : (
                  <span key={g} className="genre-chip">
                    {g}
                  </span>
                )
              ))}
            </div>

            <div className="detail-info-grid">
              {infoItems.map((it) => (
                <div key={it.label} className="detail-info-item">
                  <span className="detail-info-label">
                    <Icon name={it.icon} size={13} />
                    {it.label}
                  </span>
                  <span className={`detail-info-value ${it.accent ? "detail-info-accent" : ""}`}>
                    {it.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="detail-desc">{manga.description}</p>

            <div className="detail-actions">
              <button
                className="btn btn-primary"
                onClick={() => read(readFirstCh)}
                disabled={!readFirstCh}
              >
                <Icon name="play" size={17} />
                อ่านตอนแรก
              </button>
              {continueReading && (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    const ch = chapterList.find((c) => c.number === continueReading.chapter) ?? chapterList[0];
                    if (ch) read(ch);
                  }}
                >
                  <Icon name="history" size={17} />
                  อ่านต่อ ตอนที่ {continueReading.chapter}
                </button>
              )}
              <button
                className={`btn btn-ghost ${bookmarked ? "detail-bookmarked" : ""}`}
                onClick={handleBookmark}
                aria-pressed={bookmarked}
              >
                <Icon name={bookmarked ? "bookmarkFilled" : "bookmark"} size={17} />
                {bookmarked ? "บุ๊กมาร์กแล้ว" : "บุ๊กมาร์ก"}
              </button>
              <button className="btn btn-ghost" onClick={handleShare}>
                <Icon name="share" size={17} />
                แชร์
              </button>
              {isDoujin && (
                <Link className="btn btn-ghost" to={nekoSourceUrl(nekoSlug(manga.id))} target="_blank" rel="noreferrer">
                  <Icon name="externalLink" size={17} />
                  แหล่งข้อมูลต้นทาง
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="chapter-section card anim-fade-up">
          <div className="chapter-head">
            <h2>
              รายชื่อตอน <span className="chapter-count">{chapterList.length} ตอน</span>
              {chapterLangLabel && (
                <span className={`chapter-lang-badge ${chapterLang === "th" ? "chapter-lang-th" : ""}`}>
                  {chapterLangLabel}
                </span>
              )}
            </h2>
            <div className="chapter-tools">
              <div className="chapter-search">
                <Icon name="search" size={15} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหาตอน..."
                  aria-label="ค้นหาตอน"
                />
              </div>
              <div className="chapter-filter">
                <Icon name="filter" size={15} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as typeof statusFilter);
                    setPage(1);
                  }}
                  aria-label="กรองตอน"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="new">ใหม่ล่าสุด</option>
                  <option value="read">อ่านแล้ว</option>
                </select>
              </div>
            </div>
          </div>

          <div className="chapter-list">
            {chapters.loading && !chapterList.length
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="chapter-row" aria-hidden="true">
                    <span className="skeleton" style={{ width: 40, height: 14 }} />
                    <span className="skeleton" style={{ width: "55%", height: 16 }} />
                  </div>
                ))
              : shown.map((c) => (
                  <button key={c.id} className="chapter-row" onClick={() => read(c)}>
                    <span className="chapter-num">
                      <span className="chapter-num-text">#{c.number}</span>
                    </span>
                    <span className="chapter-info">
                      <span className="chapter-name">{c.title}</span>
                      <span className="chapter-date">
                        <Icon name="clock" size={12} />
                        {formatDate(c.date)}
                      </span>
                    </span>
                    <span className="chapter-views">
                      <Icon name="eye" size={13} />
                      {c.views ?? `${Math.floor(50000 / (c.number || 1)) + 900}`}
                    </span>
                    <span className="chapter-read-btn">
                      อ่าน <Icon name="chevronRight" size={14} />
                    </span>
                  </button>
                ))}
          </div>

          {!chapters.loading && filtered.length === 0 && (
            <p className="chapter-empty">ไม่พบตอนที่ตรงกับคำค้นหา</p>
          )}

          {hasMore && (
            <div className="load-more-wrap">
              <button className="btn btn-ghost load-more" onClick={() => setPage((p) => p + 1)}>
                โหลดเพิ่มเติม ({filtered.length - shown.length} ตอน)
              </button>
            </div>
          )}
        </section>

        <section className="home-section">
          <div className="section-head">
            <h2 className="section-title">
              <span className="tick" />
              เรื่องแนะนำที่คล้ายกัน
            </h2>
          </div>
          <div className="manga-grid">
            {recos.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <MangaCardSkeleton key={i} />)
              : recos.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
