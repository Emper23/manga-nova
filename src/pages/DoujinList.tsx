import { useState } from "react";
import { Link } from "react-router-dom";
import { MangaCard, MangaCardSkeleton } from "../components/MangaCard";
import { Icon } from "../components/Icon";
import { nekoSummaryToManga } from "../api/neko";
import { useNekoCatalogPage } from "../hooks/useMangaData";

const AGE_KEY = "manga-nova-doujin-age-confirmed";

function readAgeConfirmation() {
  try {
    return localStorage.getItem(AGE_KEY) === "yes";
  } catch {
    return false;
  }
}

export function DoujinList() {
  const [ageConfirmed, setAgeConfirmed] = useState(readAgeConfirmation);
  const [page, setPage] = useState(1);
  const catalog = useNekoCatalogPage(ageConfirmed ? page : null);
  const all = catalog.data?.items.map(nekoSummaryToManga) ?? [];

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
        <section className="age-gate card" aria-labelledby="doujin-age-title">
          <div className="age-gate-icon">18+</div>
          <p className="age-gate-kicker">พื้นที่เนื้อหาสำหรับผู้ใหญ่</p>
          <h1 id="doujin-age-title">หมวดโดจิน</h1>
          <p>
            หน้านี้อาจมีภาพหรือเนื้อหาทางเพศ
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
            MANGA NOVA เป็นเดโมและไม่ได้โฮสต์ไฟล์ต้นฉบับ อ่านจากแหล่งข้อมูลต้นทางอย่างรับผิดชอบ
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
            โดจิน 18+
            <span className="list-count"><Icon name="flame" size={13} /> อัปเดตล่าสุด</span>
          </h1>
          <p className="list-sub">รายการโดจินแยกจากคลังมันฮัว</p>
        </div>
      </div>

      <div className="manga-grid stagger">
        {catalog.loading && all.length === 0
          ? Array.from({ length: 12 }).map((_, i) => <MangaCardSkeleton key={i} />)
          : all.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
      </div>

      {!catalog.loading && all.length === 0 && (
        <div className="list-empty">
          <Icon name="book" size={40} />
          <p>โหลดรายการต้นทางไม่สำเร็จ — ลองรีเฟรชอีกครั้ง</p>
        </div>
      )}

      {(all.length > 0 || catalog.loading) && (
        <div className="doujin-pagination">
          <button className="btn btn-ghost" type="button" disabled={page <= 1 || catalog.loading} onClick={() => setPage((p) => p - 1)}>
            <Icon name="chevronLeft" size={16} /> ก่อนหน้า
          </button>
          <span>หน้า {page}</span>
          <button className="btn btn-primary" type="button" disabled={!catalog.data?.hasNext || catalog.loading} onClick={() => setPage((p) => p + 1)}>
            หน้าถัดไป <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}

    </div>
  );
}
