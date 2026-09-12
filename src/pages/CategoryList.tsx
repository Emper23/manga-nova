import { Link, useSearchParams } from "react-router-dom";
import { MangaCard, MangaCardSkeleton } from "../components/MangaCard";
import { Icon } from "../components/Icon";

import { useLoader } from "../hooks/useMangaData";
import { fetchBullyGenreCatalog, bullySummaryToManga } from "../api/bully";

export type BullyCategory = "Manhua" | "Manhwa" | "Manga";

const CATEGORY_CONFIG: Record<BullyCategory, { label: string; title: string; sub: string }> = {
  Manhua: {
    label: "มันฮัว",
    title: "มังฮัวภาพสีแปลไทย",
    sub: "มังงะจีน (Manhua) ภาพสี แปลไทย อัปเดตทุกวัน — อ่านฟรีทุกตอน",
  },
  Manhwa: {
    label: "มังฮวา",
    title: "มังฮวาภาพสีแปลไทย",
    sub: "มังงะเกาหลี (Manhwa) ภาพสี แปลไทย อัปเดตทุกวัน — อ่านฟรีทุกตอน",
  },
  Manga: {
    label: "มังงะ",
    title: "มังงะญี่ปุ่นแปลไทย",
    sub: "มังงะญี่ปุ่น (Manga) ภาพสี แปลไทย อัปเดตทุกวัน — อ่านฟรีทุกตอน",
  },
};

export function CategoryList({ category }: { category: BullyCategory }) {
  const [params] = useSearchParams();
  const config = CATEGORY_CONFIG[category];
  const genre = params.get("genre") || category;
  const catalog = useLoader(() => fetchBullyGenreCatalog(genre), [genre]);
  const all = catalog.data?.map((summary) => bullySummaryToManga(summary, genre)) ?? [];
  const loading = catalog.loading;

  return (
    <div className="container list-page anim-fade-in">
      <div className="list-head">
        <div>
          <h1 className="list-title">
            {genre === category ? config.title : `${config.label} — ${genre}`}
            <span className="list-count">
              <Icon name="flame" size={13} /> จาก mangablackcat.com
            </span>
          </h1>
          <p className="list-sub">{config.sub}</p>
        </div>
      </div>

      <div className="manga-grid stagger">
        {loading && all.length === 0
          ? Array.from({ length: 12 }).map((_, i) => <MangaCardSkeleton key={i} />)
          : all.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
      </div>

      {!loading && all.length === 0 && (
        <div className="list-empty">
          <Icon name="book" size={40} />
          <p>โหลดข้อมูลไม่สำเร็จ — ลองรีเฟรชอีกครั้ง</p>
        </div>
      )}

      {all.length > 0 && (
        <div className="load-more-wrap">
          <p className="load-more-note">
            {loading
              ? `กำลังโหลดครบทุกหน้า... โหลดแล้ว ${all.length} เรื่อง`
              : catalog.error
                ? `โหลดได้บางส่วน ${all.length} เรื่อง — ลองรีเฟรชเพื่อโหลดต่อ`
                : `โหลดครบแล้ว ${all.length} เรื่อง`}
          </p>
          <p className="load-more-note">
            อัปเดตโดยตรงจาก{" "}
            <Link to={`https://mangablackcat.com/genre/${category.toLowerCase()}`} target="_blank" rel="noreferrer">
              mangablackcat.com
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
