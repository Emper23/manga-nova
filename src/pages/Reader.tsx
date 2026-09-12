import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ReaderPageArt } from "../components/ReaderPageArt";
import { MangaCover } from "../components/MangaCover";
import { useApp } from "../context/AppContext";
import { useAllChapters, useChapterPages, useGenreManga, useMangaDetail } from "../hooks/useMangaData";
import { isNekoId } from "../api/neko";

const FALLBACK_PAGE_COUNT = 16;
const VIEWPORT_BUFFER = 6;

interface Settings {
  widthPct: number;
  gap: number;
  readMode: "dark" | "light";
  autoHide: boolean;
}

type SwipeDirection = "next" | "prev";

interface SwipeTouch {
  x: number;
  y: number;
  ignored: boolean;
  direction: SwipeDirection | null;
  progress: number;
}

interface SwipePreview {
  direction: SwipeDirection;
  progress: number;
  reachedCenter: boolean;
}

export function Reader() {
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { data: manga, loading: mangaLoading } = useMangaDetail(mangaId ?? "");
  const chapters = useAllChapters(mangaId ?? "");
  const chapter = useMemo(
    () =>
      chapters.data?.find((c) => c.externalId === chapterId) ??
      chapters.data?.find((c) => c.number === Number(chapterId)) ??
      chapters.data?.[0],
    [chapters.data, chapterId]
  );
  const { data: pageUrls } = useChapterPages(chapter?.externalId);
  const recommended = useGenreManga(manga?.genres[0] ?? "", 6, manga?.type ?? "manga");

  const { recordProgress } = useApp();
  const [settings, setSettings] = useState<Settings>({
    widthPct: 100,
    gap: 0,
    readMode: "dark",
    autoHide: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);
  const [chapterQuery, setChapterQuery] = useState("");
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set([0, 1, 2]));
  const [progress, setProgress] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chapterMenuRef = useRef<HTMLDivElement>(null);
  const chapterSearchRef = useRef<HTMLInputElement>(null);
  const hideTimer = useRef<number>(0);
  const savedRef = useRef(false);
  const touchStartRef = useRef<SwipeTouch | null>(null);
  const swipePrevRef = useRef<() => void>(() => {});
  const swipeNextRef = useRef<() => void>(() => {});
  const swipePrevAvailableRef = useRef(false);
  const swipeNextAvailableRef = useRef(false);
  const [swipePreview, setSwipePreview] = useState<SwipePreview | null>(null);

  const hasRealPages = (pageUrls?.length ?? 0) > 0;
  const pageCount = hasRealPages ? pageUrls!.length : FALLBACK_PAGE_COUNT;

  // Reset scroll/progress only when the chapter changes
  useEffect(() => {
    if (!manga || !chapter) return;
    setProgress(0);
    setVisiblePages(new Set([0, 1, 2]));
    setSettingsOpen(false);
    setChapterMenuOpen(false);
    setChapterQuery("");
    savedRef.current = false;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [manga, chapter]);

  // Close the chapter menu when focus moves outside it or Escape is pressed.
  useEffect(() => {
    if (!chapterMenuOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !chapterMenuRef.current?.contains(target)) {
        setChapterMenuOpen(false);
        setChapterQuery("");
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChapterMenuOpen(false);
        setChapterQuery("");
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [chapterMenuOpen]);

  useEffect(() => {
    if (chapterMenuOpen) chapterSearchRef.current?.focus();
  }, [chapterMenuOpen]);

  // Scroll progress + lazy rendering
  useEffect(() => {
    if (!manga || !chapter) return;
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      const el = scrollRef.current!;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      setProgress(p);
      const vh = el.clientHeight;
      const start = Math.max(0, Math.floor(el.scrollTop / vh) - VIEWPORT_BUFFER);
      const end = Math.min(pageCount, Math.ceil((el.scrollTop + vh) / vh) + VIEWPORT_BUFFER);
      setVisiblePages((prev) => {
        const next = new Set(prev);
        for (let i = start; i < end; i++) next.add(i);
        return next;
      });
    };
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [manga, chapter, pageCount]);

  // Save progress when leaving
  useEffect(() => {
    return () => {
      if (manga && chapter && !savedRef.current) {
        recordProgress(manga.id, chapter.number, Math.max(progress, 0.05));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manga, chapter]);

  // Auto-hide controls
  useEffect(() => {
    if (!settings.autoHide || settingsOpen || chapterMenuOpen) {
      setControlsVisible(true);
      window.clearTimeout(hideTimer.current);
      return;
    }
    const show = () => {
      setControlsVisible(true);
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2600);
    };
    show();
    const events: (keyof WindowEventMap)[] = ["mousemove", "scroll", "touchstart", "keydown"];
    events.forEach((e) => window.addEventListener(e, show, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, show));
      window.clearTimeout(hideTimer.current);
    };
  }, [settings.autoHide, settingsOpen, chapterMenuOpen]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollRef.current?.scrollBy({ top: 500, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollRef.current?.scrollBy({ top: -500, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters.data, chapter]);

  // Side swipe navigation: start at a side, show a preview while dragging,
  // and only switch chapters after the finger reaches the center of the screen.
  useEffect(() => {
    const clearSwipe = () => {
      touchStartRef.current = null;
      setSwipePreview(null);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        clearSwipe();
        return;
      }
      const touch = event.touches[0];
      const target = event.target;
      const ignoredTarget =
        target instanceof Element &&
        Boolean(target.closest("button, a, input, select, textarea, .reader-settings, .reader-chapter-menu"));
      const startedRight = touch.clientX >= window.innerWidth * 0.55;
      const startedLeft = touch.clientX <= window.innerWidth * 0.45;
      const direction: SwipeDirection | null = startedRight ? "next" : startedLeft ? "prev" : null;
      const hasTarget = direction === "next" ? swipeNextAvailableRef.current : direction === "prev" ? swipePrevAvailableRef.current : false;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        ignored: ignoredTarget || !direction || !hasTarget || settingsOpen || chapterMenuOpen,
        direction,
        progress: 0,
      };
      setSwipePreview(null);
    };

    const onTouchMove = (event: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start || start.ignored || !start.direction || settingsOpen || chapterMenuOpen || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
        start.progress = 0;
        setSwipePreview(null);
        return;
      }

      const isCorrectDirection = start.direction === "next" ? deltaX < 0 : deltaX > 0;
      if (!isCorrectDirection) {
        start.progress = 0;
        setSwipePreview(null);
        return;
      }

      const centerX = window.innerWidth / 2;
      const travelToCenter = start.direction === "next" ? start.x - centerX : centerX - start.x;
      const travelled = start.direction === "next" ? start.x - touch.clientX : touch.clientX - start.x;
      const progress = Math.max(0, Math.min(1, travelled / Math.max(1, travelToCenter)));
      start.progress = progress;
      setSwipePreview({ direction: start.direction, progress, reachedCenter: progress >= 1 });
    };

    const onTouchEnd = () => {
      const start = touchStartRef.current;
      if (!start) return;
      const shouldNavigate = !start.ignored && start.progress >= 1 && !settingsOpen && !chapterMenuOpen;
      const direction = start.direction;
      clearSwipe();
      if (!shouldNavigate || !direction) return;
      if (direction === "next") swipeNextRef.current();
      else swipePrevRef.current();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", clearSwipe, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", clearSwipe);
    };
  }, [settingsOpen, chapterMenuOpen]);

  const loadingView = (
    <div className="reader reader-dark">
      <div className="reader-scroll">
        <div className="container" style={{ paddingTop: 100 }}>
          <div className="skeleton" style={{ height: 24, width: 260, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: "70vh", borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );

  if (mangaLoading && !manga) return loadingView;
  if (!manga) {
    return (
      <div className="container not-found anim-fade-in">
        <h1>ไม่พบมังงะนี้</h1>
        <Link to={isNekoId(mangaId ?? "") ? "/doujin" : "/manga"} className="btn btn-primary">
          กลับไปรายชื่อมังงะ
        </Link>
      </div>
    );
  }
  // Chapter list still loading — keep a stable loading view instead of
  // flashing the not-found page (which flickers when manga loads first).
  if (!chapter) {
    return chapters.loading ? loadingView : (
      <div className="container not-found anim-fade-in">
        <h1>ไม่พบตอนนี้</h1>
        <Link to="/manga" className="btn btn-primary">
          กลับไปรายชื่อมังงะ
        </Link>
      </div>
    );
  }

  const chList = chapters.data ?? [];
  const normalizedChapterQuery = chapterQuery.trim().toLocaleLowerCase();
  const chapterNumberQuery = normalizedChapterQuery.replace(/^ตอน(?:ที่)?\s*/u, "");
  const filteredChapters = chapterNumberQuery
    ? chList.filter((c) => {
        const title = String(c.title ?? "").toLocaleLowerCase();
        return String(c.number).includes(chapterNumberQuery) || title.includes(normalizedChapterQuery);
      })
    : chList;
  const idx = chList.findIndex((c) => c.id === chapter.id);
  const prevCh = idx >= 0 ? chList[idx + 1] : undefined;
  const nextCh = idx > 0 ? chList[idx - 1] : undefined;

  const goChapter = (extId: string) => {
    setChapterMenuOpen(false);
    setChapterQuery("");
    savedRef.current = true;
    if (manga && chapter) recordProgress(manga.id, chapter.number, Math.max(progress, 0.05));
    navigate(`/read/${manga.id}/${extId}`);
  };
  const goPrev = () => prevCh && goChapter(prevCh.externalId ?? prevCh.id);
  const goNext = () => nextCh && goChapter(nextCh.externalId ?? nextCh.id);
  swipePrevAvailableRef.current = Boolean(prevCh);
  swipeNextAvailableRef.current = Boolean(nextCh);
  swipePrevRef.current = goPrev;
  swipeNextRef.current = goNext;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  const recos = recommended.data?.filter((m) => m.id !== manga.id).slice(0, 6) ?? [];
  const gapPx = settings.gap;
  const detailPath = manga.type === "doujin" ? `/doujin/${manga.id}` : `/manga/${manga.id}`;

  return (
    <div
      className={`reader ${settings.readMode === "dark" ? "reader-dark" : "reader-light"}`}
      onMouseMove={() => settings.autoHide && setControlsVisible(true)}
    >
      {swipePreview && (
        <div
          className={`reader-swipe-preview reader-swipe-preview-${swipePreview.direction} ${swipePreview.reachedCenter ? "reader-swipe-preview-ready" : ""}`}
          style={{
            opacity: 0.38 + swipePreview.progress * 0.62,
            transform: `translate(-50%, -50%) scale(${0.92 + swipePreview.progress * 0.08})`,
          }}
          aria-hidden="true"
        >
          <span className="reader-swipe-preview-icon">
            <Icon name={swipePreview.direction === "next" ? "chevronRight" : "chevronLeft"} size={22} />
          </span>
          <strong>{swipePreview.direction === "next" ? "ตอนถัดไป" : "ตอนก่อนหน้า"}</strong>
          <small>{swipePreview.reachedCenter ? "ปล่อยเพื่อไปต่อ" : "ลากไปกึ่งกลางจอ"}</small>
        </div>
      )}
      {/* Top bar */}
      <div className={`reader-topbar glass-strong ${controlsVisible ? "reader-controls-show" : ""}`}>
        <button className="reader-icon-btn" onClick={() => navigate(detailPath)} aria-label="ย้อนกลับ">
          <Icon name="arrowLeft" size={20} />
        </button>
        <div className="reader-title-wrap">
          <Link to={detailPath} className="reader-title">
            {manga.title}
          </Link>
          <span className="reader-chapter-label">
            ตอนที่ {chapter.number} <span className="reader-chapter-title">{chapter.title}</span>
            {chapter.lang && (
              <span className={`chapter-lang-badge ${chapter.lang === "th" ? "chapter-lang-th" : ""}`}>
                {chapter.lang === "th" ? "ไทย" : chapter.lang.toUpperCase()}
              </span>
            )}
          </span>
        </div>
        <div className={`reader-chapter-picker ${chapterMenuOpen ? "is-open" : ""}`} ref={chapterMenuRef}>
          <button
            type="button"
            className="reader-chapter-select"
            onClick={() => {
              if (chapterMenuOpen) setChapterQuery("");
              setChapterMenuOpen((open) => !open);
            }}
            aria-label="เลือกตอน"
            aria-haspopup="listbox"
            aria-expanded={chapterMenuOpen}
          >
            <span>ตอนที่ {chapter.number}</span>
            <Icon name="chevronDown" size={15} />
          </button>
          {chapterMenuOpen && (
            <div className="reader-chapter-menu" role="dialog" aria-label="รายการตอน">
              <div className="reader-chapter-menu-head">
                <span>เลือกตอน</span>
                <span>{chapterQuery ? `${filteredChapters.length}/${chList.length} ตอน` : `${chList.length} ตอน`}</span>
              </div>
              <div className="reader-chapter-search">
                <Icon name="search" size={15} />
                <input
                  ref={chapterSearchRef}
                  type="search"
                  value={chapterQuery}
                  onChange={(event) => setChapterQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      const first = filteredChapters[0];
                      if (first) goChapter(first.externalId ?? first.id);
                    }
                  }}
                  placeholder="พิมพ์เลขตอนหรือชื่อเรื่อง..."
                  aria-label="ค้นหาตอน"
                />
                {chapterQuery && (
                  <button
                    type="button"
                    className="reader-chapter-search-clear"
                    onClick={() => {
                      setChapterQuery("");
                      chapterSearchRef.current?.focus();
                    }}
                    aria-label="ล้างคำค้น"
                  >
                    <Icon name="close" size={13} />
                  </button>
                )}
              </div>
              <div className="reader-chapter-options" role="listbox" aria-label="รายการตอน">
                {filteredChapters.length > 0 ? (
                  filteredChapters.map((c) => {
                    const value = c.externalId ?? c.id;
                    const isCurrent = value === (chapter.externalId ?? chapter.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        className={`reader-chapter-option ${isCurrent ? "reader-chapter-option-active" : ""}`}
                        onClick={() => goChapter(value)}
                      >
                        <span className="reader-chapter-option-number">ตอนที่ {c.number}</span>
                        {isCurrent ? <Icon name="check" size={16} /> : <span className="reader-chapter-option-dot" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="reader-chapter-empty">ไม่พบตอนที่ตรงกัน</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="reader-top-progress">
          <div className="reader-progress-track">
            <div className="reader-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="reader-progress-pct">{Math.round(progress * 100)}%</span>
        </div>
        <button
          className={`reader-icon-btn ${settingsOpen ? "reader-icon-active" : ""}`}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label="การตั้งค่า"
          aria-expanded={settingsOpen}
        >
          <Icon name="settings" size={20} />
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="reader-settings glass-strong anim-fade-in" role="dialog" aria-label="การตั้งค่าการอ่าน">
          <div className="reader-setting-row">
            <span>
              <Icon name="fullscreen" size={15} /> ความกว้างภาพ
            </span>
            <input
              type="range"
              min={60}
              max={130}
              value={settings.widthPct}
              onChange={(e) => setSettings((s) => ({ ...s, widthPct: Number(e.target.value) }))}
              aria-label="ความกว้างภาพ"
            />
            <span className="reader-setting-val">{settings.widthPct}%</span>
          </div>
          <div className="reader-setting-row">
            <span>
              <Icon name="list" size={15} /> ระยะห่างระหว่างหน้า
            </span>
            <input
              type="range"
              min={0}
              max={80}
              value={settings.gap}
              onChange={(e) => setSettings((s) => ({ ...s, gap: Number(e.target.value) }))}
              aria-label="ระยะห่างระหว่างหน้า"
            />
            <span className="reader-setting-val">{settings.gap}px</span>
          </div>
          <div className="reader-setting-row">
            <span>
              <Icon name={settings.readMode === "dark" ? "moon" : "sun"} size={15} /> โหมดอ่าน
            </span>
            <div className="reader-seg" role="group" aria-label="โหมดอ่าน">
              <button
                className={settings.readMode === "dark" ? "reader-seg-active" : ""}
                onClick={() => setSettings((s) => ({ ...s, readMode: "dark" }))}
              >
                มืด
              </button>
              <button
                className={settings.readMode === "light" ? "reader-seg-active" : ""}
                onClick={() => setSettings((s) => ({ ...s, readMode: "light" }))}
              >
                สว่าง
              </button>
            </div>
          </div>
          <div className="reader-setting-row">
            <span>
              <Icon name="eye" size={15} /> ซ่อนปุ่มอัตโนมัติ
            </span>
            <button
              className={`reader-toggle ${settings.autoHide ? "reader-toggle-on" : ""}`}
              onClick={() => setSettings((s) => ({ ...s, autoHide: !s.autoHide }))}
              role="switch"
              aria-checked={settings.autoHide}
            >
              <span className="reader-toggle-knob" />
            </button>
          </div>
        </div>
      )}

      {/* Pages */}
      <div
        className="reader-scroll"
        ref={scrollRef}
        style={{ "--reader-width": settings.widthPct / 100 } as React.CSSProperties}
      >
        <div className="reader-pages" style={{ gap: `${gapPx}px` }}>
          {Array.from({ length: pageCount }, (_, i) =>
            visiblePages.has(i) ? (
              <div key={i} className="reader-page anim-fade-in">
                {hasRealPages ? (
                  <DirectChapterImage
                    src={pageUrls![i]}
                    alt={`${manga.title} ตอนที่ ${chapter.number} หน้า ${i + 1}`}
                  />
                ) : (
                  <ReaderPageArt
                    seed={manga.seed}
                    page={i + 1}
                    width={900}
                    height={Math.round(900 * (0.75 + ((manga.seed + i) % 3) * 0.22))}
                    dark={settings.readMode === "dark"}
                  />
                )}
                <span className="reader-page-num">
                  หน้า {i + 1} / {pageCount}
                </span>
              </div>
            ) : (
              <div key={i} className="reader-page">
                <div className="skeleton reader-page-skeleton" />
              </div>
            )
          )}
        </div>
      </div>

      {/* Floating controls */}
      <div className={`reader-fab reader-fab-chapters ${controlsVisible ? "reader-controls-show" : ""}`}>
        <button
          className="reader-icon-btn glass-strong"
          onClick={goPrev}
          disabled={!prevCh}
          aria-label="ตอนก่อนหน้า"
          title="ตอนก่อนหน้า (←)"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <button
          className="reader-icon-btn glass-strong"
          onClick={goNext}
          disabled={!nextCh}
          aria-label="ตอนถัดไป"
          title="ตอนถัดไป (→)"
        >
          <Icon name="chevronRight" size={20} />
        </button>
      </div>
      <div className={`reader-fab reader-fab-tools ${controlsVisible ? "reader-controls-show" : ""}`}>
        <button
          className="reader-icon-btn glass-strong"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="เลื่อนขึ้นบนสุด"
        >
          <Icon name="arrowUp" size={20} />
        </button>
        <button className="reader-icon-btn glass-strong" onClick={toggleFullscreen} aria-label="เต็มจอ">
          <Icon name={isFullscreen ? "compress" : "fullscreen"} size={20} />
        </button>
      </div>

      {/* Bottom nav: prev/next + recommended */}
      <div className="reader-bottom">
        <div className="container reader-bottom-inner">
          <div className="reader-end-actions">
            <button className="btn btn-ghost" onClick={goPrev} disabled={!prevCh}>
              <Icon name="chevronLeft" size={16} /> ตอนก่อนหน้า
            </button>
            <button className="btn btn-primary" onClick={goNext} disabled={!nextCh}>
              ตอนถัดไป <Icon name="chevronRight" size={16} />
            </button>
          </div>

          <div className="section-head reader-reco-head">
            <h2 className="section-title">
              <span className="tick" />
              เรื่องแนะนำ
            </h2>
          </div>
          <div className="reader-reco-grid">
            {recos.map((m) => (
              <Link key={m.id} to={m.type === "doujin" ? `/doujin/${m.id}` : `/manga/${m.id}`} className="reader-reco">
                <span className="reader-reco-thumb">
                  <MangaCover manga={m} />
                </span>
                <span className="reader-reco-info">
                  <span className="reader-reco-title">{m.title}</span>
                  <span className="reader-reco-meta">
                    <Icon name="starFilled" size={11} className="star-icon" />
                    {m.rating.toFixed(1)} · {m.chapters} ตอน
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

/** mangablackcat.com pages — no CORS, load directly via <img>. */
function DirectChapterImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" />;
}
