import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { fetchDevilCatalogPage, type DevilVideoSummary } from "../api/devil";
import { useLoader, type LoadState } from "../hooks/useMangaData";

const AGE_KEY = "manga-nova-doujin-age-confirmed";

function readAgeConfirmation() {
  try {
    return localStorage.getItem(AGE_KEY) === "yes";
  } catch {
    return false;
  }
}

function VideoCard({ video, index }: { video: DevilVideoSummary; index: number }) {
  return (
    <Link
      to={`/videos/${video.id}`}
      className="video-card"
      style={{ animationDelay: `${(index % 24) * 0.04}s` }}
      aria-label={video.title}
    >
      <span className="video-card-thumb">
        <img src={video.thumbUrl} alt="" loading="lazy" />
        <span className="video-card-play">
          <Icon name="play" size={22} />
        </span>
      </span>
      <span className="video-card-title">{video.title}</span>
    </Link>
  );
}

export function DevilList() {
  const [ageConfirmed, setAgeConfirmed] = useState(readAgeConfirmation);
  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");

  const catalog: LoadState<{ items: DevilVideoSummary[]; hasNext: boolean }> = useLoader(
    async () => {
      const result = await fetchDevilCatalogPage(page, query.trim());
      return { items: result.items, hasNext: result.hasNext };
    },
    [page, query]
  );

  const items = catalog.data?.items ?? [];

  const confirmAge = () => {
    try {
      localStorage.setItem(AGE_KEY, "yes");
    } catch {
      /* session still works if storage is blocked */
    }
    setAgeConfirmed(true);
  };

  if (!ageConfirmed) {
    return (
      <div className="container list-page anim-fade-in">
        <section className="age-gate card" aria-labelledby="devil-age-title">
          <div className="age-gate-icon">18+</div>
          <p className="age-gate-kicker">พื้นที่เนื้อหาสำหรับผู้ใหญ่</p>
          <h1 id="devil-age-title">หมวดวิดีโอ 18+</h1>
          <p>
            หน้านี้รวบรวมวิดีโอจากหลายแหล่งและมีเนื้อหาทางเพศ
            โปรดเข้าเฉพาะเมื่อคุณบรรลุนิติภาวะตามกฎหมายในพื้นที่ของคุณแล้ว
          </p>
          <div className="age-gate-actions">
            <button type="button" className="btn btn-primary" onClick={confirmAge}>
              ฉันอายุ 18 ปีขึ้นไป — เข้าใช้งาน
            </button>
            <Link to="/" className="btn btn-ghost">
              กลับหน้าหลัก
            </Link>
          </div>
          <p className="age-gate-note">
            MANGA NOVA เป็นเดโมและไม่ได้โฮสต์ไฟล์ต้นฉบับ รับชมจากแหล่งข้อมูลต้นทางอย่างรับผิดชอบ
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="container list-page anim-fade-in">
      <div className="list-head">
        <div>
          <h1 className="list-title">
            วิดีโอ 18+
            <span className="list-count"><Icon name="flame" size={13} /> อัปเดตล่าสุด</span>
          </h1>
          <p className="list-sub">คลังวิดีโอสำหรับผู้ใหญ่</p>
        </div>
      </div>

      <div className="list-tools card">
        <div className="list-search">
          <Icon name="search" size={16} />
          <input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setQuery(queryInput);
                setPage(1);
              }
            }}
            placeholder="ค้นหาวิดีโอ (กด Enter)..."
            aria-label="ค้นหาวิดีโอ"
          />
        </div>
        {query && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQuery("");
              setQueryInput("");
              setPage(1);
            }}
          >
            <Icon name="close" size={14} /> ล้างคำค้นหา
          </button>
        )}
      </div>

      {catalog.loading && items.length === 0 ? (
        <div className="video-grid stagger">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton video-skeleton" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="video-grid stagger">
          {items.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>
      ) : (
        <div className="list-empty">
          <Icon name="search" size={40} />
          <p>โหลดรายการไม่สำเร็จ — ลองรีเฟรชอีกครั้ง</p>
        </div>
      )}

      {(items.length > 0 || catalog.loading) && !query && (
        <div className="doujin-pagination">
          <button
            className="btn btn-ghost"
            type="button"
            disabled={page <= 1 || catalog.loading}
            onClick={() => setPage((p) => p - 1)}
          >
            <Icon name="chevronLeft" size={16} /> ก่อนหน้า
          </button>
          <span>หน้า {page}</span>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!catalog.data?.hasNext || catalog.loading}
            onClick={() => setPage((p) => p + 1)}
          >
            หน้าถัดไป <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}

      <p className="load-more-note doujin-footnote">
        เนื้อหาสำหรับผู้บรรลุนิติภาวะเท่านั้น
      </p>
    </div>
  );
}
