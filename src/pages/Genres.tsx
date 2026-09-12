import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BULLY_GENRE_SLUGS } from "../api/bully";
import { MangaCard, MangaCardSkeleton } from "../components/MangaCard";
import { useMangaList } from "../hooks/useMangaData";

const PAGE_SIZE = 24;

const GENRE_LABELS: Record<string, string> = {
  Manhua: "มังงะจีน",
  Action: "ต่อสู้",
  Adventure: "ผจญภัย",
  Romance: "โรแมนติก",
  Fantasy: "แฟนตาซี",
  Comedy: "ตลก",
  Isekai: "ต่างโลก",
  Drama: "ดราม่า",
  Horror: "สยองขวัญ",
  Mystery: "ลึกลับ",
  "Sci-Fi": "ไซไฟ",
  "Martial Arts": "กำลังภายใน",
  Supernatural: "เหนือธรรมชาติ",
  Historical: "ย้อนยุค",
  "Slice of Life": "ชีวิตประจำวัน",
  Psychological: "จิตวิทยา",
  Harem: "ฮาเร็ม",
  Game: "เกม",
  Shounen: "โชเน็น",
  Reborn: "เกิดใหม่",
};

const SUPPORTED_GENRES = [
  ...Object.keys(BULLY_GENRE_SLUGS).filter((genre) => genre !== "Manhua"),
  "Manhua",
];

function genreLabel(genre: string) {
  return GENRE_LABELS[genre] ?? genre;
}

export function Genres() {
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const requestedGenre = params.get("genre") ?? "";
  const activeGenre = SUPPORTED_GENRES.includes(requestedGenre) ? requestedGenre : "";
  // Load up to page * PAGE_SIZE items (progressive: catalog loads in background)
  const listQuery = useMangaList(activeGenre || undefined, page * PAGE_SIZE, "manhua");

  const allItems = listQuery.data ?? [];
  const shownItems = allItems.slice(0, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));

  return (
    <div className="container list-page genres-page anim-fade-in">
      <nav className="genres-filter card" aria-label="เลือกหมวดหมู่">
        <Link to="/genres" className={`genres-filter-chip ${!activeGenre ? "genres-filter-chip-active" : ""}`}>
          ทั้งหมด
        </Link>
        {SUPPORTED_GENRES.map((genre) => (
          <Link
            key={genre}
            to={`/genres?genre=${encodeURIComponent(genre)}`}
            className={`genres-filter-chip ${activeGenre === genre ? "genres-filter-chip-active" : ""}`}
            aria-current={activeGenre === genre ? "page" : undefined}
          >
            {genreLabel(genre)}
          </Link>
        ))}
      </nav>

      <section className="genres-results card" aria-labelledby="genres-results-title">
        <div className="genres-results-head">
          <div>
            <p className="genres-results-kicker">หมวดหมู่มังงะจาก mangablackcat.com</p>
            <h1 id="genres-results-title">{activeGenre ? genreLabel(activeGenre) : "ทั้งหมด"}</h1>
          </div>
          <span className="list-count">
            {listQuery.loading && !allItems.length ? "กำลังโหลด..." : `${allItems.length} เรื่อง`}
          </span>
        </div>

        {listQuery.loading && !allItems.length ? (
          <div className="manga-grid stagger">
            {Array.from({ length: 8 }).map((_, i) => (
              <MangaCardSkeleton key={i} />
            ))}
          </div>
        ) : shownItems.length ? (
          <>
            <div className="manga-grid stagger">
              {shownItems.map((manga, i) => (
                <MangaCard key={manga.id} manga={manga} index={i} />
              ))}
            </div>
            <div className="load-more-wrap" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "16px 0" }}>
              <button
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0 }); }}
              >
                ← ก่อนหน้า
              </button>
              <span style={{ fontSize: 14, color: "var(--text-secondary, #aaa)" }}>
                หน้า <strong>{page}</strong> / {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= totalPages}
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0 }); }}
              >
                ถัดไป →
              </button>
            </div>
          </>
        ) : (
          <div className="genres-empty">ยังไม่มีมังฮัวในหมวดนี้</div>
        )}
      </section>
    </div>
  );
}
